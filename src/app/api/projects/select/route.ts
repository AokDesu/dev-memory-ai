import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import path from 'path';

const selectProjectSchema = z.object({
  path: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path: projectPath } = selectProjectSchema.parse(body);

    // Normalize path
    const normalizedPath = path.resolve(projectPath);
    const projectName = path.basename(normalizedPath);

    // Check if project already exists
    let project = await prisma.repository.findUnique({
      where: { path: normalizedPath },
    });

    if (project) {
      return NextResponse.json({
        projectId: project.id,
        name: project.name,
        status: project.status,
        progress: 0,
        message: 'Project already exists',
      });
    }

    // Create new project
    project = await prisma.repository.create({
      data: {
        path: normalizedPath,
        name: projectName,
        status: 'pending',
      },
    });

    return NextResponse.json({
      projectId: project.id,
      name: project.name,
      status: project.status,
      progress: 0,
    });
  } catch (error) {
    console.error('Select project error:', error);

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
