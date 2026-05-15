import { SearchResult, SearchResponse } from '@/types/api';

export const mockSearchResults: SearchResult[] = [
  {
    id: 'result_1',
    file: 'src/lib/llm.ts',
    content: `export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}`,
    score: 0.94,
    lineStart: 45,
    lineEnd: 52,
    language: 'typescript',
    chunkType: 'function',
    name: 'generateEmbedding',
    context: {
      commit: {
        hash: 'a3f2c1d',
        author: 'Alice Johnson',
        message: 'Add OpenAI embedding generation',
        date: '2026-05-10T14:30:00Z',
      },
    },
  },
  {
    id: 'result_2',
    file: 'src/app/api/search/route.ts',
    content: `export async function POST(request: Request) {
  const { projectId, query, limit = 10 } = await request.json();
  
  // Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // Search vector database
  const results = await searchVectorDB(projectId, queryEmbedding, limit);
  
  return NextResponse.json({ results });
}`,
    score: 0.89,
    lineStart: 12,
    lineEnd: 22,
    language: 'typescript',
    chunkType: 'function',
    name: 'POST',
    context: {
      commit: {
        hash: 'b7e4d2a',
        author: 'Bob Smith',
        message: 'Implement semantic search endpoint',
        date: '2026-05-12T09:15:00Z',
      },
    },
  },
  {
    id: 'result_3',
    file: 'src/lib/db.ts',
    content: `export class VectorDatabase {
  private client: PrismaClient;
  
  constructor() {
    this.client = new PrismaClient();
  }
  
  async search(embedding: number[], limit: number) {
    // Perform cosine similarity search
    return this.client.$queryRaw\`
      SELECT * FROM embeddings
      ORDER BY embedding <=> \${embedding}::vector
      LIMIT \${limit}
    \`;
  }
}`,
    score: 0.85,
    lineStart: 78,
    lineEnd: 93,
    language: 'typescript',
    chunkType: 'class',
    name: 'VectorDatabase',
  },
];

export const mockSearchResponse: SearchResponse = {
  results: mockSearchResults,
  totalResults: 15,
  query: 'vector embedding search',
  executionTime: 234,
};

// Made with Bob
