'use client';

import { useState } from 'react';
import * as Icons from './icons';
import { Project } from '@/types/api';
import { cn } from '@/lib/utils';
import { apiClient, buildZipUpload } from '@/lib/api-client';

interface ProjectPickerProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  currentId: string;
  onPick: (projectId: string) => void;
}

type AddMode = 'path' | 'zip';

export function ProjectPicker({
  open,
  onClose,
  projects,
  currentId,
  onPick,
}: ProjectPickerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [addMode, setAddMode] = useState<AddMode>('path');
  const [projectPath, setProjectPath] = useState('');
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  if (!open) return null;

  const resetAdd = () => {
    setShowAdd(false);
    setAddMode('path');
    setProjectPath('');
    setZipFile(null);
    setUploadName('');
    setAddError(null);
  };

  const submitAdd = async () => {
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

      resetAdd();
      onPick(result.projectId);
      onClose();
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add project');
    } finally {
      setAdding(false);
    }
  };

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
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={() => !adding && onClose()}
    >
      <div
        className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-fg">
                {showAdd ? 'Add Project' : 'Switch project'}
              </h3>
              <p className="text-sm text-fg-muted mt-1">
                {showAdd
                  ? 'Choose how to add your project'
                  : 'Pick one of your indexed projects, or add a new one.'}
              </p>
            </div>
            {showAdd && (
              <button
                onClick={resetAdd}
                disabled={adding}
                className="text-xs text-fg-muted hover:text-fg"
              >
                ← Back
              </button>
            )}
          </div>

          {showAdd ? (
            <>
              {/* Tabs */}
              <div className="px-6 pt-2 border-b border-border flex gap-2">
                {tab('path', 'Path')}
                {tab('zip', 'Upload Zip')}
              </div>

              {/* Form */}
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
                        if (e.key === 'Enter' && !adding) submitAdd();
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
                        onChange={(e) => setZipFile(e.target.files?.[0] ?? null)}
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
                        .git in the zip to get commit history.
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

              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-border bg-bg-sunken">
                <button
                  onClick={resetAdd}
                  disabled={adding}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAdd}
                  disabled={submitDisabled}
                  className="btn btn-primary btn-sm"
                >
                  {adding ? (
                    <>
                      <Icons.Loader2 size={13} className="animate-spin" />
                      {addMode === 'path' ? 'Adding...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <Icons.Plus size={13} />
                      Add Project
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
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
                <button
                  onClick={() => setShowAdd(true)}
                  className="btn btn-primary btn-sm"
                >
                  <Icons.Plus size={13} />
                  Add Project
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
