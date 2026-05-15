// AI Chat page — one of the polish targets
function PageChat({ project, onOpenFile }) {
  const { useState, useRef, useEffect } = React;
  const chats = window.__MOCK.CHATS;
  const [activeChatId, setActiveChatId] = useState(chats[0].id);
  const [draft, setDraft] = useState('');
  const [expandedSources, setExpandedSources] = useState({});
  const taRef = useRef(null);
  const scrollRef = useRef(null);

  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];

  // Group history
  const grouped = React.useMemo(() => {
    const g = {};
    chats.forEach((c) => {
      if (!g[c.group]) g[c.group] = [];
      g[c.group].push(c);
    });
    return g;
  }, [chats]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeChatId]);

  // Auto-grow textarea
  useEffect(() => {
    if (!taRef.current) return;
    taRef.current.style.height = 'auto';
    taRef.current.style.height = Math.min(taRef.current.scrollHeight, 200) + 'px';
  }, [draft]);

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      // submit (no-op for prototype)
      setDraft('');
    }
  };

  return (
    <div className="chat-shell">
      {/* History sidebar */}
      <div className="chat-history">
        <div className="chat-history-head">
          <button className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
            <I.Plus size={13}/> New chat
          </button>
        </div>
        <div className="chat-history-list">
          {Object.entries(grouped).map(([group, list]) => (
            <div key={group}>
              <div className="chat-history-group-label">{group}</div>
              {list.map((c) => (
                <div key={c.id}
                     className={`chat-history-item ${activeChatId === c.id ? 'active' : ''}`}
                     onClick={() => setActiveChatId(c.id)}>
                  {c.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="chat-main">
        {activeChat.messages.length === 0 ? (
          <ChatEmpty title={activeChat.title} onPick={(p) => setDraft(p)} />
        ) : (
          <>
            <div className="row" style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{activeChat.title}</div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-dim)' }}>2 messages · gpt-4o · grounded in {project.name}</div>
              </div>
              <div className="spacer"/>
              <button className="btn btn-ghost btn-sm"><I.Copy size={12}/></button>
              <button className="btn btn-ghost btn-sm"><I.Trash size={12}/></button>
            </div>
            <div className="chat-messages" ref={scrollRef}>
              {activeChat.messages.map((m, i) => (
                <div className="msg-wrap" key={i}>
                  <ChatMessage
                    msg={m}
                    expanded={!!expandedSources[i]}
                    onToggleSources={() => setExpandedSources((s) => ({ ...s, [i]: !s[i] }))}
                    onOpenFile={onOpenFile}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        <Composer
          draft={draft}
          setDraft={setDraft}
          taRef={taRef}
          handleKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
}

function ChatMessage({ msg, expanded, onToggleSources, onOpenFile }) {
  const isAI = msg.role === 'ai';
  return (
    <div className="msg">
      <div className={`msg-avatar ${isAI ? 'ai' : 'user'}`}>
        {isAI ? <I.Sparkles size={14}/> : 'M'}
      </div>
      <div className="msg-content">
        <div className="msg-role">
          {isAI ? 'Memory' : 'You'}
          <span className="ts">{msg.when}</span>
        </div>
        <div className="msg-body">
          {typeof msg.content === 'string' ? (
            <p>{msg.content}</p>
          ) : (
            msg.content.map((block, i) => {
              if (block.type === 'p') return <p key={i} dangerouslySetInnerHTML={{ __html: block.text }}/>;
              if (block.type === 'ol') return (
                <ol key={i}>
                  {block.items.map((it, j) => <li key={j} dangerouslySetInnerHTML={{ __html: it }}/>)}
                </ol>
              );
              if (block.type === 'code') return (
                <div key={i} style={{ margin: '6px 0 14px' }}>
                  <CodeBlock lines={block.code} language={block.lang || 'go'} showHeader={true}/>
                </div>
              );
              return null;
            })
          )}

          {isAI && msg.sources && (
            <>
              <button className="sources-toggle" onClick={onToggleSources}>
                {expanded ? <I.ChevronDown size={12}/> : <I.ChevronRight size={12}/>}
                <I.File size={12}/>
                <span className="count">{msg.sources.length}</span> sources
              </button>
              {expanded && (
                <div className="sources-list">
                  {msg.sources.map((s, i) => (
                    <div key={i} className="source-item" onClick={() => onOpenFile && onOpenFile(s.path)}>
                      <FileIcon ext={s.path.split('.').pop().replace(/[^a-z]/g, '')} size={12}/>
                      <span className="path">{s.path}</span>
                      <span className="lines">L{s.lines}</span>
                      <I.ChevronRight size={12} style={{ color: 'var(--fg-faint)' }}/>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {isAI && (
            <div style={{ marginTop: 12, display: 'flex', gap: 4, color: 'var(--fg-dim)' }}>
              <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px' }}><I.Copy size={12}/></button>
              <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px', fontSize: 11.5 }}>👍</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px', fontSize: 11.5 }}>👎</button>
              <button className="btn btn-ghost btn-sm" style={{ padding: '3px 6px' }}><I.Refresh size={11}/></button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatEmpty({ title, onPick }) {
  const prompts = [
    'How does authentication work?',
    'Where do we handle rate limiting?',
    "What's the data flow for the dashboard charts?",
    'Find all TODO comments related to caching',
  ];
  return (
    <div className="chat-empty">
      <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent)', marginBottom: 14 }}>
        <I.Sparkles size={22}/>
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600 }}>Ask anything about <span style={{ fontFamily: 'var(--font-mono)', fontSize: 16 }}>voyager-web</span></h3>
      <p style={{ margin: '0 0 22px', color: 'var(--fg-muted)', fontSize: 13.5, maxWidth: 460 }}>
        Memory grounds every answer in your actual code. Every claim links to the files it came from.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', maxWidth: 580 }}>
        {prompts.map((p) => (
          <button key={p} className="prompt-chip" onClick={() => onPick(p)}>{p}</button>
        ))}
      </div>
    </div>
  );
}

function Composer({ draft, setDraft, taRef, handleKeyDown }) {
  return (
    <div className="chat-composer">
      <div className="composer-wrap">
        <div className="composer-box">
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about the codebase… (⌘+Enter to send)"
            rows={1}
          />
          <button className="send-btn" disabled={!draft.trim()} title="Send (⌘+Enter)">
            <I.Send size={14}/>
          </button>
        </div>
        <div className="composer-hint">
          <Kbd>⌘</Kbd><Kbd>↵</Kbd> to send · <Kbd>⇧</Kbd><Kbd>↵</Kbd> for new line · grounded in <span style={{ color: 'var(--fg)' }}>voyager-web</span>
        </div>
      </div>
    </div>
  );
}

window.PageChat = PageChat;
