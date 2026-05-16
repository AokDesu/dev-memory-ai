'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import * as Icons from '@/components/ui/icons';
import { EmptyState, LoadingSpinner } from '@/components/ui/states';
import { apiClient } from '@/lib/api-client';
import { SearchResult } from '@/types/api';
import { formatRelativeTime } from '@/lib/utils';

export default function SearchPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [executionTime, setExecutionTime] = useState<number>(0);

  // Filters
  const [fileType, setFileType] = useState<string[]>([]);
  const [chunkType, setChunkType] = useState<string[]>([]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearched(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      const response = await apiClient.search({
        projectId,
        query: query.trim(),
        limit: 20,
        filters: {
          fileType: fileType.length > 0 ? fileType : undefined,
        },
      });
      
      setResults(response.results);
      setExecutionTime(Date.now() - startTime);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to search');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Search Header */}
      <div className="border-b border-border bg-bg-elevated p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-fg mb-2">Semantic Search</h1>
            <p className="text-sm text-fg-muted">
              Search your codebase using natural language
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 p-4 bg-bg-card border-2 border-border-strong rounded-xl focus-within:border-accent transition-colors">
            <Icons.Search size={20} className="text-fg-dim flex-shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search for functions, classes, or describe what you're looking for..."
              className="flex-1 bg-transparent border-none outline-none text-fg text-base placeholder:text-fg-dim"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setResults([]);
                  setSearched(false);
                }}
                className="text-fg-dim hover:text-fg transition-colors"
              >
                <Icons.X size={18} />
              </button>
            )}
            <button
              onClick={handleSearch}
              disabled={!query.trim() || loading}
              className="btn btn-primary btn-sm"
            >
              {loading ? <LoadingSpinner size={14} /> : 'Search'}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-fg-dim uppercase tracking-wider">
              Filters:
            </span>
            <button className="btn btn-ghost btn-sm">
              <Icons.Filter size={14} />
              File Type
            </button>
            <button className="btn btn-ghost btn-sm">
              <Icons.Code size={14} />
              Chunk Type
            </button>
            <button className="btn btn-ghost btn-sm">
              <Icons.User size={14} />
              Author
            </button>
            <button className="btn btn-ghost btn-sm">
              <Icons.Clock size={14} />
              Date Range
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {!searched && (
            <EmptyState
              icon={<Icons.Search size={32} />}
              title="Start searching"
              description="Enter a query above to search your codebase using semantic search. Try describing what you're looking for in natural language."
            />
          )}

          {searched && loading && (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size={32} />
            </div>
          )}

          {searched && !loading && results.length === 0 && !error && (
            <EmptyState
              icon={<Icons.Search size={32} />}
              title="No results found"
              description="Try adjusting your search query or filters."
            />
          )}

          {error && (
            <EmptyState
              icon={<Icons.AlertCircle size={32} />}
              title="Search failed"
              description={error}
              action={{
                label: 'Retry',
                onClick: handleSearch,
              }}
            />
          )}

          {searched && !loading && results.length > 0 && (
            <div className="space-y-4">
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-fg-muted">
                  Found <span className="font-semibold text-fg">{results.length}</span> results
                </div>
                <div className="text-xs text-fg-dim">
                  Search completed in {executionTime}ms
                </div>
              </div>

              {/* Results List */}
              <div className="space-y-3">
                {results.map((result) => (
                  <div
                    key={result.id}
                    className="card hover:border-border-strong transition-all cursor-pointer group"
                  >
                    {/* Result Header */}
                    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Icons.FileIcon ext={result.language} size={14} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono text-fg-muted truncate">
                              {result.file.split('/').slice(0, -1).join('/')}
                            </span>
                            <span className="text-sm font-mono text-fg font-medium">
                              /{result.file.split('/').pop()}
                            </span>
                          </div>
                          {result.name && (
                            <div className="text-xs text-fg-dim mt-0.5">
                              {result.chunkType}: {result.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="text-xs font-semibold text-accent">
                            {Math.round(result.score * 100)}%
                          </div>
                          <div className="w-16 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                            <div
                              className="h-full bg-accent rounded-full"
                              style={{ width: `${result.score * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-fg-dim font-mono">
                          L{result.lineStart}-{result.lineEnd}
                        </span>
                      </div>
                    </div>

                    {/* Code Preview */}
                    <div className="p-4 bg-code-bg">
                      <pre className="text-sm font-mono text-fg overflow-x-auto">
                        <code>{result.content}</code>
                      </pre>
                    </div>

                    {/* Context */}
                    {result.context?.commit && (
                      <div className="px-4 py-3 border-t border-border bg-bg-sunken">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5 text-fg-dim">
                            <Icons.GitBranch size={12} />
                            <span className="font-mono">{result.context.commit.hash.slice(0, 7)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-fg-muted">
                            <Icons.User size={12} />
                            <span>{result.context.commit.author}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-fg-dim">
                            <Icons.Clock size={12} />
                            <span>{formatRelativeTime(result.context.commit.date)}</span>
                          </div>
                          <div className="flex-1 min-w-0 text-fg-muted truncate">
                            {result.context.commit.message}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
