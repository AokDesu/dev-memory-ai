'use client';

import { useState, useEffect } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { CommandPalette } from '@/components/ui/command-palette';
import { ProjectPicker } from '@/components/ui/project-picker';
import { useKeyboardShortcut } from '@/hooks/use-keyboard-shortcut';
import { apiClient } from '@/lib/api-client';
import { Project } from '@/types/api';
import { LoadingPage, EmptyState } from '@/components/ui/states';
import * as Icons from '@/components/ui/icons';

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [cmdOpen, setCmdOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, [projectId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projects = await apiClient.listProjects();
      setAllProjects(projects);
      
      const current = projects.find(p => p.id === projectId);
      if (current) {
        setCurrentProject(current);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return <LoadingPage message="Loading project..." />;
  }

  if (error || !currentProject) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-8">
        <EmptyState
          icon={<Icons.AlertCircle size={32} />}
          title="Failed to load project"
          description={error || 'Project not found'}
          action={{
            label: 'Retry',
            onClick: loadProjects,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* Sidebar */}
      <Sidebar
        project={currentProject}
        onOpenPicker={() => setPickerOpen(true)}
        onOpenCmd={() => setCmdOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          project={currentProject}
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
        project={currentProject}
        chats={[]}
        files={[]}
      />

      {/* Project Picker */}
      <ProjectPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        projects={allProjects}
        currentId={currentProject.id}
        onPick={(id) => {
          router.push(`/projects/${id}`);
        }}
      />
    </div>
  );
}

// Made with Bob
