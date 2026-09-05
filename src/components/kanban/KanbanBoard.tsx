'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addColumn, reorderColumns } from '@/store/slices/columnSlice';
import { showAccessDenied } from '@/store/slices/uiSlice';
import { KanbanColumn as KanbanColumnType, Task } from '@/types/task';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { useToast } from '@/components/ui/Toast';
import { Plus, Check, X } from 'lucide-react';
import { isPast, parseISO, isToday, isThisWeek, isThisMonth } from 'date-fns';

interface KanbanBoardProps {
  projectId: string;
}

const NEW_COL_COLORS = [
  '#94a3b8',
  '#3b82f6',
  '#a855f7',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#6366f1',
];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const columns = useAppSelector((s) => s.column.columns[projectId] || []);
  const allTasks = useAppSelector((s) =>
    Object.values(s.task.tasks).filter((t) => t.projectId === projectId)
  );
  const filterState = useAppSelector((s) => s.filter);
  const currentUser = useAppSelector((s) => s.auth.currentUser);

  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColColor, setNewColColor] = useState('#6366f1');

  // Filter tasks
  const filteredTasks = allTasks.filter((task) => {
    // Search query
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(q);
      const matchesDesc = task.description.toLowerCase().includes(q);
      const matchesLabel = task.labels.some((l) => l.toLowerCase().includes(q));
      if (!matchesTitle && !matchesDesc && !matchesLabel) return false;
    }

    // Assignee filter
    if (filterState.assigneeFilter.length > 0) {
      if (!task.assigneeId || !filterState.assigneeFilter.includes(task.assigneeId)) {
        return false;
      }
    }

    // Priority filter
    if (filterState.priorityFilter.length > 0) {
      if (!filterState.priorityFilter.includes(task.priority)) {
        return false;
      }
    }

    // Status filter
    if (filterState.statusFilter.length > 0) {
      if (!filterState.statusFilter.includes(task.status)) {
        return false;
      }
    }

    // Due date filter
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

  // Sort tasks within column
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
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
        // createdAt
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return filterState.sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const handleTaskDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleCreateColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;

    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'create columns' }));
      return;
    }

    const newCol: KanbanColumnType = {
      id: `col-${projectId}-${Date.now()}`,
      projectId,
      name: newColName.trim(),
      color: newColColor,
      order: columns.length,
    };

    dispatch(addColumn({ projectId, column: newCol }));
    toast.success('Column Added', newCol.name);
    setNewColName('');
    setIsAddingCol(false);
  };

  const handleMoveColumn = (index: number, direction: 'left' | 'right') => {
    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'reorder columns' }));
      return;
    }
    const newCols = [...columns];
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newCols.length) return;

    const temp = newCols[index];
    newCols[index] = newCols[targetIdx];
    newCols[targetIdx] = temp;

    dispatch(reorderColumns({ projectId, columns: newCols }));
  };

  return (
    <div className="flex items-start gap-4 overflow-x-auto pb-6 pt-1 select-none min-h-[calc(100vh-14rem)]">
      {/* Kanban Columns */}
      {columns.map((col, idx) => {
        const colTasks = sortTasks(filteredTasks.filter((t) => t.status === col.name));
        return (
          <KanbanColumn
            key={col.id}
            projectId={projectId}
            column={col}
            tasks={colTasks}
            onTaskDragStart={handleTaskDragStart}
            canMoveLeft={idx > 0}
            canMoveRight={idx < columns.length - 1}
            onMoveColumn={(dir) => handleMoveColumn(idx, dir)}
          />
        );
      })}

      {/* Add New Column Button / Card */}
      <div className="w-72 shrink-0">
        {isAddingCol ? (
          <form
            onSubmit={handleCreateColumn}
            className="p-3 rounded-2xl border border-indigo-500 bg-white dark:bg-[#0c121e] shadow-md animate-in fade-in"
          >
            <input
              type="text"
              autoFocus
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              placeholder="Column name (e.g. Testing, Blocked)..."
              className="w-full text-xs font-semibold bg-transparent border-b border-slate-200 dark:border-slate-800 pb-2 mb-3 outline-none text-slate-900 dark:text-slate-100"
            />

            <div className="flex items-center gap-1.5 mb-3">
              {NEW_COL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-5 h-5 rounded-full transition-transform ${
                    newColColor === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                  }`}
                />
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingCol(false)}
                className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold"
              >
                Save Column
              </button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAddingCol(true)}
            className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500/60 bg-slate-100/40 dark:bg-slate-900/20 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Column</span>
          </button>
        )}
      </div>
    </div>
  );
}
