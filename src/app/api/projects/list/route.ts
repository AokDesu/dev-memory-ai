import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Internal route used by the dashboard UI (same-origin fetch from the browser).
// External AI tools must use /api/external/projects which enforces Bearer auth.
// Exposed fields include absolute filesystem paths, so do not widen CORS for this
// route — same-origin policy is the security boundary.
export async function GET(_request: NextRequest) {
  try {
    const repositories = await prisma.repository.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            files: true,
          },
        },
      },
    });

    const projects = repositories.map(repo => ({
      id: repo.id,
      name: repo.name,
      path: repo.path,
      status: repo.status,
      lastIndexed: repo.lastIndexed?.toISOString() || null,
      filesCount: repo._count.files,
      createdAt: repo.createdAt.toISOString(),
    }));

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Error listing projects:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
