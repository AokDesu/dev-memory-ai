// Semantic Search page
function PageSearch({ project, onOpenFile }) {
  const { useState, useMemo } = React;
  const examples = window.__MOCK.EXAMPLE_QUERIES;
  const allResults = window.__MOCK.SEARCH_RESULTS;
  const [query, setQuery] = useState('how does authentication work');
  const [submitted, setSubmitted] = useState(true);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [activeSheet, setActiveSheet] = useState(null);
  const [filters, setFilters] = useState({
    fileTypes: { tsx: true, ts: true, js: false, css: false, md: false },
    dirs: { 'src/components': false, 'src/hooks': false, 'src/lib': false, 'src/app': false },
    authors: { 'Maya Chen': false, 'Ravi Iyer': false, 'Jin Park': false, 'Sam Reyes': false },
  });

  React.useEffect(() => {
    if (submitted) return;
    const id = setInterval(() => setPlaceholderIdx((i) => (i + 1) % examples.length), 2500);
    return () => clearInterval(id);
  }, [submitted, examples.length]);

  const results = submitted ? allResults : [];

  const toggleFilter = (group, key) => {
    setFilters((f) => ({ ...f, [group]: { ...f[group], [key]: !f[group][key] } }));
  };

  return (
    <div className="scroll-y" style={{ height: '100%' }}>
      <div className="page-pad-lg">
        <div className="search-wrap">
          <div className="page-title">Search the codebase</div>
          <div className="page-sub" style={{ marginBottom: 18 }}>
            Semantic + keyword. Ask in plain English or paste an error message.
          </div>

          <form className="search-bar" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <I.Search size={18} style={{ color: 'var(--fg-muted)' }}/>
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSubmitted(false); }}
              placeholder={`Try: "${examples[placeholderIdx]}"`}
              autoFocus
            />
            <Kbd>⏎</Kbd>
          </form>

          {!submitted && (
            <div style={{ marginTop: 18, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--fg-dim)', alignSelf: 'center', marginRight: 6 }}>Try:</span>
              {examples.map((e) => (
                <button key={e} className="prompt-chip" style={{ fontSize: 12, padding: '5px 11px' }} onClick={() => { setQuery(e); setSubmitted(true); }}>
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {submitted && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 28, maxWidth: 1180, margin: '24px auto 0' }}>
            <div>
              <div className="row" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>
                  <strong style={{ color: 'var(--fg)' }}>{results.length}</strong> results · ranked by semantic relevance
                </span>
                <div className="spacer"/>
                <span style={{ fontSize: 11.5, color: 'var(--fg-dim)' }}>312ms</span>
              </div>

              {results.map((r, i) => (
                <div key={i} className="search-result" onClick={() => setActiveSheet(r)}>
                  <div className="search-result-head">
                    <FileIcon ext={r.path.split('.').pop()} size={13}/>
                    <span className="path">
                      {r.path.replace(/\/[^/]+$/, '/')}
                      <span className="basename">{r.basename}</span>
                    </span>
                    <span style={{ color: 'var(--fg-dim)', fontFamily: 'var(--font-mono)' }}>
                      L{r.lines.start}–{r.lines.end}
                    </span>
                    <div className="relevance">
                      <div className="relevance-bar"><div style={{ width: (r.relevance * 100) + '%' }}/></div>
                      <span className="mono">{r.relevance.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ background: 'var(--code-bg)', fontFamily: 'var(--font-mono)', fontSize: 12.5, padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                    {r.snippet.map((line, j) => (
                      <div key={j} className="code-line">
                        <span className="ln">{r.lines.start + j}</span>
                        <span className="ln-content">
                          {line.length === 0 ? ' ' : line.map((tok, k) => <TokenSpan key={k} t={tok} />)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '8px 14px', fontSize: 11.5, color: 'var(--fg-dim)', display: 'flex', gap: 14, borderTop: '1px solid var(--border)' }}>
                    <span><I.GitCommit size={11} style={{ verticalAlign: '-1px' }}/> <span className="mono">{r.sha}</span></span>
                    <span>{r.author}</span>
                    <span>{r.when}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Filter panel */}
            <div className="filter-panel">
              <div className="row" style={{ marginBottom: 14 }}>
                <I.Filter size={13}/>
                <span style={{ fontSize: 12.5, fontWeight: 500 }}>Filters</span>
                <span className="spacer"/>
                <button className="btn btn-ghost btn-sm" style={{ fontSize: 11.5, padding: '3px 6px' }}>Clear</button>
              </div>

              <div className="filter-group">
                <h4>File type</h4>
                {Object.entries(filters.fileTypes).map(([k, v]) => (
                  <div key={k} className={`filter-item ${v ? 'active' : ''}`} onClick={() => toggleFilter('fileTypes', k)}>
                    <span className="filter-check">{v && <I.Check size={10}/>}</span>
                    <FileIcon ext={k} size={12}/>
                    <span>.{k}</span>
                    <span className="count">{Math.round(20 + Math.random()*80)}</span>
                  </div>
                ))}
              </div>

              <div className="filter-group">
                <h4>Directory</h4>
                {Object.entries(filters.dirs).map(([k, v]) => (
                  <div key={k} className={`filter-item ${v ? 'active' : ''}`} onClick={() => toggleFilter('dirs', k)}>
                    <span className="filter-check">{v && <I.Check size={10}/>}</span>
                    <I.Folder size={11}/>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>{k}</span>
                  </div>
                ))}
              </div>

              <div className="filter-group">
                <h4>Author</h4>
                {Object.entries(filters.authors).map(([k, v]) => (
                  <div key={k} className={`filter-item ${v ? 'active' : ''}`} onClick={() => toggleFilter('authors', k)}>
                    <span className="filter-check">{v && <I.Check size={10}/>}</span>
                    <span>{k}</span>
                  </div>
                ))}
              </div>

              <div className="filter-group">
                <h4>Date range</h4>
                {['Past 24 hours', 'Past week', 'Past month', 'All time'].map((d, i) => (
                  <div key={d} className={`filter-item ${i === 3 ? 'active' : ''}`}>
                    <span className="filter-check">{i === 3 && <I.Check size={10}/>}</span>
                    <span>{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ height: 40 }}/>
      </div>

      {activeSheet && (
        <FileSheet result={activeSheet} onClose={() => setActiveSheet(null)} onOpenFull={() => { onOpenFile(activeSheet.path); setActiveSheet(null); }}/>
      )}
    </div>
  );
}

function FileSheet({ result, onClose, onOpenFull }) {
  // Use the rich LoginForm file content if the path matches; otherwise show the snippet
  const isLogin = result.path === 'src/components/auth/LoginForm.tsx';
  const file = window.__MOCK.FILE_LOGIN;
  return (
    <>
      <div className="sheet-backdrop" onClick={onClose}/>
      <div className="sheet">
        <div className="sheet-header">
          <FileIcon ext={result.path.split('.').pop()} size={13}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {result.path}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onOpenFull}><I.ExternalLink size={12}/> Open in Explorer</button>
          <button className="icon-btn" onClick={onClose}><I.X size={15}/></button>
        </div>
        <div className="scroll-y" style={{ padding: 16 }}>
          {isLogin ? (
            <>
              <div style={{ marginBottom: 14, padding: 12, background: 'var(--accent-soft)', borderRadius: 8, borderLeft: '2px solid var(--accent)' }}>
                <div className="row" style={{ marginBottom: 4 }}>
                  <I.Sparkles size={12} style={{ color: 'var(--accent)' }}/>
                  <span style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.05 }}>AI summary</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.55 }} dangerouslySetInnerHTML={{ __html: file.description }}/>
              </div>
              <CodeBlock
                lines={file.lines}
                language="tsx"
                highlight={[result.lines.start, result.lines.start + 1, result.lines.start + 2]}
              />
            </>
          ) : (
            <CodeBlock
              lines={result.snippet}
              language={result.path.split('.').pop()}
              startLine={result.lines.start}
            />
          )}
        </div>
      </div>
    </>
  );
}

window.PageSearch = PageSearch;
