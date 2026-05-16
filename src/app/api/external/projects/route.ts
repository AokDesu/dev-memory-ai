import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * List all indexed projects available to external tools.
 *
 * GET /api/external/projects
 * Authorization: Bearer <API_SECRET_KEY>
 *
 * Use the returned `id`, `path`, or `name` to identify a project
 * when calling POST /api/external/ask.
 */
export async function GET(request: NextRequest) {
  try {
    // Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    const apiKey = authHeader.substring(7);
    const validApiKey = process.env.API_SECRET_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      return NextResponse.json(
        { error: 'Invalid API key', code: 'INVALID_API_KEY' },
        { status: 401 }
      );
    }

    const repositories = await prisma.repository.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, path: true, status: true, lastIndexed: true },
    });

    const projects = repositories.map((r) => ({
      id: r.id,
      name: r.name,
      path: r.path,
      status: r.status,
      lastIndexed: r.lastIndexed?.toISOString() ?? null,
    }));

    return NextResponse.json({ projects, total: projects.length });
  } catch (error) {
    console.error('External projects list error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
