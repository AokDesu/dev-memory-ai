import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getEmbeddings } from '@/lib/llm';
import { searchCodeChunks, SearchFilters } from '@/lib/search/vector-search';

// Request validation schema
const searchRequestSchema = z.object({
  projectId: z.string(),
  query: z.string().min(1),
  limit: z.number().optional().default(10),
  filters: z
    .object({
      fileType: z.array(z.string()).optional(),
      author: z.string().optional(),
      dateRange: z
        .object({
          from: z.string(),
          to: z.string(),
        })
        .optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = searchRequestSchema.parse(body);

    const { projectId, query, limit, filters } = validatedData;

    // Generate embedding for the query
    const queryEmbedding = await getEmbeddings(query);

    // Search code chunks
    const results = await searchCodeChunks(
      projectId,
      queryEmbedding,
      limit,
      filters as SearchFilters
    );

    return NextResponse.json({
      results: results.map((result) => ({
        id: result.id,
        file: result.file,
        content: result.content,
        score: result.score,
        lineStart: result.lineStart,
        lineEnd: result.lineEnd,
        language: result.language,
        chunkType: result.chunkType,
        name: result.name ?? null,
        context: result.context,
      })),
      totalResults: results.length,
      query,
    });
  } catch (error) {
    console.error('Search API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          details: error.errors,
        },
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

// GET endpoint for search suggestions or recent searches
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    // TODO: Implement search history or suggestions
    return NextResponse.json({
      suggestions: [],
      recentSearches: [],
    });
  } catch (error) {
    console.error('Search GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Made with Bob
