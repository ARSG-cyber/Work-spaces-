'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateProject,
  archiveProject,
  unarchiveProject,
  deleteProject,
  toggleProjectMember,
} from '@/store/slices/projectSlice';
import { showConfirmDialog, showAccessDenied } from '@/store/slices/uiSlice';
import { Avatar } from '@/components/common/Avatar';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  Archive,
  Trash2,
  Check,
  Save,
  ShieldAlert,
} from 'lucide-react';

interface ProjectSettingsPageProps {
  params: Promise<{
    workspaceId: string;
    projectId: string;
  }>;
}

const PROJECT_ICONS = ['⚡', '📱', '🛡️', '🎯', '🚀', '💻', '🎨', '📣', '🌱', '📊'];
const PROJECT_COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#64748b',
];

export default function ProjectSettingsPage({ params }: ProjectSettingsPageProps) {
  const resolvedParams = use(params);
  const { workspaceId, projectId } = resolvedParams;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();

  const project = useAppSelector((s) => s.project.projects[projectId]);
  const activeWorkspace = useAppSelector((s) => s.workspace.workspaces[workspaceId]);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const currentUser = useAppSelector((s) => s.auth.currentUser);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [color, setColor] = useState('#6366f1');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description);
      setIcon(project.icon);
      setColor(project.color);
    }
  }, [project]);

  if (!project || !activeWorkspace) {
    return (
      <div className="p-8 text-center text-slate-500">
        Project or Workspace not found.
      </div>
    );
  }

  const workspaceUsers = mockUsers.filter((u) =>
    activeWorkspace.members.some((m) => m.userId === u.id)
  );

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'edit project settings' }));
      return;
    }

    dispatch(
      updateProject({
        id: project.id,
        updates: {
          name: name.trim(),
          description: description.trim(),
          icon,
          color,
        },
      })
    );
    toast.success('Project Settings Saved');
  };

  const handleToggleArchive = () => {
    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'archive project' }));
      return;
    }

    if (project.isArchived) {
      dispatch(unarchiveProject(project.id));
      toast.success('Project Restored', `"${project.name}" unarchived.`);
    } else {
      dispatch(archiveProject(project.id));
      toast.info('Project Archived', `"${project.name}" moved to archives.`);
    }
  };

  const handleDelete = () => {
    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'delete project' }));
      return;
    }

    dispatch(
      showConfirmDialog({
        title: 'Delete Project',
        message: `Permanently delete "${project.name}" and all of its tasks? This action cannot be reversed.`,
        confirmLabel: 'Delete Project',
        isDestructive: true,
        actionType: 'delete_project',
        payload: { projectId: project.id },
      })
    );
    router.push(`/app/workspaces/${workspaceId}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Back button & title */}
      <div>
        <Link
          href={`/app/workspaces/${workspaceId}/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Project</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Project Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage general metadata, team members, and lifecycle for {project.name}.
        </p>
      </div>

      {/* General Settings Card */}
      <form
        onSubmit={handleSaveGeneral}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] p-6 space-y-5 shadow-xs"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          General Identity
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Project Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
          />
        </div>

        {/* Icon & Color Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {PROJECT_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-sm transition-transform cursor-pointer ${
                    icon === ic
                      ? 'bg-white dark:bg-slate-800 ring-2 ring-indigo-500 scale-110 shadow-xs'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Color Tag
            </label>
            <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {PROJECT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>

      {/* Member Assignment Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] p-6 space-y-4 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Assigned Workspace Members
        </h2>
        <p className="text-xs text-slate-500">
          Only members belonging to {activeWorkspace.name} can be assigned to this project.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {workspaceUsers.map((user) => {
            const isAssigned = project.memberIds.includes(user.id);
            return (
              <div
                key={user.id}
                className="flex items-center justify-between py-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} avatar={user.avatar} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      toggleProjectMember({
                        projectId: project.id,
                        userId: user.id,
                      })
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs border transition-colors cursor-pointer ${
                    isAssigned
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {isAssigned ? 'Assigned' : 'Assign'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Danger Zone Card */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 p-6 space-y-4">
        <h2 className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          <span>Danger Zone</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-rose-100 dark:border-rose-900/30">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {project.isArchived ? 'Restore Project' : 'Archive Project'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {project.isArchived
                ? 'Unarchive this project to display it back in the main navigation.'
                : 'Hide this project from active navigation and boards.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleArchive}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold cursor-pointer"
          >
            {project.isArchived ? 'Restore Project' : 'Archive Project'}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
          <div>
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Delete Project
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently remove this project and all associated task records.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Delete Project
          </button>
        </div>
      </div>
    </div>
  );
}
