import { configureStore, Middleware } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import columnReducer from './slices/columnSlice';
import commentReducer from './slices/commentSlice';
import activityReducer from './slices/activitySlice';
import notificationReducer from './slices/notificationSlice';
import filterReducer from './slices/filterSlice';
import uiReducer from './slices/uiSlice';
import historyReducer from './slices/historySlice';
import syncReducer from './slices/syncSlice';
import { savePersistedState, AppPersistedState } from '@/services/storageService';

let saveTimeout: NodeJS.Timeout | null = null;

// Middleware to automatically sync state to localStorage on state changes
const persistenceMiddleware: Middleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  if (typeof window !== 'undefined') {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    saveTimeout = setTimeout(() => {
      const state = storeAPI.getState();
      const persistedPayload: AppPersistedState = {
        version: 1,
        users: state.auth.mockUsers,
        currentUserId: state.auth.currentUser?.id || 'user-1',
        workspaces: state.workspace.workspaces,
        activeWorkspaceId: state.workspace.activeWorkspaceId,
        projects: state.project.projects,
        columns: state.column.columns,
        tasks: state.task.tasks,
        comments: state.comment.comments,
        activities: state.activity.activities,
        notifications: state.notification.notifications,
        filterPresets: state.filter.savedPresets,
        notificationPreferences: state.notification.preferences,
        projectViews: state.ui.projectViews,
        theme: state.ui.theme,
      };
      savePersistedState(persistedPayload);
    }, 250);
  }

  return result;
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    project: projectReducer,
    task: taskReducer,
    column: columnReducer,
    comment: commentReducer,
    activity: activityReducer,
    notification: notificationReducer,
    filter: filterReducer,
    ui: uiReducer,
    history: historyReducer,
    sync: syncReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(persistenceMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
