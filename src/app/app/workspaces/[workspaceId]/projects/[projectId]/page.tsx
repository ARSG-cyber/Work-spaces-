'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setProjectView } from '@/store/slices/uiSlice';
import { updateProject } from '@/store/slices/projectSlice';
import { KanbanBoard } from '@/components/kanban/KanbanBoard';
import { TaskTableView } from '@/components/list/TaskTableView';
import { CalendarView } from '@/components/calendar/CalendarView';
import { FilterBar } from '@/components/common/FilterBar';
import { Avatar } from '@/components/common/Avatar';
import { useToast } from '@/components/ui/Toast';
import {
  Kanban,
  TableProperties,
  Calendar,
  Settings,
  Archive,
  Edit2,
  Users,
} from 'lucide-react';

interface ProjectPageProps {
  params: Promise<{
    workspaceId: string;
    projectId: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = use(params);
  const { workspaceId, projectId } = resolvedParams;

  const dispatch = useAppDispatch();
  const toast = useToast();
  const router = useRouter();

  const project = useAppSelector((s) => s.project.projects[projectId]);
  const activeWorkspace = useAppSelector((s) => s.workspace.workspaces[workspaceId]);
  const projectViews = useAppSelector((s) => s.ui.projectViews);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const currentUser = useAppSelector((s) => s.auth.currentUser);

  // Active view with persistence fallback
  const currentView = projectViews[projectId] || activeWorkspace?.defaultView || 'kanban';

  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [desc, setDesc] = useState(project?.description || '');

  useEffect(() => {
    if (project) {
      setDesc(project.description);
    }
  }, [project]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl mb-4">
          🔍
        </div>
        <h2 className="text-lg font-bold">Project Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          The requested project might have been moved, deleted, or does not belong to this workspace.
        </p>
        <Link
          href={`/app/workspaces/${workspaceId}`}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Workspace Overview
        </Link>
      </div>
    );
  }

  const projectMembers = mockUsers.filter((u) => project.memberIds.includes(u.id));

  const handleSaveDesc = () => {
    if (desc !== project.description) {
      dispatch(updateProject({ id: project.id, updates: { description: desc } }));
      toast.info('Description Updated');
    }
    setIsEditingDesc(false);
  };

  const handleViewChange = (view: 'kanban' | 'list' | 'calendar') => {
    dispatch(setProjectView({ projectId, view }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Project Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs"
              style={{ backgroundColor: `${project.color}15` }}
            >
              {project.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                  {project.name}
                </h1>
                {project.isArchived && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    <Archive className="w-3 h-3" />
                    Archived
                  </span>
                )}
              </div>

              {/* Editable Description */}
              {isEditingDesc ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    autoFocus
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    onBlur={handleSaveDesc}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveDesc();
                      if (e.key === 'Escape') setIsEditingDesc(false);
                    }}
                    className="w-full text-xs bg-white dark:bg-slate-900 border border-indigo-500 rounded px-2 py-1 outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              ) : (
                <p
                  onClick={() => setIsEditingDesc(true)}
                  className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 truncate"
                  title="Click to edit description"
                >
                  {project.description || '+ Add project description...'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* View Switcher Tabs & Members */}
        <div className="flex items-center gap-3">
          {/* Members Avatars Stack */}
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {projectMembers.map((m) => (
              <Avatar
                key={m.id}
                name={m.name}
                avatar={m.avatar}
                size="xs"
                className="ring-2 ring-white dark:ring-[#090d16]"
              />
            ))}
          </div>

          {/* View Tabs */}
          <div className="flex items-center p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#0c121e]">
            <button
              type="button"
              onClick={() => handleViewChange('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Kanban Board (1)"
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>

            <button
              type="button"
              onClick={() => handleViewChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'list'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List / Table (2)"
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>List</span>
            </button>

            <button
              type="button"
              onClick={() => handleViewChange('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'calendar'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Calendar (3)"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <Link
            href={`/app/workspaces/${workspaceId}/projects/${projectId}/settings`}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Project Settings"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Shared Filter Bar */}
      <FilterBar projectId={projectId} showGroupBy={currentView === 'list'} />

      {/* Render Active View */}
      {currentView === 'kanban' && <KanbanBoard projectId={projectId} />}
      {currentView === 'list' && <TaskTableView projectId={projectId} />}
      {currentView === 'calendar' && <CalendarView projectId={projectId} />}
    </div>
  );
}
