'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector, useHistory } from '@/store/hooks';
import { renameColumn, deleteColumn } from '@/store/slices/columnSlice';
import { moveTaskColumn, createTask } from '@/store/slices/taskSlice';
import { showConfirmDialog, showAccessDenied } from '@/store/slices/uiSlice';
import { KanbanColumn as KanbanColumnType, Task } from '@/types/task';
import { TaskCard } from '@/components/kanban/TaskCard';
import { useToast } from '@/components/ui/Toast';
import { Plus, MoreVertical, Edit2, Trash2, Check, X } from 'lucide-react';

interface KanbanColumnProps {
  projectId: string;
  column: KanbanColumnType;
  tasks: Task[];
  onTaskDragStart: (e: React.DragEvent, taskId: string) => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
  onMoveColumn?: (direction: 'left' | 'right') => void;
}

export function KanbanColumn({
  projectId,
  column,
  tasks,
  onTaskDragStart,
  canMoveLeft,
  canMoveRight,
  onMoveColumn,
}: KanbanColumnProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { captureHistory } = useHistory();

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);

  const [isEditingName, setIsEditingName] = useState(false);
  const [colName, setColName] = useState(column.name);
  const [showOptions, setShowOptions] = useState(false);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleSaveName = () => {
    if (colName.trim() && colName !== column.name) {
      if (currentUser?.role === 'viewer') {
        dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'rename columns' }));
        return;
      }
      dispatch(renameColumn({ projectId, columnId: column.id, name: colName.trim() }));
      toast.info('Column Renamed', colName.trim());
    }
    setIsEditingName(false);
  };

  const handleDeleteColumn = () => {
    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'delete columns' }));
      return;
    }
    dispatch(
      showConfirmDialog({
        title: 'Delete Column',
        message: `Delete "${column.name}"? Tasks currently in this column will be moved to another column.`,
        confirmLabel: 'Delete Column',
        isDestructive: true,
        actionType: 'delete_column',
        payload: { projectId, columnId: column.id },
      })
    );
    setShowOptions(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'move tasks' }));
      return;
    }

    captureHistory(`Moved task to "${column.name}"`);
    dispatch(moveTaskColumn({ taskId, newStatus: column.name }));
    toast.info('Moved Task', `Moved to ${column.name}`);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !currentUser) return;

    if (currentUser.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'create tasks' }));
      return;
    }

    const newTaskId = `task-${Date.now()}`;
    const newTask: Task = {
      id: newTaskId,
      projectId,
      workspaceId: activeWorkspaceId,
      title: quickTitle.trim(),
      description: '',
      status: column.name,
      priority: 'medium',
      dueDate: null,
      assigneeId: currentUser.id,
      labels: [],
      subtasks: [],
      attachments: [],
      order: tasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    captureHistory(`Created task "${newTask.title}" in ${column.name}`);
    dispatch(createTask(newTask));
    toast.success('Task Added', newTask.title);
    setQuickTitle('');
    setIsQuickAdding(false);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col w-72 sm:w-80 shrink-0 rounded-2xl border transition-all duration-150 ${
        isDragOver
          ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
          : 'border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-[#0c121e]/80'
      } max-h-[calc(100vh-12rem)] flex-1`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: column.color }}
          />

          {isEditingName ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                autoFocus
                value={colName}
                onChange={(e) => setColName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                className="flex-1 bg-white dark:bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>
          ) : (
            <h3
              onClick={() => setIsEditingName(true)}
              className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-indigo-600"
              title="Click to rename"
            >
              {column.name}
            </h3>
          )}

          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 px-1.5 py-0.2 rounded-full bg-slate-200/60 dark:bg-slate-800">
            {tasks.length}
          </span>
        </div>

        {/* Column Actions */}
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsQuickAdding(true)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Add task to this column"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Column options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showOptions && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 shadow-xl z-30 p-1 animate-in fade-in">
              <button
                type="button"
                onClick={() => {
                  setIsEditingName(true);
                  setShowOptions(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
              >
                <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Rename Column</span>
              </button>

              {canMoveLeft && onMoveColumn && (
                <button
                  type="button"
                  onClick={() => {
                    onMoveColumn('left');
                    setShowOptions(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                >
                  <span>← Move Left</span>
                </button>
              )}

              {canMoveRight && onMoveColumn && (
                <button
                  type="button"
                  onClick={() => {
                    onMoveColumn('right');
                    setShowOptions(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-left"
                >
                  <span>Move Right →</span>
                </button>
              )}

              <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

              <button
                type="button"
                onClick={handleDeleteColumn}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Column</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Task Cards Container */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-24">
        {/* Quick Add Input */}
        {isQuickAdding && (
          <form onSubmit={handleQuickAdd} className="p-2.5 rounded-xl border border-indigo-500 bg-white dark:bg-[#0f1523] shadow-sm animate-in fade-in">
            <textarea
              autoFocus
              rows={2}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full text-xs bg-transparent outline-none resize-none placeholder-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleQuickAdd(e);
                }
              }}
            />
            <div className="flex justify-end gap-1.5 mt-2">
              <button
                type="button"
                onClick={() => setIsQuickAdding(false)}
                className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-indigo-600 text-white rounded text-[11px] font-semibold"
              >
                Add
              </button>
            </div>
          </form>
        )}

        {/* Task Cards */}
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onDragStart={onTaskDragStart} />
        ))}

        {tasks.length === 0 && !isQuickAdding && (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 italic">
            No tasks in this lane.
          </div>
        )}
      </div>
    </div>
  );
}
