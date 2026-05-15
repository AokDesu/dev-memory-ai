# Build the Frontend for Developer Memory AI

## Project Context
I'm building **Developer Memory AI**, a Next.js 14 web app that indexes local Git repositories and lets developers search and chat with their codebase using AI (semantic search, natural-language Q&A, AI-generated file summaries). Think "ChatGPT for your codebase."

This task is **frontend UI only**. The RAG/backend work is being handled separately — use mock data everywhere.

## Tech Stack (already decided, do not change)
- Next.js 14 (App Router) + TypeScript
- TailwindCSS
- shadcn/ui — install components as needed via `npx shadcn@latest add <component>`
- lucide-react for icons
- next-themes for dark mode
- Server Components by default; `"use client"` only when needed

## Design Direction
- **Feel:** serious developer tool — Linear, Vercel dashboard, GitHub. Clean, fast, keyboard-friendly, information-dense.
- **NOT** a generic AI marketing site. No purple-to-pink gradients, no oversized hero text, no bouncy animations.
- **Theme:** dark mode by default, polished light mode available. Use `next-themes`.
- **Typography:** Inter for UI, JetBrains Mono (or Geist Mono) for code.
- **Color:** neutral grays as the base, one restrained accent color for primary actions.
- **Motion:** subtle only. Skeleton loaders instead of spinners.
- **Every list view** gets a real empty state (icon + message + CTA).
- **Cmd+K command palette** for global navigation (use shadcn's `Command` component).

## Pages to Build

### 1. Landing / Project Picker — `/`
- Short hero, "Select Project" CTA opening a dialog to pick a local repo path
- Grid of recently indexed projects (name, last indexed, language stats, file count)
- First-time empty state with a 3-step "how it works"

### 2. Project Dashboard — `/projects/[id]`
- Top bar: project name, branch, last sync, "Re-index" button
- AI-generated repository summary card with tech stack badges
- Stat tiles: files, LOC, last commit, contributors
- Recent activity feed (commits with AI-summarized changes)
- Left sidebar nav: Search, Chat, Explorer, Settings

### 3. Semantic Search — `/projects/[id]/search`
- Big search input with example queries as placeholders
- Results: file path, code snippet (syntax-highlighted), relevance score, git blame (author/commit/date)
- Filter panel: file type, directory, author, date range
- Clicking a result opens code in a side sheet

### 4. AI Chat — `/projects/[id]/chat`
- ChatGPT-style interface specialized for code
- Markdown + syntax-highlighted code blocks in messages
- Each AI response has an expandable "Sources" section citing files
- Sidebar with chat history grouped by date
- Cmd+Enter to send, multiline input

### 5. Code Explorer — `/projects/[id]/explorer`
- Three panels: file tree (left) | code viewer (center) | AI insights (right)
- File tree with type icons + filter input
- Code viewer with Shiki for syntax highlighting, line numbers, git blame on hover
- AI insights panel: file description, key functions, dependencies, related files

### 6. Settings — `/projects/[id]/settings`
- Tabs: General, AI Provider, API Keys, Indexing
- AI Provider tab: radio for Gemini / OpenAI / Ollama, model dropdown, masked API key input
- API Keys tab: generate/revoke external keys with copy-to-clipboard
- Indexing tab: include/exclude file extensions, max file size, re-index button

## Folder Structure
```
src/
├── app/
│   ├── (dashboard)/projects/[id]/{search,chat,explorer,settings}/page.tsx
│   ├── page.tsx                # landing
│   └── layout.tsx
├── components/
│   ├── ui/                     # shadcn components
│   ├── layout/                 # sidebar, topbar, command palette
│   ├── dashboard/
│   ├── search/
│   ├── chat/
│   └── explorer/
├── lib/
│   ├── mock-data.ts            # ALL data lives here for now
│   └── utils.ts
└── types/
```

## Mock Data Requirements
Put everything in `src/lib/mock-data.ts`. Make it realistic:
- Real-looking file paths (`src/components/auth/LoginForm.tsx`)
- Real-looking commit messages and SHAs
- Code snippets that look like actual TypeScript/React
- 3–5 sample projects, 20+ files per project, 10+ commits, 5+ chat conversations

## Constraints — do NOT do these
- No real LLM API calls
- No Prisma, no database, no backend wiring
- No UI library other than shadcn/ui + Tailwind
- No `localStorage` for important state — keep things in React state for now

## Process
1. First, **show me a file/folder plan** and list which shadcn components you'll install. Wait for me to confirm.
2. Then build in this order: layout shell → landing → dashboard → search → chat → explorer → settings.
3. After each page, pause and let me review before moving to the next.
4. Make everything responsive — sidebar collapses to a `Sheet` on mobile, three-panel layouts stack vertically on small screens.

Start with the plan.
