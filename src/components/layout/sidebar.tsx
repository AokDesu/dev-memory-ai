'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import * as Icons from '@/components/ui/icons';
import { Project } from '@/types/api';

interface SidebarProps {
  project: Project;
  onOpenPicker: () => void;
  onOpenCmd: () => void;
}

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  kbd?: string;
}

export function Sidebar({ project, onOpenPicker, onOpenCmd }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <Icons.Home size={16} />,
      href: `/projects/${project.id}`,
    },
    {
      key: 'search',
      label: 'Search',
      icon: <Icons.Search size={16} />,
      href: `/projects/${project.id}/search`,
      kbd: '/',
    },
    {
      key: 'chat',
      label: 'Chat',
      icon: <Icons.Chat size={16} />,
      href: `/projects/${project.id}/chat`,
    },
    {
      key: 'explorer',
      label: 'Explorer',
      icon: <Icons.Code size={16} />,
      href: `/projects/${project.id}/explorer`,
    },
    {
      key: 'settings',
      label: 'Settings',
      icon: <Icons.Settings size={16} />,
      href: `/projects/${project.id}/settings`,
    },
  ];

  const isActive = (href: string) => {
    if (href === `/projects/${project.id}`) {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside className="flex flex-col min-w-0 bg-bg-elevated border-r border-border h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
        <div className="flex items-center justify-center w-7 h-7 rounded-md bg-accent text-accent-fg font-semibold text-sm">
          M
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-tight">
            Memory<span className="text-fg-dim font-normal">.dev</span>
          </div>
        </div>
        <button
          onClick={onOpenCmd}
          className="icon-btn"
          title="Command palette (⌘K)"
        >
          <Icons.Search size={14} />
        </button>
      </div>

      {/* Project Picker */}
      <button
        onClick={onOpenPicker}
        className="flex items-center gap-2.5 px-3 py-2.5 mx-3 mt-3 rounded-lg border border-border bg-bg-card hover:bg-bg-hover transition-colors text-left"
      >
        <Icons.Folder size={14} className="text-fg-muted flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-fg truncate">
            {project.name}
          </div>
          {project.branch && (
            <div className="text-xs text-fg-dim font-mono truncate">
              {project.branch}
            </div>
          )}
        </div>
        <Icons.ChevronUpDown size={12} className="text-fg-dim flex-shrink-0" />
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.href)}
            className={cn(
              'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'bg-bg-hover text-fg'
                : 'text-fg-muted hover:bg-bg-hover hover:text-fg'
            )}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {item.kbd && (
              <span className="kbd">{item.kbd}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex items-center gap-3 px-3 py-3 border-t border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-fg font-semibold text-xs">
          MC
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-fg truncate">Maya Chen</div>
          <div className="text-xs text-fg-dim">Pro plan</div>
        </div>
      </div>
    </aside>
  );
}

// Made with Bob
