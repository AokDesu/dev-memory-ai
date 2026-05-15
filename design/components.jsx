// Shared components: Sidebar, Topbar, CommandPalette, CodeBlock renderer

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ---------- Code rendering ----------
function TokenSpan({ t }) {
  if (t.t === 'p') return <>{t.v}</>;
  return <span className={`tok-${t.t}`}>{t.v}</span>;
}

function CodeBlock({ lines, language = 'tsx', highlight = [], showHeader = true, startLine = 1 }) {
  return (
    <div className="code-block">
      {showHeader && (
        <div className="code-block-header">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: FILE_COLORS[language] || '#888' }} />
          <span>{language}</span>
        </div>
      )}
      <pre>
        {lines.map((line, i) => {
          const lineNum = i + startLine;
          const isHl = highlight.includes(lineNum);
          return (
            <div key={i} className={`code-line ${isHl ? 'hl' : ''}`}>
              <span className="ln">{lineNum}</span>
              <span className="ln-content">
                {line.length === 0 ? ' ' : line.map((tok, j) => <TokenSpan key={j} t={tok} />)}
              </span>
            </div>
          );
        })}
      </pre>
    </div>
  );
}

// ---------- Kbd ----------
const Kbd = ({ children }) => <span className="kbd">{children}</span>;

// ---------- Sidebar ----------
function Sidebar({ project, currentPage, onNavigate, onOpenPicker, onOpenCmd }) {
  const items = [
    { key: 'dashboard', label: 'Dashboard', icon: <I.Home /> },
    { key: 'search', label: 'Search', icon: <I.Search />, kbd: '/' },
    { key: 'chat', label: 'Chat', icon: <I.Chat /> },
    { key: 'explorer', label: 'Explorer', icon: <I.Code /> },
    { key: 'settings', label: 'Settings', icon: <I.Settings /> },
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-mark">M</div>
        <div className="brand-name">Memory<span style={{ color: 'var(--fg-dim)', fontWeight: 400 }}>.dev</span></div>
        <div className="spacer" />
        <button className="icon-btn" title="Command palette (⌘K)" onClick={onOpenCmd} style={{ width: 26, height: 26 }}>
          <I.Search size={14} />
        </button>
      </div>

      <div className="project-picker" onClick={onOpenPicker}>
        <I.Folder size={14} />
        <span className="project-picker-name">{project.name}</span>
        <span className="project-picker-branch">{project.branch}</span>
        <I.ChevronUpDown size={12} />
      </div>

      <div className="sidebar-nav">
        {items.map((it) => (
          <div key={it.key}
               className={`nav-item ${currentPage === it.key ? 'active' : ''}`}
               onClick={() => onNavigate(it.key)}>
            {it.icon}
            <span>{it.label}</span>
            {it.kbd && <Kbd>{it.kbd}</Kbd>}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="avatar">MC</div>
        <div className="avatar-info">
          <div className="name">Maya Chen</div>
          <div className="sub">Pro plan</div>
        </div>
      </div>
    </aside>
  );
}

// ---------- Topbar ----------
function Topbar({ project, currentPage, onOpenCmd, theme, onToggleTheme, rightExtra }) {
  const pageNames = {
    dashboard: 'Dashboard',
    search: 'Search',
    chat: 'Chat',
    explorer: 'Explorer',
    settings: 'Settings',
  };
  return (
    <div className="topbar">
      <div className="crumbs">
        <span className="crumb">{project.name}</span>
        <span className="sep"><I.ChevronRight size={14} /></span>
        <span className="crumb active">{pageNames[currentPage]}</span>
      </div>
      <div className="topbar-right">
        {rightExtra}
        <button className="cmd-trigger" onClick={onOpenCmd}>
          <I.Search size={13} />
          <span className="label">Search or jump to…</span>
          <Kbd>⌘K</Kbd>
        </button>
        <button className="icon-btn" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? <I.Sun size={15} /> : <I.Moon size={15} />}
        </button>
      </div>
    </div>
  );
}

// ---------- Command Palette ----------
function CommandPalette({ open, onClose, onAction, project, chats, files, theme, onToggleTheme }) {
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQ('');
      setIdx(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Build commands
  const groups = useMemo(() => {
    const navs = [
      { kind: 'nav', name: 'Dashboard', sub: 'Project overview', icon: <I.Home size={14} />, action: { type: 'nav', page: 'dashboard' } },
      { kind: 'nav', name: 'Semantic Search', sub: 'Search the codebase', icon: <I.Search size={14} />, action: { type: 'nav', page: 'search' } },
      { kind: 'nav', name: 'AI Chat', sub: 'Ask about the codebase', icon: <I.Chat size={14} />, action: { type: 'nav', page: 'chat' } },
      { kind: 'nav', name: 'Code Explorer', sub: 'Browse files', icon: <I.Code size={14} />, action: { type: 'nav', page: 'explorer' } },
      { kind: 'nav', name: 'Settings', sub: 'Project preferences', icon: <I.Settings size={14} />, action: { type: 'nav', page: 'settings' } },
    ];
    const actions = [
      { kind: 'action', name: 'Re-index project', sub: 'Refresh embeddings', icon: <I.Refresh size={14} />, action: { type: 'reindex' } },
      { kind: 'action', name: theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme', sub: 'Toggle appearance', icon: theme === 'dark' ? <I.Sun size={14} /> : <I.Moon size={14} />, action: { type: 'theme' } },
      { kind: 'action', name: 'Switch project…', sub: 'Open a different repo', icon: <I.Folder size={14} />, action: { type: 'picker' } },
    ];
    const chatItems = chats.slice(0, 4).map((c) => ({
      kind: 'chat', name: c.title, sub: c.group, icon: <I.Chat size={14} />, action: { type: 'chat', id: c.id },
    }));
    const fileItems = files.map((f) => ({
      kind: 'file', name: f.basename || f.name, sub: f.path, icon: <FileIcon ext={f.ext} size={13} />, action: { type: 'file', path: f.path },
    }));
    return [
      { label: 'Jump to', items: navs },
      { label: 'Actions', items: actions },
      ...(chatItems.length ? [{ label: 'Recent chats', items: chatItems }] : []),
      ...(fileItems.length ? [{ label: 'Files', items: fileItems }] : []),
    ];
  }, [chats, files, theme]);

  // Filter
  const filtered = useMemo(() => {
    if (!q.trim()) return groups;
    const Q = q.toLowerCase();
    return groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) =>
          it.name.toLowerCase().includes(Q) || (it.sub || '').toLowerCase().includes(Q)
        ),
      }))
      .filter((g) => g.items.length);
  }, [groups, q]);

  // Flat list for keyboard navigation
  const flat = useMemo(() => filtered.flatMap((g) => g.items), [filtered]);

  useEffect(() => { setIdx(0); }, [q]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(flat.length - 1, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      if (flat[idx]) onAction(flat[idx].action);
    } else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  if (!open) return null;

  let cursor = -1;
  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cmd-input">
          <I.Search size={15} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a command or search…"
          />
          <Kbd>esc</Kbd>
        </div>
        <div className="cmd-list" ref={listRef}>
          {filtered.length === 0 && (
            <div style={{ padding: '20px 14px', color: 'var(--fg-dim)', fontSize: 13, textAlign: 'center' }}>
              No results.
            </div>
          )}
          {filtered.map((g) => (
            <div key={g.label}>
              <div className="cmd-group">{g.label}</div>
              {g.items.map((it) => {
                cursor += 1;
                const active = cursor === idx;
                return (
                  <div key={cursor}
                       className={`cmd-row ${active ? 'active' : ''}`}
                       onMouseEnter={() => setIdx(cursor)}
                       onClick={() => onAction(it.action)}>
                    {it.icon}
                    <span className="name">{it.name}</span>
                    {it.sub && <span className="sub">{it.sub}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------- Project picker dialog ----------
function ProjectPickerDialog({ open, onClose, projects, currentId, onPick }) {
  if (!open) return null;
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()} style={{ width: 540 }}>
        <div className="dialog-head">
          <h3>Switch project</h3>
          <p>Pick one of your indexed projects, or add a new one.</p>
        </div>
        <div className="dialog-body" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {projects.map((p) => (
            <div key={p.id}
                 onClick={() => onPick(p.id)}
                 className="cmd-row"
                 style={{ padding: '10px 12px', cursor: 'pointer' }}>
              <I.Folder size={14} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, color: 'var(--fg)', fontSize: 13 }}>{p.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-dim)' }}>{p.path}</div>
              </div>
              {p.id === currentId && <span className="badge badge-accent">Current</span>}
              {p.indexing && <span className="badge badge-warning">Indexing</span>}
            </div>
          ))}
        </div>
        <div className="dialog-foot">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm">
            <I.Plus size={13} /> Add local folder…
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CodeBlock, Sidebar, Topbar, CommandPalette, ProjectPickerDialog, Kbd, TokenSpan });
