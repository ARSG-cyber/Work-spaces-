import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState, FilterPreset } from '@/types/filter';
import { TaskPriority } from '@/types/task';

export interface FilterSliceState extends FilterState {
  savedPresets: FilterPreset[];
}

const defaultFilters: FilterState = {
  searchQuery: '',
  assigneeFilter: [],
  priorityFilter: [],
  statusFilter: [],
  labelFilter: [],
  dueDateRange: 'all',
  sortBy: 'createdAt',
  sortDirection: 'desc',
  groupBy: 'none',
};

const initialState: FilterSliceState = {
  ...defaultFilters,
  savedPresets: [
    {
      id: 'preset-1',
      workspaceId: 'ws-1',
      name: 'Urgent Tasks',
      filters: {
        ...defaultFilters,
        priorityFilter: ['urgent'],
        sortBy: 'priority',
        groupBy: 'status',
      },
      createdAt: new Date().toISOString(),
    },
  ],
};

export const filterSlice = createSlice({
  name: 'filter',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setAssigneeFilter: (state, action: PayloadAction<string[]>) => {
      state.assigneeFilter = action.payload;
    },
    toggleAssigneeFilter: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.assigneeFilter.includes(id)) {
        state.assigneeFilter = state.assigneeFilter.filter((item) => item !== id);
      } else {
        state.assigneeFilter.push(id);
      }
    },
    setPriorityFilter: (state, action: PayloadAction<TaskPriority[]>) => {
      state.priorityFilter = action.payload;
    },
    togglePriorityFilter: (state, action: PayloadAction<TaskPriority>) => {
      const p = action.payload;
      if (state.priorityFilter.includes(p)) {
        state.priorityFilter = state.priorityFilter.filter((item) => item !== p);
      } else {
        state.priorityFilter.push(p);
      }
    },
    setStatusFilter: (state, action: PayloadAction<string[]>) => {
      state.statusFilter = action.payload;
    },
    toggleStatusFilter: (state, action: PayloadAction<string>) => {
      const s = action.payload;
      if (state.statusFilter.includes(s)) {
        state.statusFilter = state.statusFilter.filter((item) => item !== s);
      } else {
        state.statusFilter.push(s);
      }
    },
    setLabelFilter: (state, action: PayloadAction<string[]>) => {
      state.labelFilter = action.payload;
    },
    toggleLabelFilter: (state, action: PayloadAction<string>) => {
      const l = action.payload;
      if (state.labelFilter.includes(l)) {
        state.labelFilter = state.labelFilter.filter((item) => item !== l);
      } else {
        state.labelFilter.push(l);
      }
    },
    setDueDateRange: (
      state,
      action: PayloadAction<'all' | 'overdue' | 'today' | 'week' | 'month'>
    ) => {
      state.dueDateRange = action.payload;
    },
    setSortBy: (
      state,
      action: PayloadAction<'dueDate' | 'priority' | 'createdAt' | 'title'>
    ) => {
      state.sortBy = action.payload;
    },
    setSortDirection: (state, action: PayloadAction<'asc' | 'desc'>) => {
      state.sortDirection = action.payload;
    },
    toggleSortDirection: (state) => {
      state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    },
    setGroupBy: (
      state,
      action: PayloadAction<'none' | 'status' | 'assignee' | 'priority' | 'label'>
    ) => {
      state.groupBy = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.assigneeFilter = [];
      state.priorityFilter = [];
      state.statusFilter = [];
      state.labelFilter = [];
      state.dueDateRange = 'all';
      state.sortBy = 'createdAt';
      state.sortDirection = 'desc';
      state.groupBy = 'none';
    },
    saveFilterPreset: (
      state,
      action: PayloadAction<{ name: string; workspaceId: string }>
    ) => {
      const newPreset: FilterPreset = {
        id: `preset-${Date.now()}`,
        workspaceId: action.payload.workspaceId,
        name: action.payload.name,
        filters: {
          searchQuery: state.searchQuery,
          assigneeFilter: [...state.assigneeFilter],
          priorityFilter: [...state.priorityFilter],
          statusFilter: [...state.statusFilter],
          labelFilter: [...state.labelFilter],
          dueDateRange: state.dueDateRange,
          sortBy: state.sortBy,
          sortDirection: state.sortDirection,
          groupBy: state.groupBy,
        },
        createdAt: new Date().toISOString(),
      };
      state.savedPresets.push(newPreset);
    },
    applyFilterPreset: (state, action: PayloadAction<FilterPreset>) => {
      const { filters } = action.payload;
      state.searchQuery = filters.searchQuery || '';
      state.assigneeFilter = filters.assigneeFilter || [];
      state.priorityFilter = filters.priorityFilter || [];
      state.statusFilter = filters.statusFilter || [];
      state.labelFilter = filters.labelFilter || [];
      state.dueDateRange = filters.dueDateRange || 'all';
      state.sortBy = filters.sortBy || 'createdAt';
      state.sortDirection = filters.sortDirection || 'desc';
      state.groupBy = filters.groupBy || 'none';
    },
    deleteFilterPreset: (state, action: PayloadAction<string>) => {
      state.savedPresets = state.savedPresets.filter((p) => p.id !== action.payload);
    },
    setFilterPresets: (state, action: PayloadAction<FilterPreset[]>) => {
      state.savedPresets = action.payload;
    },
  },
});

export const {
  setSearchQuery,
  setAssigneeFilter,
  toggleAssigneeFilter,
  setPriorityFilter,
  togglePriorityFilter,
  setStatusFilter,
  toggleStatusFilter,
  setLabelFilter,
  toggleLabelFilter,
  setDueDateRange,
  setSortBy,
  setSortDirection,
  toggleSortDirection,
  setGroupBy,
  resetFilters,
  saveFilterPreset,
  applyFilterPreset,
  deleteFilterPreset,
  setFilterPresets,
} = filterSlice.actions;

export default filterSlice.reducer;
