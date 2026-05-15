// Project Dashboard
function PageDashboard({ project, commits, onNavigate }) {
  const reindexing = false;
  return (
    <div className="scroll-y">
      <div className="page-pad-lg" style={{ maxWidth: 1280 }}>
        <div className="row" style={{ marginBottom: 6 }}>
          <div>
            <div className="row" style={{ gap: 10 }}>
              <h1 className="page-title" style={{ margin: 0 }}>{project.name}</h1>
              <span className="badge"><I.GitBranch size={10}/> {project.branch}</span>
              <span className="badge badge-success"><span className="badge-dot"/> Synced</span>
            </div>
            <div className="page-sub mono" style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5 }}>{project.path}</div>
          </div>
          <div className="spacer" />
          <div className="row" style={{ gap: 8 }}>
            <button className="btn btn-secondary"><I.GitCommit size={13}/> View commits</button>
            <button className="btn btn-primary"><I.Refresh size={13}/> Re-index</button>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="stat-grid" style={{ marginTop: 24 }}>
          <div className="stat-tile">
            <div className="label">Files</div>
            <div className="value">{project.files.toLocaleString()}</div>
            <div className="delta">+12 since last index</div>
          </div>
          <div className="stat-tile">
            <div className="label">Lines of code</div>
            <div className="value">{(project.loc/1000).toFixed(1)}k</div>
            <div className="delta">+318 this week</div>
          </div>
          <div className="stat-tile">
            <div className="label">Last commit</div>
            <div className="value" style={{ fontSize: 18 }}>{project.lastCommit}</div>
            <div className="delta">by Maya Chen</div>
          </div>
          <div className="stat-tile">
            <div className="label">Contributors</div>
            <div className="value">{project.contributors}</div>
            <div className="delta">2 active this week</div>
          </div>
        </div>

        {/* Main 2-col */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginTop: 16 }}>
          {/* Summary card */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title row" style={{ gap: 6 }}>
                  <I.Sparkles size={13} style={{ color: 'var(--accent)' }}/>
                  AI repository summary
                </div>
                <div className="card-sub">Generated {project.lastIndexed} · {project.summary ? 'gpt-4o' : ''}</div>
              </div>
              <button className="btn btn-ghost btn-sm"><I.Refresh size={12}/> Regenerate</button>
            </div>
            <div className="card-body">
              <p style={{ margin: 0, color: 'var(--fg-muted)', lineHeight: 1.65, fontSize: 13.5 }}>
                {project.summary}
              </p>

              <div className="section-title" style={{ marginTop: 18, marginBottom: 8 }}>Tech stack</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {project.stack.map((s) => (
                  <span key={s} className="badge">{s}</span>
                ))}
              </div>

              <div className="section-title" style={{ marginTop: 18, marginBottom: 8 }}>Language breakdown</div>
              <div className="lang-bar">
                {project.langs.map((l) => (
                  <div key={l.name} style={{ width: l.pct + '%', background: LANGUAGES[l.name] || '#888' }} />
                ))}
              </div>
              <div className="lang-legend">
                {project.langs.map((l) => (
                  <span key={l.name}>
                    <span className="swatch" style={{ background: LANGUAGES[l.name] }}/>
                    {l.name} <span style={{ color: 'var(--fg-dim)' }}>{l.pct.toFixed(1)}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-header">
                <div className="card-title">Quick actions</div>
              </div>
              <div style={{ padding: 4 }}>
                {[
                  { icon: <I.Search size={14}/>, label: 'Search the codebase', sub: 'Semantic + keyword', page: 'search' },
                  { icon: <I.Chat size={14}/>, label: 'Ask a question', sub: 'AI chat with citations', page: 'chat' },
                  { icon: <I.Code size={14}/>, label: 'Browse files', sub: 'Explorer with AI insights', page: 'explorer' },
                ].map((a) => (
                  <div key={a.label} className="cmd-row" onClick={() => onNavigate(a.page)} style={{ padding: '10px 12px' }}>
                    {a.icon}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--fg)', fontSize: 13, fontWeight: 500 }}>{a.label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--fg-dim)' }}>{a.sub}</div>
                    </div>
                    <I.ChevronRight size={14} style={{ color: 'var(--fg-faint)' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Index health</div>
                <span className="badge badge-success"><span className="badge-dot"/> healthy</span>
              </div>
              <div className="card-body" style={{ padding: 14, fontSize: 12.5, color: 'var(--fg-muted)' }}>
                <div className="row" style={{ marginBottom: 8 }}>
                  <span>Embedding coverage</span>
                  <span className="spacer"/>
                  <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>98.4%</span>
                </div>
                <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden', marginBottom: 14 }}>
                  <div style={{ width: '98.4%', height: '100%', background: 'var(--accent)' }}/>
                </div>
                <div className="row" style={{ marginBottom: 8 }}>
                  <span>Chunks</span>
                  <span className="spacer"/>
                  <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>14,832</span>
                </div>
                <div className="row">
                  <span>Skipped files</span>
                  <span className="spacer"/>
                  <span style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>13 <span style={{ color: 'var(--fg-dim)' }}>· too large</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card-header">
            <div>
              <div className="card-title">Recent activity</div>
              <div className="card-sub">Commits with AI-summarized changes</div>
            </div>
            <button className="btn btn-ghost btn-sm">View all <I.ChevronRight size={12}/></button>
          </div>
          <div className="card-body" style={{ padding: '4px 16px 8px' }}>
            {commits.map((c) => (
              <div key={c.sha} className="activity-row">
                <div className="commit-sha mono">{c.sha}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="msg">{c.message}</div>
                  <div className="ai-line" dangerouslySetInnerHTML={{ __html: c.aiSummary }}/>
                  <div className="meta">
                    {c.author} · {c.when} · {c.filesChanged} files changed
                  </div>
                </div>
                <div className="avatar" style={{ width: 22, height: 22, fontSize: 10, alignSelf: 'flex-start' }}>{c.authorInitials}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: 40 }}/>
      </div>
    </div>
  );
}

window.PageDashboard = PageDashboard;
