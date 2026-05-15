// Main app — routing, theme, glue
const { useState, useEffect, useCallback } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue"
}/*EDITMODE-END*/;

const ACCENTS = {
  blue:    { c: '#3b82f6', h: '#2563eb', s: 'rgba(59, 130, 246, 0.12)' },
  green:   { c: '#22c55e', h: '#16a34a', s: 'rgba(34, 197, 94, 0.12)' },
  orange:  { c: '#f97316', h: '#ea580c', s: 'rgba(249, 115, 22, 0.12)' },
  violet:  { c: '#a855f7', h: '#9333ea', s: 'rgba(168, 85, 247, 0.12)' },
  mono:    { c: '#e5e5e5', h: '#fafafa', s: 'rgba(229, 229, 229, 0.12)' },
};

function App() {
  const [theme, setTheme] = useState('dark');
  const [page, setPage] = useState('landing');   // 'landing' | 'dashboard' | 'search' | 'chat' | 'explorer' | 'settings'
  const [projectId, setProjectId] = useState(null);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Apply accent
  useEffect(() => {
    const a = ACCENTS[tweaks.accent] || ACCENTS.blue;
    document.documentElement.style.setProperty('--accent', a.c);
    document.documentElement.style.setProperty('--accent-hover', a.h);
    document.documentElement.style.setProperty('--accent-soft', a.s);
    document.documentElement.style.setProperty('--accent-fg', tweaks.accent === 'mono' ? '#0a0a0a' : '#ffffff');
  }, [tweaks.accent]);

  // Global ⌘K
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
      } else if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        if (page !== 'landing') {
          e.preventDefault();
          setPage('search');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [page]);

  const projects = window.__MOCK.PROJECTS;
  const project = projectId ? projects.find((p) => p.id === projectId) : projects[0];

  const handleAction = useCallback((action) => {
    setCmdOpen(false);
    if (action.type === 'nav') setPage(action.page);
    else if (action.type === 'theme') setTheme((t) => t === 'dark' ? 'light' : 'dark');
    else if (action.type === 'picker') setPickerOpen(true);
    else if (action.type === 'chat') setPage('chat');
    else if (action.type === 'file') setPage('explorer');
    else if (action.type === 'reindex') {/* noop */}
  }, []);

  const onToggleTheme = () => setTheme((t) => t === 'dark' ? 'light' : 'dark');

  const cmdFiles = [
    { basename: 'LoginForm.tsx', path: 'src/components/auth/LoginForm.tsx', ext: 'tsx' },
    { basename: 'useSignIn.ts', path: 'src/hooks/useSignIn.ts', ext: 'ts' },
    { basename: 'middleware.ts', path: 'src/middleware.ts', ext: 'ts' },
    { basename: 'LiveMetricChart.tsx', path: 'src/components/dashboard/LiveMetricChart.tsx', ext: 'tsx' },
  ];

  if (page === 'landing') {
    return (
      <>
        <div data-screen-label="00 Landing">
          <PageLanding
            projects={projects}
            theme={theme}
            onToggleTheme={onToggleTheme}
            onOpenProject={(id) => { setProjectId(id); setPage('dashboard'); }}
            onAddProject={() => setPickerOpen(true)}
            isFirstTime={true}
          />
        </div>
        <ProjectPickerDialog
          open={pickerOpen}
          projects={projects}
          currentId={projectId}
          onClose={() => setPickerOpen(false)}
          onPick={(id) => { setProjectId(id); setPickerOpen(false); setPage('dashboard'); }}
        />
        <CommandPalette
          open={cmdOpen}
          onClose={() => setCmdOpen(false)}
          onAction={handleAction}
          project={project}
          chats={window.__MOCK.CHATS}
          files={cmdFiles}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />
        <TweaksControl accent={tweaks.accent} setTweak={setTweak} />
      </>
    );
  }

  const screenLabel = {
    dashboard: '01 Dashboard',
    search: '02 Search',
    chat: '03 Chat',
    explorer: '04 Explorer',
    settings: '05 Settings',
  }[page];

  return (
    <div className="app" data-screen-label={screenLabel}>
      <Sidebar
        project={project}
        currentPage={page}
        onNavigate={setPage}
        onOpenPicker={() => setPickerOpen(true)}
        onOpenCmd={() => setCmdOpen(true)}
      />
      <div className="main">
        <Topbar
          project={project}
          currentPage={page}
          onOpenCmd={() => setCmdOpen(true)}
          theme={theme}
          onToggleTheme={onToggleTheme}
          rightExtra={
            <button className="btn btn-ghost btn-sm" onClick={() => setPage('landing')}>
              <I.ChevronLeft size={13}/> All projects
            </button>
          }
        />
        {page === 'dashboard' && <PageDashboard project={project} commits={window.__MOCK.COMMITS} onNavigate={setPage}/>}
        {page === 'search' && <PageSearch project={project} onOpenFile={() => setPage('explorer')}/>}
        {page === 'chat' && <PageChat project={project} onOpenFile={() => setPage('explorer')}/>}
        {page === 'explorer' && <PageExplorer project={project}/>}
        {page === 'settings' && <PageSettings project={project}/>}
      </div>

      <ProjectPickerDialog
        open={pickerOpen}
        projects={projects}
        currentId={projectId || project.id}
        onClose={() => setPickerOpen(false)}
        onPick={(id) => { setProjectId(id); setPickerOpen(false); }}
      />
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onAction={handleAction}
        project={project}
        chats={window.__MOCK.CHATS}
        files={cmdFiles}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />
      <TweaksControl accent={tweaks.accent} setTweak={setTweak} />
    </div>
  );
}

// Map accent name <-> hex so TweakColor (which uses hex values) can roundtrip.
const ACCENT_HEX = { blue: '#3b82f6', green: '#22c55e', orange: '#f97316', violet: '#a855f7', mono: '#e5e5e5' };
const HEX_TO_ACCENT = Object.fromEntries(Object.entries(ACCENT_HEX).map(([k, v]) => [v, k]));

function TweaksControl({ accent, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Accent color">
        <TweakColor
          label="Accent"
          value={ACCENT_HEX[accent] || ACCENT_HEX.blue}
          onChange={(hex) => setTweak('accent', HEX_TO_ACCENT[hex] || 'blue')}
          options={Object.values(ACCENT_HEX)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
