import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { FileTreeNode } from '@/types/api';

interface BuilderNode {
  path: string;
  name: string;
  type: 'file' | 'directory';
  language?: string;
  size?: number;
  lastModified?: string;
  children?: Map<string, BuilderNode>;
}

interface FileMeta {
  language: string | null;
  size: number | null;
  lastModified: Date | null;
}

function ensureDir(
  parent: Map<string, BuilderNode>,
  parentPath: string,
  segment: string
): BuilderNode {
  const existing = parent.get(segment);
  if (existing) return existing;
  const fullPath = parentPath ? `${parentPath}/${segment}` : segment;
  const node: BuilderNode = {
    path: fullPath,
    name: segment,
    type: 'directory',
    children: new Map(),
  };
  parent.set(segment, node);
  return node;
}

function addFile(
  root: Map<string, BuilderNode>,
  segments: string[],
  meta: FileMeta
) {
  let parent = root;
  let parentPath = '';

  for (let i = 0; i < segments.length - 1; i++) {
    const dir = ensureDir(parent, parentPath, segments[i]);
    parentPath = dir.path;
    if (!dir.children) dir.children = new Map();
    parent = dir.children;
  }

  const leafName = segments[segments.length - 1];
  const leafPath = parentPath ? `${parentPath}/${leafName}` : leafName;
  parent.set(leafName, {
    path: leafPath,
    name: leafName,
    type: 'file',
    language: meta.language ?? undefined,
    size: meta.size ?? undefined,
    lastModified: meta.lastModified
      ? meta.lastModified.toISOString()
      : undefined,
  });
}

function serialise(map: Map<string, BuilderNode>): FileTreeNode[] {
  const list: FileTreeNode[] = [];
  for (const node of map.values()) {
    if (node.type === 'directory') {
      list.push({
        path: node.path,
        type: 'directory',
        children: node.children ? serialise(node.children) : [],
      });
    } else {
      list.push({
        path: node.path,
        type: 'file',
        language: node.language,
        size: node.size,
        lastModified: node.lastModified,
      });
    }
  }
  list.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.path.localeCompare(b.path);
  });
  return list;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const repo = await prisma.repository.findUnique({ where: { id } });
    if (!repo) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const files = await prisma.file.findMany({
      where: { repositoryId: id },
      select: {
        path: true,
        language: true,
        size: true,
        lastModified: true,
      },
      orderBy: { path: 'asc' },
    });

    const root = new Map<string, BuilderNode>();
    for (const f of files) {
      const segments = f.path.split(/[\\/]/).filter(Boolean);
      if (segments.length === 0) continue;
      addFile(root, segments, {
        language: f.language,
        size: f.size,
        lastModified: f.lastModified,
      });
    }

    return NextResponse.json({
      tree: serialise(root),
      totalFiles: files.length,
    });
  } catch (error) {
    console.error('File tree error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
