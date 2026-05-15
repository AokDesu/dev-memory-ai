'use client';

import { useState } from 'react';
import * as Icons from '@/components/ui/icons';
import { SuccessBanner } from '@/components/ui/states';

type Tab = 'general' | 'indexing' | 'ai' | 'advanced';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-bg-elevated px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-fg mb-2">Settings</h1>
          <p className="text-sm text-fg-muted">
            Configure your project preferences
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          {saved && (
            <div className="mb-6">
              <SuccessBanner
                message="Settings saved successfully!"
                onDismiss={() => setSaved(false)}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs */}
            <div className="lg:col-span-1">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'general'
                      ? 'bg-accent-soft text-accent'
                      : 'text-fg-muted hover:bg-bg-hover hover:text-fg'
                  }`}
                >
                  <Icons.Settings size={16} />
                  General
                </button>
                <button
                  onClick={() => setActiveTab('indexing')}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'indexing'
                      ? 'bg-accent-soft text-accent'
                      : 'text-fg-muted hover:bg-bg-hover hover:text-fg'
                  }`}
                >
                  <Icons.Database size={16} />
                  Indexing
                </button>
                <button
                  onClick={() => setActiveTab('ai')}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'ai'
                      ? 'bg-accent-soft text-accent'
                      : 'text-fg-muted hover:bg-bg-hover hover:text-fg'
                  }`}
                >
                  <Icons.Zap size={16} />
                  AI & LLM
                </button>
                <button
                  onClick={() => setActiveTab('advanced')}
                  className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'advanced'
                      ? 'bg-accent-soft text-accent'
                      : 'text-fg-muted hover:bg-bg-hover hover:text-fg'
                  }`}
                >
                  <Icons.Terminal size={16} />
                  Advanced
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="lg:col-span-3 space-y-6">
              {activeTab === 'general' && (
                <>
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-fg mb-4">Project Information</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Project Name
                        </label>
                        <input
                          type="text"
                          defaultValue="developer-memory-ai"
                          className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Description
                        </label>
                        <textarea
                          defaultValue="AI-powered code memory and semantic search"
                          rows={3}
                          className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm focus:outline-none focus:border-accent resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Repository Path
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            defaultValue="/Users/dev/projects/developer-memory-ai"
                            className="flex-1 px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm font-mono focus:outline-none focus:border-accent"
                            readOnly
                          />
                          <button className="btn btn-secondary btn-sm">
                            <Icons.Folder size={14} />
                            Browse
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-fg mb-4">Preferences</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-fg">Auto-index on file changes</div>
                          <div className="text-xs text-fg-muted mt-1">
                            Automatically re-index when files are modified
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-fg">Enable notifications</div>
                          <div className="text-xs text-fg-muted mt-1">
                            Show notifications for indexing completion
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'indexing' && (
                <>
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-fg mb-4">Indexing Options</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          File Extensions to Index
                        </label>
                        <input
                          type="text"
                          defaultValue=".ts, .tsx, .js, .jsx, .py, .java, .go"
                          className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm font-mono focus:outline-none focus:border-accent"
                        />
                        <p className="text-xs text-fg-dim mt-1">Comma-separated list of file extensions</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Ignore Patterns
                        </label>
                        <textarea
                          defaultValue="node_modules/&#10;.git/&#10;dist/&#10;build/"
                          rows={4}
                          className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm font-mono focus:outline-none focus:border-accent resize-none"
                        />
                        <p className="text-xs text-fg-dim mt-1">One pattern per line</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Max File Size (MB)
                        </label>
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm focus:outline-none focus:border-accent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-fg mb-4">Re-index Project</h2>
                    <p className="text-sm text-fg-muted mb-4">
                      Trigger a full re-index of the project. This will regenerate all embeddings.
                    </p>
                    <button className="btn btn-secondary">
                      <Icons.Refresh size={14} />
                      Start Re-indexing
                    </button>
                  </div>
                </>
              )}

              {activeTab === 'ai' && (
                <>
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-fg mb-4">LLM Configuration</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Provider
                        </label>
                        <select className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm focus:outline-none focus:border-accent">
                          <option>OpenAI</option>
                          <option>Anthropic (Claude)</option>
                          <option>Ollama (Local)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Model
                        </label>
                        <select className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm focus:outline-none focus:border-accent">
                          <option>gpt-4-turbo</option>
                          <option>gpt-3.5-turbo</option>
                          <option>claude-3-opus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          API Key
                        </label>
                        <input
                          type="password"
                          defaultValue="sk-••••••••••••••••"
                          className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm font-mono focus:outline-none focus:border-accent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Temperature
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          defaultValue="0.7"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-fg-dim mt-1">
                          <span>Precise</span>
                          <span>Creative</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-fg mb-4">Embedding Model</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-fg mb-2">
                          Model
                        </label>
                        <select className="w-full px-3 py-2 bg-bg-card border border-border rounded-lg text-fg text-sm focus:outline-none focus:border-accent">
                          <option>text-embedding-3-small</option>
                          <option>text-embedding-3-large</option>
                          <option>all-MiniLM-L6-v2 (Local)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'advanced' && (
                <>
                  <div className="card p-6">
                    <h2 className="text-lg font-semibold text-fg mb-4">Cache Settings</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-fg">Enable caching</div>
                          <div className="text-xs text-fg-muted mt-1">
                            Cache embeddings and search results
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-bg-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                      </div>
                      <button className="btn btn-secondary btn-sm">
                        <Icons.Trash2 size={14} />
                        Clear Cache
                      </button>
                    </div>
                  </div>

                  <div className="card p-6 border-danger/20">
                    <h2 className="text-lg font-semibold text-danger mb-4">Danger Zone</h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-fg mb-2">Delete Project</h3>
                        <p className="text-sm text-fg-muted mb-3">
                          Permanently delete this project and all its data. This action cannot be undone.
                        </p>
                        <button className="btn btn-sm bg-danger text-white hover:bg-danger/90">
                          <Icons.Trash2 size={14} />
                          Delete Project
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button className="btn btn-secondary">Cancel</button>
                <button onClick={handleSave} className="btn btn-primary">
                  <Icons.Check size={14} />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
