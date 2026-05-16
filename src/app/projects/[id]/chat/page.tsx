'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import * as Icons from '@/components/ui/icons';
import { EmptyState, LoadingSpinner } from '@/components/ui/states';
import { apiClient } from '@/lib/api-client';
import { ChatMessage, ChatEvent } from '@/types/api';

export default function ChatPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentSources, setCurrentSources] = useState<Array<{ file: string; lines: [number, number] }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || streaming) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setStreaming(true);
    setCurrentResponse('');
    setCurrentSources([]);

    // Locals avoid the stale-closure bug: React state set inside the
    // `for await` loop isn't visible on subsequent iterations of the same
    // render, so the persisted message would always be empty.
    let assembledResponse = '';
    let assembledSources: Array<{ file: string; lines: [number, number] }> = [];

    try {
      const stream = apiClient.chatStream({
        projectId,
        message: input,
      });

      for await (const event of stream) {
        switch (event.type) {
          case 'thinking':
            // Just show loading state
            break;
          case 'context':
            if ('sources' in event) {
              assembledSources = event.sources.map((s) => ({
                file: s.file,
                lines: s.lines,
              }));
              setCurrentSources(assembledSources);
            }
            break;
          case 'token':
            if ('content' in event) {
              assembledResponse += event.content;
              setCurrentResponse(assembledResponse);
            }
            break;
          case 'done': {
            const aiMessage: ChatMessage = {
              role: 'assistant',
              content: assembledResponse,
              timestamp: new Date().toISOString(),
              sources: assembledSources.length > 0 ? assembledSources : undefined,
            };
            setMessages((prev) => [...prev, aiMessage]);
            setCurrentResponse('');
            setCurrentSources([]);
            setStreaming(false);
            break;
          }
          case 'error':
            if ('error' in event) {
              console.error('Chat error:', event.error);
              const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `Error: ${event.error}`,
                timestamp: new Date().toISOString(),
              };
              setMessages((prev) => [...prev, errorMessage]);
            }
            setStreaming(false);
            break;
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to send message'}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreaming(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Chat Header */}
      <div className="border-b border-border bg-bg-elevated px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-fg mb-2">AI Chat</h1>
          <p className="text-sm text-fg-muted">
            Ask questions about your codebase
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <EmptyState
              icon={<Icons.Chat size={32} />}
              title="Start a conversation"
              description="Ask me anything about your codebase. I can help you understand code, find implementations, or explain complex logic."
            />
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-4 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-fg font-semibold text-sm flex-shrink-0">
                  AI
                </div>
              )}

              <div
                className={`flex-1 max-w-3xl ${
                  message.role === 'user' ? 'flex justify-end' : ''
                }`}
              >
                <div
                  className={`rounded-xl p-4 ${
                    message.role === 'user'
                      ? 'bg-accent text-accent-fg'
                      : 'bg-bg-card border border-border'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border space-y-2">
                      <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider">
                        Sources
                      </div>
                      {message.sources.map((source, i) => (
                        <button
                          key={i}
                          className="flex items-center gap-2 w-full p-2 rounded-lg bg-bg-hover hover:bg-bg-sunken transition-colors text-left"
                        >
                          <Icons.FileText size={14} className="text-fg-muted flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-mono text-fg truncate">
                              {source.file}
                            </div>
                            <div className="text-xs text-fg-dim">
                              Lines {source.lines[0]}-{source.lines[1]}
                            </div>
                          </div>
                          <Icons.ExternalLink size={12} className="text-fg-dim flex-shrink-0" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-fg-dim">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {message.role === 'user' && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-bg-hover text-fg font-semibold text-sm flex-shrink-0">
                  U
                </div>
              )}
            </div>
          ))}

          {streaming && (
            <div className="flex gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-fg font-semibold text-sm flex-shrink-0">
                AI
              </div>
              <div className="flex-1 max-w-3xl">
                <div className="rounded-xl p-4 bg-bg-card border border-border">
                  {currentResponse ? (
                    <>
                      <div className="text-sm whitespace-pre-wrap">{currentResponse}</div>
                      {currentSources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-border space-y-2">
                          <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider">
                            Sources
                          </div>
                          {currentSources.map((source, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded-lg bg-bg-hover"
                            >
                              <Icons.FileText size={14} className="text-fg-muted flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-mono text-fg truncate">
                                  {source.file}
                                </div>
                                <div className="text-xs text-fg-dim">
                                  Lines {source.lines[0]}-{source.lines[1]}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LoadingSpinner size={16} />
                      <span className="text-sm text-fg-muted">Thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-bg-elevated p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3 p-4 bg-bg-card border-2 border-border-strong rounded-xl focus-within:border-accent transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your codebase..."
              className="flex-1 bg-transparent border-none outline-none text-fg text-sm placeholder:text-fg-dim resize-none min-h-[24px] max-h-[200px]"
              rows={1}
              disabled={streaming}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="btn btn-primary btn-sm flex-shrink-0"
            >
              {streaming ? (
                <LoadingSpinner size={14} />
              ) : (
                <>
                  <Icons.ArrowRight size={14} />
                  Send
                </>
              )}
            </button>
          </div>
          <div className="mt-2 text-xs text-fg-dim text-center">
            Press <span className="kbd">Enter</span> to send, <span className="kbd">Shift+Enter</span> for new line
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
