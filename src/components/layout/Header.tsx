'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector, useHistory } from '@/store/hooks';
import {
  toggleSidebarOpen,
  toggleSidebarCollapsed,
  setCommandPaletteOpen,
  setGlobalSearchOpen,
  toggleTheme,
} from '@/store/slices/uiSlice';
import { setSyncStatus } from '@/store/slices/syncSlice';
import { NotificationPopover } from '@/components/notifications/NotificationPopover';
import { UserMenu } from '@/components/layout/UserMenu';
import { useToast } from '@/components/ui/Toast';
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  Command,
  Sun,
  Moon,
  RotateCcw,
  RotateCw,
  RefreshCw,
  Wifi,
  WifiOff,
  ChevronRight,
} from 'lucide-react';

export function Header() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { undo, redo, canUndo, canRedo } = useHistory();

  const theme = useAppSelector((s) => s.ui.theme);
  const sidebarCollapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const isOnline = useAppSelector((s) => s.sync.isOnline);
  const syncStatus = useAppSelector((s) => s.sync.syncStatus);
  const offlineQueue = useAppSelector((s) => s.sync.offlineQueue);
  const activeWorkspace = useAppSelector(
    (s) => s.workspace.workspaces[s.workspace.activeWorkspaceId]
  );
  const projects = useAppSelector((s) => s.project.projects);

  // Derive active project from pathname
  const pathParts = pathname.split('/');
  const projectIdx = pathParts.indexOf('projects');
  const activeProjectId = projectIdx !== -1 ? pathParts[projectIdx + 1] : null;
  const activeProject = activeProjectId ? projects[activeProjectId] : null;

  const handleManualSync = () => {
    dispatch(setSyncStatus('syncing'));
    setTimeout(() => {
      dispatch(setSyncStatus('synced'));
      toast.success('Sync Complete', 'All offline changes reconciled.');
    }, 500);
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-md px-4 sm:px-6 transition-colors">
      {/* Left section: Drawer Toggle + Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebarOpen())}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Open mobile menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Sidebar Collapse Toggle */}
        <button
          type="button"
          onClick={() => dispatch(toggleSidebarCollapsed())}
          className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <PanelLeft className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
          {activeWorkspace && (
            <Link
              href={`/app/workspaces/${activeWorkspace.id}`}
              className="flex items-center gap-1 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
            >
              <span>{activeWorkspace.icon}</span>
              <span className="truncate">{activeWorkspace.name}</span>
            </Link>
          )}

          {activeProject && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <Link
                href={`/app/workspaces/${activeWorkspace?.id}/projects/${activeProject.id}`}
                className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
              >
                <span>{activeProject.icon}</span>
                <span className="truncate">{activeProject.name}</span>
              </Link>
            </>
          )}

          {pathname.endsWith('/settings') && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200 font-medium">Settings</span>
            </>
          )}
        </nav>
      </div>

      {/* Right section: Search, Command Palette, Offline, Undo/Redo, Notifications, Theme, User */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Offline & Sync Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5">
          {!isOnline ? (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-[11px] font-medium">
              <WifiOff className="w-3 h-3 text-amber-500 animate-pulse" />
              <span>Offline ({offlineQueue.length} queued)</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleManualSync}
              disabled={syncStatus === 'syncing'}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
              title="Manual Sync"
            >
              <RefreshCw
                className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin text-indigo-500' : ''}`}
              />
              <span className="hidden xl:inline">
                {syncStatus === 'syncing' ? 'Syncing...' : 'Synced'}
              </span>
            </button>
          )}
        </div>

        {/* Global Search Button */}
        <button
          type="button"
          onClick={() => dispatch(setGlobalSearchOpen(true))}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Search</span>
          <kbd className="hidden md:inline text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
            /
          </kbd>
        </button>

        {/* Command Palette Button */}
        <button
          type="button"
          onClick={() => dispatch(setCommandPaletteOpen(true))}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-xs cursor-pointer"
          title="Command Palette (Cmd+K)"
        >
          <Command className="w-3.5 h-3.5" />
          <kbd className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
            ⌘K
          </kbd>
        </button>

        {/* Undo / Redo buttons */}
        <div className="hidden sm:flex items-center border-l border-slate-200 dark:border-slate-800 pl-1.5 ml-1 gap-0.5">
          <button
            type="button"
            onClick={() => {
              if (canUndo) {
                undo();
                toast.info('Undone', 'Reverted previous task action.');
              }
            }}
            disabled={!canUndo}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              canUndo
                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
            }`}
            title="Undo (Cmd+Z)"
            aria-label="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (canRedo) {
                redo();
                toast.info('Redone', 'Restored task action.');
              }
            }}
            disabled={!canRedo}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              canRedo
                ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
            }`}
            title="Redo (Cmd+Shift+Z)"
            aria-label="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Notification Popover Bell */}
        <NotificationPopover />

        {/* Dark / Light Theme Toggle */}
        <button
          type="button"
          onClick={() => dispatch(toggleTheme())}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle color theme"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Profile Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
