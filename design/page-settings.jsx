// Settings page
function PageSettings({ project }) {
  const { useState } = React;
  const [tab, setTab] = useState('general');
  const [provider, setProvider] = useState('openai');
  const [apiKey, setApiKey] = useState('sk-proj-9f4cR2bN8mLqPzXkY7VvT3JsHd0WaEoUiK');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState('gpt-4o');
  const [maxSize, setMaxSize] = useState(2);
  const [autoSync, setAutoSync] = useState(true);
  const [telemetry, setTelemetry] = useState(false);

  return (
    <div className="scroll-y">
      <div className="page-pad-lg">
        <div className="page-title">Settings</div>
        <div className="page-sub" style={{ marginBottom: 24 }}>
          Configuration for <span className="mono" style={{ color: 'var(--fg)' }}>{project.name}</span>
        </div>

        <div className="settings-grid">
          <div className="settings-side-nav">
            {[
              { k: 'general', label: 'General' },
              { k: 'ai', label: 'AI Provider' },
              { k: 'keys', label: 'API Keys' },
              { k: 'indexing', label: 'Indexing' },
            ].map((t) => (
              <div key={t.k} className={`item ${tab === t.k ? 'active' : ''}`} onClick={() => setTab(t.k)}>
                {t.label}
              </div>
            ))}
          </div>

          <div>
            {tab === 'general' && <SectionGeneral project={project} autoSync={autoSync} setAutoSync={setAutoSync} telemetry={telemetry} setTelemetry={setTelemetry}/>}
            {tab === 'ai' && <SectionAI provider={provider} setProvider={setProvider} model={model} setModel={setModel} apiKey={apiKey} setApiKey={setApiKey} showKey={showKey} setShowKey={setShowKey}/>}
            {tab === 'keys' && <SectionKeys/>}
            {tab === 'indexing' && <SectionIndexing maxSize={maxSize} setMaxSize={setMaxSize}/>}
          </div>
        </div>

        <div style={{ height: 60 }}/>
      </div>
    </div>
  );
}

function SectionGeneral({ project, autoSync, setAutoSync, telemetry, setTelemetry }) {
  return (
    <div>
      <div className="section-title">General</div>
      <div className="field-row">
        <div>
          <div className="field-label">Project name</div>
          <div className="field-help">Display name across the app. Doesn't change the folder.</div>
        </div>
        <div className="field-control">
          <input className="input" defaultValue={project.name} style={{ maxWidth: 320 }}/>
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">Local path</div>
          <div className="field-help">Where Memory watches for changes.</div>
        </div>
        <div className="field-control row" style={{ gap: 8 }}>
          <code style={{ fontSize: 12, padding: '6px 10px', background: 'var(--bg-hover)', borderRadius: 6, color: 'var(--fg-muted)' }}>{project.path}</code>
          <button className="btn btn-secondary btn-sm">Change…</button>
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">Auto-sync on commit</div>
          <div className="field-help">Re-index incrementally after every <code style={{ fontSize: 11, color: 'var(--fg)' }}>git commit</code>.</div>
        </div>
        <div className="field-control row">
          <div className={`toggle ${autoSync ? 'on' : ''}`} onClick={() => setAutoSync((v) => !v)}/>
          <span style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{autoSync ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">Anonymous telemetry</div>
          <div className="field-help">Send usage events. No code, no queries, no file paths.</div>
        </div>
        <div className="field-control row">
          <div className={`toggle ${telemetry ? 'on' : ''}`} onClick={() => setTelemetry((v) => !v)}/>
          <span style={{ fontSize: 12.5, color: 'var(--fg-muted)' }}>{telemetry ? 'Enabled' : 'Disabled'}</span>
        </div>
      </div>
      <div className="field-row" style={{ paddingTop: 28 }}>
        <div>
          <div className="field-label" style={{ color: 'var(--danger)' }}>Delete project</div>
          <div className="field-help">Removes the index. Your code is untouched.</div>
        </div>
        <div className="field-control">
          <button className="btn btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--border-strong)' }}>
            <I.Trash size={13}/> Delete from Memory
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionAI({ provider, setProvider, model, setModel, apiKey, setApiKey, showKey, setShowKey }) {
  const providers = [
    { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4 Turbo · best quality, paid', icon: <I.Sparkles size={16}/> },
    { id: 'gemini', name: 'Google Gemini', desc: 'gemini-1.5-pro, flash · large context window', icon: <I.Sparkles size={16}/> },
    { id: 'ollama', name: 'Ollama', desc: 'Run locally · llama3, mistral, qwen', icon: <I.Cpu size={16}/> },
  ];
  const models = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    gemini: ['gemini-1.5-pro', 'gemini-1.5-flash'],
    ollama: ['llama3.1:8b', 'qwen2.5-coder:7b', 'mistral:7b'],
  };
  return (
    <div>
      <div className="section-title">AI Provider</div>
      <div className="field-row">
        <div>
          <div className="field-label">Provider</div>
          <div className="field-help">Used for chat answers and AI summaries. Embeddings use a local model regardless.</div>
        </div>
        <div className="field-control" style={{ maxWidth: 460 }}>
          {providers.map((p) => (
            <div key={p.id}
                 className={`radio-card ${provider === p.id ? 'active' : ''}`}
                 onClick={() => setProvider(p.id)}>
              <div className="radio-dot"/>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--bg-hover)', display: 'grid', placeItems: 'center', color: 'var(--fg-muted)' }}>
                {p.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div className="name">{p.name}</div>
                <div className="desc">{p.desc}</div>
              </div>
              {p.id === 'ollama' && <span className="badge badge-success">Local</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">Model</div>
          <div className="field-help">Higher tiers = better answers, more cost.</div>
        </div>
        <div className="field-control">
          <select className="input" value={model} onChange={(e) => setModel(e.target.value)} style={{ maxWidth: 280, appearance: 'auto' }}>
            {models[provider].map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">API key</div>
          <div className="field-help">Stored in your OS keychain. Never sent anywhere except {providers.find(p => p.id === provider).name}.</div>
        </div>
        <div className="field-control row" style={{ gap: 8, maxWidth: 460 }}>
          <input
            className="input"
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}
          />
          <button className="icon-btn" style={{ flexShrink: 0, border: '1px solid var(--border)' }} onClick={() => setShowKey((v) => !v)}>
            {showKey ? <I.EyeOff size={14}/> : <I.Eye size={14}/>}
          </button>
        </div>
      </div>
      <div className="field-row">
        <div/>
        <div className="field-control row" style={{ gap: 8 }}>
          <button className="btn btn-secondary">Test connection</button>
          <button className="btn btn-primary">Save changes</button>
        </div>
      </div>
    </div>
  );
}

function SectionKeys() {
  const keys = [
    { name: 'Local CLI', value: 'mk_live_a7f4c91bd2e8503f', created: '12 days ago' },
    { name: 'VS Code extension', value: 'mk_live_9c1ea44b3d0e21f8', created: '2 months ago' },
    { name: 'CI / GitHub Actions', value: 'mk_live_4b87f1003e8b2a91', created: '3 months ago' },
  ];
  return (
    <div>
      <div className="row" style={{ marginBottom: 16 }}>
        <div>
          <div className="section-title" style={{ margin: 0 }}>API Keys</div>
          <div style={{ fontSize: 12.5, color: 'var(--fg-dim)', marginTop: 4 }}>
            For integrations that talk to Memory from outside the app.
          </div>
        </div>
        <div className="spacer"/>
        <button className="btn btn-primary btn-sm"><I.Plus size={13}/> Generate key</button>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: '4px 16px' }}>
          {keys.map((k) => (
            <div key={k.name} className="key-row">
              <div className="key-name">{k.name}</div>
              <div className="key-value">
                <I.Key size={11}/>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {k.value.slice(0, 8)}{'•'.repeat(20)}
                </span>
                <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px' }}><I.Copy size={11}/></button>
              </div>
              <div className="key-meta">{k.created}</div>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', padding: '3px 6px' }}>Revoke</button>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 14, border: '1px solid var(--border)', borderRadius: 10, fontSize: 12.5, color: 'var(--fg-muted)', background: 'var(--bg-card)' }}>
        <div className="row" style={{ marginBottom: 4 }}>
          <I.Terminal size={13}/>
          <strong style={{ color: 'var(--fg)' }}>Quick start</strong>
        </div>
        <code className="mono" style={{ display: 'block', padding: '8px 10px', marginTop: 6, background: 'var(--code-bg)', borderRadius: 6, fontSize: 12 }}>
          <span style={{ color: 'var(--fg-dim)' }}>$</span> memory chat <span className="tok-str">"how does auth work"</span> <span className="tok-kw">--key</span> <span className="tok-str">$MEMORY_KEY</span>
        </code>
      </div>
    </div>
  );
}

function SectionIndexing({ maxSize, setMaxSize }) {
  const [include, setInclude] = React.useState(['.ts', '.tsx', '.js', '.jsx', '.css', '.md', '.json']);
  const [exclude, setExclude] = React.useState(['node_modules', '.next', 'dist', 'build', '*.lock', '.env*']);
  return (
    <div>
      <div className="section-title">Indexing</div>
      <div className="field-row">
        <div>
          <div className="field-label">Include extensions</div>
          <div className="field-help">Files with these extensions are embedded.</div>
        </div>
        <div className="field-control">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {include.map((e) => (
              <span key={e} className="badge" style={{ padding: '4px 8px', fontSize: 12 }}>
                <span className="mono">{e}</span>
                <I.X size={11} style={{ marginLeft: 2, cursor: 'pointer', color: 'var(--fg-dim)' }} onClick={() => setInclude(include.filter((x) => x !== e))}/>
              </span>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ padding: '3px 8px', border: '1px dashed var(--border-strong)' }}>
              <I.Plus size={11}/> Add
            </button>
          </div>
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">Exclude patterns</div>
          <div className="field-help">Glob patterns. <code style={{ fontSize: 11 }}>.gitignore</code> is always respected.</div>
        </div>
        <div className="field-control">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {exclude.map((e) => (
              <span key={e} className="badge" style={{ padding: '4px 8px', fontSize: 12 }}>
                <span className="mono">{e}</span>
                <I.X size={11} style={{ marginLeft: 2, cursor: 'pointer', color: 'var(--fg-dim)' }} onClick={() => setExclude(exclude.filter((x) => x !== e))}/>
              </span>
            ))}
            <button className="btn btn-ghost btn-sm" style={{ padding: '3px 8px', border: '1px dashed var(--border-strong)' }}>
              <I.Plus size={11}/> Add
            </button>
          </div>
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">Max file size</div>
          <div className="field-help">Larger files are skipped — useful for minified bundles or generated lockfiles.</div>
        </div>
        <div className="field-control row" style={{ gap: 12 }}>
          <input type="range" min="0.5" max="10" step="0.5" value={maxSize}
                 onChange={(e) => setMaxSize(parseFloat(e.target.value))}
                 style={{ width: 200, accentColor: 'var(--accent)' }}/>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg)', minWidth: 60 }}>
            {maxSize.toFixed(1)} MB
          </span>
        </div>
      </div>
      <div className="field-row">
        <div>
          <div className="field-label">Re-index now</div>
          <div className="field-help">Drop the embedding store and rebuild from scratch. Takes ~2 minutes.</div>
        </div>
        <div className="field-control row" style={{ gap: 8 }}>
          <button className="btn btn-secondary"><I.Refresh size={13}/> Incremental</button>
          <button className="btn btn-secondary" style={{ color: 'var(--danger)' }}><I.Database size={13}/> Full rebuild</button>
        </div>
      </div>
    </div>
  );
}

window.PageSettings = PageSettings;
