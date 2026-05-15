/**
 * Frontend API Client
 * Handles all API calls from the frontend to the backend
 */

import {
  Project,
  ProjectListResponse,
  ProjectStatusResponse,
  SearchRequest,
  SearchResponse,
  ChatRequest,
  ChatEvent,
  RepositorySummary
} from '@/types/api';

// Matches GitHub's 100 MB per-file ceiling.
const MAX_FILE_BYTES = 100 * 1024 * 1024;
const MAX_TOTAL_BYTES = 1024 * 1024 * 1024; // 1 GB
const MAX_FILE_MB = Math.round(MAX_FILE_BYTES / 1024 / 1024);
const MAX_TOTAL_MB = Math.round(MAX_TOTAL_BYTES / 1024 / 1024);

export const UPLOAD_LIMITS = {
  perFileBytes: MAX_FILE_BYTES,
  totalBytes: MAX_TOTAL_BYTES,
  perFileLabel: `${MAX_FILE_MB} MB`,
  totalLabel: `${MAX_TOTAL_MB} MB`,
};

export function buildZipUpload(name: string, zip: File): FormData {
  if (zip.size > MAX_TOTAL_BYTES) {
    throw new Error(`Zip exceeds ${MAX_TOTAL_MB} MB limit`);
  }
  const fd = new FormData();
  fd.append('mode', 'zip');
  fd.append('name', name);
  fd.append('zip', zip);
  return fd;
}

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch wrapper with error handling
   */
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: 'Unknown error',
          message: `HTTP ${response.status}` 
        }));
        throw new Error(error.message || error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  /**
   * Projects API
   */
  async listProjects(): Promise<Project[]> {
    const response = await this.fetch<ProjectListResponse>('/projects/list');
    return response.projects;
  }

  async getProjectStatus(projectId: string): Promise<ProjectStatusResponse> {
    return this.fetch<ProjectStatusResponse>(`/projects/status/${projectId}`);
  }

  async selectProject(path: string): Promise<{
    projectId: string;
    name: string;
    status: string;
    progress: number;
    message: string;
  }> {
    return this.fetch('/projects/select', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });
  }

  async uploadProject(formData: FormData): Promise<{
    projectId: string;
    name: string;
    status: string;
    progress: number;
    message: string;
  }> {
    // Do not set Content-Type: the browser must set the multipart boundary.
    const response = await fetch(`${this.baseUrl}/projects/select`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({
        error: 'Unknown error',
        message: `HTTP ${response.status}`,
      }));
      throw new Error(err.message || err.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  async indexProject(projectId: string, incremental: boolean = false): Promise<{
    jobId?: string;
    status: string;
    message: string;
  }> {
    return this.fetch('/projects/index', {
      method: 'POST',
      body: JSON.stringify({ projectId, incremental }),
    });
  }

  /**
   * Summary API
   */
  async getProjectSummary(projectId: string): Promise<RepositorySummary> {
    return this.fetch<RepositorySummary>(`/summary/${projectId}`);
  }

  /**
   * Search API
   */
  async search(request: SearchRequest): Promise<SearchResponse> {
    return this.fetch<SearchResponse>('/search', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Chat API with streaming support
   */
  async *chatStream(request: ChatRequest): AsyncGenerator<ChatEvent, void, unknown> {
    const url = `${this.baseUrl}/chat`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              yield data as ChatEvent;
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * File Explorer API
   */
  async getFileTree(
    projectId: string
  ): Promise<{ tree: import('@/types/api').FileTreeNode[]; totalFiles: number }> {
    return this.fetch(`/projects/${projectId}/files`);
  }

  async getFileContent(
    projectId: string,
    filePath: string
  ): Promise<{
    path: string;
    content: string;
    language: string | null;
    lines: number;
    metadata: {
      lastAuthor: string | null;
      lastModified: string | null;
    };
  }> {
    return this.fetch(`/projects/${projectId}/files/content`, {
      method: 'POST',
      body: JSON.stringify({ path: filePath }),
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class for testing or custom instances
export { APIClient };

// Made with Bob
