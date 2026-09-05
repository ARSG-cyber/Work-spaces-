'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveTaskDetailId } from '@/store/slices/uiSlice';
import { toggleTaskComplete } from '@/store/slices/taskSlice';
import { Task } from '@/types/task';
import { Avatar } from '@/components/common/Avatar';
import { PriorityBadge, TagChip } from '@/components/common/Badge';
import { CheckSquare, Square, Calendar, Paperclip, CheckCircle2 } from 'lucide-react';
import { isPast, parseISO, isToday } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

export function TaskCard({ task, onDragStart }: TaskCardProps) {
  const dispatch = useAppDispatch();
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const assignee = mockUsers.find((u) => u.id === task.assigneeId);

  // Count subtasks
  let totalSubtasks = 0;
  let completedSubtasks = 0;
  function countSubtasks(list: typeof task.subtasks) {
    list.forEach((s) => {
      totalSubtasks++;
      if (s.completed) completedSubtasks++;
      if (s.children && s.children.length > 0) countSubtasks(s.children);
    });
  }
  countSubtasks(task.subtasks);

  // Due date status
  const isOverdue =
    task.dueDate && task.status !== 'Done' && isPast(parseISO(task.dueDate)) && !isToday(parseISO(task.dueDate));
  const isDueToday = task.dueDate && isToday(parseISO(task.dueDate));

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
      onClick={() => dispatch(setActiveTaskDetailId(task.id))}
      className="group relative flex flex-col gap-2.5 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0f1523] hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing text-xs select-none"
    >
      {/* Top row: Checkbox + Title */}
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleTaskComplete(task.id));
          }}
          className="text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 mt-0.5 shrink-0 transition-colors cursor-pointer"
          title={task.status === 'Done' ? 'Mark incomplete' : 'Mark complete'}
        >
          {task.status === 'Done' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        <span
          className={`font-semibold leading-snug line-clamp-2 ${
            task.status === 'Done'
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {task.title}
        </span>
      </div>

      {/* Description Snippet */}
      {task.description && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Labels row */}
      {task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((lbl) => (
            <TagChip key={lbl} label={lbl} className="text-[10px] py-0 px-1.5" />
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium self-center">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Metadata row: Priority, Due Date, Subtasks, Assignee */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} size="sm" />

          {/* Subtask count */}
          {totalSubtasks > 0 && (
            <span
              className={`flex items-center gap-1 font-medium ${
                completedSubtasks === totalSubtasks
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : ''
              }`}
              title={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            >
              <CheckSquare className="w-3 h-3" />
              <span>
                {completedSubtasks}/{totalSubtasks}
              </span>
            </span>
          )}

          {/* Attachments indicator */}
          {task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5" title={`${task.attachments.length} files`}>
              <Paperclip className="w-3 h-3" />
              <span>{task.attachments.length}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Due date */}
          {task.dueDate && (
            <span
              className={`flex items-center gap-1 font-medium ${
                isOverdue
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : isDueToday
                  ? 'text-amber-600 dark:text-amber-400 font-semibold'
                  : ''
              }`}
              title={`Due date: ${task.dueDate}`}
            >
              <Calendar className="w-3 h-3" />
              <span>{task.dueDate.slice(5)}</span>
            </span>
          )}

          {/* Assignee Avatar */}
          {assignee ? (
            <Avatar
              name={assignee.name}
              avatar={assignee.avatar}
              size="xs"
              className="ring-1 ring-white dark:ring-slate-900"
            />
          ) : (
            <span className="w-5 h-5 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-[10px] text-slate-400">
              ?
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
