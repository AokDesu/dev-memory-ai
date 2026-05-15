import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { z } from 'zod';

const indexProjectSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  incremental: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, incremental } = indexProjectSchema.parse(body);

    // Get repository
    const repository = await prisma.repository.findUnique({
      where: { id: projectId },
      include: {
        indexingJobs: {
          where: { status: 'running' },
        },
      },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if already indexing
    if (repository.indexingJobs.length > 0) {
      return NextResponse.json({
        jobId: repository.indexingJobs[0].id,
        status: 'already_running',
        message: 'Indexing is already in progress for this project',
      });
    }

    // Create new indexing job
    const job = await prisma.indexingJob.create({
      data: {
        repositoryId: projectId,
        status: 'pending',
        progress: 0,
      },
    });

    // Update repository status
    await prisma.repository.update({
      where: { id: projectId },
      data: { status: 'indexing' },
    });

    // TODO: Trigger actual indexing process (Member B will implement)
    // For now, we just create the job and return
    // In production, this would trigger a background worker or queue job
96
 

    return NextResponse.json(
      {
        jobId: job.id,
        status: 'started',
        message: 'Indexing job created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error starting indexing:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// Made with Bob
