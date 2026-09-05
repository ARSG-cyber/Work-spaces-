'use client';

import React, { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import {
  addSubtask,
  toggleSubtask,
  updateSubtaskTitle,
  deleteSubtask,
  convertSubtaskToTask,
} from '@/store/slices/taskSlice';
import { Subtask } from '@/types/task';
import { useToast } from '@/components/ui/Toast';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  CornerDownRight,
  ExternalLink,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface SubtaskItemProps {
  taskId: string;
  subtask: Subtask;
  depth?: number;
}

function SubtaskItem({ taskId, subtask, depth = 0 }: SubtaskItemProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(subtask.title);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [childTitle, setChildTitle] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const hasChildren = subtask.children && subtask.children.length > 0;

  const handleSaveTitle = () => {
    if (title.trim() && title !== subtask.title) {
      dispatch(updateSubtaskTitle({ taskId, subtaskId: subtask.id, title: title.trim() }));
    }
    setIsEditing(false);
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (childTitle.trim()) {
      dispatch(
        addSubtask({
          taskId,
          parentId: subtask.id,
          title: childTitle.trim(),
        })
      );
      setChildTitle('');
      setIsAddingChild(false);
      setCollapsed(false);
    }
  };

  const handleConvertToTask = () => {
    dispatch(convertSubtaskToTask({ taskId, subtaskId: subtask.id }));
    toast.success('Converted to Task', `"${subtask.title}" is now a project-level task.`);
  };

  return (
    <div className="group/item flex flex-col">
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition-colors text-xs"
        style={{ paddingLeft: `${Math.min(depth * 16 + 8, 96)}px` }}
      >
        {/* Expand / Collapse toggle if has children */}
        {hasChildren ? (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            {collapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        ) : depth > 0 ? (
          <CornerDownRight className="w-3 h-3 text-slate-300 dark:text-slate-700 shrink-0" />
        ) : (
          <span className="w-3" />
        )}

        {/* Complete Checkbox */}
        <button
          type="button"
          onClick={() => dispatch(toggleSubtask({ taskId, subtaskId: subtask.id }))}
          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shrink-0 cursor-pointer"
        >
          {subtask.completed ? (
            <CheckSquare className="w-4 h-4 text-emerald-500" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        {/* Title / Inline Edit */}
        {isEditing ? (
          <input
            type="text"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') setIsEditing(false);
            }}
            className="flex-1 bg-white dark:bg-slate-900 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-slate-100 outline-none"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`flex-1 cursor-pointer truncate ${
              subtask.completed
                ? 'line-through text-slate-400 dark:text-slate-500'
                : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {subtask.title}
          </span>
        )}

        {/* Action Buttons (visible on hover) */}
        <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 transition-opacity">
          {/* Add Nested Subtask */}
          <button
            type="button"
            onClick={() => setIsAddingChild(true)}
            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Add nested subtask"
          >
            <Plus className="w-3 h-3" />
          </button>

          {/* Convert to Full Task */}
          <button
            type="button"
            onClick={handleConvertToTask}
            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Convert to standalone task"
          >
            <ExternalLink className="w-3 h-3" />
          </button>

          {/* Delete Subtask */}
          <button
            type="button"
            onClick={() => dispatch(deleteSubtask({ taskId, subtaskId: subtask.id }))}
            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Delete subtask"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Child Creation Form */}
      {isAddingChild && (
        <form onSubmit={handleAddChild} className="flex items-center gap-2 py-1 pl-8 pr-2">
          <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={childTitle}
            onChange={(e) => setChildTitle(e.target.value)}
            placeholder="Nested subtask title..."
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs outline-none"
          />
          <button
            type="submit"
            className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[11px] font-medium"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAddingChild(false)}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Render Nested Children */}
      {!collapsed && hasChildren && (
        <div className="flex flex-col">
          {subtask.children!.map((child) => (
            <SubtaskItem
              key={child.id}
              taskId={taskId}
              subtask={child}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Flat counter helper for progress computation
function countSubtasks(subtasks: Subtask[]): { total: number; completed: number } {
  let total = 0;
  let completed = 0;

  function traverse(list: Subtask[]) {
    list.forEach((s) => {
      total++;
      if (s.completed) completed++;
      if (s.children && s.children.length > 0) {
        traverse(s.children);
      }
    });
  }

  traverse(subtasks);
  return { total, completed };
}

export function SubtaskTree({
  taskId,
  subtasks,
}: {
  taskId: string;
  subtasks: Subtask[];
}) {
  const dispatch = useAppDispatch();
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const { total, completed } = countSubtasks(subtasks);
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleAddTopLevel = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      dispatch(
        addSubtask({
          taskId,
          parentId: null,
          title: newTitle.trim(),
        })
      );
      setNewTitle('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Progress Header */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Subtasks ({completed}/{total})
        </span>
        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
          {percentage}% completed
        </span>
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* Subtasks List */}
      <div className="space-y-0.5">
        {subtasks.map((st) => (
          <SubtaskItem key={st.id} taskId={taskId} subtask={st} depth={0} />
        ))}
      </div>

      {/* Add Top-Level Subtask */}
      {isAdding ? (
        <form onSubmit={handleAddTopLevel} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Subtask checklist item..."
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium cursor-pointer"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 pt-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add subtask</span>
        </button>
      )}
    </div>
  );
}
