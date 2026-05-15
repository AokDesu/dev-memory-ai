import { FileItem } from '@/types/api';

export interface FileTreeNode extends FileItem {
  children?: FileTreeNode[];
  expanded?: boolean;
}

export const mockFileTree: FileTreeNode[] = [
  {
    path: 'src',
    type: 'directory',
    expanded: true,
    children: [
      {
        path: 'src/app',
        type: 'directory',
        expanded: true,
        children: [
          {
            path: 'src/app/layout.tsx',
            type: 'file',
            language: 'typescript',
            size: 2456,
            lastModified: '2026-05-15T10:30:00Z',
          },
          {
            path: 'src/app/page.tsx',
            type: 'file',
            language: 'typescript',
            size: 1823,
            lastModified: '2026-05-15T09:15:00Z',
          },
          {
            path: 'src/app/globals.css',
            type: 'file',
            language: 'css',
            size: 3421,
            lastModified: '2026-05-14T16:20:00Z',
          },
          {
            path: 'src/app/api',
            type: 'directory',
            children: [
              {
                path: 'src/app/api/search',
                type: 'directory',
                children: [
                  {
                    path: 'src/app/api/search/route.ts',
                    type: 'file',
                    language: 'typescript',
                    size: 4567,
                    lastModified: '2026-05-13T14:30:00Z',
                  },
                ],
              },
              {
                path: 'src/app/api/chat',
                type: 'directory',
                children: [
                  {
                    path: 'src/app/api/chat/route.ts',
                    type: 'file',
                    language: 'typescript',
                    size: 5234,
                    lastModified: '2026-05-12T11:45:00Z',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: 'src/components',
        type: 'directory',
        expanded: true,
        children: [
          {
            path: 'src/components/ui',
            type: 'directory',
            children: [
              {
                path: 'src/components/ui/button.tsx',
                type: 'file',
                language: 'typescript',
                size: 1234,
                lastModified: '2026-05-10T08:30:00Z',
              },
              {
                path: 'src/components/ui/dialog.tsx',
                type: 'file',
                language: 'typescript',
                size: 2345,
                lastModified: '2026-05-10T08:30:00Z',
              },
            ],
          },
          {
            path: 'src/components/layout',
            type: 'directory',
            children: [
              {
                path: 'src/components/layout/sidebar.tsx',
                type: 'file',
                language: 'typescript',
                size: 3456,
                lastModified: '2026-05-11T10:15:00Z',
              },
              {
                path: 'src/components/layout/topbar.tsx',
                type: 'file',
                language: 'typescript',
                size: 2789,
                lastModified: '2026-05-11T10:15:00Z',
              },
            ],
          },
        ],
      },
      {
        path: 'src/lib',
        type: 'directory',
        children: [
          {
            path: 'src/lib/db.ts',
            type: 'file',
            language: 'typescript',
            size: 4321,
            lastModified: '2026-05-09T15:20:00Z',
          },
          {
            path: 'src/lib/llm.ts',
            type: 'file',
            language: 'typescript',
            size: 5678,
            lastModified: '2026-05-10T14:30:00Z',
          },
          {
            path: 'src/lib/utils.ts',
            type: 'file',
            language: 'typescript',
            size: 1567,
            lastModified: '2026-05-15T17:46:00Z',
          },
        ],
      },
      {
        path: 'src/types',
        type: 'directory',
        children: [
          {
            path: 'src/types/api.ts',
            type: 'file',
            language: 'typescript',
            size: 6789,
            lastModified: '2026-05-15T17:47:00Z',
          },
        ],
      },
    ],
  },
  {
    path: 'prisma',
    type: 'directory',
    children: [
      {
        path: 'prisma/schema.prisma',
        type: 'file',
        language: 'prisma',
        size: 3456,
        lastModified: '2026-05-08T12:00:00Z',
      },
    ],
  },
  {
    path: 'public',
    type: 'directory',
    children: [
      {
        path: 'public/logo.svg',
        type: 'file',
        language: 'svg',
        size: 1234,
        lastModified: '2026-05-01T10:00:00Z',
      },
    ],
  },
  {
    path: 'package.json',
    type: 'file',
    language: 'json',
    size: 2345,
    lastModified: '2026-05-15T17:44:00Z',
  },
  {
    path: 'tsconfig.json',
    type: 'file',
    language: 'json',
    size: 567,
    lastModified: '2026-05-01T10:00:00Z',
  },
  {
    path: 'README.md',
    type: 'file',
    language: 'markdown',
    size: 4567,
    lastModified: '2026-05-14T09:30:00Z',
  },
];

export const mockFileContent = `import { NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/llm';
import { searchVectorDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { projectId, query, limit = 10 } = await request.json();
    
    // Validate input
    if (!projectId || !query) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate query embedding
    const queryEmbedding = await generateEmbedding(query);
    
    // Search vector database
    const results = await searchVectorDB(projectId, queryEmbedding, limit);
    
    return NextResponse.json({
      results,
      totalResults: results.length,
      query,
      executionTime: Date.now() - startTime,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}`;

// Made with Bob
