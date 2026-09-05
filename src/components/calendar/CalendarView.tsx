'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveTaskDetailId, setCreateTaskModalOpen } from '@/store/slices/uiSlice';
import { Task } from '@/types/task';
import { PriorityBadge } from '@/components/common/Badge';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isPast,
  isToday,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

interface CalendarViewProps {
  projectId: string;
}

export function CalendarView({ projectId }: CalendarViewProps) {
  const dispatch = useAppDispatch();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const allTasks = useAppSelector((s) =>
    Object.values(s.task.tasks).filter((t) => t.projectId === projectId && t.dueDate)
  );
  const filterState = useAppSelector((s) => s.filter);

  // Filter tasks
  const filteredTasks = allTasks.filter((task) => {
    if (filterState.searchQuery) {
      const q = filterState.searchQuery.toLowerCase();
      if (
        !task.title.toLowerCase().includes(q) &&
        !task.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (
      filterState.assigneeFilter.length > 0 &&
      (!task.assigneeId || !filterState.assigneeFilter.includes(task.assigneeId))
    ) {
      return false;
    }
    if (
      filterState.priorityFilter.length > 0 &&
      !filterState.priorityFilter.includes(task.priority)
    ) {
      return false;
    }
    if (
      filterState.statusFilter.length > 0 &&
      !filterState.statusFilter.includes(task.status)
    ) {
      return false;
    }
    return true;
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getTasksForDate = (date: Date) => {
    return filteredTasks.filter((t) => {
      if (!t.dueDate) return false;
      try {
        const taskDate = parseISO(t.dueDate);
        return isSameDay(taskDate, date);
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c121e] overflow-hidden shadow-xs">
      {/* Month Navigation Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
          >
            Today
          </button>
          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Names Header */}
      <div className="grid grid-cols-7 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-center py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Calendar Grid Days */}
      <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-slate-100 dark:divide-slate-800/80 min-h-[500px]">
        {days.map((day) => {
          const isCurrMonth = isSameMonth(day, currentMonth);
          const isCurrentToday = isToday(day);
          const dayTasks = getTasksForDate(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => dispatch(setCreateTaskModalOpen(true))}
              className={`min-h-[100px] p-2 flex flex-col transition-colors cursor-pointer group ${
                isCurrMonth
                  ? 'bg-white dark:bg-[#0c121e]'
                  : 'bg-slate-50/50 dark:bg-slate-950/40 text-slate-400'
              } hover:bg-slate-50 dark:hover:bg-slate-900/40`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                    isCurrentToday
                      ? 'bg-indigo-600 text-white font-bold'
                      : isCurrMonth
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-400'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                <span className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600 transition-opacity">
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </div>

              {/* Day's Task Pills */}
              <div className="space-y-1 overflow-y-auto max-h-24">
                {dayTasks.map((t) => {
                  const isOverdue =
                    t.status !== 'Done' && isPast(day) && !isToday(day);

                  return (
                    <div
                      key={t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(setActiveTaskDetailId(t.id));
                      }}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border shadow-2xs transition-transform hover:scale-102 cursor-pointer ${
                        t.status === 'Done'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 line-through opacity-75'
                          : isOverdue
                          ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                          : 'bg-slate-50 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                      }`}
                      title={t.title}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          t.priority === 'urgent'
                            ? 'bg-rose-500'
                            : t.priority === 'high'
                            ? 'bg-orange-500'
                            : t.priority === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                      <span className="truncate flex-1">{t.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
