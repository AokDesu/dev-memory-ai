'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Icons from '@/components/ui/icons';
import { EmptyState, LoadingPage } from '@/components/ui/states';
import { apiClient, buildZipUpload } from '@/lib/api-client';
import { Project } from '@/types/api';
import { formatRelativeTime } from '@/lib/utils';

type AddMode = 'path' | 'zip';

export default function LandingPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [projectPath, setProjectPath] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addMode, setAddMode] = useState<AddMode>('path');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.listProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const resetAddDialog = () => {
    setShowAddDialog(false);
    setProjectPath('');
    setZipFile(null);
    setUploadName('');
    setAddError(null);
    setAddMode('path');
  };

  const handleAddProject = async () => {
    try {
      setAdding(true);
      setAddError(null);

      let result: { projectId: string };

      if (addMode === 'path') {
        if (!projectPath.trim()) {
          setAddError('Please enter a project path');
          setAdding(false);
          return;
        }
        result = await apiClient.selectProject(projectPath.trim());
      } else {
        if (!zipFile) {
          setAddError('Please pick a zip file');
          setAdding(false);
          return;
        }
        const formData = buildZipUpload(
          uploadName.trim() || zipFile.name.replace(/\.zip$/i, ''),
          zipFile
        );
        result = await apiClient.uploadProject(formData);
      }

      await loadProjects();
      resetAddDialog();
      router.push(`/projects/${result.projectId}`);
    } catch (err) {
      console.error('Error adding project:', err);
      setAddError(err instanceof Error ? err.message : 'Failed to add project');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <>
        <LoadingPage message="Loading projects..." />
        {/* Add Project Dialog */}
        {showAddDialog && renderAddDialog()}
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="min-h-screen bg-bg flex items-center justify-center p-8">
          <EmptyState
            icon={<Icons.AlertCircle size={32} />}
            title="Failed to load projects"
            description={error}
            action={{
              label: 'Retry',
              onClick: loadProjects,
            }}
          />
        </div>
        {/* Add Project Dialog */}
        {showAddDialog && renderAddDialog()}
      </>
    );
  }

  if (projects.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-bg flex items-center justify-center p-8">
          <EmptyState
            icon={<Icons.Folder size={32} />}
            title="No projects yet"
            description="Get started by adding your first project to index and search."
            action={{
              label: 'Add Project',
              onClick: () => setShowAddDialog(true),
            }}
          />
        </div>
        {/* Add Project Dialog */}
        {showAddDialog && renderAddDialog()}
      </>
    );
  }

  function renderAddDialog() {
    const submitDisabled =
      adding ||
      (addMode === 'path' && !projectPath.trim()) ||
      (addMode === 'zip' && !zipFile);

    const tab = (mode: AddMode, label: string) => (
      <button
        type="button"
        onClick={() => {
          setAddMode(mode);
          setAddError(null);
        }}
        disabled={adding}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
          addMode === mode
            ? 'text-accent border-accent'
            : 'text-fg-muted border-transparent hover:text-fg'
        }`}
      >
        {label}
      </button>
    );

    return (
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={() => !adding && resetAddDialog()}
      >
        <div
          className="bg-bg-elevated border border-border rounded-xl shadow-2xl w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-lg font-semibold text-fg">Add New Project</h3>
            <p className="text-sm text-fg-muted mt-1">
              Choose how to add your project
            </p>
          </div>

          {/* Tabs */}
          <div className="px-6 pt-2 border-b border-border flex gap-2">
            {tab('path', 'Path')}
            {tab('zip', 'Upload Zip')}
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {addMode === 'path' && (
              <div>
                <label className="block text-sm font-medium text-fg mb-2">
                  Project Path
                </label>
                <input
                  type="text"
                  value={projectPath}
                  onChange={(e) => setProjectPath(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !adding) handleAddProject();
                  }}
                  placeholder="e.g., C:\\Users\\username\\projects\\my-app"
                  className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-fg placeholder:text-fg-dim focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-mono text-sm"
                  disabled={adding}
                  autoFocus
                />
                <p className="text-xs text-fg-muted mt-2">
                  Path to a directory on this machine (must be a Git repository).
                </p>
              </div>
            )}

            {addMode === 'zip' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-fg mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="Optional — defaults to zip filename"
                    className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-fg placeholder:text-fg-dim focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                    disabled={adding}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-fg mb-2">
                    Zip File
                  </label>
                  <input
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    onChange={(e) =>
                      setZipFile(e.target.files?.[0] ?? null)
                    }
                    disabled={adding}
                    className="block w-full text-sm text-fg file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-bg-hover file:text-fg file:cursor-pointer"
                  />
                  {zipFile && (
                    <p className="text-xs text-fg-muted mt-2">
                      {zipFile.name} · {(zipFile.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  )}
                  <p className="text-xs text-fg-muted mt-2">
                    Limits: 100 MB per file inside zip, 1 GB total. Include
                    your .git folder in the zip to get commit history.
                  </p>
                </div>
              </div>
            )}

            {addError && (
              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <Icons.AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-500">{addError}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
            <button
              onClick={resetAddDialog}
              className="btn btn-secondary"
              disabled={adding}
            >
              Cancel
            </button>
            <button
              onClick={handleAddProject}
              className="btn btn-primary"
              disabled={submitDisabled}
            >
              {adding ? (
                <>
                  <Icons.Loader2 size={16} className="animate-spin" />
                  {addMode === 'path' ? 'Adding...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Icons.Plus size={16} />
                  Add Project
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
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
              <button 
                className="btn btn-primary"
                onClick={() => setShowAddDialog(true)}
              >
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

      {/* Add Project Dialog */}
      {showAddDialog && renderAddDialog()}
    </>
  );
}

// Made with Bob
