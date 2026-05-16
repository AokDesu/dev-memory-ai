import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getLLM, getEmbeddings } from '@/lib/llm';
import { getSearchCache } from '@/lib/cache';
import { z } from 'zod';

const querySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  query: z.string().min(1, 'Query is required'),
  context: z.string().optional(),
  maxResults: z.number().min(1).max(20).optional().default(5),
});

/**
 * External API endpoint for AI tools (Claude Code, Cursor, etc.)
 * Requires API key authentication
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Check API key authentication
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

    // Parse and validate request
    const body = await request.json();
    const { projectId, query, context, maxResults } = querySchema.parse(body);

    // Check if project exists
    const repository = await prisma.repository.findUnique({
      where: { id: projectId },
    });

    if (!repository) {
      return NextResponse.json(
        { error: 'Project not found', code: 'PROJECT_NOT_FOUND' },
        { status: 404 }
      );
    }

    if (repository.status !== 'ready') {
      return NextResponse.json(
        { error: 'Project is not ready. Please wait for indexing to complete.', code: 'PROJECT_NOT_READY' },
        { status: 400 }
      );
    }

    // Check cache — key includes projectId so different projects never share entries
    const cache = getSearchCache();
    const cacheFilters = { projectId };
    const cachedResult = cache.get(query, cacheFilters);
    if (cachedResult) {
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        executionTime: Date.now() - startTime,
      });
    }

    // Generate query embedding
    const queryEmbedding = await getEmbeddings(query);

    // Search for relevant code chunks
    const allChunks = await prisma.codeChunk.findMany({
      where: { repositoryId: projectId },
      include: {
        file: true,
      },
      take: 100, // Get top 100 for scoring
    });

    // Calculate similarity scores
    const scoredChunks = allChunks
      .map(chunk => {
        if (!chunk.embedding) return null;

        let chunkEmbedding: number[];
        try {
          chunkEmbedding = JSON.parse(chunk.embedding);
        } catch {
          return null;
        }
        if (!Array.isArray(chunkEmbedding)) return null;

        const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);

        return {
          chunk,
          similarity,
        };
      })
      .filter(item => item !== null)
      .sort((a, b) => b!.similarity - a!.similarity)
      .slice(0, maxResults);

    // Format sources
    const sources = scoredChunks.map(item => ({
      file: item!.chunk.file.path,
      lines: [item!.chunk.startLine, item!.chunk.endLine] as [number, number],
      content: item!.chunk.content,
      relevance: item!.similarity,
    }));

    // Generate answer using LLM
    const llm = getLLM();
    const contextText = sources
      .map(s => `File: ${s.file} (lines ${s.lines[0]}-${s.lines[1]})\n${s.content}`)
      .join('\n\n---\n\n');

    const prompt = `You are a code assistant helping developers understand their codebase.

Context from the codebase:
${contextText}

${context ? `Additional context: ${context}\n\n` : ''}Question: ${query}

Provide a clear, concise answer based on the code context above. Always cite the source files and line numbers.`;

    const response = await llm.invoke(prompt);
    const answer = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);

    // Calculate confidence based on relevance scores
    const avgRelevance =
      sources.length > 0
        ? sources.reduce((sum, s) => sum + s.relevance, 0) / sources.length
        : 0;
    const confidence = Math.min(avgRelevance * 1.2, 1); // Scale up slightly, cap at 1

    const result = {
      answer,
      sources,
      confidence,
      executionTime: Date.now() - startTime,
    };

    // Cache the result
    cache.set(query, result, cacheFilters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing external query:', error);

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

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  
  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  
  return dotProduct / (magnitudeA * magnitudeB);
}
