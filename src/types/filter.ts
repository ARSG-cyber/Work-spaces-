import { TaskPriority } from './task';

export interface FilterState {
  searchQuery: string;
  assigneeFilter: string[];
  priorityFilter: TaskPriority[];
  statusFilter: string[];
  labelFilter: string[];
  dueDateRange: 'all' | 'overdue' | 'today' | 'week' | 'month';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortDirection: 'asc' | 'desc';
  groupBy: 'none' | 'status' | 'assignee' | 'priority' | 'label';
}

export interface FilterPreset {
  id: string;
  workspaceId: string;
  name: string;
  filters: FilterState;
  createdAt: string;
}
