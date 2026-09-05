'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSidebarOpen,
  setCreateProjectModalOpen,
  setCreateTaskModalOpen,
  setShortcutsHelpOpen,
} from '@/store/slices/uiSlice';
import { WorkspaceSwitcher } from '@/components/workspace/WorkspaceSwitcher';
import {
  LayoutDashboard,
  CheckSquare,
  Plus,
  Folder,
  Archive,
  ChevronDown,
  ChevronRight,
  Settings,
  Keyboard,
  X,
} from 'lucide-react';

export function Sidebar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();

  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const sidebarCollapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);
  const projects = useAppSelector((s) =>
    Object.values(s.project.projects).filter((p) => p.workspaceId === activeWorkspaceId)
  );

  const [archivedOpen, setArchivedOpen] = useState(false);

  const activeProjects = projects.filter((p) => !p.isArchived);
  const archivedProjects = projects.filter((p) => p.isArchived);

  const isLinkActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-40 flex flex-col h-screen border-r border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-[#0b101d] transition-all duration-200 shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${sidebarCollapsed ? 'md:w-18' : 'w-64'}`}
      >
        {/* Workspace Switcher Header */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          {!sidebarCollapsed ? (
            <div className="flex-1 min-w-0">
              <WorkspaceSwitcher />
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <span className="text-2xl">🚀</span>
            </div>
          )}

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => dispatch(setSidebarOpen(false))}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-1">
            <Link
              href="/app/dashboard"
              onClick={() => dispatch(setSidebarOpen(false))}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isLinkActive('/app/dashboard')
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="Dashboard"
            >
              <LayoutDashboard className="w-4 h-4 shrink-0 text-indigo-500" />
              {!sidebarCollapsed && <span>Dashboard</span>}
            </Link>

            <Link
              href={`/app/workspaces/${activeWorkspaceId}`}
              onClick={() => dispatch(setSidebarOpen(false))}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isLinkActive(`/app/workspaces/${activeWorkspaceId}`)
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="All Projects & Overview"
            >
              <CheckSquare className="w-4 h-4 shrink-0 text-emerald-500" />
              {!sidebarCollapsed && <span>Projects Overview</span>}
            </Link>
          </nav>

          {/* Projects List Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 py-1">
              {!sidebarCollapsed && (
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Projects ({activeProjects.length})
                </span>
              )}
              <button
                type="button"
                onClick={() => dispatch(setCreateProjectModalOpen(true))}
                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="New Project"
                aria-label="Create project"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5 mt-1">
              {activeProjects.map((proj) => {
                const projectUrl = `/app/workspaces/${activeWorkspaceId}/projects/${proj.id}`;
                const isActive = pathname.startsWith(projectUrl);
                return (
                  <Link
                    key={proj.id}
                    href={projectUrl}
                    onClick={() => dispatch(setSidebarOpen(false))}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors group ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                    title={proj.name}
                  >
                    <span className="text-sm shrink-0">{proj.icon}</span>
                    {!sidebarCollapsed && (
                      <span className="truncate flex-1">{proj.name}</span>
                    )}
                    {!sidebarCollapsed && (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: proj.color }}
                      />
                    )}
                  </Link>
                );
              })}

              {activeProjects.length === 0 && !sidebarCollapsed && (
                <p className="px-3 py-2 text-[11px] text-slate-400 italic">
                  No active projects.
                </p>
              )}
            </div>

            {/* Archived Projects Accordion */}
            {archivedProjects.length > 0 && !sidebarCollapsed && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setArchivedOpen(!archivedOpen)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5">
                    <Archive className="w-3 h-3" />
                    <span>Archived ({archivedProjects.length})</span>
                  </div>
                  {archivedOpen ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </button>

                {archivedOpen && (
                  <div className="space-y-0.5 pl-2 mt-1">
                    {archivedProjects.map((proj) => {
                      const projectUrl = `/app/workspaces/${activeWorkspaceId}/projects/${proj.id}`;
                      return (
                        <Link
                          key={proj.id}
                          href={projectUrl}
                          onClick={() => dispatch(setSidebarOpen(false))}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 line-through opacity-75"
                        >
                          <span>{proj.icon}</span>
                          <span className="truncate">{proj.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Actions Area */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          {/* Quick Create Task */}
          <button
            type="button"
            onClick={() => dispatch(setCreateTaskModalOpen(true))}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Create Task (C)"
          >
            <Plus className="w-4 h-4" />
            {!sidebarCollapsed && <span>New Task</span>}
            {!sidebarCollapsed && (
              <kbd className="hidden sm:inline text-[9px] bg-indigo-700/60 px-1 py-0.5 rounded font-mono">
                C
              </kbd>
            )}
          </button>

          {/* Quick links */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
            <Link
              href={`/app/workspaces/${activeWorkspaceId}/settings`}
              className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1.5"
              title="Workspace Settings"
            >
              <Settings className="w-3.5 h-3.5" />
              {!sidebarCollapsed && <span>Settings</span>}
            </Link>

            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={() => dispatch(setShortcutsHelpOpen(true))}
                className="hover:text-slate-700 dark:hover:text-slate-200 flex items-center gap-1"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="w-3.5 h-3.5" />
                <span>Shortcuts</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
