'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, useHistory } from '@/store/hooks';
import { createTask } from '@/store/slices/taskSlice';
import { setCreateTaskModalOpen, showAccessDenied } from '@/store/slices/uiSlice';
import { logActivity } from '@/store/slices/activitySlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/ui/Toast';
import { Task, TaskPriority, Subtask } from '@/types/task';
import { Avatar } from '@/components/common/Avatar';
import { PriorityBadge, TagChip } from '@/components/common/Badge';
import { Plus, X, Calendar, User, Tag } from 'lucide-react';

export function CreateTaskModal() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { captureHistory } = useHistory();

  const isOpen = useAppSelector((s) => s.ui.createTaskModalOpen);
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);
  const activeWorkspace = useAppSelector((s) => s.workspace.workspaces[activeWorkspaceId]);
  const projects = useAppSelector((s) =>
    Object.values(s.project.projects).filter(
      (p) => p.workspaceId === activeWorkspaceId && !p.isArchived
    )
  );
  const columns = useAppSelector((s) => s.column.columns);
  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [initialSubtasks, setInitialSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');

  // Default selected project & status on open
  useEffect(() => {
    if (isOpen && projects.length > 0) {
      const defaultProj = projects[0];
      setProjectId(defaultProj.id);
      const projCols = columns[defaultProj.id] || [];
      setStatus(projCols[0]?.name || 'Backlog');
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setAssigneeId(currentUser?.id || null);
      setLabels([]);
      setInitialSubtasks([]);
    }
  }, [isOpen, projects.length]);

  // When project changes, update status default
  const handleProjectChange = (pId: string) => {
    setProjectId(pId);
    const projCols = columns[pId] || [];
    setStatus(projCols[0]?.name || 'Backlog');
  };

  if (!isOpen || !activeWorkspace) return null;

  const currentCols = columns[projectId] || [];
  const workspaceUsers = mockUsers.filter((u) =>
    activeWorkspace.members.some((m) => m.userId === u.id)
  );

  const handleAddLabel = () => {
    const val = newLabel.trim().replace(/^#/, '');
    if (val && !labels.includes(val)) {
      setLabels([...labels, val]);
      setNewLabel('');
    }
  };

  const handleAddSubtask = () => {
    const val = newSubtask.trim();
    if (val) {
      setInitialSubtasks([...initialSubtasks, val]);
      setNewSubtask('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser || !projectId) return;

    if (currentUser.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'create tasks' }));
      return;
    }

    const newTaskId = `task-${Date.now()}`;
    const subtaskObjects: Subtask[] = initialSubtasks.map((stTitle, idx) => ({
      id: `sub-${newTaskId}-${idx}`,
      parentId: null,
      title: stTitle,
      completed: false,
    }));

    const newTask: Task = {
      id: newTaskId,
      projectId,
      workspaceId: activeWorkspaceId,
      title: title.trim(),
      description: description.trim(),
      status: status || 'To Do',
      priority,
      dueDate: dueDate || null,
      assigneeId,
      labels,
      subtasks: subtaskObjects,
      attachments: [],
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    captureHistory(`Created task "${newTask.title}"`);
    dispatch(createTask(newTask));

    dispatch(
      logActivity({
        id: `act-${Date.now()}`,
        taskId: newTaskId,
        taskTitle: newTask.title,
        projectId,
        workspaceId: activeWorkspaceId,
        actorId: currentUser.id,
        actionType: 'task_created',
        details: `created task "${newTask.title}"`,
        timestamp: new Date().toISOString(),
      })
    );

    // Notify assignee if different from creator
    if (assigneeId && assigneeId !== currentUser.id) {
      dispatch(
        addNotification({
          id: `notif-${Date.now()}`,
          userId: assigneeId,
          title: 'New Task Assignment',
          message: `${currentUser.name} assigned you to "${newTask.title}"`,
          type: 'assignment',
          taskId: newTaskId,
          projectId,
          workspaceId: activeWorkspaceId,
          read: false,
          createdAt: new Date().toISOString(),
        })
      );
    }

    toast.success('Task Created', `"${newTask.title}" has been added.`);
    dispatch(setCreateTaskModalOpen(false));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(setCreateTaskModalOpen(false))}
      title="Create New Task"
      description="Add a task with subtasks, assignees, and target deadlines"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement WebAuthn Biometric Support"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Project & Column Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => handleProjectChange(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initial Status / Column
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {currentCols.map((col) => (
                <option key={col.id} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority & Assignee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 capitalize"
            >
              {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                <option key={p} value={p}>
                  {p.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assignee
            </label>
            <select
              value={assigneeId || ''}
              onChange={(e) => setAssigneeId(e.target.value || null)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              <option value="">Unassigned</option>
              {workspaceUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
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
            placeholder="Technical details, acceptance criteria, or links..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none"
          />
        </div>

        {/* Labels / Tags Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Labels
          </label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {labels.map((lbl) => (
              <TagChip
                key={lbl}
                label={lbl}
                onRemove={() => setLabels(labels.filter((l) => l !== lbl))}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddLabel();
                }
              }}
              placeholder="Add a label (e.g. Backend, Design) and press Enter"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddLabel}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Add
            </button>
          </div>
        </div>

        {/* Checklist Subtasks */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Initial Subtasks
          </label>
          <div className="space-y-1 mb-2">
            {initialSubtasks.map((st, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-2.5 py-1.5 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <span>□ {st}</span>
                <button
                  type="button"
                  onClick={() =>
                    setInitialSubtasks(initialSubtasks.filter((_, idx) => idx !== i))
                  }
                  className="text-slate-400 hover:text-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask();
                }
              }}
              placeholder="Add checklist subtask..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAddSubtask}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Add Subtask
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => dispatch(setCreateTaskModalOpen(false))}
            className="py-2 px-4 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            Create Task
          </button>
        </div>
      </form>
    </Modal>
  );
}
