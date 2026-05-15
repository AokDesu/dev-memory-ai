import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getIndexingProgress } from '@/lib/indexer/file-indexer';

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params;

    // Get repository
    const repository = await prisma.repository.findUnique({
      where: { id: projectId },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get indexing progress
    const progress = await getIndexingProgress(projectId);

    if (progress) {
      return NextResponse.json({
        projectId: repository.id,
        status: 'indexing',
        progress: progress.progress,
        processedFiles: progress.processedFiles,
        totalFiles: progress.totalFiles,
        currentFile: progress.currentFile,
      });
    }

    return NextResponse.json({
      projectId: repository.id,
      status: repository.status,
      progress: repository.status === 'ready' ? 100 : 0,
      processedFiles: 0,
      totalFiles: 0,
      currentFile: null,
    });
  } catch (error) {
    console.error('Project status error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Made with Bob
