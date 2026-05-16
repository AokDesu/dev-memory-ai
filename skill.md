# dev-memory-ai — Codebase Q&A Skill

Use this skill to answer questions about any indexed repository without loading source files into your context. The webapp performs embedding search and LLM synthesis; you receive a ready answer with cited sources.

## When to use

- "How does X work in this codebase?"
- "Where is Y implemented?"
- "What files are involved in Z?"

Delegate these questions here instead of reading files yourself. Reduces token usage significantly for large codebases.

## Setup

**Base URL:** `http://localhost:3000` (or wherever the webapp is running)  
**Auth:** every request needs `Authorization: Bearer <API_SECRET_KEY>`  
The key is in the webapp's `.env` file as `API_SECRET_KEY`.

---

## Step 1 — Discover available projects

```
GET /api/external/projects
Authorization: Bearer <key>
```

**Response**
```json
{
  "projects": [
    {
      "id": "cmp7xnqo70000dw2rj8zxozqw",
      "name": "dev-memory-ai",
      "path": "C:\\Users\\chava\\dev-memory-ai",
      "status": "ready",
      "lastIndexed": "2026-05-16T06:02:30.868Z"
    }
  ],
  "total": 1
}
```

Only projects with `"status": "ready"` can be queried. Skip projects that are `"indexing"` or `"error"`.

---

## Step 2 — Ask a question

```
POST /api/external/ask
Authorization: Bearer <key>
Content-Type: application/json
```

**Request body**
```json
{
  "projectPath": "C:\\Users\\chava\\dev-memory-ai",
  "query": "how does authentication work?",
  "maxResults": 5
}
```

You may identify the project with **any one** of:
| Field | Description |
|---|---|
| `projectId` | The `id` from `/projects` — most precise |
| `projectPath` | Filesystem path of the repo (exact match) — best for tools that know the working directory |
| `projectName` | Display name (exact, case-sensitive) |

`maxResults` is optional (default 5, max 20). Higher values give broader context but slower responses.

**Response**
```json
{
  "answer": "Authentication is handled by... [Source 1]",
  "sources": [
    {
      "file": "src/lib/auth.ts",
      "lines": [12, 45],
      "content": "...",
      "relevance": 0.87
    }
  ],
  "project": { "id": "...", "name": "dev-memory-ai" },
  "confidence": 0.72,
  "executionTime": 2400,
  "cached": false
}
```

`confidence` is 0–1. Below ~0.3 means the indexed codebase has little relevant content for the query. `cached: true` means the answer came from cache (response will be fast).

---

## Errors

| Status | Code | Meaning |
|---|---|---|
| 401 | `UNAUTHORIZED` | Missing `Authorization` header |
| 401 | `INVALID_API_KEY` | Wrong key |
| 400 | _(zod details)_ | Missing required field or bad `maxResults` |
| 404 | `PROJECT_NOT_FOUND` | No project matched the identifier |
| 400 | `PROJECT_NOT_READY` | Project is still indexing |
| 500 | `INTERNAL_ERROR` | Server-side failure (check `message` field) |

---

## Recommended workflow

```
1. GET /api/external/projects
     → find the project whose `path` matches the current repo
     → confirm status === "ready"

2. POST /api/external/ask
     { projectPath: <repo path>, query: <question> }
     → read `answer` and cite `sources` if quoting code
```

If the webapp is not reachable or the project isn't indexed, fall back to reading files directly.
