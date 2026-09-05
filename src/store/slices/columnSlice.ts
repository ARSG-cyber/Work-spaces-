import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { KanbanColumn } from '@/types/task';
import { INITIAL_COLUMNS } from '@/services/mockData';

export interface ColumnState {
  columns: Record<string, KanbanColumn[]>;
}

const initialState: ColumnState = {
  columns: INITIAL_COLUMNS,
};

export const columnSlice = createSlice({
  name: 'column',
  initialState,
  reducers: {
    setColumns: (state, action: PayloadAction<Record<string, KanbanColumn[]>>) => {
      state.columns = action.payload;
    },
    addColumn: (
      state,
      action: PayloadAction<{ projectId: string; column: KanbanColumn }>
    ) => {
      const { projectId, column } = action.payload;
      if (!state.columns[projectId]) {
        state.columns[projectId] = [];
      }
      state.columns[projectId].push(column);
    },
    renameColumn: (
      state,
      action: PayloadAction<{ projectId: string; columnId: string; name: string }>
    ) => {
      const { projectId, columnId, name } = action.payload;
      const cols = state.columns[projectId];
      if (cols) {
        const col = cols.find((c) => c.id === columnId);
        if (col) {
          col.name = name;
        }
      }
    },
    deleteColumn: (
      state,
      action: PayloadAction<{ projectId: string; columnId: string }>
    ) => {
      const { projectId, columnId } = action.payload;
      if (state.columns[projectId]) {
        state.columns[projectId] = state.columns[projectId].filter((c) => c.id !== columnId);
      }
    },
    reorderColumns: (
      state,
      action: PayloadAction<{ projectId: string; columns: KanbanColumn[] }>
    ) => {
      const { projectId, columns } = action.payload;
      state.columns[projectId] = columns.map((col, idx) => ({ ...col, order: idx }));
    },
  },
});

export const {
  setColumns,
  addColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
} = columnSlice.actions;

export default columnSlice.reducer;
