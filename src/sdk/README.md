# Developer Memory AI SDK

TypeScript/JavaScript client library for integrating with Developer Memory AI.

## Installation

```bash
npm install @developer-memory-ai/sdk
```

Or use directly from your project:

```typescript
import { createClient } from '@/sdk/client';
```

## Quick Start

```typescript
import { createClient } from '@developer-memory-ai/sdk';

// Initialize client
const client = createClient({
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000/api', // Optional, defaults to localhost
});

// Query the knowledge base
const response = await client.query({
  projectId: 'proj_123',
  query: 'How does authentication work?',
});

console.log(response.answer);
console.log(response.sources);
```

## API Reference

### `createClient(config)`

Create a new client instance.

**Parameters:**
- `config.apiKey` (string, required): Your API key
- `config.baseUrl` (string, optional): API base URL (default: `http://localhost:3000/api`)
- `config.timeout` (number, optional): Request timeout in ms (default: 30000)

**Returns:** `DeveloperMemoryClient`

### `client.query(request)`

Query the knowledge base for code-related questions.

**Parameters:**
```typescript
{
  projectId: string;      // Project ID to query
  query: string;          // Natural language question
  context?: string;       // Additional context (optional)
  maxResults?: number;    // Max sources to return (default: 5, max: 20)
}
```

**Returns:**
```typescript
{
  answer: string;         // AI-generated answer
  sources: Array<{
    file: string;         // File path
    lines: [number, number]; // Line range
    content: string;      // Code snippet
    relevance: number;    // Relevance score (0-1)
  }>;
  confidence: number;     // Answer confidence (0-1)
  executionTime: number;  // Query time in ms
  cached?: boolean;       // Whether result was cached
}
```

### `client.listProjects()`

List all indexed projects.

**Returns:**
```typescript
Array<{
  id: string;
  name: string;
  path: string;
  status: 'pending' | 'indexing' | 'ready' | 'error';
  lastIndexed: string | null;
  filesCount?: number;
  createdAt: string;
}>
```

### `client.getProjectStatus(projectId)`

Get indexing status for a project.

**Parameters:**
- `projectId` (string): Project ID

**Returns:**
```typescript
{
  projectId: string;
  status: 'pending' | 'indexing' | 'ready' | 'error';
  progress: number;       // 0-100
  processedFiles: number;
  totalFiles: number;
  currentFile?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}
```

### `client.selectProject(path)`

Select a local repository for indexing.

**Parameters:**
- `path` (string): Absolute path to repository

**Returns:**
```typescript
{
  projectId: string;
  name: string;
  status: string;
  progress: number;
  message: string;
}
```

### `client.indexProject(projectId, incremental?)`

Start indexing a project.

**Parameters:**
- `projectId` (string): Project ID
- `incremental` (boolean, optional): Incremental indexing (default: false)

**Returns:**
```typescript
{
  jobId: string;
  status: string;
  message: string;
}
```

### `client.waitForReady(projectId, options?)`

Wait for a project to finish indexing.

**Parameters:**
- `projectId` (string): Project ID
- `options` (optional):
  - `pollInterval` (number): Polling interval in ms (default: 2000)
  - `timeout` (number): Max wait time in ms (default: 300000)
  - `onProgress` (function): Progress callback

**Returns:** `Promise<ProjectStatus>`

## Usage Examples

### Basic Query

```typescript
const client = createClient({
  apiKey: process.env.DEV_MEMORY_API_KEY!,
});

const result = await client.query({
  projectId: 'proj_abc123',
  query: 'Explain the payment processing flow',
});

console.log('Answer:', result.answer);
console.log('Confidence:', result.confidence);
console.log('Sources:', result.sources.length);
```

### Index a New Project

```typescript
// Select project
const project = await client.selectProject('/path/to/my-repo');
console.log('Project created:', project.projectId);

// Start indexing
const job = await client.indexProject(project.projectId);
console.log('Indexing started:', job.jobId);

// Wait for completion with progress updates
const status = await client.waitForReady(project.projectId, {
  onProgress: (status) => {
    console.log(`Progress: ${status.progress}%`);
    console.log(`Processing: ${status.currentFile}`);
  },
});

console.log('Indexing complete!');
```

### List and Query Projects

```typescript
// Get all projects
const projects = await client.listProjects();

// Find ready projects
const readyProjects = projects.filter(p => p.status === 'ready');

// Query each project
for (const project of readyProjects) {
  const result = await client.query({
    projectId: project.id,
    query: 'What are the main components?',
  });
  
  console.log(`\n${project.name}:`);
  console.log(result.answer);
}
```

### Error Handling

```typescript
try {
  const result = await client.query({
    projectId: 'invalid-id',
    query: 'test',
  });
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('Project does not exist');
  } else if (error.message.includes('not ready')) {
    console.error('Project is still indexing');
  } else {
    console.error('Query failed:', error.message);
  }
}
```

### With Custom Context

```typescript
const result = await client.query({
  projectId: 'proj_123',
  query: 'How do I add a new API endpoint?',
  context: 'I want to add a REST endpoint for user management',
  maxResults: 10,
});
```

## Integration Examples

### Claude Code Extension

```typescript
// claude-code-extension.ts
import { createClient } from '@developer-memory-ai/sdk';

const client = createClient({
  apiKey: process.env.DEV_MEMORY_API_KEY!,
  baseUrl: 'https://your-deployment.vercel.app/api',
});

export async function enhanceClaudeContext(
  projectPath: string,
  userQuery: string
): Promise<string> {
  // Get or create project
  const projects = await client.listProjects();
  let project = projects.find(p => p.path === projectPath);
  
  if (!project) {
    project = await client.selectProject(projectPath);
    await client.indexProject(project.projectId);
    await client.waitForReady(project.projectId);
  }
  
  // Query knowledge base
  const result = await client.query({
    projectId: project.id,
    query: userQuery,
  });
  
  // Return enhanced context for Claude
  return `
Based on the codebase analysis:

${result.answer}

Relevant code:
${result.sources.map(s => `
File: ${s.file} (lines ${s.lines[0]}-${s.lines[1]})
\`\`\`
${s.content}
\`\`\`
`).join('\n')}
`;
}
```

### Cursor Integration

```typescript
// cursor-integration.ts
import { createClient } from '@developer-memory-ai/sdk';

const client = createClient({
  apiKey: process.env.DEV_MEMORY_API_KEY!,
});

export async function getCursorContext(
  projectId: string,
  currentFile: string,
  cursorPosition: { line: number; column: number }
): Promise<string> {
  const query = `What is the context around ${currentFile} at line ${cursorPosition.line}?`;
  
  const result = await client.query({
    projectId,
    query,
    context: `Current file: ${currentFile}`,
  });
  
  return result.answer;
}
```

### VS Code Extension

```typescript
// vscode-extension.ts
import * as vscode from 'vscode';
import { createClient } from '@developer-memory-ai/sdk';

let client: DeveloperMemoryClient;

export function activate(context: vscode.ExtensionContext) {
  client = createClient({
    apiKey: context.globalState.get('apiKey') || '',
  });
  
  // Register command
  const disposable = vscode.commands.registerCommand(
    'devmemory.query',
    async () => {
      const query = await vscode.window.showInputBox({
        prompt: 'Ask about your codebase',
      });
      
      if (!query) return;
      
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) return;
      
      // Get or create project
      const projects = await client.listProjects();
      let project = projects.find(p => p.path === workspaceFolder.uri.fsPath);
      
      if (!project) {
        project = await client.selectProject(workspaceFolder.uri.fsPath);
      }
      
      // Query
      const result = await client.query({
        projectId: project.id,
        query,
      });
      
      // Show result
      const panel = vscode.window.createWebviewPanel(
        'devmemory',
        'Developer Memory',
        vscode.ViewColumn.Two,
        {}
      );
      
      panel.webview.html = `
        <h1>Answer</h1>
        <p>${result.answer}</p>
        <h2>Sources</h2>
        ${result.sources.map(s => `
          <div>
            <strong>${s.file}</strong> (lines ${s.lines[0]}-${s.lines[1]})
            <pre>${s.content}</pre>
          </div>
        `).join('')}
      `;
    }
  );
  
  context.subscriptions.push(disposable);
}
```

## TypeScript Types

All types are exported from the SDK:

```typescript
import type {
  QueryRequest,
  QueryResponse,
  ProjectInfo,
  ProjectStatus,
  SDKConfig,
} from '@developer-memory-ai/sdk';
```

## Error Handling

The SDK throws standard JavaScript errors. Common error messages:

- `"Missing or invalid authorization header"` - Invalid API key
- `"Project not found"` - Project ID doesn't exist
- `"Project is not ready"` - Project still indexing
- `"Request timeout"` - Request took too long
- `"Invalid request data"` - Validation error

## Rate Limits

- Search: 60 requests/minute
- Chat: 20 requests/minute
- External API: 100 requests/minute per API key

## Support

- Documentation: https://docs.devmemory.ai
- GitHub: https://github.com/yourusername/developer-memory-ai
- Issues: https://github.com/yourusername/developer-memory-ai/issues
