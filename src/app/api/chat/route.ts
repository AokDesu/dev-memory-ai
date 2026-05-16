import { NextRequest } from 'next/server';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { queryRAGStream } from '@/lib/rag/rag-chain';

// Request validation schema
const chatRequestSchema = z.object({
  projectId: z.string(),
  message: z.string().min(1),
  conversationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    const { projectId, message, conversationId } = validatedData;
    const sessionConversationId = conversationId ?? randomUUID();

    // Get RAG response with streaming
    const { stream, sources } = await queryRAGStream(projectId, message);

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          // Send thinking event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'thinking' })}\n\n`
            )
          );

          // Send context/sources event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'context',
                sources: sources.map((s) => ({
                  file: s.file,
                  lines: s.lines,
                })),
              })}\n\n`
            )
          );

          // Stream tokens from LLM
          for await (const chunk of stream) {
            const content = typeof chunk === 'string' ? chunk : chunk.content;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'token',
                  content,
                })}\n\n`
              )
            );
          }

          // Send done event matching ChatDoneEvent shape
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'done',
                conversationId: sessionConversationId,
              })}\n\n`
            )
          );

          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);

    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Made with Bob
