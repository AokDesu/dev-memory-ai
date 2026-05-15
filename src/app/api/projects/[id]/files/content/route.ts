import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import { z } from 'zod';

const MAX_VIEW_BYTES = 5 * 1024 * 1024; // 5 MB cap for in-browser viewing

const bodySchema = z.object({
  path: z.string().min(1, 'path is required'),
});

function safeJoin(root: string, relPath: string): string | null {
  const normalised = path
    .normalize(relPath.replace(/^[\\/]+/, ''))
    .replace(/^[\\/]+/, '');
  const target = path.resolve(root, normalised);
  const rootResolved = path.resolve(root);
  if (target !== rootResolved && !target.startsWith(rootResolved + path.sep)) {
    return null;
  }
  return target;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { path: relPath } = bodySchema.parse(body);

    const repo = await prisma.repository.findUnique({ where: { id } });
    if (!repo) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const abs = safeJoin(repo.path, relPath);
    if (!abs) {
      return NextResponse.json(
        { error: 'Path escapes repository root', code: 'UNSAFE_PATH' },
        { status: 400 }
      );
    }

    let stat;
    try {
      stat = await fs.stat(abs);
    } catch {
      return NextResponse.json(
        { error: 'File not found', code: 'FILE_NOT_FOUND' },
        { status: 404 }
      );
    }
    if (!stat.isFile()) {
      return NextResponse.json(
        { error: 'Not a file', code: 'NOT_A_FILE' },
        { status: 400 }
      );
    }
    if (stat.size > MAX_VIEW_BYTES) {
      return NextResponse.json(
        {
          error: `File too large to view (${(stat.size / 1024 / 1024).toFixed(1)} MB > ${MAX_VIEW_BYTES / 1024 / 1024} MB)`,
          code: 'FILE_TOO_LARGE',
        },
        { status: 413 }
      );
    }

    const content = await fs.readFile(abs, 'utf-8');
    const lines = content.split('\n').length;

    const fileRow = await prisma.file.findFirst({
      where: { repositoryId: id, path: relPath },
      select: { language: true, lastAuthor: true, lastModified: true },
    });

    return NextResponse.json({
      path: relPath,
      content,
      language: fileRow?.language ?? null,
      lines,
      metadata: {
        lastAuthor: fileRow?.lastAuthor ?? null,
        lastModified: fileRow?.lastModified?.toISOString() ?? null,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('File content error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
