import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { validatePath, isDirectory, isGitRepository, getRepositoryName } from '@/lib/filesystem';
import { z } from 'zod';

const selectProjectSchema = z.object({
  path: z.string().min(1, 'Path is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: projectPath } = selectProjectSchema.parse(body);

    // Validate path
    let validatedPath: string;
    try {
      validatedPath = validatePath(projectPath);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    // Check if it's a directory
    if (!isDirectory(validatedPath)) {
      return NextResponse.json(
        { error: 'Path must be a directory', code: 'NOT_A_DIRECTORY' },
        { status: 400 }
      );
    }

    // Check if it's a Git repository
    const isGit = await isGitRepository(validatedPath);
    if (!isGit) {
      return NextResponse.json(
        { error: 'Path must be a Git repository', code: 'NOT_A_GIT_REPO' },
        { status: 400 }
      );
    }

    // Get repository name
    const repoName = getRepositoryName(validatedPath);

    // Check if repository already exists
    let repository = await prisma.repository.findUnique({
      where: { path: validatedPath },
    });

    if (repository) {
      // Repository already exists, return it
      return NextResponse.json({
        projectId: repository.id,
        name: repository.name,
        status: repository.status,
        progress: 0,
        message: 'Repository already indexed',
      });
    }

    // Create new repository
    repository = await prisma.repository.create({
      data: {
        path: validatedPath,
        name: repoName,
        status: 'pending',
      },
    });

    // Create indexing job
    await prisma.indexingJob.create({
      data: {
        repositoryId: repository.id,
        status: 'pending',
        progress: 0,
      },
    });

    return NextResponse.json(
      {
        projectId: repository.id,
        name: repository.name,
        status: repository.status,
        progress: 0,
        message: 'Repository added successfully. Ready to index.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error selecting project:', error);

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
