import { ChatMessage } from '@/types/api';

export interface ChatConversation {
  id: string;
  title: string;
  group: string;
  messages: ChatMessage[];
  createdAt: string;
}

export const mockChatConversations: ChatConversation[] = [
  {
    id: 'conv_1',
    title: 'How does authentication work?',
    group: 'Authentication',
    createdAt: '2026-05-15T10:30:00Z',
    messages: [
      {
        role: 'user',
        content: 'How does the authentication system work in this project?',
        timestamp: '2026-05-15T10:30:00Z',
      },
      {
        role: 'assistant',
        content:
          'The authentication system uses JWT tokens with a two-step process:\n\n1. **Login Flow**: The `authenticateUser` function in `src/auth/login.ts` validates credentials against the database and generates a JWT token using the `jsonwebtoken` library.\n\n2. **Token Verification**: Each protected API route uses the `verifyToken` middleware from `src/middleware/auth.ts` to validate the JWT token in the Authorization header.\n\nThe tokens expire after 24 hours and include the user ID and role in the payload.',
        timestamp: '2026-05-15T10:30:15Z',
        sources: [
          {
            file: 'src/auth/login.ts',
            lines: [45, 78],
          },
          {
            file: 'src/middleware/auth.ts',
            lines: [12, 35],
          },
        ],
      },
    ],
  },
  {
    id: 'conv_2',
    title: 'Explain the search algorithm',
    group: 'Search',
    createdAt: '2026-05-14T15:20:00Z',
    messages: [
      {
        role: 'user',
        content: 'Can you explain how the semantic search algorithm works?',
        timestamp: '2026-05-14T15:20:00Z',
      },
      {
        role: 'assistant',
        content:
          'The semantic search uses vector embeddings and cosine similarity:\n\n1. **Indexing**: Code chunks are converted to 384-dimensional vectors using the `all-MiniLM-L6-v2` model\n2. **Query Processing**: User queries are embedded using the same model\n3. **Similarity Search**: PostgreSQL with pgvector extension performs cosine similarity search\n4. **Ranking**: Results are ranked by similarity score (0-1) and filtered by relevance threshold\n\nThe system can search across 100k+ code chunks in under 200ms.',
        timestamp: '2026-05-14T15:20:18Z',
        sources: [
          {
            file: 'src/lib/embeddings.ts',
            lines: [23, 56],
          },
          {
            file: 'src/app/api/search/route.ts',
            lines: [34, 67],
          },
        ],
      },
    ],
  },
  {
    id: 'conv_3',
    title: 'Database schema overview',
    group: 'Database',
    createdAt: '2026-05-13T09:45:00Z',
    messages: [
      {
        role: 'user',
        content: 'What tables are in the database?',
        timestamp: '2026-05-13T09:45:00Z',
      },
      {
        role: 'assistant',
        content:
          'The database has 5 main tables:\n\n1. **projects**: Stores indexed repositories\n2. **files**: Individual files in each project\n3. **chunks**: Code chunks with embeddings (vector column)\n4. **commits**: Git commit history\n5. **conversations**: Chat conversation history\n\nThe schema uses Prisma ORM with PostgreSQL and the pgvector extension for vector similarity search.',
        timestamp: '2026-05-13T09:45:12Z',
        sources: [
          {
            file: 'prisma/schema.prisma',
            lines: [1, 120],
          },
        ],
      },
    ],
  },
];

export const mockCurrentConversation = mockChatConversations[0];

// Made with Bob
