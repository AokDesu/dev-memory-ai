// Landing / Project Picker page
function PageLanding({ projects, onOpenProject, onAddProject, theme, onToggleTheme, isFirstTime }) {
  const indexing = projects.find(p => p.indexing);
  return (
    <div className="landing-shell">
      <div className="landing-top">
        <div className="landing-brand">
          <div className="logo-mark">M</div>
          <div>Memory<span style={{ color: 'var(--fg-dim)', fontWeight: 400 }}>.dev</span></div>
        </div>
        <div className="spacer" />
        <div className="row" style={{ gap: 10 }}>
          <a className="btn btn-ghost btn-sm" href="#"><I.ExternalLink size={13}/> Docs</a>
          <button className="icon-btn" onClick={onToggleTheme} title="Toggle theme">
            {theme === 'dark' ? <I.Sun size={15} /> : <I.Moon size={15} />}
          </button>
        </div>
      </div>

      <div className="landing-wrap">
        <div className="landing-hero">
          <h1>Your projects</h1>
          <p>Pick a repo to dive in. Indexes refresh on demand — local-first, your code never leaves your machine.</p>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-primary" onClick={onAddProject}>
              <I.Plus size={14} /> Select project
            </button>
            <button className="btn btn-secondary">
              <I.ExternalLink size={13} /> Connect GitHub
            </button>
          </div>
        </div>

        {isFirstTime && (
          <div style={{ marginBottom: 32 }}>
            <div className="section-title">How it works</div>
            <div className="how-row">
              <div className="how-step">
                <div className="num">1</div>
                <h4>Point it at a repo</h4>
                <p>Pick a local folder. We crawl it once and build an embedding index — no upload, no cloud sync.</p>
              </div>
              <div className="how-step">
                <div className="num">2</div>
                <h4>Ask anything</h4>
                <p>Semantic search and AI chat over your actual code. Answers cite the exact files and line ranges they came from.</p>
              </div>
              <div className="how-step">
                <div className="num">3</div>
                <h4>Stay current</h4>
                <p>Re-index on demand, or wire it into your <span className="mono" style={{ color: 'var(--accent)' }}>post-commit</span> hook to keep memory fresh as you ship.</p>
              </div>
            </div>
          </div>
        )}

        <div className="row" style={{ marginBottom: 14 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>Recently indexed</div>
          <div className="spacer" />
          <button className="btn btn-ghost btn-sm">Sort by recent <I.ChevronDown size={12}/></button>
        </div>

        <div className="projects-grid">
          {projects.map((p) => (
            <div key={p.id} className="project-card" onClick={() => !p.indexing && onOpenProject(p.id)}>
              <div className="row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="name">{p.name}</div>
                  <div className="path">{p.path}</div>
                </div>
                <I.ArrowRight size={14} style={{ color: 'var(--fg-faint)' }} />
              </div>

              {/* Language bar */}
              {p.langs.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div className="lang-bar">
                    {p.langs.map((l) => (
                      <div key={l.name} style={{ width: l.pct + '%', background: LANGUAGES[l.name] || '#888' }} />
                    ))}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap', fontSize: 11, color: 'var(--fg-dim)' }}>
                    {p.langs.slice(0, 3).map((l) => (
                      <span key={l.name}>
                        <span className="swatch" style={{ background: LANGUAGES[l.name], display: 'inline-block', width: 7, height: 7, borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }}/>
                        {l.name} {l.pct.toFixed(1)}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="meta-row">
                <span className="item"><I.File size={11}/> {p.files.toLocaleString()} files</span>
                <span className="item"><I.GitBranch size={11}/> {p.branch}</span>
                <span className="item" style={p.indexing ? { color: 'var(--accent)' } : {}}>
                  {p.indexing
                    ? <><I.Refresh size={11} className="spin"/> Indexing {Math.round((p.indexProgress || 0) * 100)}%</>
                    : <>Indexed {p.lastIndexed}</>}
                </span>
              </div>

              {p.indexing && (
                <div style={{
                  position: 'absolute', left: 16, right: 16, bottom: 6,
                  height: 2, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{ width: ((p.indexProgress || 0) * 100) + '%', height: '100%', background: 'var(--accent)', transition: 'width 200ms' }}/>
                </div>
              )}
            </div>
          ))}
          <div className="add-card" onClick={onAddProject}>
            <I.Plus size={16} />
            <span>Add another project</span>
          </div>
        </div>

        <div style={{ marginTop: 40, padding: 16, border: '1px dashed var(--border)', borderRadius: 10, fontSize: 12.5, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <I.Terminal size={16} />
          <span>Or run <code className="mono" style={{ color: 'var(--accent)' }}>memory init</code> in any project folder.</span>
          <div className="spacer" />
          <button className="btn btn-ghost btn-sm"><I.Copy size={12}/> Copy</button>
        </div>
      </div>
    </div>
  );
}

window.PageLanding = PageLanding;
