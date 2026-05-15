'use client';

import { useState } from 'react';
import { useParams, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { CommandPalette } from '@/components/ui/command-palette';
import { ProjectPicker } from '@/components/ui/project-picker';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { mockCurrentProject, mockProjects, mockChatConversations, mockFileTree } from '@/lib/mock-data';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Determine current page from pathname
  const getCurrentPage = () => {
    if (pathname?.includes('/search')) return 'search';
    if (pathname?.includes('/chat')) return 'chat';
    if (pathname?.includes('/explorer')) return 'explorer';
    if (pathname?.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  // Keyboard shortcuts
  useKeyboardShortcut({ key: 'k', meta: true }, () => setCmdOpen(true));
  useKeyboardShortcut({ key: '/' }, () => setCmdOpen(true));

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <Sidebar
        project={mockCurrentProject}
        onOpenPicker={() => setPickerOpen(true)}
        onOpenCmd={() => setCmdOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          project={mockCurrentProject}
          currentPage={getCurrentPage()}
          onOpenCmd={() => setCmdOpen(true)}
        />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        project={mockCurrentProject}
        chats={mockChatConversations}
        files={mockFileTree}
      />

      {/* Project Picker */}
      <ProjectPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        projects={mockProjects}
        currentId={mockCurrentProject.id}
        onPick={(id) => {
          console.log('Switch to project:', id);
          // TODO: Navigate to new project
        }}
      />
    </div>
  );
}

// Made with Bob
