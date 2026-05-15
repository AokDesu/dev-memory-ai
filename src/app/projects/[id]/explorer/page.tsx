'use client';

import { useState } from 'react';
import * as Icons from '@/components/ui/icons';
import { LoadingSpinner } from '@/components/ui/states';
import { mockFileTree, mockFileContent } from '@/lib/mock-data';
import { FileTreeNode } from '@/lib/mock-data/files';
import { formatBytes } from '@/lib/utils';

export default function ExplorerPage() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>(mockFileContent);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set(['src', 'src/app', 'src/components']));
  const [loading, setLoading] = useState(false);

  const toggleDir = (path: string) => {
    setExpandedDirs((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const handleFileClick = (path: string) => {
    setSelectedFile(path);
    setLoading(true);
    // Simulate loading file content
    setTimeout(() => {
      setFileContent(mockFileContent);
      setLoading(false);
    }, 300);
  };

  const renderFileTree = (nodes: FileTreeNode[], level = 0) => {
    return nodes.map((node) => {
      const isExpanded = expandedDirs.has(node.path);
      const isSelected = selectedFile === node.path;

      if (node.type === 'directory') {
        return (
          <div key={node.path}>
            <button
              onClick={() => toggleDir(node.path)}
              className="flex items-center gap-2 w-full px-2 py-1.5 rounded hover:bg-bg-hover transition-colors text-left"
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              {isExpanded ? (
                <Icons.ChevronDown size={14} className="text-fg-muted flex-shrink-0" />
              ) : (
                <Icons.ChevronRight size={14} className="text-fg-muted flex-shrink-0" />
              )}
              {isExpanded ? (
                <Icons.FolderOpen size={14} className="text-accent flex-shrink-0" />
              ) : (
                <Icons.Folder size={14} className="text-fg-muted flex-shrink-0" />
              )}
              <span className="text-sm text-fg truncate">
                {node.path.split('/').pop()}
              </span>
            </button>
            {isExpanded && node.children && (
              <div>{renderFileTree(node.children, level + 1)}</div>
            )}
          </div>
        );
      }

      return (
        <button
          key={node.path}
          onClick={() => handleFileClick(node.path)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded transition-colors text-left ${
            isSelected ? 'bg-accent-soft text-accent' : 'hover:bg-bg-hover'
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <Icons.FileIcon ext={node.language || 'txt'} size={14} />
          <span className={`text-sm truncate ${isSelected ? 'text-accent font-medium' : 'text-fg'}`}>
            {node.path.split('/').pop()}
          </span>
        </button>
      );
    });
  };

  return (
    <div className="h-full flex">
      {/* File Tree Panel */}
      <div className="w-64 border-r border-border bg-bg-elevated flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-fg">Files</h2>
        </div>
        <div className="flex-1 overflow-auto p-2">
          {renderFileTree(mockFileTree)}
        </div>
      </div>

      {/* Code Viewer Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedFile ? (
          <>
            {/* File Header */}
            <div className="px-4 py-3 border-b border-border bg-bg-elevated flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Icons.FileIcon ext={selectedFile.split('.').pop() || 'txt'} size={16} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-fg truncate">{selectedFile}</div>
                  <div className="text-xs text-fg-dim">
                    TypeScript · 234 lines · 4.5 KB
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="icon-btn" title="Copy">
                  <Icons.Copy size={14} />
                </button>
                <button className="icon-btn" title="Download">
                  <Icons.Download size={14} />
                </button>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto bg-code-bg">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner size={32} />
                </div>
              ) : (
                <div className="p-4">
                  <pre className="text-sm font-mono text-fg">
                    <code>{fileContent}</code>
                  </pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <Icons.Code size={48} className="text-fg-dim mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-fg mb-2">No file selected</h3>
              <p className="text-sm text-fg-muted max-w-sm">
                Select a file from the tree to view its contents
              </p>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights Panel */}
      <div className="w-80 border-l border-border bg-bg-elevated flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-fg">AI Insights</h2>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {selectedFile ? (
            <>
              {/* File Summary */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Zap size={14} className="text-accent" />
                  <h3 className="text-sm font-semibold text-fg">Summary</h3>
                </div>
                <p className="text-sm text-fg-muted leading-relaxed">
                  This file implements the search API endpoint with semantic search capabilities using vector embeddings.
                </p>
              </div>

              {/* Key Functions */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Code size={14} className="text-accent" />
                  <h3 className="text-sm font-semibold text-fg">Key Functions</h3>
                </div>
                <div className="space-y-2">
                  <button className="flex items-center gap-2 w-full p-2 rounded-lg bg-bg-hover hover:bg-bg-sunken transition-colors text-left">
                    <span className="text-xs font-mono text-fg">POST()</span>
                    <span className="text-xs text-fg-dim">L12-22</span>
                  </button>
                  <button className="flex items-center gap-2 w-full p-2 rounded-lg bg-bg-hover hover:bg-bg-sunken transition-colors text-left">
                    <span className="text-xs font-mono text-fg">generateEmbedding()</span>
                    <span className="text-xs text-fg-dim">L45-52</span>
                  </button>
                </div>
              </div>

              {/* Dependencies */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.Package size={14} className="text-accent" />
                  <h3 className="text-sm font-semibold text-fg">Dependencies</h3>
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs font-mono text-fg-muted">@/lib/llm</div>
                  <div className="text-xs font-mono text-fg-muted">@/lib/db</div>
                  <div className="text-xs font-mono text-fg-muted">next/server</div>
                </div>
              </div>

              {/* Related Files */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.FileText size={14} className="text-accent" />
                  <h3 className="text-sm font-semibold text-fg">Related Files</h3>
                </div>
                <div className="space-y-2">
                  <button className="flex items-center gap-2 w-full p-2 rounded-lg bg-bg-hover hover:bg-bg-sunken transition-colors text-left">
                    <Icons.FileIcon ext="ts" size={12} />
                    <span className="text-xs text-fg truncate">src/lib/llm.ts</span>
                  </button>
                  <button className="flex items-center gap-2 w-full p-2 rounded-lg bg-bg-hover hover:bg-bg-sunken transition-colors text-left">
                    <Icons.FileIcon ext="ts" size={12} />
                    <span className="text-xs text-fg truncate">src/lib/db.ts</span>
                  </button>
                </div>
              </div>

              {/* Recent Changes */}
              <div className="card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icons.GitBranch size={14} className="text-accent" />
                  <h3 className="text-sm font-semibold text-fg">Recent Changes</h3>
                </div>
                <div className="space-y-2">
                  <div className="text-xs">
                    <div className="font-mono text-fg-dim mb-1">a3f2c1d</div>
                    <div className="text-fg-muted">Add semantic search endpoint</div>
                    <div className="text-fg-dim mt-1">2 days ago</div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Icons.Info size={32} className="text-fg-dim mx-auto mb-3" />
              <p className="text-sm text-fg-muted">
                Select a file to see AI-powered insights
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
