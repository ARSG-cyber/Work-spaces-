'use client';

import React from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveTaskDetailId, setCreateTaskModalOpen } from '@/store/slices/uiSlice';
import { toggleTaskComplete } from '@/store/slices/taskSlice';
import { Avatar } from '@/components/common/Avatar';
import { PriorityBadge } from '@/components/common/Badge';
import { formatDistanceToNow, isPast, parseISO, isToday, isThisWeek } from 'date-fns';
import {
  CheckSquare,
  Square,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Folder,
  Plus,
  AlertCircle,
  Activity as ActivityIcon,
  TrendingUp,
} from 'lucide-react';

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const activeWorkspace = useAppSelector(
    (s) => s.workspace.workspaces[s.workspace.activeWorkspaceId]
  );
  const projects = useAppSelector((s) =>
    Object.values(s.project.projects).filter(
      (p) => p.workspaceId === s.workspace.activeWorkspaceId && !p.isArchived
    )
  );
  const allWorkspaceTasks = useAppSelector((s) =>
    Object.values(s.task.tasks).filter(
      (t) => t.workspaceId === s.workspace.activeWorkspaceId
    )
  );
  const activities = useAppSelector((s) =>
    s.activity.activities.filter((a) => a.workspaceId === s.workspace.activeWorkspaceId)
  );
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);

  if (!currentUser || !activeWorkspace) return null;

  // Real-time statistics computed directly from Redux state
  const totalTasks = allWorkspaceTasks.length;
  const inProgressTasks = allWorkspaceTasks.filter((t) => t.status === 'In Progress').length;
  const completedTasks = allWorkspaceTasks.filter((t) => t.status === 'Done').length;
  const overdueTasks = allWorkspaceTasks.filter(
    (t) =>
      t.dueDate &&
      t.status !== 'Done' &&
      isPast(parseISO(t.dueDate)) &&
      !isToday(parseISO(t.dueDate))
  );

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Tasks assigned to current active user
  const assignedToMe = allWorkspaceTasks.filter((t) => t.assigneeId === currentUser.id);

  // Upcoming deadlines (tasks due today or this week, not completed)
  const upcomingDeadlines = allWorkspaceTasks
    .filter((t) => {
      if (!t.dueDate || t.status === 'Done') return false;
      const parsed = parseISO(t.dueDate);
      return isToday(parsed) || isThisWeek(parsed) || isPast(parsed);
    })
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] shadow-xs">
        <div className="flex items-center gap-4">
          <Avatar name={currentUser.name} avatar={currentUser.avatar} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome back, {currentUser.name}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active in <span className="font-semibold">{activeWorkspace.name}</span> • Here is your workspace summary today.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch(setCreateTaskModalOpen(true))}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task</span>
        </button>
      </div>

      {/* Task Statistics Widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Total Tasks
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {totalTasks}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            In Progress
          </span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {inProgressTasks}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Completed
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {completedTasks}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Overdue
          </span>
          <p
            className={`text-2xl font-bold mt-1 ${
              overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'
            }`}
          >
            {overdueTasks.length}
          </p>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Completion
            </span>
            <span className="text-xs font-bold text-indigo-600">{completionRate}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned to Me & Deadlines */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assigned to Me */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Assigned to Me ({assignedToMe.length})
                </h2>
              </div>
              <span className="text-xs text-slate-400">
                {assignedToMe.filter((t) => t.status === 'Done').length} completed
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {assignedToMe.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  You have no tasks assigned to you in this workspace.
                </div>
              ) : (
                assignedToMe.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => dispatch(setActiveTaskDetailId(task.id))}
                    className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(toggleTaskComplete(task.id));
                        }}
                        className="text-slate-400 hover:text-emerald-500"
                      >
                        {task.status === 'Done' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>

                      <span
                        className={`truncate font-medium ${
                          task.status === 'Done'
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <PriorityBadge priority={task.priority} size="sm" />
                      {task.dueDate && (
                        <span className="text-[11px] text-slate-400">
                          {task.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Approaching Deadlines
                </h2>
              </div>
              <span className="text-xs text-slate-400">Due soon or overdue</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {upcomingDeadlines.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  No upcoming deadlines this week.
                </div>
              ) : (
                upcomingDeadlines.slice(0, 5).map((task) => {
                  const isOverdue =
                    isPast(parseISO(task.dueDate!)) && !isToday(parseISO(task.dueDate!));
                  const isTodayDate = isToday(parseISO(task.dueDate!));

                  return (
                    <div
                      key={task.id}
                      onClick={() => dispatch(setActiveTaskDetailId(task.id))}
                      className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-3">
                        <p className="font-medium text-slate-800 dark:text-slate-200 truncate">
                          {task.title}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          Status: {task.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <PriorityBadge priority={task.priority} size="sm" />
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isOverdue
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                              : isTodayDate
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          {isOverdue ? 'Overdue' : isTodayDate ? 'Today' : task.dueDate}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Projects & Activity Stream */}
        <div className="space-y-6">
          {/* Recent Projects */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Projects
                </h2>
              </div>
              <Link
                href={`/app/workspaces/${activeWorkspace.id}`}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                View all
              </Link>
            </div>

            <div className="space-y-2">
              {projects.map((proj) => {
                const projTasks = allWorkspaceTasks.filter((t) => t.projectId === proj.id);
                return (
                  <Link
                    key={proj.id}
                    href={`/app/workspaces/${activeWorkspace.id}/projects/${proj.id}`}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 transition-all text-xs group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base">{proj.icon}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 truncate">
                        {proj.name}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {projTasks.length} tasks
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Activity Stream */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Recent Team Activity
                </h2>
              </div>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No activity logged yet.</p>
              ) : (
                activities.slice(0, 8).map((act) => {
                  const actor = mockUsers.find((u) => u.id === act.actorId);
                  return (
                    <div key={act.id} className="flex items-start gap-2.5 text-xs">
                      <Avatar
                        name={actor?.name || 'Teammate'}
                        avatar={actor?.avatar}
                        size="xs"
                        className="mt-0.5"
                      />
                      <div className="min-w-0 flex-1 leading-snug">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {actor?.name || 'Teammate'}
                        </span>{' '}
                        <span className="text-slate-500 dark:text-slate-400">
                          {act.details}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
