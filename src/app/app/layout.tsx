'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPaletteModal } from '@/components/command-palette/CommandPaletteModal';
import { GlobalSearchDialog } from '@/components/search/GlobalSearchDialog';
import { ShortcutsHelpModal } from '@/components/dialogs/ShortcutsHelpModal';
import { AccessDeniedDialog } from '@/components/dialogs/AccessDeniedDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { CreateProjectModal } from '@/components/project/CreateProjectModal';
import { CreateWorkspaceModal } from '@/components/workspace/CreateWorkspaceModal';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { CreateTaskModal } from '@/components/task/CreateTaskModal';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const currentUser = useAppSelector((s) => s.auth.currentUser);

  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      router.replace('/login');
    }
  }, [isAuthenticated, currentUser, router]);

  if (!isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090d16]">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto focus:outline-none">{children}</main>
      </div>

      {/* Global Modals & Overlays */}
      <CommandPaletteModal />
      <GlobalSearchDialog />
      <ShortcutsHelpModal />
      <AccessDeniedDialog />
      <ConfirmDialog />
      <CreateProjectModal />
      <CreateWorkspaceModal />
      <TaskDetailModal />
      <CreateTaskModal />
    </div>
  );
}
