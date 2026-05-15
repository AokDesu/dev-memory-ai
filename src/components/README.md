# Components Documentation

This directory contains all React components for the Developer Memory AI frontend.

## Directory Structure

```
components/
├── ui/              # Reusable UI components
├── layout/          # Layout components (Sidebar, Topbar)
└── theme-provider.tsx  # Theme context provider
```

## UI Components

### Icons (`ui/icons.tsx`)

Re-exports Lucide icons and provides custom icon components.

**Usage:**
```tsx
import * as Icons from '@/components/ui/icons';

<Icons.Search size={16} />
<Icons.FileIcon ext="ts" size={14} />
<Icons.ChevronUpDown size={12} />
```

**File Type Colors:**
- Automatically maps file extensions to colors
- Used in FileIcon component

### States (`ui/states.tsx`)

Loading, error, and empty state components.

**Components:**
- `LoadingSpinner` - Animated spinner
- `LoadingPage` - Full page loading state
- `LoadingSkeleton` - Skeleton loader
- `ErrorState` - Error display with retry
- `ErrorBanner` - Inline error message
- `EmptyState` - Empty state with action
- `InfoBanner` - Info message
- `SuccessBanner` - Success message

**Usage:**
```tsx
import { LoadingPage, ErrorState, EmptyState } from '@/components/ui/states';

// Loading
<LoadingPage message="Loading..." />

// Error
<ErrorState
  title="Failed to load"
  message="Could not fetch data"
  onRetry={() => refetch()}
/>

// Empty
<EmptyState
  icon={<Icons.Search size={32} />}
  title="No results"
  description="Try a different search"
  action={{ label: "Clear", onClick: handleClear }}
/>
```

### Command Palette (`ui/command-palette.tsx`)

Keyboard-driven command palette (⌘K).

**Features:**
- Fuzzy search
- Keyboard navigation (↑↓, Enter, Esc)
- Multiple command groups
- Recent chats and files
- Theme toggle
- Navigation shortcuts

**Usage:**
```tsx
import { CommandPalette } from '@/components/ui/command-palette';

<CommandPalette
  open={isOpen}
  onClose={() => setIsOpen(false)}
  project={currentProject}
  chats={recentChats}
  files={fileList}
  onAction={(action) => handleAction(action)}
/>
```

### Project Picker (`ui/project-picker.tsx`)

Dialog for switching between projects.

**Features:**
- Project list with status badges
- Current project indicator
- Add project button
- Indexing status display

**Usage:**
```tsx
import { ProjectPicker } from '@/components/ui/project-picker';

<ProjectPicker
  open={isOpen}
  onClose={() => setIsOpen(false)}
  projects={allProjects}
  currentId={currentProject.id}
  onPick={(id) => switchProject(id)}
/>
```

## Layout Components

### Sidebar (`layout/sidebar.tsx`)

Main navigation sidebar.

**Features:**
- Navigation with active states
- Project picker trigger
- Command palette trigger (⌘K)
- User profile footer
- Keyboard shortcuts display

**Props:**
```tsx
interface SidebarProps {
  project: Project;
  onOpenPicker: () => void;
  onOpenCmd: () => void;
}
```

### Topbar (`layout/topbar.tsx`)

Top navigation bar with breadcrumbs.

**Features:**
- Breadcrumb navigation
- Command palette trigger
- Theme toggle button
- Extra content slot

**Props:**
```tsx
interface TopbarProps {
  project: Project;
  currentPage: string;
  onOpenCmd: () => void;
  rightExtra?: React.ReactNode;
}
```

## Theme Provider

Wraps the app to provide theme context.

**Usage:**
```tsx
import { ThemeProvider } from '@/components/theme-provider';

<ThemeProvider>
  {children}
</ThemeProvider>
```

**Theme Hook:**
```tsx
import { useTheme } from 'next-themes';

const { theme, setTheme } = useTheme();
setTheme('dark'); // or 'light'
```

## Styling Guidelines

### Tailwind Classes

Use utility classes from our custom Tailwind config:

**Colors:**
- `bg-bg` - Background
- `bg-bg-elevated` - Elevated background
- `bg-bg-card` - Card background
- `bg-bg-hover` - Hover state
- `text-fg` - Foreground text
- `text-fg-muted` - Muted text
- `text-fg-dim` - Dim text
- `border-border` - Border color
- `bg-accent` - Accent color

**Components:**
- `btn btn-primary` - Primary button
- `btn btn-secondary` - Secondary button
- `btn btn-ghost` - Ghost button
- `card` - Card container
- `badge badge-accent` - Badge
- `icon-btn` - Icon button
- `kbd` - Keyboard shortcut

### Responsive Design

All components use mobile-first responsive design:

```tsx
// Mobile first
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Breakpoints:
// sm: 640px
// md: 768px
// lg: 1024px
// xl: 1280px
```

## Best Practices

1. **Always use TypeScript** - Full type safety
2. **Use 'use client'** - For client components
3. **Import from @/** - Use path aliases
4. **Responsive by default** - Mobile-first approach
5. **Accessible** - ARIA labels, keyboard navigation
6. **Dark mode ready** - Use CSS variables
7. **Loading states** - Show feedback for async operations
8. **Error handling** - Graceful error displays

## Examples

### Creating a New Page

```tsx
'use client';

import { useState } from 'react';
import * as Icons from '@/components/ui/icons';
import { LoadingPage, EmptyState } from '@/components/ui/states';

export default function MyPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  if (loading) {
    return <LoadingPage message="Loading..." />;
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Icons.Search size={32} />}
        title="No data"
        description="Get started by adding some data"
      />
    );
  }

  return (
    <div className="p-6">
      {/* Your content */}
    </div>
  );
}
```

### Using Keyboard Shortcuts

```tsx
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';

function MyComponent() {
  useKeyboardShortcut(
    { key: 'k', meta: true },
    () => openCommandPalette()
  );

  useKeyboardShortcut(
    { key: '/', preventDefault: true },
    () => focusSearch()
  );
}
```

## Testing

Components should be tested for:
- Rendering with different props
- User interactions (clicks, keyboard)
- Loading and error states
- Responsive behavior
- Accessibility (ARIA, keyboard nav)

---

For more information, see the main project README.