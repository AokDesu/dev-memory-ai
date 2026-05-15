import {
  Home,
  Search,
  MessageSquare,
  Code,
  Settings,
  Folder,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Sun,
  Moon,
  Plus,
  X,
  Check,
  AlertCircle,
  Info,
  Loader2,
  FileText,
  File,
  FolderOpen,
  GitBranch,
  Clock,
  User,
  Mail,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Trash2,
  Edit,
  MoreVertical,
  Filter,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Zap,
  Terminal,
  Database,
  Package,
  Cpu,
  HardDrive,
  type LucideIcon,
} from 'lucide-react';

// Re-export all icons
export {
  Home,
  Search,
  MessageSquare as Chat,
  Code,
  Settings,
  Folder,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Sun,
  Moon,
  Plus,
  X,
  Check,
  AlertCircle,
  Info,
  Loader2,
  FileText,
  File,
  FolderOpen,
  GitBranch,
  Clock,
  User,
  Mail,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Trash2,
  Edit,
  MoreVertical,
  Filter,
  ArrowLeft,
  ArrowRight,
  RefreshCw as Refresh,
  Zap,
  Terminal,
  Database,
  Package,
  Cpu,
  HardDrive,
};

// File type colors
export const FILE_COLORS: Record<string, string> = {
  ts: '#3178c6',
  tsx: '#3178c6',
  js: '#f7df1e',
  jsx: '#f7df1e',
  json: '#5a5a5a',
  css: '#264de4',
  scss: '#cc6699',
  html: '#e34c26',
  md: '#083fa1',
  py: '#3776ab',
  java: '#007396',
  go: '#00add8',
  rs: '#ce422b',
  cpp: '#00599c',
  c: '#555555',
  rb: '#cc342d',
  php: '#777bb4',
  swift: '#fa7343',
  kt: '#7f52ff',
  sql: '#e38c00',
  sh: '#89e051',
  yml: '#cb171e',
  yaml: '#cb171e',
  xml: '#e34c26',
  svg: '#ffb13b',
  prisma: '#2d3748',
};

// File icon component
interface FileIconProps {
  ext: string;
  size?: number;
  className?: string;
}

export function FileIcon({ ext, size = 14, className = '' }: FileIconProps) {
  const color = FILE_COLORS[ext.toLowerCase()] || '#888';
  
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '2px',
        backgroundColor: color,
        fontSize: size * 0.6,
        fontWeight: 600,
        color: '#fff',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {ext.slice(0, 2).toUpperCase()}
    </div>
  );
}

// Chevron up/down toggle icon
interface ChevronUpDownProps {
  size?: number;
  className?: string;
}

export function ChevronUpDown({ size = 12, className = '' }: ChevronUpDownProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 5L6 2L9 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 7L6 10L9 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type { LucideIcon };

// Made with Bob
