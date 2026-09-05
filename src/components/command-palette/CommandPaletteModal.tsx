'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector, useHistory } from '@/store/hooks';
import {
  setCommandPaletteOpen,
  setCreateTaskModalOpen,
  setCreateProjectModalOpen,
  setCreateWorkspaceModalOpen,
  setGlobalSearchOpen,
  toggleTheme,
  setProjectView,
  setShortcutsHelpOpen,
} from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import { setSyncStatus } from '@/store/slices/syncSlice';
import { useToast } from '@/components/ui/Toast';
import {
  Search,
  LayoutDashboard,
  Kanban,
  TableProperties,
  Calendar,
  PlusCircle,
  FolderPlus,
  Building,
  SunMoon,
  RotateCcw,
  RotateCw,
  RefreshCw,
  LogOut,
  Keyboard,
  ArrowRight,
} from 'lucide-react';

export function CommandPaletteModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const { undo, redo, canUndo, canRedo } = useHistory();

  const isOpen = useAppSelector((s) => s.ui.commandPaletteOpen);
  const theme = useAppSelector((s) => s.ui.theme);
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);
  const projects = useAppSelector((s) =>
    Object.values(s.project.projects).filter(
      (p) => p.workspaceId === activeWorkspaceId && !p.isArchived
    )
  );
  const currentProjectId = projects[0]?.id;

  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actions = [
    {
      id: 'dash',
      title: 'Go to Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      shortcut: 'G D',
      perform: () => router.push('/app/dashboard'),
    },
    {
      id: 'create-task',
      title: 'Create New Task',
      category: 'Actions',
      icon: PlusCircle,
      shortcut: 'C',
      perform: () => dispatch(setCreateTaskModalOpen(true)),
    },
    {
      id: 'create-proj',
      title: 'Create New Project',
      category: 'Actions',
      icon: FolderPlus,
      shortcut: '',
      perform: () => dispatch(setCreateProjectModalOpen(true)),
    },
    {
      id: 'create-ws',
      title: 'Create New Workspace',
      category: 'Actions',
      icon: Building,
      shortcut: '',
      perform: () => dispatch(setCreateWorkspaceModalOpen(true)),
    },
    {
      id: 'search-all',
      title: 'Global Search',
      category: 'Actions',
      icon: Search,
      shortcut: '/',
      perform: () => dispatch(setGlobalSearchOpen(true)),
    },
    {
      id: 'view-kanban',
      title: 'Switch View: Kanban Board',
      category: 'View',
      icon: Kanban,
      shortcut: '1',
      perform: () => {
        if (currentProjectId) {
          dispatch(setProjectView({ projectId: currentProjectId, view: 'kanban' }));
          toast.info('Switched View', 'Kanban Board');
        }
      },
    },
    {
      id: 'view-list',
      title: 'Switch View: List / Table',
      category: 'View',
      icon: TableProperties,
      shortcut: '2',
      perform: () => {
        if (currentProjectId) {
          dispatch(setProjectView({ projectId: currentProjectId, view: 'list' }));
          toast.info('Switched View', 'List View');
        }
      },
    },
    {
      id: 'view-cal',
      title: 'Switch View: Calendar',
      category: 'View',
      icon: Calendar,
      shortcut: '3',
      perform: () => {
        if (currentProjectId) {
          dispatch(setProjectView({ projectId: currentProjectId, view: 'calendar' }));
          toast.info('Switched View', 'Calendar View');
        }
      },
    },
    {
      id: 'undo',
      title: 'Undo last action',
      category: 'History',
      icon: RotateCcw,
      shortcut: '⌘Z',
      perform: () => {
        if (canUndo) {
          undo();
          toast.info('Undone', 'Reverted previous task action.');
        } else {
          toast.info('Nothing to Undo');
        }
      },
    },
    {
      id: 'redo',
      title: 'Redo last reverted action',
      category: 'History',
      icon: RotateCw,
      shortcut: '⌘⇧Z',
      perform: () => {
        if (canRedo) {
          redo();
          toast.info('Redone', 'Restored task action.');
        } else {
          toast.info('Nothing to Redo');
        }
      },
    },
    {
      id: 'theme',
      title: `Toggle Theme (current: ${theme})`,
      category: 'Preferences',
      icon: SunMoon,
      shortcut: '',
      perform: () => dispatch(toggleTheme()),
    },
    {
      id: 'shortcuts',
      title: 'View Keyboard Shortcuts',
      category: 'Preferences',
      icon: Keyboard,
      shortcut: '?',
      perform: () => dispatch(setShortcutsHelpOpen(true)),
    },
    {
      id: 'sync',
      title: 'Trigger Cloud Sync',
      category: 'System',
      icon: RefreshCw,
      shortcut: '',
      perform: () => {
        dispatch(setSyncStatus('syncing'));
        setTimeout(() => {
          dispatch(setSyncStatus('synced'));
          toast.success('Sync Complete', 'All offline and local changes synced.');
        }, 600);
      },
    },
    {
      id: 'logout',
      title: 'Log out of session',
      category: 'Account',
      icon: LogOut,
      shortcut: '',
      perform: () => {
        dispatch(logout());
        router.push('/login');
      },
    },
  ];

  // Also add navigation items for each active project
  projects.forEach((proj) => {
    actions.push({
      id: `proj-${proj.id}`,
      title: `Open Project: ${proj.name}`,
      category: 'Projects',
      icon: ArrowRight,
      shortcut: '',
      perform: () =>
        router.push(`/app/workspaces/${proj.workspaceId}/projects/${proj.id}`),
    });
  });

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        dispatch(setCommandPaletteOpen(false));
        filtered[selectedIndex].perform();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => dispatch(setCommandPaletteOpen(false))}
      />

      <div className="relative w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 shadow-2xl transition-all duration-150 animate-in zoom-in-95 z-10 overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search actions..."
            className="flex-1 bg-transparent text-sm placeholder-slate-400 focus:outline-none text-slate-900 dark:text-slate-100"
          />
          <kbd className="text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              No matching commands found.
            </div>
          ) : (
            filtered.map((action, idx) => {
              const Icon = action.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={action.id}
                  onClick={() => {
                    dispatch(setCommandPaletteOpen(false));
                    action.perform();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50 text-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-200'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      }`}
                    />
                    <span className="font-medium">{action.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      {action.category}
                    </span>
                    {action.shortcut && (
                      <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        {action.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>Use ↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>Workspace Manager Command Engine</span>
        </div>
      </div>
    </div>
  );
}
