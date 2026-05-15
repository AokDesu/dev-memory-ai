import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { indexRepository } from '@/lib/indexer/file-indexer';

const indexProjectSchema = z.object({
  projectId: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = indexProjectSchema.parse(body);

    // Start indexing in background (don't await)
    indexRepository(projectId, '')
      .then(() => {
        console.log(`Indexing completed for project ${projectId}`);
      })
      .catch((error) => {
        console.error(`Indexing failed for project ${projectId}:`, error);
      });

    return NextResponse.json({
      message: 'Indexing started',
      projectId,
    });
  } catch (error) {
    console.error('Index project error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

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
