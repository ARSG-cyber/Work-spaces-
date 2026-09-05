import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface QueuedOfflineAction {
  id: string;
  actionName: string;
  payload: any;
  timestamp: string;
}

export interface SyncState {
  isOnline: boolean;
  offlineQueue: QueuedOfflineAction[];
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  networkFailureRate: number; // 0 = 0%, 0.1 = 10%, 0.5 = 50%
  simulatedLiveEnabled: boolean;
  errorMessage: string | null;
}

const initialState: SyncState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  offlineQueue: [],
  syncStatus: 'idle',
  lastSyncedAt: new Date().toISOString(),
  networkFailureRate: 0,
  simulatedLiveEnabled: true,
  errorMessage: null,
};

export const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
    },
    queueOfflineAction: (
      state,
      action: PayloadAction<{ actionName: string; payload: any }>
    ) => {
      state.offlineQueue.push({
        id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        actionName: action.payload.actionName,
        payload: action.payload.payload,
        timestamp: new Date().toISOString(),
      });
    },
    clearOfflineQueue: (state) => {
      state.offlineQueue = [];
    },
    setSyncStatus: (
      state,
      action: PayloadAction<'idle' | 'syncing' | 'synced' | 'error'>
    ) => {
      state.syncStatus = action.payload;
      if (action.payload === 'synced') {
        state.lastSyncedAt = new Date().toISOString();
        state.errorMessage = null;
      }
    },
    setSyncError: (state, action: PayloadAction<string>) => {
      state.syncStatus = 'error';
      state.errorMessage = action.payload;
    },
    setNetworkFailureRate: (state, action: PayloadAction<number>) => {
      state.networkFailureRate = action.payload;
    },
    setSimulatedLiveEnabled: (state, action: PayloadAction<boolean>) => {
      state.simulatedLiveEnabled = action.payload;
    },
  },
});

export const {
  setOnlineStatus,
  queueOfflineAction,
  clearOfflineQueue,
  setSyncStatus,
  setSyncError,
  setNetworkFailureRate,
  setSimulatedLiveEnabled,
} = syncSlice.actions;

export default syncSlice.reducer;
