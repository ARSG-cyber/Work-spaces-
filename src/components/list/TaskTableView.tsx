'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector, useHistory } from '@/store/hooks';
import {
  toggleSelectTask,
  selectAllTasks,
  clearSelectedTasks,
  bulkUpdateStatus,
  bulkUpdateAssignee,
  bulkDeleteTasks,
  toggleTaskComplete,
} from '@/store/slices/taskSlice';
import { setActiveTaskDetailId, showConfirmDialog, showAccessDenied } from '@/store/slices/uiSlice';
import { Task, TaskPriority } from '@/types/task';
import { Avatar } from '@/components/common/Avatar';
import { PriorityBadge, TagChip } from '@/components/common/Badge';
import { useToast } from '@/components/ui/Toast';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Calendar,
  User,
  Trash2,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { isPast, parseISO, isToday, isThisWeek, isThisMonth, format } from 'date-fns';

interface TaskTableViewProps {
  projectId: string;
}

export function TaskTableView({ projectId }: TaskTableViewProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { captureHistory } = useHistory();

  const allTasks = useAppSelector((s) =>
    Object.values(s.task.tasks).filter((t) => t.projectId === projectId)
  );
  const selectedTaskIds = useAppSelector((s) => s.task.selectedTaskIds);
  const columns = useAppSelector((s) => s.column.columns[projectId] || []);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const filterState = useAppSelector((s) => s.filter);

  // Collapsed state for groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  // 1. Filter tasks
  const filteredTasks = allTasks.filter((task) => {
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = task.description.toLowerCase().includes(q);
      const matchesLabel = task.labels.some((l) => l.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesLabel) return false;
    }

    if (filterState.assigneeFilter.length > 0) {
      if (!task.assigneeId || !filterState.assigneeFilter.includes(task.assigneeId)) {
        return false;
      }
    }

    if (filterState.priorityFilter.length > 0) {
      if (!filterState.priorityFilter.includes(task.priority)) {
        return false;
      }
    }

    if (filterState.statusFilter.length > 0) {
      if (!filterState.statusFilter.includes(task.status)) {
        return false;
      }
    }

    if (filterState.dueDateRange !== 'all') {
      if (!task.dueDate) return false;
      const parsedDate = parseISO(task.dueDate);
      if (filterState.dueDateRange === 'overdue') {
        if (!isPast(parsedDate) || isToday(parsedDate)) return false;
      } else if (filterState.dueDateRange === 'today') {
        if (!isToday(parsedDate)) return false;
      } else if (filterState.dueDateRange === 'week') {
        if (!isThisWeek(parsedDate)) return false;
      } else if (filterState.dueDateRange === 'month') {
        if (!isThisMonth(parsedDate)) return false;
      }
    }

    return true;
  });

  // 2. Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let comparison = 0;
    if (filterState.sortBy === 'dueDate') {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      comparison = dateA - dateB;
    } else if (filterState.sortBy === 'priority') {
      const priorityOrder: Record<string, number> = {
        urgent: 4,
        high: 3,
        medium: 2,
        low: 1,
      };
      comparison = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    } else if (filterState.sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else {
      comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return filterState.sortDirection === 'asc' ? comparison : -comparison;
  });

  // 3. Group tasks
  const groups: Record<string, Task[]> = {};
  if (filterState.groupBy === 'status') {
    columns.forEach((col) => {
      groups[col.name] = [];
    });
    sortedTasks.forEach((t) => {
      if (!groups[t.status]) groups[t.status] = [];
      groups[t.status].push(t);
    });
  } else if (filterState.groupBy === 'assignee') {
    mockUsers.forEach((u) => {
      groups[u.name] = [];
    });
    groups['Unassigned'] = [];
    sortedTasks.forEach((t) => {
      const u = mockUsers.find((user) => user.id === t.assigneeId);
      const groupName = u ? u.name : 'Unassigned';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(t);
    });
  } else if (filterState.groupBy === 'priority') {
    ['urgent', 'high', 'medium', 'low'].forEach((p) => {
      groups[p.toUpperCase()] = [];
    });
    sortedTasks.forEach((t) => {
      const key = t.priority.toUpperCase();
      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });
  } else if (filterState.groupBy === 'label') {
    groups['No Label'] = [];
    sortedTasks.forEach((t) => {
      if (t.labels.length === 0) {
        groups['No Label'].push(t);
      } else {
        t.labels.forEach((l) => {
          if (!groups[l]) groups[l] = [];
          groups[l].push(t);
        });
      }
    });
  } else {
    // None
    groups['All Tasks'] = sortedTasks;
  }

  const toggleGroup = (grp: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [grp]: !prev[grp] }));
  };

  const isAllSelected =
    filteredTasks.length > 0 &&
    filteredTasks.every((t) => selectedTaskIds.includes(t.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      dispatch(clearSelectedTasks());
    } else {
      dispatch(selectAllTasks(filteredTasks.map((t) => t.id)));
    }
  };

  // Bulk Operations
  const handleBulkStatus = (status: string) => {
    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'update tasks' }));
      return;
    }
    captureHistory(`Bulk updated status to ${status}`);
    dispatch(bulkUpdateStatus({ status }));
    toast.success('Updated Status', `Applied to ${selectedTaskIds.length} tasks.`);
  };

  const handleBulkAssignee = (assigneeId: string | null) => {
    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'assign tasks' }));
      return;
    }
    captureHistory('Bulk updated assignee');
    dispatch(bulkUpdateAssignee({ assigneeId }));
    toast.success('Updated Assignee');
  };

  const handleBulkDelete = () => {
    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'delete tasks' }));
      return;
    }
    dispatch(
      showConfirmDialog({
        title: 'Delete Selected Tasks',
        message: `Permanently delete ${selectedTaskIds.length} selected task(s)? This action cannot be undone.`,
        confirmLabel: 'Delete All Selected',
        isDestructive: true,
        actionType: 'delete_task', // or bulk
        payload: {},
      })
    );
    // Execute bulk delete on confirm directly if confirmed
    captureHistory(`Bulk deleted ${selectedTaskIds.length} tasks`);
    dispatch(bulkDeleteTasks());
    toast.info('Deleted Tasks');
  };

  return (
    <div className="relative pb-24">
      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c121e] overflow-hidden shadow-xs">
        {/* Table Header Row */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
          <div className="col-span-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              {isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <span>#</span>
          </div>
          <div className="col-span-4">Task</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Assignee</div>
          <div className="col-span-1 text-right">Due Date</div>
        </div>

        {/* Groups & Rows */}
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {Object.entries(groups).map(([groupName, tasksInGroup]) => {
            const isCollapsed = !!collapsedGroups[groupName];
            return (
              <div key={groupName} className="flex flex-col">
                {/* Group Header (if grouped) */}
                {filterState.groupBy !== 'none' && (
                  <div
                    onClick={() => toggleGroup(groupName)}
                    className="flex items-center justify-between px-4 py-2 bg-slate-50/50 dark:bg-slate-900/40 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 cursor-pointer transition-colors select-none"
                  >
                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>{groupName}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({tasksInGroup.length})
                      </span>
                    </div>
                  </div>
                )}

                {/* Tasks inside group */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {tasksInGroup.length === 0 ? (
                      <div className="py-4 text-center text-xs text-slate-400 italic">
                        No tasks in this group.
                      </div>
                    ) : (
                      tasksInGroup.map((task, idx) => {
                        const isSelected = selectedTaskIds.includes(task.id);
                        const assignee = mockUsers.find((u) => u.id === task.assigneeId);
                        const isOverdue =
                          task.dueDate &&
                          task.status !== 'Done' &&
                          isPast(parseISO(task.dueDate)) &&
                          !isToday(parseISO(task.dueDate));

                        return (
                          <div
                            key={task.id}
                            onClick={() => dispatch(setActiveTaskDetailId(task.id))}
                            className={`flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-3 px-4 py-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors text-xs items-center ${
                              isSelected ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                            }`}
                          >
                            {/* Checkbox & ID */}
                            <div className="col-span-1 flex items-center gap-2 w-full md:w-auto">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(toggleSelectTask(task.id));
                                }}
                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(toggleTaskComplete(task.id));
                                }}
                                className="text-slate-400 hover:text-emerald-500 transition-colors"
                              >
                                {task.status === 'Done' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>
                            </div>

                            {/* Title & Description snippet */}
                            <div className="col-span-4 min-w-0 w-full">
                              <span
                                className={`font-semibold text-slate-800 dark:text-slate-200 truncate block ${
                                  task.status === 'Done'
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : ''
                                }`}
                              >
                                {task.title}
                              </span>
                              {task.labels.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {task.labels.slice(0, 2).map((l) => (
                                    <span
                                      key={l}
                                      className="text-[10px] text-indigo-500 dark:text-indigo-400 font-medium"
                                    >
                                      #{l}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Status */}
                            <div className="col-span-2 w-full md:w-auto">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {task.status}
                              </span>
                            </div>

                            {/* Priority */}
                            <div className="col-span-2 w-full md:w-auto">
                              <PriorityBadge priority={task.priority} size="sm" />
                            </div>

                            {/* Assignee */}
                            <div className="col-span-2 flex items-center gap-1.5 w-full md:w-auto">
                              {assignee ? (
                                <>
                                  <Avatar name={assignee.name} avatar={assignee.avatar} size="xs" />
                                  <span className="truncate text-slate-700 dark:text-slate-300">
                                    {assignee.name}
                                  </span>
                                </>
                              ) : (
                                <span className="text-slate-400 italic">Unassigned</span>
                              )}
                            </div>

                            {/* Due Date */}
                            <div className="col-span-1 md:text-right w-full md:w-auto">
                              {task.dueDate ? (
                                <span
                                  className={`text-[11px] font-medium ${
                                    isOverdue
                                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                                      : 'text-slate-500 dark:text-slate-400'
                                  }`}
                                >
                                  {task.dueDate}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0f1523]/95 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-4 text-xs">
          <span className="font-bold text-slate-800 dark:text-white">
            {selectedTaskIds.length} selected
          </span>

          <div className="h-4 w-px bg-slate-200 dark:border-slate-800" />

          {/* Bulk Status */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Status:</span>
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatus(e.target.value);
              }}
              defaultValue=""
              className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-xs outline-none"
            >
              <option value="" disabled>
                Change...
              </option>
              {columns.map((col) => (
                <option key={col.id} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Assignee */}
          <div className="flex items-center gap-1">
            <span className="text-slate-400">Assignee:</span>
            <select
              onChange={(e) => handleBulkAssignee(e.target.value || null)}
              defaultValue=""
              className="bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 text-xs outline-none"
            >
              <option value="" disabled>
                Assign to...
              </option>
              <option value="">Unassigned</option>
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bulk Delete */}
          <button
            type="button"
            onClick={handleBulkDelete}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          {/* Deselect */}
          <button
            type="button"
            onClick={() => dispatch(clearSelectedTasks())}
            className="text-slate-400 hover:text-slate-600 p-1"
            title="Deselect all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
