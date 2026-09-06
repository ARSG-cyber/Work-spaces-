'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { useAppDispatch, useAppSelector, useHistory } from '@/store/hooks';
import { loadPersistedState } from '@/services/storageService';
import { setWorkspaces, setActiveWorkspaceId } from '@/store/slices/workspaceSlice';
import { setProjects } from '@/store/slices/projectSlice';
import { setColumns } from '@/store/slices/columnSlice';
import { setTasks } from '@/store/slices/taskSlice';
import { setComments } from '@/store/slices/commentSlice';
import { setActivities } from '@/store/slices/activitySlice';
import { setNotifications } from '@/store/slices/notificationSlice';
import { setFilterPresets } from '@/store/slices/filterSlice';
import {
  setTheme,
  setAllProjectViews,
  setCommandPaletteOpen,
  setGlobalSearchOpen,
  setCreateTaskModalOpen,
  setProjectView,
  setActiveTaskDetailId,
  hideAccessDenied,
  hideConfirmDialog,
  setSidebarOpen,
} from '@/store/slices/uiSlice';
import { setOnlineStatus } from '@/store/slices/syncSlice';
import { loginSuccess, setMockUsers } from '@/store/slices/authSlice';
import { runLiveSimulationTick } from '@/services/simulatedLiveService';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.ui.theme);
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);
  const currentProjectId = useAppSelector((s) => {
    const projects = Object.values(s.project.projects).filter(
      (p) => p.workspaceId === s.workspace.activeWorkspaceId && !p.isArchived
    );
    return projects[0]?.id;
  });
  const [rehydrated, setRehydrated] = useState(false);
  const { undo, redo, canUndo, canRedo } = useHistory();
  const toast = useToast();

  // 1. Rehydrate state from localStorage on boot
  useEffect(() => {
    try {
      const persisted = loadPersistedState();
      dispatch(setMockUsers(persisted.users));
      const currentUser =
        persisted.users.find((u) => u.id === persisted.currentUserId) || persisted.users[0];
      if (currentUser) {
        dispatch(loginSuccess(currentUser));
      }
      dispatch(setWorkspaces(persisted.workspaces));
      dispatch(setActiveWorkspaceId(persisted.activeWorkspaceId));
      dispatch(setProjects(persisted.projects));
      dispatch(setColumns(persisted.columns));
      dispatch(setTasks(persisted.tasks));
      dispatch(setComments(persisted.comments));
      dispatch(setActivities(persisted.activities));
      dispatch(setNotifications(persisted.notifications));
      dispatch(setFilterPresets(persisted.filterPresets));
      dispatch(setAllProjectViews(persisted.projectViews));
      dispatch(setTheme(persisted.theme));
    } catch (e) {
      console.error('Failed to rehydrate persisted state:', e);
    } finally {
      setRehydrated(true);
    }
  }, [dispatch]);

  // 2. Sync theme class on <html>
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        root.style.colorScheme = 'light';
      }
    }
  }, [theme]);

  // 3. Online / Offline listeners
  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
      toast.info('Connection Restored', 'You are back online. All changes synced.');
    };
    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
      toast.warning('Working Offline', 'Changes will be saved locally and queued.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch, toast]);

  // 4. Simulated Live Teammates activity loop
  useEffect(() => {
    const timer = setInterval(() => {
      runLiveSimulationTick(dispatch, store.getState);
    }, 35000);
    return () => clearInterval(timer);
  }, [dispatch]);

  // 5. Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
      const isContentEditable =
        document.activeElement?.getAttribute('contenteditable') === 'true';

      // Global shortcut: Escape closes modals / drawers
      if (e.key === 'Escape') {
        dispatch(setCommandPaletteOpen(false));
        dispatch(setGlobalSearchOpen(false));
        dispatch(setCreateTaskModalOpen(false));
        dispatch(setActiveTaskDetailId(null));
        dispatch(hideAccessDenied());
        dispatch(hideConfirmDialog());
        dispatch(setSidebarOpen(false));
        return;
      }

      // Cmd / Ctrl + K: Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        dispatch(setCommandPaletteOpen(true));
        return;
      }

      // Cmd / Ctrl + Z: Undo
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        if (!isInput && !isContentEditable) {
          e.preventDefault();
          if (canUndo) {
            undo();
            toast.info('Undone', 'Reverted previous task action.');
          }
          return;
        }
      }

      // Cmd / Ctrl + Shift + Z or Cmd / Ctrl + Y: Redo
      if (
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && e.shiftKey) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
      ) {
        if (!isInput && !isContentEditable) {
          e.preventDefault();
          if (canRedo) {
            redo();
            toast.info('Redone', 'Restored previous task action.');
          }
          return;
        }
      }

      // Non-input shortcuts
      if (!isInput && !isContentEditable) {
        if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          dispatch(setCreateTaskModalOpen(true));
        } else if (e.key === '/') {
          e.preventDefault();
          dispatch(setGlobalSearchOpen(true));
        } else if (e.key === '1' && currentProjectId) {
          e.preventDefault();
          dispatch(setProjectView({ projectId: currentProjectId, view: 'kanban' }));
          toast.info('View Switched', 'Kanban Board');
        } else if (e.key === '2' && currentProjectId) {
          e.preventDefault();
          dispatch(setProjectView({ projectId: currentProjectId, view: 'list' }));
          toast.info('View Switched', 'List View');
        } else if (e.key === '3' && currentProjectId) {
          e.preventDefault();
          dispatch(setProjectView({ projectId: currentProjectId, view: 'calendar' }));
          toast.info('View Switched', 'Calendar View');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dispatch, undo, redo, canUndo, canRedo, toast, currentProjectId]);

  if (!rehydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-wide">Loading workspace session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ToastProvider>
        <AppInitializer>{children}</AppInitializer>
      </ToastProvider>
    </Provider>
  );
}
