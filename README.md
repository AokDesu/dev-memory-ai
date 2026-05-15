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
git clone <repository-url>
cd developer-memory-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# Initialize database
npm run db:init

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Features

### Core Features (MVP)
- ✅ **Project Selection**: Browse and select local repositories
- ✅ **Automatic Indexing**: Scans files, Git history, and code structure
- ✅ **Semantic Search**: Find code by meaning, not just keywords
- ✅ **AI Chat**: Ask questions about your codebase
- ✅ **Code Explorer**: Browse files with AI-generated insights
- ✅ **Repository Summary**: Automatic project overview
- ✅ **External API**: Integration with Claude Code, Cursor, etc.

### Coming Soon
- [ ] Slack integration
- [ ] Jira integration
- [ ] VS Code extension
- [ ] Team collaboration features
- [ ] Analytics dashboard

## 🏗️ Architecture

```
Next.js 14 (App Router)
├── Frontend (React + TailwindCSS)
├── Backend (API Routes)
├── RAG Engine (LangChain.js)
├── Database (Prisma + SQLite)
└── AI (OpenAI or Ollama)
```

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

Create a `.env.local` file:

```env
# Database
DATABASE_URL="file:./dev.db"

# OpenAI (for embeddings and LLM)
OPENAI_API_KEY="sk-..."

# Or use Ollama (local)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_MODEL="llama3"

# App Settings
NEXT_PUBLIC_APP_NAME="Developer Memory AI"
NEXT_PUBLIC_MAX_FILE_SIZE="10485760"

# External API
API_SECRET_KEY="your-secret-key-here"
```

### Using Local Models (Ollama)

For complete privacy, use Ollama instead of OpenAI:

```bash
# Install Ollama
curl https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3

# Start Ollama server
ollama serve
```

Then set `OLLAMA_BASE_URL` in `.env.local`.

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

## 🔌 API Integration

### For AI Tools (Claude Code, Cursor, etc.)

```typescript
// Query the knowledge base
const response = await fetch('http://localhost:3000/api/external/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    projectId: 'proj_123',
    query: 'Explain the payment flow',
  }),
});

const data = await response.json();
console.log(data.answer);
console.log(data.sources);
```

See [API_CONTRACTS.md](./API_CONTRACTS.md) for full API documentation.

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

- [Technical Plan](../TECHNICAL_PLAN.md) - Original technical approach
- [Next.js Implementation Plan](../NEXTJS_IMPLEMENTATION_PLAN.md) - Full implementation guide
- [Application Workflow](../APPLICATION_WORKFLOW.md) - User journey and technical flow
- [API Contracts](./API_CONTRACTS.md) - Complete API documentation
- [Team Task Distribution](../TEAM_TASK_DISTRIBUTION_V2.md) - Task breakdown for team

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

## 💰 Cost

- **Development**: Free (local models)
- **Running**: $0-90/month depending on deployment
  - Local (Ollama): $0
  - OpenAI API: ~$10-50/month
  - Vercel hosting: $0-20/month

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
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database with [Prisma](https://www.prisma.io/)

## 📧 Support

- GitHub Issues: [Report a bug](https://github.com/yourusername/developer-memory-ai/issues)
- Documentation: [Read the docs](./docs)
- Email: support@devmemory.ai

---

**Built for the 2026 Hackathon** 🚀

*Making developer knowledge accessible through AI*