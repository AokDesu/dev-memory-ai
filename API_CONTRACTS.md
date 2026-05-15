# API Contracts - Developer Memory AI

This document defines all API endpoints and their contracts for the Developer Memory AI application. These contracts enable parallel development between frontend (Member P) and backend (Member B) teams.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

---

## Authentication

External API endpoints require authentication via API key:

```
Authorization: Bearer <api_key>
```

---

## 1. Project Management

### POST /api/projects/select

Select a local repository to index.

**Request**:
```typescript
{
  path: string; // Absolute path to repository
}
```

**Response**:
```typescript
{
  projectId: string;
  name: string;
  status: 'pending' | 'indexing' | 'ready' | 'error';
  progress: number; // 0-100
  message?: string;
}
```

**Example**:
```json
{
  "projectId": "clx1234567890",
  "name": "my-awesome-project",
  "status": "indexing",
  "progress": 0,
  "message": "Indexing started"
}
```

---

### GET /api/projects/list

List all indexed projects.

**Response**:
```typescript
{
  projects: Array<{
    id: string;
    name: string;
    path: string;
    status: 'pending' | 'indexing' | 'ready' | 'error';
    lastIndexed: string | null; // ISO 8601 date
    filesCount?: number;
    createdAt: string; // ISO 8601 date
  }>;
}
```

---

### GET /api/projects/status/:projectId

Get indexing status for a project.

**Response**:
```typescript
{
  projectId: string;
  status: 'pending' | 'indexing' | 'ready' | 'error';
  progress: number; // 0-100
  processedFiles: number;
  totalFiles: number;
  currentFile?: string;
  error?: string;
  startedAt?: string; // ISO 8601 date
  completedAt?: string; // ISO 8601 date
}
```

---

### POST /api/projects/index

Start or restart indexing for a project.

**Request**:
```typescript
{
  projectId: string;
  incremental?: boolean; // Default: false
}
```

**Response**:
```typescript
{
  jobId: string;
  status: 'started' | 'already_running';
  message: string;
}
```

---

### DELETE /api/projects/:projectId

Delete a project and all its data.

**Response**:
```typescript
{
  success: boolean;
  message: string;
}
```

---

## 2. Search

### POST /api/search

Semantic search across codebase.

**Request**:
```typescript
{
  projectId: string;
  query: string;
  limit?: number; // Default: 10, Max: 50
  filters?: {
    fileType?: string[]; // e.g., ['ts', 'tsx', 'js']
    chunkType?: string[]; // e.g., ['function', 'class']
    author?: string;
    dateRange?: {
      from: string; // ISO 8601 date
      to: string; // ISO 8601 date
    };
  };
}
```

**Response**:
```typescript
{
  results: Array<{
    id: string;
    file: string; // Relative path
    content: string;
    score: number; // 0-1 relevance score
    lineStart: number;
    lineEnd: number;
    language: string;
    chunkType: 'function' | 'class' | 'file' | 'comment';
    name?: string; // Function/class name
    context?: {
      commit?: {
        hash: string;
        author: string;
        message: string;
        date: string; // ISO 8601 date
      };
    };
  }>;
  totalResults: number;
  query: string;
  executionTime: number; // milliseconds
}
```

**Example**:
```json
{
  "results": [
    {
      "id": "chunk_123",
      "file": "src/auth/login.ts",
      "content": "export async function authenticateUser(email: string, password: string) {\n  // ...\n}",
      "score": 0.92,
      "lineStart": 45,
      "lineEnd": 78,
      "language": "typescript",
      "chunkType": "function",
      "name": "authenticateUser",
      "context": {
        "commit": {
          "hash": "abc123",
          "author": "John Doe",
          "message": "Add JWT authentication",
          "date": "2024-03-15T10:30:00Z"
        }
      }
    }
  ],
  "totalResults": 15,
  "query": "authentication logic",
  "executionTime": 234
}
```

---

## 3. Chat

### POST /api/chat

Conversational interface with streaming responses.

**Request**:
```typescript
{
  projectId: string;
  message: string;
  conversationId?: string; // For continuing conversation
  context?: string; // Additional context
}
```

**Response**: Server-Sent Events (SSE)

**Event Types**:
```typescript
// Thinking phase
{
  type: 'thinking';
  content: string; // e.g., "Searching commits..."
}

// Context retrieved
{
  type: 'context';
  sources: Array<{
    file: string;
    lines: [number, number];
    content: string;
  }>;
}

// Token streaming
{
  type: 'token';
  content: string; // Single token
}

// Completion
{
  type: 'done';
  conversationId: string;
}

// Error
{
  type: 'error';
  error: string;
}
```

**Example Stream**:
```
data: {"type":"thinking","content":"Searching for authentication code..."}

data: {"type":"context","sources":[{"file":"src/auth/login.ts","lines":[45,78],"content":"..."}]}

data: {"type":"token","content":"The"}
data: {"type":"token","content":" authentication"}
data: {"type":"token","content":" system"}
...

data: {"type":"done","conversationId":"conv_123"}
```

---

### GET /api/chat/history/:conversationId

Get conversation history.

**Response**:
```typescript
{
  conversationId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string; // ISO 8601 date
    sources?: Array<{
      file: string;
      lines: [number, number];
    }>;
  }>;
}
```

---

## 4. Repository Summary

### GET /api/summary/:projectId

Get comprehensive repository summary.

**Response**:
```typescript
{
  projectId: string;
  name: string;
  path: string;
  statistics: {
    totalFiles: number;
    totalLines: number;
    languages: Record<string, number>; // language -> file count
    authors: Array<{
      name: string;
      commits: number;
      linesChanged: number;
    }>;
  };
  techStack: string[]; // Detected technologies
  keyFiles: Array<{
    path: string;
    importance: number; // 0-1
    reason: string;
  }>;
  recentActivity: Array<{
    date: string; // ISO 8601 date
    commits: number;
    filesChanged: number;
  }>;
  structure: {
    directories: number;
    maxDepth: number;
    mainDirectories: string[];
  };
}
```

---

## 5. File Operations

### GET /api/files/:projectId

List files in project.

**Query Parameters**:
- `path` (optional): Subdirectory path
- `limit` (optional): Max files to return (default: 100)

**Response**:
```typescript
{
  files: Array<{
    path: string;
    type: 'file' | 'directory';
    language?: string;
    size?: number; // bytes
    lastModified?: string; // ISO 8601 date
  }>;
  totalFiles: number;
}
```

---

### GET /api/files/:projectId/content

Get file content.

**Query Parameters**:
- `path` (required): File path

**Response**:
```typescript
{
  path: string;
  content: string;
  language: string;
  lines: number;
  metadata: {
    lastAuthor?: string;
    lastModified?: string; // ISO 8601 date
    commits?: number;
  };
}
```

---

## 6. Commit History

### GET /api/commits/:projectId

Get commit history.

**Query Parameters**:
- `limit` (optional): Max commits (default: 50)
- `file` (optional): Filter by file path
- `author` (optional): Filter by author

**Response**:
```typescript
{
  commits: Array<{
    hash: string;
    author: string;
    email: string;
    timestamp: string; // ISO 8601 date
    message: string;
    filesChanged: string[];
    additions: number;
    deletions: number;
  }>;
  totalCommits: number;
}
```

---

### GET /api/commits/:projectId/:hash

Get specific commit details.

**Response**:
```typescript
{
  hash: string;
  author: string;
  email: string;
  timestamp: string; // ISO 8601 date
  message: string;
  filesChanged: Array<{
    path: string;
    status: 'added' | 'modified' | 'deleted';
    additions: number;
    deletions: number;
  }>;
  diff?: string; // Full diff (optional)
}
```

---

## 7. Analysis

### POST /api/analyze

Analyze code impact or dependencies.

**Request**:
```typescript
{
  projectId: string;
  type: 'impact' | 'dependencies' | 'usage';
  target: string; // File path or function name
}
```

**Response**:
```typescript
{
  type: string;
  target: string;
  analysis: {
    dependencies?: string[]; // Files this depends on
    dependents?: string[]; // Files that depend on this
    impactScore?: number; // 0-1
    affectedFiles?: number;
    recommendations?: string[];
    usageCount?: number;
    usageLocations?: Array<{
      file: string;
      line: number;
    }>;
  };
}
```

---

## 8. External API (for AI Tools)

### POST /api/external/query

Query knowledge base from external AI tools (Claude Code, Cursor, etc.).

**Headers**:
```
Authorization: Bearer <api_key>
```

**Request**:
```typescript
{
  projectId: string;
  query: string;
  context?: string; // Additional context
  maxResults?: number; // Default: 5
}
```

**Response**:
```typescript
{
  answer: string;
  sources: Array<{
    file: string;
    lines: [number, number];
    content: string;
    relevance: number; // 0-1
  }>;
  confidence: number; // 0-1
  executionTime: number; // milliseconds
}
```

**Example**:
```json
{
  "answer": "The payment flow starts in `src/payment/checkout.ts` where the `processPayment` function validates the payment method, creates a payment intent via Stripe API, and handles the response. On success, it updates the order status in the database.",
  "sources": [
    {
      "file": "src/payment/checkout.ts",
      "lines": [45, 120],
      "content": "export async function processPayment(...) { ... }",
      "relevance": 0.95
    }
  ],
  "confidence": 0.92,
  "executionTime": 1234
}
```

---

### POST /api/external/embed

Generate embeddings for custom text (for AI tool integrations).

**Headers**:
```
Authorization: Bearer <api_key>
```

**Request**:
```typescript
{
  text: string;
}
```

**Response**:
```typescript
{
  embedding: number[]; // 384-dimensional vector
  model: string; // e.g., "all-MiniLM-L6-v2"
}
```

---

## Error Responses

All endpoints return errors in this format:

```typescript
{
  error: string; // Error message
  code: string; // Error code (e.g., "PROJECT_NOT_FOUND")
  details?: any; // Additional error details
}
```

**HTTP Status Codes**:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

---

## WebSocket Events

### Connection

```
ws://localhost:3000/api/ws
```

### Events

**Indexing Progress**:
```typescript
{
  type: 'indexing_progress';
  projectId: string;
  progress: number; // 0-100
  currentFile: string;
  processedFiles: number;
  totalFiles: number;
}
```

**Indexing Complete**:
```typescript
{
  type: 'indexing_complete';
  projectId: string;
  filesIndexed: number;
  duration: number; // milliseconds
}
```

**File Change Detected**:
```typescript
{
  type: 'file_changed';
  projectId: string;
  file: string;
  changeType: 'added' | 'modified' | 'deleted';
}
```

---

## Rate Limits

- **Search**: 60 requests/minute
- **Chat**: 20 requests/minute
- **External API**: 100 requests/minute per API key

---

## TypeScript Types

All types are available in `src/types/api.ts`:

```typescript
import type {
  SearchRequest,
  SearchResponse,
  ChatRequest,
  ProjectStatus,
  // ... etc
} from '@/types/api';
```

---

*Last Updated: May 15, 2026*
*Version: 1.0*
