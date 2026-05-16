/**
 * Developer Memory AI SDK
 * Client library for integrating with the Developer Memory AI API
 */

export interface QueryRequest {
  projectId: string;
  query: string;
  context?: string;
  maxResults?: number;
}

export interface QueryResponse {
  answer: string;
  sources: Array<{
    file: string;
    lines: [number, number];
    content: string;
    relevance: number;
  }>;
  confidence: number;
  executionTime: number;
  cached?: boolean;
}

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  status: 'pending' | 'indexing' | 'ready' | 'error';
  lastIndexed: string | null;
  filesCount?: number;
  createdAt: string;
}

export interface ProjectStatus {
  projectId: string;
  status: 'pending' | 'indexing' | 'ready' | 'error';
  progress: number;
  processedFiles: number;
  totalFiles: number;
  currentFile?: string | null;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface SDKConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class DeveloperMemoryClient {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;

  constructor(config: SDKConfig) {
    this.apiKey = config.apiKey;
    if (!config.baseUrl) {
      this.baseUrl = 'http://localhost:3000/api';
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production') {
        console.warn(
          '[DeveloperMemoryClient] No baseUrl provided; falling back to ' +
            'http://localhost:3000/api in a production environment. Set ' +
            'SDKConfig.baseUrl explicitly to target your deployment.'
        );
      }
    } else {
      this.baseUrl = config.baseUrl;
    }
    this.timeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Query the knowledge base
   */
  async query(request: QueryRequest): Promise<QueryResponse> {
    const response = await this.fetch('/external/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return response as QueryResponse;
  }

  /**
   * List all projects
   */
  async listProjects(): Promise<ProjectInfo[]> {
    const response = await this.fetch('/external/projects', {
      method: 'GET',
    });

    return (response as { projects: ProjectInfo[] }).projects;
  }

  /**
   * Get project status
   */
  async getProjectStatus(projectId: string): Promise<ProjectStatus> {
    const response = await this.fetch(`/projects/status/${projectId}`, {
      method: 'GET',
    });

    return response as ProjectStatus;
  }

  /**
   * Select a project for indexing
   */
  async selectProject(path: string): Promise<{
    projectId: string;
    name: string;
    status: string;
    progress: number;
    message: string;
  }> {
    const response = await this.fetch('/projects/select', {
      method: 'POST',
      body: JSON.stringify({ path }),
    });

    return response as any;
  }

  /**
   * Start indexing a project
   */
  async indexProject(projectId: string, incremental: boolean = false): Promise<{
    jobId?: string;
    status: string;
    message: string;
  }> {
    const response = await this.fetch('/projects/index', {
      method: 'POST',
      body: JSON.stringify({ projectId, incremental }),
    });

    return response as any;
  }

  /**
   * Wait for project to be ready
   */
  async waitForReady(
    projectId: string,
    options?: {
      pollInterval?: number;
      timeout?: number;
      onProgress?: (status: ProjectStatus) => void;
    }
  ): Promise<ProjectStatus> {
    const pollInterval = options?.pollInterval || 2000; // 2 seconds
    const timeout = options?.timeout || 300000; // 5 minutes
    const startTime = Date.now();

    while (true) {
      const status = await this.getProjectStatus(projectId);

      if (options?.onProgress) {
        options.onProgress(status);
      }

      if (status.status === 'ready') {
        return status;
      }

      if (status.status === 'error') {
        throw new Error(`Indexing failed: ${status.error}`);
      }

      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for project to be ready');
      }

      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Internal fetch wrapper
   */
  private async fetch(endpoint: string, options: RequestInit): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      throw error;
    }
  }
}

/**
 * Create a new client instance
 */
export function createClient(config: SDKConfig): DeveloperMemoryClient {
  return new DeveloperMemoryClient(config);
}

