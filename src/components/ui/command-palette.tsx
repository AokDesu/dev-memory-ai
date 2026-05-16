'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import * as Icons from './icons';
import { Project, ChatConversation, FileTreeNode } from '@/types/api';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  chats?: ChatConversation[];
  files?: FileTreeNode[];
  onAction?: (action: CommandAction) => void;
}

interface CommandAction {
  type: 'nav' | 'chat' | 'file' | 'theme' | 'reindex' | 'picker';
  page?: string;
  id?: string;
  path?: string;
}

interface CommandItem {
  kind: string;
  name: string;
  sub?: string;
  icon: React.ReactNode;
  action: CommandAction;
}

interface CommandGroup {
  label: string;
  items: CommandItem[];
}

export function CommandPalette({
  open,
  onClose,
  project,
  chats = [],
  files = [],
  onAction,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Build command groups
  const groups = useMemo<CommandGroup[]>(() => {
    const navItems: CommandItem[] = [
      {
        kind: 'nav',
        name: 'Dashboard',
        sub: 'Project overview',
        icon: <Icons.Home size={14} />,
        action: { type: 'nav', page: 'dashboard' },
      },
      {
        kind: 'nav',
        name: 'Semantic Search',
        sub: 'Search the codebase',
        icon: <Icons.Search size={14} />,
        action: { type: 'nav', page: 'search' },
      },
      {
        kind: 'nav',
        name: 'AI Chat',
        sub: 'Ask about the codebase',
        icon: <Icons.Chat size={14} />,
        action: { type: 'nav', page: 'chat' },
      },
      {
        kind: 'nav',
        name: 'Code Explorer',
        sub: 'Browse files',
        icon: <Icons.Code size={14} />,
        action: { type: 'nav', page: 'explorer' },
      },
      {
        kind: 'nav',
        name: 'Settings',
        sub: 'Project preferences',
        icon: <Icons.Settings size={14} />,
        action: { type: 'nav', page: 'settings' },
      },
    ];

    const actionItems: CommandItem[] = [
      {
        kind: 'action',
        name: 'Re-index project',
        sub: 'Refresh embeddings',
        icon: <Icons.Refresh size={14} />,
        action: { type: 'reindex' },
      },
      {
        kind: 'action',
        name: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
        sub: 'Toggle appearance',
        icon: theme === 'dark' ? <Icons.Sun size={14} /> : <Icons.Moon size={14} />,
        action: { type: 'theme' },
      },
      {
        kind: 'action',
        name: 'Switch project…',
        sub: 'Open a different repo',
        icon: <Icons.Folder size={14} />,
        action: { type: 'picker' },
      },
    ];

    const chatItems: CommandItem[] = chats.slice(0, 4).map((c) => ({
      kind: 'chat',
      name: c.title,
      sub: c.group,
      icon: <Icons.Chat size={14} />,
      action: { type: 'chat', id: c.id },
    }));

    const fileItems: CommandItem[] = files
      .filter((f) => f.type === 'file')
      .slice(0, 10)
      .map((f) => ({
        kind: 'file',
        name: f.path.split('/').pop() || f.path,
        sub: f.path,
        icon: <Icons.FileIcon ext={f.language || 'txt'} size={13} />,
        action: { type: 'file', path: f.path },
      }));

    return [
      { label: 'Jump to', items: navItems },
      { label: 'Actions', items: actionItems },
      ...(chatItems.length ? [{ label: 'Recent chats', items: chatItems }] : []),
      ...(fileItems.length ? [{ label: 'Files', items: fileItems }] : []),
    ];
  }, [chats, files, theme]);

  // Filter groups based on query
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            (it.sub || '').toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  // Flat list for keyboard navigation
  const flatItems = useMemo(
    () => filteredGroups.flatMap((g) => g.items),
    [filteredGroups]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleAction = (action: CommandAction) => {
    if (action.type === 'nav' && action.page) {
      router.push(`/projects/${project.id}${action.page === 'dashboard' ? '' : `/${action.page}`}`);
    } else if (action.type === 'theme') {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    } else if (onAction) {
      onAction(action);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(flatItems.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        handleAction(flatItems[selectedIndex].action);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  let cursor = -1;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-bg-elevated border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Icons.Search size={15} className="text-fg-dim" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search…"
              className="flex-1 bg-transparent border-none outline-none text-fg text-sm placeholder:text-fg-dim"
            />
            <span className="kbd">esc</span>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredGroups.length === 0 && (
              <div className="py-8 px-4 text-center text-fg-dim text-sm">
                No results found.
              </div>
            )}
            {filteredGroups.map((group) => (
              <div key={group.label}>
                <div className="px-4 py-2 text-xs font-semibold text-fg-dim uppercase tracking-wider">
                  {group.label}
                </div>
                {group.items.map((item) => {
                  cursor += 1;
                  const isActive = cursor === selectedIndex;
                  return (
                    <button
                      key={cursor}
                      className={`flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors ${
                        isActive ? 'bg-bg-hover' : 'hover:bg-bg-hover'
                      }`}
                      onMouseEnter={() => setSelectedIndex(cursor)}
                      onClick={() => handleAction(item.action)}
                    >
                      <div className="text-fg-muted">{item.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-fg truncate">
                          {item.name}
                        </div>
                        {item.sub && (
                          <div className="text-xs text-fg-dim truncate">
                            {item.sub}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
