// Code Explorer — three panels, with blame-on-hover and AI insights
function PageExplorer({ project }) {
  const { useState, useMemo } = React;
  const [activeFn, setActiveFn] = useState(null);
  const [hoverLine, setHoverLine] = useState(null);
  const [treeFilter, setTreeFilter] = useState('');
  const [openTabs, setOpenTabs] = useState(['src/components/auth/LoginForm.tsx']);
  const [activeTab, setActiveTab] = useState('src/components/auth/LoginForm.tsx');
  const file = window.__MOCK.FILE_LOGIN;
  const tree = window.__MOCK.FILE_TREE;

  // Compute highlight range from selected function
  const highlightRange = useMemo(() => {
    if (!activeFn) return null;
    const fn = file.keyFunctions.find((f) => f.name === activeFn);
    if (!fn) return null;
    if (fn.kind === 'component') return { start: fn.line, end: fn.line + 30 };
    if (fn.kind === 'const') return { start: fn.line, end: fn.line + 3 };
    if (fn.kind === 'fn') return { start: fn.line, end: fn.line + 10 };
    return { start: fn.line, end: fn.line };
  }, [activeFn]);

  return (
    <div className="explorer-shell">
      {/* Left: file tree */}
      <div className="explorer-pane left">
        <div className="pane-head">
          <I.Folder size={13}/>
          <span>Files</span>
          <span className="spacer"/>
          <button className="icon-btn" style={{ width: 22, height: 22 }}><I.Refresh size={12}/></button>
        </div>
        <div style={{ padding: 8, borderBottom: '1px solid var(--border)' }}>
          <input
            className="input"
            placeholder="Filter files…"
            value={treeFilter}
            onChange={(e) => setTreeFilter(e.target.value)}
            style={{ fontSize: 12, padding: '5px 9px' }}
          />
        </div>
        <div className="tree">
          <TreeRenderer
            nodes={tree}
            depth={0}
            filter={treeFilter}
            activeTab={activeTab}
            onPick={(path) => {
              if (!openTabs.includes(path)) setOpenTabs([...openTabs, path]);
              setActiveTab(path);
            }}
          />
        </div>
      </div>

      {/* Center: code viewer */}
      <div className="explorer-pane">
        {/* Tabs */}
        <div className="editor-tabs">
          {openTabs.map((p) => {
            const ext = p.split('.').pop();
            const base = p.split('/').pop();
            return (
              <div key={p}
                   className={`editor-tab ${activeTab === p ? 'active' : ''}`}
                   onClick={() => setActiveTab(p)}>
                <FileIcon ext={ext} size={12}/>
                <span>{base}</span>
                <span className="close" onClick={(e) => {
                  e.stopPropagation();
                  const next = openTabs.filter((x) => x !== p);
                  setOpenTabs(next);
                  if (activeTab === p && next.length) setActiveTab(next[0]);
                }}><I.X size={11}/></span>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="row" style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)', fontSize: 12 }}>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>{file.path}</span>
          <span className="spacer"/>
          <span style={{ color: 'var(--fg-dim)', fontSize: 11.5 }}>{file.lines.length} lines · {file.size}</span>
          <span className="badge" style={{ marginLeft: 8 }}><I.GitBranch size={10}/> {project.branch}</span>
        </div>

        {/* Code */}
        <div className="code-view">
          {file.lines.map((line, i) => {
            const lineNum = i + 1;
            const inHl = highlightRange && lineNum >= highlightRange.start && lineNum <= highlightRange.end;
            const blame = file.blame[lineNum];
            return (
              <div key={i}
                   className={`line ${inHl ? 'hl' : ''}`}
                   onMouseEnter={() => setHoverLine(lineNum)}
                   onMouseLeave={() => setHoverLine((v) => (v === lineNum ? null : v))}
                   style={{ position: 'relative' }}>
                <span className="ln">{lineNum}</span>
                <span className="ln-content">
                  {line.length === 0 ? ' ' : line.map((tok, j) => <TokenSpan key={j} t={tok}/>)}
                </span>
                {/* Blame badge on hover (only on annotated lines) */}
                {hoverLine === lineNum && blame && (
                  <div style={{
                    position: 'absolute',
                    right: 12,
                    top: 0,
                    fontSize: 11,
                    color: 'var(--fg-dim)',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-strong)',
                    padding: '2px 8px',
                    borderRadius: 5,
                    fontFamily: 'var(--font-mono)',
                    pointerEvents: 'none',
                  }}>
                    <span style={{ color: 'var(--accent)' }}>{blame.sha}</span>
                    {' · '}
                    <span style={{ fontFamily: 'var(--font-ui)' }}>{blame.author} · {blame.when}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: AI insights */}
      <div className="explorer-pane right">
        <div className="pane-head">
          <I.Sparkles size={13} style={{ color: 'var(--accent)' }}/>
          <span>AI insights</span>
          <span className="spacer"/>
          <button className="icon-btn" style={{ width: 22, height: 22 }} title="Regenerate"><I.Refresh size={12}/></button>
        </div>
        <div className="scroll-y">
          <div className="insight-section">
            <h4>About this file</h4>
            <p style={{ color: 'var(--fg-muted)' }} dangerouslySetInnerHTML={{ __html: file.description }}/>
          </div>

          <div className="insight-section">
            <h4>Key declarations</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {file.keyFunctions.map((fn) => (
                <div key={fn.name}
                     className="insight-fn"
                     style={activeFn === fn.name ? { background: 'var(--accent-soft)', color: 'var(--fg)' } : {}}
                     onMouseEnter={() => setActiveFn(fn.name)}
                     onMouseLeave={() => setActiveFn(null)}
                     onClick={() => setActiveFn((v) => v === fn.name ? null : fn.name)}>
                  <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, background: 'var(--bg-hover)', color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>
                    {fn.kind}
                  </span>
                  <span className="name">{fn.name}</span>
                  <span className="ln-ref">L{fn.line}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--fg-dim)', marginTop: 8 }}>
              Hover to preview · click to pin
            </div>
          </div>

          <div className="insight-section">
            <h4>Imports & dependencies</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {file.dependencies.map((d) => (
                <div key={d} className="row" style={{ gap: 8, fontSize: 12, color: 'var(--fg-muted)', cursor: 'pointer', padding: '4px 6px', borderRadius: 5 }} >
                  <FileIcon ext={d.split('.').pop()} size={11}/>
                  <span style={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="insight-section">
            <h4>Related files</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {file.related.map((d) => (
                <div key={d} className="row" style={{ gap: 8, fontSize: 12, color: 'var(--fg-muted)', cursor: 'pointer', padding: '4px 6px', borderRadius: 5 }}>
                  <FileIcon ext={d.split('.').pop()} size={11}/>
                  <span style={{ fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.split('/').pop()}</span>
                  <span className="spacer"/>
                  <span style={{ fontSize: 10.5, color: 'var(--fg-dim)' }}>{Math.round(60 + Math.random() * 30)}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="insight-section">
            <h4>Git history</h4>
            <div style={{ fontSize: 12, color: 'var(--fg-muted)' }}>
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <span className="mono" style={{ color: 'var(--accent)' }}>a7f4c91</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>fix(auth): clear refresh token…</span>
                <span style={{ color: 'var(--fg-dim)', fontSize: 11 }}>2d</span>
              </div>
              <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                <span className="mono" style={{ color: 'var(--fg-dim)' }}>01b3d2f</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>feat(auth): magic-link sign-in</span>
                <span style={{ color: 'var(--fg-dim)', fontSize: 11 }}>1w</span>
              </div>
              <div className="row" style={{ gap: 8 }}>
                <span className="mono" style={{ color: 'var(--fg-dim)' }}>8e2a017</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>feat(auth): initial login form</span>
                <span style={{ color: 'var(--fg-dim)', fontSize: 11 }}>3w</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeRenderer({ nodes, depth, filter, activeTab, onPick, parentPath = '' }) {
  const { useState } = React;
  return (
    <>
      {nodes.map((node, i) => (
        <TreeNode key={i} node={node} depth={depth} filter={filter} activeTab={activeTab} onPick={onPick} parentPath={parentPath}/>
      ))}
    </>
  );
}

function TreeNode({ node, depth, filter, activeTab, onPick, parentPath }) {
  const { useState } = React;
  const [open, setOpen] = useState(node.open || false);
  const pad = 6 + depth * 12;

  const path = parentPath ? `${parentPath}/${node.name}` : node.name;

  if (node.type === 'file') {
    const fullPath = node.path || path;
    const matches = !filter || node.name.toLowerCase().includes(filter.toLowerCase());
    if (!matches) return null;
    const isActive = activeTab === fullPath;
    return (
      <div className={`tree-row ${isActive ? 'active' : ''}`}
           style={{ paddingLeft: pad }}
           onClick={() => onPick(fullPath)}>
        <span style={{ width: 14 }}/>
        <FileIcon ext={node.ext} size={12}/>
        <span className="tree-name">{node.name}</span>
      </div>
    );
  }

  // dir
  return (
    <>
      <div className="tree-row"
           style={{ paddingLeft: pad }}
           onClick={() => setOpen((o) => !o)}>
        <span className="tree-chev">
          {open ? <I.ChevronDown size={10}/> : <I.ChevronRight size={10}/>}
        </span>
        {open ? <I.FolderOpen size={12} style={{ color: 'var(--accent)' }}/> : <I.Folder size={12} style={{ color: 'var(--fg-dim)' }}/>}
        <span className="tree-name">{node.name}</span>
      </div>
      {open && node.children && (
        <TreeRenderer nodes={node.children} depth={depth + 1} filter={filter} activeTab={activeTab} onPick={onPick} parentPath={path}/>
      )}
    </>
  );
}

window.PageExplorer = PageExplorer;
