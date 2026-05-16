# Developer Memory AI

An AI-powered system that automatically indexes and understands your codebase, enabling semantic search, natural language queries, and intelligent code exploration.

## 🎯 Overview

Developer Memory AI helps developers:
- **Understand codebases faster** through semantic search
- **Ask questions** about code in natural language
- **Track changes** with Git history integration
- **Onboard quickly** with automatic documentation
- **Integrate with AI tools** like Claude Code and Cursor

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/AokDesu/dev-memory-ai.git
cd dev-memory-ai

# Install dependencies (--legacy-peer-deps resolves a LangChain peer conflict)
npm install --legacy-peer-deps

# Generate Prisma client
npx prisma generate

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys (see Configuration section below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🤖 AI Provider Configuration

Developer Memory AI supports **multiple AI providers**. Choose the one that fits your needs:

### Option 1: Google Gemini (Recommended - Free Tier Available)

```env
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIza...        # or GEMINI_API_KEY — both are recognised
GEMINI_MODEL=gemini-2.5-flash-lite
EMBEDDINGS_PROVIDER=local
```

**Get API Key**: https://aistudio.google.com/app/apikey

**Models**:
- `gemini-2.5-flash-lite` - Fast, cheap (recommended)
- `gemini-2.0-flash` - Latest generation
- `gemini-1.5-pro` - Most capable

**Pricing**: Free tier includes 1,500 requests/day

### Option 2: OpenAI

```env
AI_PROVIDER="openai"
OPENAI_API_KEY="sk-..."
EMBEDDINGS_PROVIDER="openai"
```

**Get API Key**: https://platform.openai.com/api-keys

**Pricing**: Pay-per-use (~$10-50/month for typical usage)

### Option 3: Ollama (Local - Complete Privacy)

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3

# Start Ollama server
ollama serve
```

```env
AI_PROVIDER="ollama"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"
EMBEDDINGS_PROVIDER="local"
```

**Pricing**: Free (runs on your machine)

### Embeddings Configuration

For semantic search, choose an embeddings provider:

- **`local`** (default): Free, runs in Node.js via `@xenova/transformers` — no API calls needed. The first indexing run downloads the model (~80 MB) once.
- **`gemini`**: Uses Gemini's `text-embedding-004` model. Requires `GOOGLE_API_KEY`.
- **`openai`**: Uses OpenAI's `text-embedding-3-small`. Requires `OPENAI_API_KEY`.

> **Important:** the embeddings provider must be the same for indexing and querying. If you change `EMBEDDINGS_PROVIDER` after indexing, re-index the project so stored vectors match.

## 📋 Features

### Core Features (MVP)
- ✅ **Project Selection**: Browse and select local repositories
- ✅ **Automatic Indexing**: Scans files, Git history, and code structure
- ✅ **Semantic Search**: Find code by meaning, not just keywords
- ✅ **AI Chat**: Ask questions about your codebase
- ✅ **Code Explorer**: Browse files with AI-generated insights
- ✅ **Repository Summary**: Automatic project overview
- ✅ **External API**: Integration with Claude Code, Cursor, etc.
- ✅ **Multi-AI Support**: Gemini, OpenAI, or Ollama

### Coming Soon
- [ ] Slack integration
- [ ] Jira integration
- [ ] VS Code extension
- [ ] Team collaboration features
- [ ] Analytics dashboard

## 🏗️ Architecture

```
Next.js 16 (App Router, Webpack mode)
├── Frontend (React + TailwindCSS)
├── Backend (API Routes)
├── RAG Engine (LangChain.js)
├── Database (Prisma 7 + SQLite via libsql)
└── AI (Gemini / OpenAI / Ollama)
```

> Turbopack is disabled (`next dev --webpack`) because it cannot resolve Prisma's native `.prisma` client. This is handled automatically by the `dev` script.

## 📁 Project Structure

```
developer-memory-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── (dashboard)/       # Dashboard pages
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── search/           # Search components
│   │   ├── chat/             # Chat components
│   │   └── explorer/         # Code explorer
│   ├── lib/                   # Core business logic
│   │   ├── db.ts             # Prisma client
│   │   ├── llm.ts            # Multi-provider AI
│   │   ├── indexer/          # Code indexing
│   │   ├── rag/              # RAG pipeline
│   │   └── git/              # Git operations
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── prisma.config.ts      # Prisma config
├── public/                    # Static assets
└── package.json
```

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# AI Provider — "gemini" | "openai" | "ollama"
AI_PROVIDER=gemini
GOOGLE_API_KEY=AIza...          # or GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash-lite

# OpenAI (if AI_PROVIDER=openai)
OPENAI_API_KEY=sk-...

# Ollama (if AI_PROVIDER=ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3

# Embeddings — "local" | "gemini" | "openai"
EMBEDDINGS_PROVIDER=local

# App settings
NEXT_PUBLIC_MAX_FILE_SIZE=10485760

# External API authentication (used by /api/external/* endpoints)
API_SECRET_KEY=your-secret-key-here
ADMIN_API_KEY=your-admin-key-here
```

## 📖 Usage

### 1. Select a Project

1. Open the application
2. Click "Select Project"
3. Browse to your local repository
4. Click "Index Project"

### 2. Search Code

```
Search: "How does authentication work?"
```

Results show relevant code with context and commit history.

### 3. Chat with AI

```
You: "Why was Redis added to this project?"

AI: "Redis was added in commit abc123 (2024-03-15) by @john
to improve session caching performance..."
```

### 4. Explore Code

Browse the file tree with AI-generated descriptions for each file.

## 🔌 External API

AI tools (Claude Code, Codex, Bob Shell, etc.) can delegate codebase questions to this webapp instead of reading files themselves. All external endpoints require `Authorization: Bearer <API_SECRET_KEY>`.

### Discover indexed projects

```bash
GET /api/external/projects
```

```json
{
  "projects": [
    { "id": "...", "name": "my-repo", "path": "/home/user/my-repo", "status": "ready", "lastIndexed": "..." }
  ],
  "total": 1
}
```

### Ask a question

```bash
POST /api/external/ask
Content-Type: application/json

{
  "projectPath": "/home/user/my-repo",   # or projectId / projectName
  "query": "how does authentication work?",
  "maxResults": 5
}
```

```json
{
  "answer": "Authentication is handled by... [Source 1]",
  "sources": [{ "file": "src/auth.ts", "lines": [12, 45], "content": "...", "relevance": 0.87 }],
  "project": { "id": "...", "name": "my-repo" },
  "confidence": 0.72,
  "executionTime": 2400,
  "cached": false
}
```

Responses are cached for 10 minutes. A repeated identical query returns in ~3 ms with `"cached": true`.

See **[skill.md](./skill.md)** for the full integration guide including error codes and a recommended workflow for AI agents.

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npm run db:init      # Initialize database
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset database

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
```

### Team Development

This project is designed for parallel development:

- **Member A (You)**: Infrastructure, DevOps, Integration
- **Member B**: Backend & RAG Pipeline
- **Member P**: Frontend & UI

See [TEAM_TASK_DISTRIBUTION_V2.md](../TEAM_TASK_DISTRIBUTION_V2.md) for detailed task breakdown.

## 📚 Documentation

- [skill.md](./skill.md) — Integration guide for AI agents (Claude Code, Codex, etc.)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test src/lib/indexer.test.ts

# Run with coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
```

### Docker

```bash
# Build image
docker build -t dev-memory-ai .

# Run container
docker run -p 3000:3000 -v $(pwd)/data:/app/data dev-memory-ai
```

### Traditional VPS

```bash
# On server
git clone <your-repo>
cd developer-memory-ai
npm install
npm run build
pm2 start npm --name "dev-memory" -- start
```

## 🔒 Security

- All data stays local (SQLite database)
- Repository files never leave your machine
- Optional: Use local LLM (Ollama) for complete privacy
- API keys for external access only
- Rate limiting on all endpoints

## 💰 Cost Comparison

| Provider | Setup | Monthly Cost | Privacy | Speed |
|----------|-------|--------------|---------|-------|
| **Gemini** | Easy | $0 (free tier) | Cloud | Fast |
| **OpenAI** | Easy | $10-50 | Cloud | Fast |
| **Ollama** | Medium | $0 | Local | Medium |

**Recommendation**: Start with Gemini (free), switch to Ollama for privacy, or OpenAI for best quality.

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Powered by [LangChain.js](https://js.langchain.com/)
- AI by [Google Gemini](https://ai.google.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database with [Prisma](https://www.prisma.io/)

## 📧 Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/developer-memory-ai/issues)
- Documentation: [Read the docs](./docs)
- Email: support@devmemory.ai

---

**Built for the 2026 Hackathon** 🚀

*Making developer knowledge accessible through AI*
