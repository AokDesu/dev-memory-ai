import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;

    // Get repository
    const repository = await prisma.repository.findUnique({
      where: { id: projectId },
      include: {
        indexingJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            files: true,
          },
        },
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    const latestJob = repository.indexingJobs[0];

    return NextResponse.json({
      projectId: repository.id,
      status: repository.status,
      progress: latestJob?.progress || 0,
      processedFiles: latestJob?.processedFiles || 0,
      totalFiles: latestJob?.totalFiles || 0,
      currentFile: latestJob?.currentFile || null,
      error: latestJob?.error || null,
      startedAt: latestJob?.startedAt?.toISOString() || null,
      completedAt: latestJob?.completedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error getting project status:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
