import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
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
