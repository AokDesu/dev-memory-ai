'use client';

import * as Icons from './icons';
import { Project } from '@/types/api';
import { cn } from '@/lib/utils';

interface ProjectPickerProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  currentId: string;
  onPick: (projectId: string) => void;
}

export function ProjectPicker({
  open,
  onClose,
  projects,
  currentId,
  onPick,
}: ProjectPickerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-fg">Switch project</h3>
            <p className="text-sm text-fg-muted mt-1">
              Pick one of your indexed projects, or add a new one.
            </p>
          </div>

          {/* Project List */}
          <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  onPick(project.id);
                  onClose();
                }}
                className={cn(
                  'flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors',
                  project.id === currentId
                    ? 'bg-accent-soft border border-accent'
                    : 'bg-bg-card border border-border hover:bg-bg-hover hover:border-border-strong'
                )}
              >
                <Icons.Folder size={16} className="text-fg-muted flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-fg truncate">
                      {project.name}
                    </span>
                    {project.id === currentId && (
                      <span className="badge badge-accent">Current</span>
                    )}
                    {project.status === 'indexing' && (
                      <span className="badge badge-warning flex items-center gap-1">
                        <Icons.Loader2 size={10} className="animate-spin" />
                        Indexing
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-fg-dim font-mono truncate mt-0.5">
                    {project.path}
                  </div>
                  {project.filesCount !== undefined && (
                    <div className="text-xs text-fg-muted mt-1">
                      {project.filesCount.toLocaleString()} files
                      {project.lastIndexed && (
                        <span className="text-fg-dim">
                          {' · '}Last indexed{' '}
                          {new Date(project.lastIndexed).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-bg-sunken">
            <button onClick={onClose} className="btn btn-secondary btn-sm">
              Cancel
            </button>
            <button className="btn btn-primary btn-sm">
              <Icons.Plus size={13} />
              Add local folder…
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
