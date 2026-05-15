'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from '@/components/ui/icons';
import { EmptyState, LoadingPage } from '@/components/ui/states';
import { mockProjects } from '@/lib/mock-data';
import { Project } from '@/types/api';
import { formatRelativeTime } from '@/lib/utils';

export default function LandingPage() {
  const router = useRouter();
  const [projects] = useState<Project[]>(mockProjects);
  const [loading] = useState(false);

  if (loading) {
    return <LoadingPage message="Loading projects..." />;
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <EmptyState
          icon={<Icons.Folder size={32} />}
          title="No projects yet"
          description="Get started by adding your first project to index and search."
          action={{
            label: 'Add Project',
            onClick: () => {
              // TODO: Open file picker
              console.log('Add project');
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="border-b border-border bg-bg-elevated">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-accent-fg font-bold text-lg">
                  M
                </div>
                <h1 className="text-2xl font-bold text-fg">
                  Memory<span className="text-fg-muted font-normal">.dev</span>
                </h1>
              </div>
              <p className="text-sm text-fg-muted">
                AI-powered code memory and semantic search
              </p>
            </div>
            <button className="btn btn-primary">
              <Icons.Plus size={16} />
              Add Project
            </button>
          </div>
        </div>
      </header>

      {/* Projects Grid */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-fg mb-1">Your Projects</h2>
          <p className="text-sm text-fg-muted">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} indexed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <button
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}`)}
              className="card p-5 hover:border-border-strong transition-all text-left group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-bg-hover group-hover:bg-accent group-hover:text-accent-fg transition-colors">
                    <Icons.Folder size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-fg truncate group-hover:text-accent transition-colors">
                      {project.name}
                    </h3>
                    {project.branch && (
                      <div className="flex items-center gap-1.5 text-xs text-fg-dim mt-0.5">
                        <Icons.GitBranch size={11} />
                        <span className="font-mono">{project.branch}</span>
                      </div>
                    )}
                  </div>
                </div>
                {project.status === 'indexing' && (
                  <span className="badge badge-warning flex items-center gap-1">
                    <Icons.Loader2 size={10} className="animate-spin" />
                    Indexing
                  </span>
                )}
                {project.status === 'ready' && (
                  <span className="badge badge-success">Ready</span>
                )}
              </div>

              {/* Path */}
              <div className="text-xs text-fg-dim font-mono truncate mb-3 px-2 py-1.5 bg-bg-sunken rounded">
                {project.path}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-fg-muted">
                {project.filesCount !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <Icons.FileText size={12} />
                    <span>{project.filesCount.toLocaleString()} files</span>
                  </div>
                )}
                {project.lastIndexed && (
                  <div className="flex items-center gap-1.5">
                    <Icons.Clock size={12} />
                    <span>{formatRelativeTime(project.lastIndexed)}</span>
                  </div>
                )}
              </div>

              {/* Arrow indicator */}
              <div className="flex items-center justify-end mt-4 text-fg-dim group-hover:text-accent transition-colors">
                <Icons.ArrowRight size={16} />
              </div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

// Made with Bob
