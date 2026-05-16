'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import * as Icons from '@/components/ui/icons';
import { Project } from '@/types/api';

interface TopbarProps {
  project: Project;
  currentPage: string;
  onOpenCmd: () => void;
  rightExtra?: React.ReactNode;
}

const pageNames: Record<string, string> = {
  dashboard: 'Dashboard',
  search: 'Search',
  chat: 'Chat',
  explorer: 'Explorer',
  settings: 'Settings',
};

export function Topbar({ project, currentPage, onOpenCmd, rightExtra }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering theme-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const router = useRouter();

  return (
    <div className="flex items-center gap-3 h-12 px-4 border-b border-border bg-bg flex-shrink-0">
      {/* Back to Projects Button */}
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-bg-elevated text-fg-dim hover:text-fg transition-colors"
        title="Back to all projects"
      >
        <Icons.ChevronLeft size={16} />
        <span className="text-xs font-medium">Projects</span>
      </button>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-fg-muted">{project.name}</span>
        <Icons.ChevronRight size={14} className="text-fg-faint" />
        <span className="text-fg font-medium">{pageNames[currentPage] || currentPage}</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 ml-auto">
        {rightExtra}
        
        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCmd}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-border bg-bg-elevated hover:border-border-strong text-fg-dim hover:text-fg-muted transition-colors min-w-[240px]"
        >
          <Icons.Search size={13} />
          <span className="flex-1 text-left text-xs">Search or jump to…</span>
          <span className="kbd">⌘K</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="icon-btn"
          title="Toggle theme"
        >
          {mounted ? (
            theme === 'dark' ? <Icons.Sun size={15} /> : <Icons.Moon size={15} />
          ) : (
            <Icons.Sun size={15} />
          )}
        </button>
      </div>
    </div>
  );
}

// Made with Bob
