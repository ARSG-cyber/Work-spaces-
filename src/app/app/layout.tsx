'use client';

import React from 'react';
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
