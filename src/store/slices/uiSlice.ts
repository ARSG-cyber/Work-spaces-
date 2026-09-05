import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UIState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean; // for mobile drawer
  sidebarCollapsed: boolean; // for desktop toggle
  commandPaletteOpen: boolean;
  globalSearchOpen: boolean;
  createTaskModalOpen: boolean;
  createProjectModalOpen: boolean;
  createWorkspaceModalOpen: boolean;
  importExportModalOpen: boolean;
  shortcutsHelpOpen: boolean;
  activeTaskDetailId: string | null;
  projectViews: Record<string, 'kanban' | 'list' | 'calendar'>;
  accessDeniedModal: {
    isOpen: boolean;
    requiredRole?: string;
    actionName?: string;
  };
  confirmDialog: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    actionType?: string;
    payload?: any;
  };
}

const initialState: UIState = {
  theme: 'dark',
  sidebarOpen: false,
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  globalSearchOpen: false,
  createTaskModalOpen: false,
  createProjectModalOpen: false,
  createWorkspaceModalOpen: false,
  importExportModalOpen: false,
  shortcutsHelpOpen: false,
  activeTaskDetailId: null,
  projectViews: {
    'proj-1': 'kanban',
    'proj-2': 'kanban',
    'proj-3': 'list',
    'proj-5': 'calendar',
  },
  accessDeniedModal: {
    isOpen: false,
  },
  confirmDialog: {
    isOpen: false,
    title: '',
    message: '',
  },
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarOpen: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.commandPaletteOpen = action.payload;
    },
    setGlobalSearchOpen: (state, action: PayloadAction<boolean>) => {
      state.globalSearchOpen = action.payload;
    },
    setCreateTaskModalOpen: (state, action: PayloadAction<boolean>) => {
      state.createTaskModalOpen = action.payload;
    },
    setCreateProjectModalOpen: (state, action: PayloadAction<boolean>) => {
      state.createProjectModalOpen = action.payload;
    },
    setCreateWorkspaceModalOpen: (state, action: PayloadAction<boolean>) => {
      state.createWorkspaceModalOpen = action.payload;
    },
    setImportExportModalOpen: (state, action: PayloadAction<boolean>) => {
      state.importExportModalOpen = action.payload;
    },
    setShortcutsHelpOpen: (state, action: PayloadAction<boolean>) => {
      state.shortcutsHelpOpen = action.payload;
    },
    setActiveTaskDetailId: (state, action: PayloadAction<string | null>) => {
      state.activeTaskDetailId = action.payload;
    },
    setProjectView: (
      state,
      action: PayloadAction<{ projectId: string; view: 'kanban' | 'list' | 'calendar' }>
    ) => {
      state.projectViews[action.payload.projectId] = action.payload.view;
    },
    setAllProjectViews: (
      state,
      action: PayloadAction<Record<string, 'kanban' | 'list' | 'calendar'>>
    ) => {
      state.projectViews = action.payload;
    },
    showAccessDenied: (
      state,
      action: PayloadAction<{ requiredRole?: string; actionName?: string }>
    ) => {
      state.accessDeniedModal = {
        isOpen: true,
        requiredRole: action.payload.requiredRole || 'Admin',
        actionName: action.payload.actionName || 'perform this action',
      };
    },
    hideAccessDenied: (state) => {
      state.accessDeniedModal.isOpen = false;
    },
    showConfirmDialog: (
      state,
      action: PayloadAction<{
        title: string;
        message: string;
        confirmLabel?: string;
        cancelLabel?: string;
        isDestructive?: boolean;
        actionType?: string;
        payload?: any;
      }>
    ) => {
      state.confirmDialog = {
        isOpen: true,
        ...action.payload,
      };
    },
    hideConfirmDialog: (state) => {
      state.confirmDialog.isOpen = false;
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebarOpen,
  setSidebarCollapsed,
  toggleSidebarCollapsed,
  setCommandPaletteOpen,
  setGlobalSearchOpen,
  setCreateTaskModalOpen,
  setCreateProjectModalOpen,
  setCreateWorkspaceModalOpen,
  setImportExportModalOpen,
  setShortcutsHelpOpen,
  setActiveTaskDetailId,
  setProjectView,
  setAllProjectViews,
  showAccessDenied,
  hideAccessDenied,
  showConfirmDialog,
  hideConfirmDialog,
} = uiSlice.actions;

export default uiSlice.reducer;
