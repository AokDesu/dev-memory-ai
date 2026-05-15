'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import * as Icons from '@/components/ui/icons';
import { LoadingPage, EmptyState } from '@/components/ui/states';
import { apiClient } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';

interface SummaryData {
  repository: {
    id: string;
    name: string;
    path: string;
    status: string;
    lastIndexed: string | null;
  };
  statistics: {
    totalFiles: number;
    totalLinesOfCode: number;
    totalCommits: number;
    totalContributors: number;
  };
  languages: Array<{
    language: string;
    count: number;
    linesOfCode?: number;
    percentage: string;
  }>;
  techStack: string[];
  keyFiles: Array<{
    path: string;
    language: string | null;
    linesOfCode: number | null;
    lastAuthor: string | null;
    lastModified: string | null;
  }>;
  recentCommits: Array<{
    hash: string;
    author: string;
    message: string;
    timestamp: string;
    filesChanged: string[];
  }>;
  topContributors: Array<{
    author: string;
    commits: number;
  }>;
}

export default function DashboardPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryData | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async (isFirst: boolean) => {
      try {
        if (isFirst) setLoading(true);
        setError(null);
        const data = (await apiClient.getProjectSummary(projectId)) as unknown as SummaryData;
        if (cancelled) return;
        setSummary(data);
        // Keep polling while the indexer is still working so the dashboard
        // populates as files / commits land in the DB.
        if (data.repository?.status === 'indexing' || data.repository?.status === 'pending') {
          timer = setTimeout(() => tick(false), 3000);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading summary:', err);
        setError(err instanceof Error ? err.message : 'Failed to load project summary');
      } finally {
        if (isFirst && !cancelled) setLoading(false);
      }
    };

    tick(true);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [projectId]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getProjectSummary(projectId);
      setSummary(data as any);
    } catch (err) {
      console.error('Error loading summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingPage message="Loading dashboard..." />;
  }

  if (error || !summary) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <EmptyState
          icon={<Icons.AlertCircle size={32} />}
          title="Failed to load dashboard"
          description={error || 'Project summary not found'}
          action={{
            label: 'Retry',
            onClick: loadSummary,
          }}
        />
      </div>
    );
  }

  const {
    statistics,
    techStack = [],
    keyFiles = [],
    recentCommits = [],
    topContributors = [],
    languages = []
  } = summary;

  // Use language data from API or convert from mock data
  const languageData = languages
    ? languages.map((l) => ({
        lang: l.language,
        count: l.count,
        linesOfCode: l.linesOfCode ?? 0,
        percentage: parseFloat(l.percentage),
      }))
    : Object.entries((statistics as any).languages || {})
        .map(([lang, count]) => ({
          lang,
          count: count as number,
          linesOfCode: 0,
          percentage: ((count as number) / statistics.totalFiles) * 100,
        }))
        .sort((a, b) => b.count - a.count);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-fg mb-2">Dashboard</h1>
        <p className="text-sm text-fg-muted">
          Overview of {summary.repository?.name || (summary as any).name || 'Project'} repository
        </p>
      </div>

      {(summary.repository?.status === 'indexing' ||
        summary.repository?.status === 'pending') && (
        <div className="card p-4 flex items-center gap-3 border-warning/40 bg-warning/5">
          <Icons.Loader2 size={16} className="animate-spin text-warning" />
          <div className="text-sm text-fg">
            Indexing in progress — numbers below update every few seconds.
          </div>
        </div>
      )}

      {summary.repository?.status === 'error' && (
        <div className="card p-4 flex items-center gap-3 border-red-500/40 bg-red-500/5">
          <Icons.AlertCircle size={16} className="text-red-500" />
          <div className="text-sm text-fg">
            Last indexing run failed. Re-index from the command palette to retry.
          </div>
        </div>
      )}

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
            Across {languageData.length} languages
          </div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">
            Lines of Code
          </div>
          <div className="text-3xl font-semibold text-fg mb-1">
            {(statistics.totalLinesOfCode || (statistics as any).totalLines || 0).toLocaleString()}
          </div>
          <div className="text-xs text-fg-muted">
            Total lines of code
          </div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">
            Contributors
          </div>
          <div className="text-3xl font-semibold text-fg mb-1">
            {statistics.totalContributors || (statistics as any).authors?.length || 0}
          </div>
          <div className="text-xs text-fg-muted">
            {topContributors?.[0]?.commits || (statistics as any).authors?.[0]?.commits || 0} commits by top contributor
          </div>
        </div>

        <div className="card p-4">
          <div className="text-xs font-semibold text-fg-dim uppercase tracking-wider mb-2">
            Recent Activity
          </div>
          <div className="text-3xl font-semibold text-fg mb-1">
            {statistics.totalCommits || (summary as any).recentActivity?.[0]?.commits || 0}
          </div>
          <div className="text-xs text-fg-muted">
            Total commits
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
                    <span className="text-fg-muted">
                      {lang.linesOfCode > 0
                        ? `${lang.linesOfCode.toLocaleString()} lines`
                        : `${lang.count} files`}
                    </span>
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
              {techStack?.map((tech) => (
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
          {keyFiles?.map((file) => (
            <div key={file.path} className="p-4 hover:bg-bg-hover transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icons.FileText size={14} className="text-fg-muted flex-shrink-0" />
                    <span className="text-sm font-mono text-fg truncate">
                      {file.path}
                    </span>
                  </div>
                  <p className="text-sm text-fg-muted">
                    {file.linesOfCode?.toLocaleString() || 0} lines
                    {file.language && ` · ${file.language}`}
                  </p>
                </div>
                <div className="text-xs text-fg-dim">
                  {file.lastAuthor && `by ${file.lastAuthor}`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Commits */}
      <div className="card">
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-fg">Recent Commits</h2>
          <p className="text-sm text-fg-muted mt-1">
            Latest commits in the repository
          </p>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {recentCommits?.map((commit) => (
              <div
                key={commit.hash}
                className="flex items-start gap-3 p-3 bg-bg-hover rounded-lg"
              >
                <Icons.GitBranch size={16} className="text-fg-muted flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-fg mb-1">
                    {commit.message}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-fg-dim">
                    <span>{commit.author}</span>
                    <span>·</span>
                    <span className="font-mono">{commit.hash.slice(0, 7)}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(commit.timestamp)}</span>
                  </div>
                </div>
                <div className="text-xs text-fg-muted flex-shrink-0">
                  {commit.filesChanged.length} files
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
          {topContributors?.map((contributor, index) => (
            <div key={contributor.author} className="p-4 flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-fg font-semibold text-sm">
                {contributor.author.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-fg">{contributor.author}</div>
                <div className="text-xs text-fg-muted">
                  {contributor.commits} commits
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
