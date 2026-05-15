'use client';

import { useState } from 'react';
import * as Icons from '@/components/ui/icons';
import { LoadingPage } from '@/components/ui/states';
import { mockProjectSummary } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';

export default function DashboardPage() {
  const [loading] = useState(false);
  const [summary] = useState(mockProjectSummary);

  if (loading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  const { statistics, techStack, keyFiles, recentActivity } = summary;

  // Calculate language percentages
  const totalFiles = Object.values(statistics.languages).reduce((a, b) => a + b, 0);
  const languageData = Object.entries(statistics.languages)
    .map(([lang, count]) => ({
      lang,
      count,
      percentage: (count / totalFiles) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fg mb-2">Dashboard</h1>
        <p className="text-sm text-fg-muted">
          Overview of {summary.name} repository
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">
            Total Files
          </div>
          <div className="text-3xl font-semibold text-fg mb-1">
            {statistics.totalFiles.toLocaleString()}
          </div>
          <div className="text-xs text-fg-muted">
            Across {Object.keys(statistics.languages).length} languages
          </div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">
            Lines of Code
          </div>
          <div className="text-3xl font-semibold text-fg mb-1">
            {statistics.totalLines.toLocaleString()}
          </div>
          <div className="text-xs text-fg-muted">
            +2.3k this week
          </div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">
            Contributors
          </div>
          <div className="text-3xl font-semibold text-fg mb-1">
            {statistics.authors.length}
          </div>
          <div className="text-xs text-fg-muted">
            {statistics.authors[0].commits} commits by top contributor
          </div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">
            Recent Activity
          </div>
          <div className="text-3xl font-semibold text-fg mb-1">
            {recentActivity[0].commits}
          </div>
          <div className="text-xs text-fg-muted">
            Commits today
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Distribution */}
        <div className="card">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-fg">Language Distribution</h2>
          </div>
          <div className="p-4 space-y-4">
            {/* Language Bar */}
            <div className="flex h-2 rounded-full overflow-hidden bg-bg-hover">
              {languageData.map((lang, i) => (
                <div
                  key={lang.lang}
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: Icons.FILE_COLORS[lang.lang.toLowerCase()] || '#888',
                  }}
                  title={`${lang.lang}: ${lang.percentage.toFixed(1)}%`}
                />
              ))}
            </div>

            {/* Language List */}
            <div className="space-y-2">
              {languageData.map((lang) => (
                <div key={lang.lang} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm"
                      style={{
                        backgroundColor: Icons.FILE_COLORS[lang.lang.toLowerCase()] || '#888',
                      }}
                    />
                    <span className="text-fg">{lang.lang}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-fg-muted">{lang.count} files</span>
                    <span className="text-fg-dim font-mono text-xs">
                      {lang.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="card">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-fg">Tech Stack</h2>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1.5 bg-bg-hover border border-border rounded-lg text-sm font-medium text-fg"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Key Files */}
      <div className="card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-fg">Key Files</h2>
          <p className="text-sm text-fg-muted mt-1">
            Most important files in the codebase
          </p>
        </div>
        <div className="divide-y divide-border">
          {keyFiles.map((file) => (
            <div key={file.path} className="p-4 hover:bg-bg-hover transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icons.FileText size={14} className="text-fg-muted flex-shrink-0" />
                    <span className="text-sm font-mono text-fg truncate">
                      {file.path}
                    </span>
                  </div>
                  <p className="text-sm text-fg-muted">{file.reason}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-xs font-semibold text-accent">
                    {Math.round(file.importance * 100)}%
                  </div>
                  <div className="w-16 h-1.5 bg-bg-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${file.importance * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-fg">Recent Activity</h2>
          <p className="text-sm text-fg-muted mt-1">
            Commit activity over the last 7 days
          </p>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.date}
                className="flex items-center justify-between p-3 bg-bg-hover rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Icons.GitBranch size={16} className="text-fg-muted" />
                  <div>
                    <div className="text-sm font-medium text-fg">
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                    <div className="text-xs text-fg-dim">
                      {activity.filesChanged} files changed
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-fg">
                    {activity.commits} commits
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Contributors */}
      <div className="card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-fg">Top Contributors</h2>
        </div>
        <div className="divide-y divide-border">
          {statistics.authors.map((author, index) => (
            <div key={author.name} className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-fg font-semibold text-sm">
                {author.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-fg">{author.name}</div>
                <div className="text-xs text-fg-muted">
                  {author.commits} commits · {author.linesChanged.toLocaleString()} lines changed
                </div>
              </div>
              {index === 0 && (
                <span className="badge badge-accent">Top Contributor</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Made with Bob
