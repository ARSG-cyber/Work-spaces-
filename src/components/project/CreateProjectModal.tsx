'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createProject } from '@/store/slices/projectSlice';
import { setColumns } from '@/store/slices/columnSlice';
import { createTask } from '@/store/slices/taskSlice';
import { setCreateProjectModalOpen, showAccessDenied } from '@/store/slices/uiSlice';
import { logActivity } from '@/store/slices/activitySlice';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/ui/Toast';
import { Project, ProjectTemplate } from '@/types/project';
import { KanbanColumn, Task } from '@/types/task';
import { PROJECT_TEMPLATES } from '@/services/mockData';
import { Avatar } from '@/components/common/Avatar';
import { Sparkles, Check } from 'lucide-react';

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

export function CreateProjectModal() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();

  const isOpen = useAppSelector((s) => s.ui.createProjectModalOpen);
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);
  const activeWorkspace = useAppSelector((s) => s.workspace.workspaces[activeWorkspaceId]);
  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('⚡');
  const [color, setColor] = useState('#6366f1');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>(
    currentUser ? [currentUser.id] : []
  );

  if (!isOpen || !activeWorkspace) return null;

  // Workspace members
  const workspaceUsers = mockUsers.filter((u) =>
    activeWorkspace.members.some((m) => m.userId === u.id)
  );

  const toggleMember = (userId: string) => {
    setAssignedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleTemplateSelect = (template: ProjectTemplate) => {
    if (selectedTemplateId === template.id) {
      setSelectedTemplateId(null);
    } else {
      setSelectedTemplateId(template.id);
      setName(template.name);
      setDescription(template.description);
      setIcon(template.icon);
      setColor(template.color);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    if (currentUser.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'create a project' }));
      return;
    }

    const newProjectId = `proj-${Date.now()}`;
    const newProject: Project = {
      id: newProjectId,
      workspaceId: activeWorkspaceId,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      isArchived: false,
      memberIds: assignedMemberIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch(createProject(newProject));

    // Handle template columns & tasks if template was chosen
    const chosenTemplate = PROJECT_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (chosenTemplate) {
      const newColumns: KanbanColumn[] = chosenTemplate.columns.map((colName, idx) => ({
        id: `col-${newProjectId}-${idx}`,
        projectId: newProjectId,
        name: colName,
        color: idx === chosenTemplate.columns.length - 1 ? '#10b981' : '#6366f1',
        order: idx,
      }));

      dispatch(setColumns({ [newProjectId]: newColumns }));

      // Create initial tasks from template
      chosenTemplate.initialTasks.forEach((t, idx) => {
        const taskId = `task-${newProjectId}-${idx}`;
        const task: Task = {
          id: taskId,
          projectId: newProjectId,
          workspaceId: activeWorkspaceId,
          title: t.title,
          description: t.description,
          status: t.statusColumnName,
          priority: t.priority,
          dueDate: new Date(Date.now() + (idx + 2) * 86400000).toISOString().split('T')[0],
          assigneeId: assignedMemberIds[idx % assignedMemberIds.length] || currentUser.id,
          labels: t.labels,
          subtasks: (t.subtasks || []).map((subTitle, sIdx) => ({
            id: `sub-${taskId}-${sIdx}`,
            parentId: null,
            title: subTitle,
            completed: false,
          })),
          attachments: [],
          order: idx,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        dispatch(createTask(task));
      });
    } else {
      // Default columns
      const defaultCols: KanbanColumn[] = [
        { id: `col-${newProjectId}-0`, projectId: newProjectId, name: 'To Do', color: '#94a3b8', order: 0 },
        { id: `col-${newProjectId}-1`, projectId: newProjectId, name: 'In Progress', color: '#3b82f6', order: 1 },
        { id: `col-${newProjectId}-2`, projectId: newProjectId, name: 'In Review', color: '#a855f7', order: 2 },
        { id: `col-${newProjectId}-3`, projectId: newProjectId, name: 'Done', color: '#10b981', order: 3 },
      ];
      dispatch(setColumns({ [newProjectId]: defaultCols }));
    }

    dispatch(
      logActivity({
        id: `act-${Date.now()}`,
        projectId: newProjectId,
        projectName: newProject.name,
        workspaceId: activeWorkspaceId,
        actorId: currentUser.id,
        actionType: 'project_created',
        details: `created project "${newProject.name}"`,
        timestamp: new Date().toISOString(),
      })
    );

    toast.success('Project Created', `Started "${newProject.name}"`);
    dispatch(setCreateProjectModalOpen(false));
    router.push(`/app/workspaces/${activeWorkspaceId}/projects/${newProjectId}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(setCreateProjectModalOpen(false))}
      title="Create New Project"
      description={`Add a project to ${activeWorkspace.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Templates Picker Carousel */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Choose a Predefined Template (Optional)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PROJECT_TEMPLATES.map((template) => {
              const isSelected = selectedTemplateId === template.id;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 dark:border-indigo-500 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'
                  }`}
                >
                  <div className="text-xl mb-1">{template.icon}</div>
                  <p className="text-xs font-semibold leading-snug truncate">{template.name}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {template.initialTasks.length} tasks
                  </p>
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px]">
                      <Check className="w-2.5 h-2.5" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Project Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. NextGen Mobile Client, Q4 Marketing Campaign..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief purpose, milestones, or deliverables for this project..."
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
              Tagging Color
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

        {/* Workspace Member Assignment */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Assign Workspace Members
          </label>
          <div className="flex flex-wrap gap-2">
            {workspaceUsers.map((user) => {
              const isAssigned = assignedMemberIds.includes(user.id);
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => toggleMember(user.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    isAssigned
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Avatar name={user.name} avatar={user.avatar} size="xs" />
                  <span>{user.name}</span>
                  {isAssigned && <Check className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => dispatch(setCreateProjectModalOpen(false))}
            className="py-2 px-4 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            Create Project
          </button>
        </div>
      </form>
    </Modal>
  );
}
