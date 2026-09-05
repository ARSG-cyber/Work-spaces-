'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setCreateProjectModalOpen } from '@/store/slices/uiSlice';
import { Avatar } from '@/components/common/Avatar';
import { RoleBadge } from '@/components/common/Badge';
import {
  FolderPlus,
  ArrowRight,
  Settings,
  Users,
  CheckCircle2,
  Clock,
  Archive,
  BarChart3,
} from 'lucide-react';

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default function WorkspacePage({ params }: WorkspacePageProps) {
  const resolvedParams = use(params);
  const { workspaceId } = resolvedParams;

  const dispatch = useAppDispatch();
  const workspace = useAppSelector((s) => s.workspace.workspaces[workspaceId]);
  const projects = useAppSelector((s) =>
    Object.values(s.project.projects).filter((p) => p.workspaceId === workspaceId)
  );
  const allTasks = useAppSelector((s) =>
    Object.values(s.task.tasks).filter((t) => t.workspaceId === workspaceId)
  );
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);

  if (!workspace) {
    return (
      <div className="p-8 text-center text-slate-500">
        Workspace not found.
      </div>
    );
  }

  const activeProjects = projects.filter((p) => !p.isArchived);
  const completedTasks = allTasks.filter((t) => t.status === 'Done').length;
  const inProgressTasks = allTasks.filter((t) => t.status === 'In Progress').length;
  const completionRate =
    allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  const members = workspace.members.map((m) => {
    const user = mockUsers.find((u) => u.id === m.userId);
    return { ...m, user };
  });

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Workspace Hero Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] shadow-xs">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-xs shrink-0"
            style={{ backgroundColor: `${workspace.color}18` }}
          >
            {workspace.icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {workspace.name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Workspace Overview • {activeProjects.length} active projects • {members.length} team members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/app/workspaces/${workspaceId}/settings`}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Workspace Settings</span>
          </Link>
          <button
            type="button"
            onClick={() => dispatch(setCreateProjectModalOpen(true))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Tasks
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {allTasks.length}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            In Progress
          </span>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
            {inProgressTasks}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Completed
          </span>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {completedTasks}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e]">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Completion Rate
          </span>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {completionRate}%
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Active Projects ({activeProjects.length})
          </h2>
          <button
            type="button"
            onClick={() => dispatch(setCreateProjectModalOpen(true))}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Create project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map((proj) => {
            const projTasks = allTasks.filter((t) => t.projectId === proj.id);
            const projDone = projTasks.filter((t) => t.status === 'Done').length;
            const projMembers = mockUsers.filter((u) => proj.memberIds.includes(u.id));

            return (
              <Link
                key={proj.id}
                href={`/app/workspaces/${workspaceId}/projects/${proj.id}`}
                className="group flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] hover:border-indigo-400 dark:hover:border-indigo-500/50 shadow-xs hover:shadow-md transition-all text-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-2xl p-2 rounded-xl border border-slate-200/60 dark:border-slate-800"
                      style={{ backgroundColor: `${proj.color}15` }}
                    >
                      {proj.icon}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: proj.color }}
                    />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {projTasks.length} tasks
                    </span>
                    <span>•</span>
                    <span>{projDone} done</span>
                  </div>

                  <div className="flex items-center -space-x-1.5 overflow-hidden">
                    {projMembers.slice(0, 3).map((m) => (
                      <Avatar
                        key={m.id}
                        name={m.name}
                        avatar={m.avatar}
                        size="xs"
                        className="ring-2 ring-white dark:ring-[#0c121e]"
                      />
                    ))}
                  </div>
                </div>
              </Link>
            );
          })}

          {activeProjects.length === 0 && (
            <div className="col-span-full p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <FolderPlus className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold">No active projects in this workspace</p>
              <p className="text-xs text-slate-500 mt-1">
                Create your first project or start from a predefined template.
              </p>
              <button
                type="button"
                onClick={() => dispatch(setCreateProjectModalOpen(true))}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Create Project
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Workspace Members Section */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Team Members ({members.length})
            </h2>
          </div>
          <Link
            href={`/app/workspaces/${workspaceId}/settings`}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Manage members
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {members.map((m) => {
            if (!m.user) return null;
            return (
              <div
                key={m.userId}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs"
              >
                <Avatar name={m.user.name} avatar={m.user.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {m.user.name}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{m.user.email}</p>
                </div>
                <RoleBadge role={m.role} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
