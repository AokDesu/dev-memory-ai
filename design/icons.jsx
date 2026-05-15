// Lucide-style icons as inline SVGs
const Icon = ({ d, size = 16, stroke = 1.6, fill = 'none', viewBox = '0 0 24 24', children, ...rest }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor"
       strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d ? <path d={d} /> : children}
  </svg>
);

const I = {
  Search:    (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3-3"/></Icon>,
  Chat:      (p) => <Icon {...p}><path d="M21 15a4 4 0 0 1-4 4H8l-5 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8z"/></Icon>,
  Folder:    (p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/></Icon>,
  FolderOpen:(p) => <Icon {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v1H3V7z"/><path d="M3 9h18l-2 8a2 2 0 0 1-2 1.5H5A2 2 0 0 1 3 17V9z"/></Icon>,
  File:      (p) => <Icon {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6z"/><path d="M14 3v6h6"/></Icon>,
  Layout:    (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></Icon>,
  Settings:  (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  Home:      (p) => <Icon {...p}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2h-5v-7H10v7H5a2 2 0 0 1-2-2z"/></Icon>,
  Plus:      (p) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  ArrowRight:(p) => <Icon {...p}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>,
  ChevronRight:(p) => <Icon {...p}><path d="m9 6 6 6-6 6"/></Icon>,
  ChevronDown:(p) => <Icon {...p}><path d="m6 9 6 6 6-6"/></Icon>,
  ChevronLeft:(p) => <Icon {...p}><path d="m15 6-6 6 6 6"/></Icon>,
  X:         (p) => <Icon {...p}><path d="M18 6 6 18M6 6l12 12"/></Icon>,
  Check:     (p) => <Icon {...p}><path d="m20 6-11 11-5-5"/></Icon>,
  Send:      (p) => <Icon {...p}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></Icon>,
  GitBranch: (p) => <Icon {...p}><circle cx="6" cy="3" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M6 5v8a4 4 0 0 0 4 4h2M18 8a4 4 0 0 1-4 4h-2"/></Icon>,
  GitCommit: (p) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M3 12h6M15 12h6"/></Icon>,
  Refresh:   (p) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>,
  Sun:       (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></Icon>,
  Moon:      (p) => <Icon {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></Icon>,
  Sparkles:  (p) => <Icon {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></Icon>,
  Code:      (p) => <Icon {...p}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></Icon>,
  Filter:    (p) => <Icon {...p}><path d="M22 3H2l8 9.5V19l4 2v-8.5z"/></Icon>,
  Copy:      (p) => <Icon {...p}><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></Icon>,
  Eye:       (p) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></Icon>,
  EyeOff:    (p) => <Icon {...p}><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A11 11 0 0 1 12 5c7 0 11 7 11 7a13 13 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13 13 0 0 0 1 12s4 7 11 7a9.7 9.7 0 0 0 5.39-1.61"/><path d="M2 2l20 20"/></Icon>,
  Key:       (p) => <Icon {...p}><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/></Icon>,
  Trash:     (p) => <Icon {...p}><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Icon>,
  Terminal:  (p) => <Icon {...p}><path d="m4 17 6-6-6-6M12 19h8"/></Icon>,
  Database:  (p) => <Icon {...p}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v6c0 1.7 4 3 9 3s9-1.3 9-3V5M3 11v6c0 1.7 4 3 9 3s9-1.3 9-3v-6"/></Icon>,
  Cpu:       (p) => <Icon {...p}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/></Icon>,
  ExternalLink:(p)=> <Icon {...p}><path d="M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></Icon>,
  Star:      (p) => <Icon {...p}><path d="m12 2 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z"/></Icon>,
  ChevronUpDown: (p) => <Icon {...p}><path d="m8 9 4-4 4 4M8 15l4 4 4-4"/></Icon>,
  PanelLeft: (p) => <Icon {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></Icon>,
};

// File-type icons (mini)
const FILE_COLORS = {
  tsx: '#3178c6', ts: '#3178c6', jsx: '#f1e05a', js: '#f1e05a',
  css: '#563d7c', scss: '#cf649a', json: '#5b8db5', md: '#7a7a7a',
  go: '#00ADD8', py: '#3572A5', rs: '#dea584', html: '#e34c26',
  svg: '#ff9a3c', ico: '#a1a1aa',
};
const FileIcon = ({ ext, size = 14 }) => {
  const color = FILE_COLORS[ext] || '#888';
  const label = (ext || '?').slice(0, 3).toUpperCase();
  // Use a tiny pill
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size + 2, height: size, borderRadius: 3,
      background: color + '22', color, fontSize: 8.5, fontWeight: 700, fontFamily: 'var(--font-mono)',
      letterSpacing: '-0.02em', lineHeight: 1, flexShrink: 0,
    }}>{label.slice(0, ext === 'tsx' || ext === 'jsx' ? 3 : 2)}</span>
  );
};

window.I = I;
window.FileIcon = FileIcon;
