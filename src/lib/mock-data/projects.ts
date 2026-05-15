import { Project, RepositorySummary } from '@/types/api';

export const mockProjects: Project[] = [
  {
    id: 'proj_1',
    name: 'developer-memory-ai',
    path: '/Users/dev/projects/developer-memory-ai',
    status: 'ready',
    lastIndexed: '2026-05-15T10:30:00Z',
    filesCount: 1247,
    createdAt: '2026-05-01T08:00:00Z',
    branch: 'main',
  },
  {
    id: 'proj_2',
    name: 'ecommerce-platform',
    path: '/Users/dev/projects/ecommerce-platform',
    status: 'ready',
    lastIndexed: '2026-05-14T15:20:00Z',
    filesCount: 3421,
    createdAt: '2026-04-15T09:00:00Z',
    branch: 'develop',
  },
  {
    id: 'proj_3',
    name: 'mobile-app',
    path: '/Users/dev/projects/mobile-app',
    status: 'indexing',
    lastIndexed: null,
    filesCount: 892,
    createdAt: '2026-05-15T16:00:00Z',
    branch: 'feature/new-ui',
    indexing: true,
  },
];

export const mockCurrentProject: Project = mockProjects[0];

export const mockProjectSummary: RepositorySummary = {
  projectId: 'proj_1',
  name: 'developer-memory-ai',
  path: '/Users/dev/projects/developer-memory-ai',
  statistics: {
    totalFiles: 1247,
    totalLines: 45823,
    languages: {
      TypeScript: 856,
      JavaScript: 234,
      CSS: 45,
      JSON: 89,
      Markdown: 23,
    },
    authors: [
      {
        name: 'Alice Johnson',
        commits: 342,
        linesChanged: 28934,
      },
      {
        name: 'Bob Smith',
        commits: 198,
        linesChanged: 15672,
      },
      {
        name: 'Carol White',
        commits: 87,
        linesChanged: 6234,
      },
    ],
  },
  techStack: [
    'Next.js 14',
    'TypeScript',
    'React',
    'TailwindCSS',
    'Prisma',
    'PostgreSQL',
    'OpenAI',
  ],
  keyFiles: [
    {
      path: 'src/app/api/search/route.ts',
      importance: 0.95,
      reason: 'Core search functionality with vector embeddings',
    },
    {
      path: 'src/lib/llm.ts',
      importance: 0.92,
      reason: 'LLM integration and prompt management',
    },
    {
      path: 'prisma/schema.prisma',
      importance: 0.88,
      reason: 'Database schema definition',
    },
  ],
  recentActivity: [
    {
      date: '2026-05-15',
      commits: 12,
      filesChanged: 34,
    },
    {
      date: '2026-05-14',
      commits: 8,
      filesChanged: 21,
    },
    {
      date: '2026-05-13',
      commits: 15,
      filesChanged: 42,
    },
  ],
  structure: {
    directories: 87,
    maxDepth: 6,
    mainDirectories: ['src', 'prisma', 'public', 'design', 'docs'],
  },
};

// Made with Bob
