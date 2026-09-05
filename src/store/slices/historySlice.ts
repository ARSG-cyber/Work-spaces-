import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task } from '@/types/task';

export interface HistoryEntry {
  description: string;
  tasksSnapshot: Record<string, Task>;
  timestamp: string;
}

export interface HistoryState {
  past: HistoryEntry[];
  future: HistoryEntry[];
  lastActionMessage: string | null;
}

const initialState: HistoryState = {
  past: [],
  future: [],
  lastActionMessage: null,
};

export const historySlice = createSlice({
  name: 'history',
  initialState,
  reducers: {
    recordHistory: (
      state,
      action: PayloadAction<{ description: string; tasksSnapshot: Record<string, Task> }>
    ) => {
      // Limit history stack size to 30
      state.past.push({
        description: action.payload.description,
        tasksSnapshot: JSON.parse(JSON.stringify(action.payload.tasksSnapshot)),
        timestamp: new Date().toISOString(),
      });
      if (state.past.length > 30) {
        state.past.shift();
      }
      state.future = []; // Clear redo stack on new action
      state.lastActionMessage = action.payload.description;
    },
    popPast: (state) => {
      // Used internally by undo thunk/flow
      state.past.pop();
    },
    pushFuture: (
      state,
      action: PayloadAction<{ description: string; tasksSnapshot: Record<string, Task> }>
    ) => {
      state.future.push({
        description: action.payload.description,
        tasksSnapshot: JSON.parse(JSON.stringify(action.payload.tasksSnapshot)),
        timestamp: new Date().toISOString(),
      });
    },
    popFuture: (state) => {
      state.future.pop();
    },
    clearHistory: (state) => {
      state.past = [];
      state.future = [];
      state.lastActionMessage = null;
    },
  },
});

export const { recordHistory, popPast, pushFuture, popFuture, clearHistory } =
  historySlice.actions;

export default historySlice.reducer;
