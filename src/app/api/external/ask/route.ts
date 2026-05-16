import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { queryRAG } from '@/lib/rag/rag-chain';
import { getSearchCache } from '@/lib/cache';

const askSchema = z
  .object({
    projectId: z.string().optional(),
    projectPath: z.string().optional(),
    projectName: z.string().optional(),
    query: z.string().min(1, 'Query is required'),
    maxResults: z.number().min(1).max(20).optional().default(5),
  })
  .refine((d) => d.projectId || d.projectPath || d.projectName, {
    message: 'One of projectId, projectPath, or projectName is required',
  });

function authError(msg: string, code: string, status: number) {
  return NextResponse.json({ error: msg, code }, { status });
}

/**
 * External query endpoint for AI tools (Claude Code, Bob Shell, Codex, etc.)
 *
 * POST /api/external/ask
 * Authorization: Bearer <API_SECRET_KEY>
 *
 * Body:
 *   projectId?   – internal project UUID
 *   projectPath? – filesystem path of the repository (e.g. /Users/me/my-repo)
 *   projectName? – display name of the project
 *   query        – natural-language question about the codebase
 *   maxResults?  – number of code chunks to retrieve (1-20, default 5)
 *
 * At least one of projectId / projectPath / projectName must be supplied.
 * projectId is checked first, then projectPath (exact), then projectName (exact).
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return authError('Missing or invalid authorization header', 'UNAUTHORIZED', 401);
    }
    const apiKey = authHeader.substring(7);
    const validApiKey = process.env.API_SECRET_KEY;
    if (!validApiKey || apiKey !== validApiKey) {
      return authError('Invalid API key', 'INVALID_API_KEY', 401);
    }

    // Validate body
    const body = await request.json();
    const { projectId, projectPath, projectName, query, maxResults } = askSchema.parse(body);

    // Project lookup — try ID → path → name
    let repository = null;
    if (projectId) {
      repository = await prisma.repository.findUnique({ where: { id: projectId } });
    } else if (projectPath) {
      repository = await prisma.repository.findFirst({ where: { path: projectPath } });
    } else if (projectName) {
      repository = await prisma.repository.findFirst({ where: { name: projectName } });
    }

    if (!repository) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (repository.status !== 'ready') {
      return NextResponse.json(
        {
          error: 'Project is not ready. Please wait for indexing to complete.',
          code: 'PROJECT_NOT_READY',
          status: repository.status,
        },
        { status: 400 }
      );
    }

    // Cache check — key includes projectId so different projects never share entries
    const cache = getSearchCache();
    const cacheFilters = { projectId: repository.id };
    const cached = cache.get(query, cacheFilters);
    if (cached) {
      return NextResponse.json({
        ...cached,
        cached: true,
        executionTime: Date.now() - startTime,
      });
    }

    // RAG — reuse the shared chain (embedding + vector search + LLM)
    const ragResponse = await queryRAG(repository.id, query, maxResults);

    const sources = ragResponse.sources.map((s) => ({
      file: s.file,
      lines: s.lines,
      content: s.content,
      relevance: s.score,
    }));

    const avgRelevance =
      sources.length > 0
        ? sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length
        : 0;
    const confidence = Math.min(avgRelevance * 1.2, 1);

    const result = {
      answer: ragResponse.answer,
      sources,
      project: { id: repository.id, name: repository.name },
      confidence,
      executionTime: Date.now() - startTime,
      cached: false,
    };

    cache.set(query, result, cacheFilters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('External ask error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
