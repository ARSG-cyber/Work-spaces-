'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector, useHistory } from '@/store/hooks';
import {
  setActiveTaskDetailId,
  showConfirmDialog,
  showAccessDenied,
} from '@/store/slices/uiSlice';
import {
  updateTask,
  duplicateTask,
  convertTaskToSubtask,
} from '@/store/slices/taskSlice';
import { logActivity } from '@/store/slices/activitySlice';
import { TaskPriority } from '@/types/task';
import { Avatar } from '@/components/common/Avatar';
import { PriorityBadge, TagChip } from '@/components/common/Badge';
import { SubtaskTree } from '@/components/task/SubtaskTree';
import { AttachmentManager } from '@/components/task/AttachmentManager';
import { CommentThread } from '@/components/comments/CommentThread';
import { useToast } from '@/components/ui/Toast';
import { formatDistanceToNow } from 'date-fns';
import {
  X,
  Copy,
  Trash2,
  Calendar,
  User,
  Tag,
  History,
  Activity,
  CornerDownRight,
  MoreHorizontal,
} from 'lucide-react';

export function TaskDetailModal() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { captureHistory } = useHistory();

  const activeTaskId = useAppSelector((s) => s.ui.activeTaskDetailId);
  const task = useAppSelector((s) => (activeTaskId ? s.task.tasks[activeTaskId] : null));
  const allTasks = useAppSelector((s) => s.task.tasks);
  const activeWorkspace = useAppSelector(
    (s) => (task ? s.workspace.workspaces[task.workspaceId] : null)
  );
  const columns = useAppSelector((s) => (task ? s.column.columns[task.projectId] || [] : []));
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const activities = useAppSelector((s) =>
    s.activity.activities.filter((a) => a.taskId === activeTaskId)
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [showConvertToSubtask, setShowConvertToSubtask] = useState(false);
  const [targetParentId, setTargetParentId] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'activity'>('details');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task]);

  if (!activeTaskId || !task || !activeWorkspace) return null;

  const workspaceUsers = mockUsers.filter((u) =>
    activeWorkspace.members.some((m) => m.userId === u.id)
  );

  const handleTitleBlur = () => {
    if (title.trim() && title !== task.title) {
      captureHistory(`Renamed task to "${title}"`);
      dispatch(updateTask({ id: task.id, updates: { title: title.trim() } }));
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== task.description) {
      dispatch(updateTask({ id: task.id, updates: { description } }));
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus !== task.status) {
      captureHistory(`Changed status to ${newStatus}`);
      dispatch(updateTask({ id: task.id, updates: { status: newStatus } }));
      dispatch(
        logActivity({
          id: `act-${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          workspaceId: task.workspaceId,
          actorId: currentUser?.id || 'user-1',
          actionType: 'status_changed',
          details: `changed status to "${newStatus}"`,
          timestamp: new Date().toISOString(),
        })
      );
      toast.info('Status Updated', newStatus);
    }
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    if (newPriority !== task.priority) {
      captureHistory(`Changed priority to ${newPriority}`);
      dispatch(updateTask({ id: task.id, updates: { priority: newPriority } }));
      dispatch(
        logActivity({
          id: `act-${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          workspaceId: task.workspaceId,
          actorId: currentUser?.id || 'user-1',
          actionType: 'priority_changed',
          details: `changed priority to "${newPriority}"`,
          timestamp: new Date().toISOString(),
        })
      );
      toast.info('Priority Updated', newPriority);
    }
  };

  const handleAssigneeChange = (newAssigneeId: string | null) => {
    if (newAssigneeId !== task.assigneeId) {
      const assignedUser = mockUsers.find((u) => u.id === newAssigneeId);
      captureHistory(`Assigned to ${assignedUser?.name || 'Unassigned'}`);
      dispatch(updateTask({ id: task.id, updates: { assigneeId: newAssigneeId } }));
      dispatch(
        logActivity({
          id: `act-${Date.now()}`,
          taskId: task.id,
          taskTitle: task.title,
          projectId: task.projectId,
          workspaceId: task.workspaceId,
          actorId: currentUser?.id || 'user-1',
          actionType: 'assignee_changed',
          details: `assigned task to ${assignedUser?.name || 'Unassigned'}`,
          timestamp: new Date().toISOString(),
        })
      );
      toast.info('Assignee Updated', assignedUser?.name || 'Unassigned');
    }
  };

  const handleDueDateChange = (newDueDate: string) => {
    captureHistory(`Updated due date to ${newDueDate}`);
    dispatch(updateTask({ id: task.id, updates: { dueDate: newDueDate || null } }));
    toast.info('Due Date Updated');
  };

  const handleAddLabel = () => {
    const val = newLabel.trim().replace(/^#/, '');
    if (val && !task.labels.includes(val)) {
      dispatch(updateTask({ id: task.id, updates: { labels: [...task.labels, val] } }));
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (lbl: string) => {
    dispatch(
      updateTask({ id: task.id, updates: { labels: task.labels.filter((l) => l !== lbl) } })
    );
  };

  const handleDuplicate = () => {
    dispatch(duplicateTask(task.id));
    toast.success('Task Duplicated', `Created a copy of "${task.title}"`);
    dispatch(setActiveTaskDetailId(null));
  };

  const handleDelete = () => {
    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'delete tasks' }));
      return;
    }
    dispatch(
      showConfirmDialog({
        title: 'Delete Task',
        message: `Are you sure you want to permanently delete "${task.title}"?`,
        confirmLabel: 'Delete Task',
        isDestructive: true,
        actionType: 'delete_task',
        payload: { taskId: task.id },
      })
    );
    dispatch(setActiveTaskDetailId(null));
  };

  const handleConvertToSubtask = () => {
    if (!targetParentId) return;
    dispatch(convertTaskToSubtask({ taskId: task.id, targetParentTaskId: targetParentId }));
    toast.success('Converted to Subtask');
    dispatch(setActiveTaskDetailId(null));
  };

  // Other tasks in this project eligible to be parents
  const potentialParents = Object.values(allTasks).filter(
    (t) => t.projectId === task.projectId && t.id !== task.id
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => dispatch(setActiveTaskDetailId(null))}
      />

      {/* Slide-out Panel */}
      <div className="relative w-full max-w-2xl h-full bg-white dark:bg-[#0c121e] text-slate-900 dark:text-slate-100 shadow-2xl border-l border-slate-200 dark:border-slate-800 z-10 flex flex-col transition-transform duration-200 animate-in slide-in-from-right">
        {/* Top Header & Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 dark:border-slate-800">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('details')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'details'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Task Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('activity')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Activity History ({activities.length})</span>
            </button>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleDuplicate}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Duplicate Task"
            >
              <Copy className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowConvertToSubtask(!showConvertToSubtask)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Convert to Subtask"
            >
              <CornerDownRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => dispatch(setActiveTaskDetailId(null))}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ml-2"
              aria-label="Close task details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Convert to Subtask Inline Popover */}
        {showConvertToSubtask && (
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/60 text-xs flex flex-col gap-2 animate-in slide-in-from-top-2">
            <p className="font-semibold text-indigo-900 dark:text-indigo-200">
              Convert "{task.title}" into a subtask of another task:
            </p>
            <div className="flex gap-2">
              <select
                value={targetParentId}
                onChange={(e) => setTargetParentId(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs"
              >
                <option value="">Select target parent task...</option>
                {potentialParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!targetParentId}
                onClick={handleConvertToSubtask}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs disabled:opacity-50 cursor-pointer"
              >
                Convert
              </button>
              <button
                type="button"
                onClick={() => setShowConvertToSubtask(false)}
                className="px-2 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tab Content: Details vs Activity Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'activity' ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Audit Trail & History
              </h4>
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No recorded activity for this task yet.</p>
              ) : (
                <div className="space-y-3 relative pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                  {activities.map((act) => {
                    const actor = mockUsers.find((u) => u.id === act.actorId);
                    return (
                      <div key={act.id} className="relative text-xs">
                        <div className="absolute -left-[21px] top-0.5 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-4 ring-white dark:ring-[#0c121e]" />
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {actor?.name || 'Someone'}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400">
                            {act.details}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {formatDistanceToNow(new Date(act.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Task Title Inline Edit */}
              <div>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="w-full text-xl font-bold bg-transparent text-slate-900 dark:text-white outline-none border-b border-transparent focus:border-indigo-500/40 pb-1"
                  placeholder="Task title..."
                />
              </div>

              {/* Properties Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-xs">
                {/* Status */}
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Status
                  </span>
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    {columns.map((col) => (
                      <option key={col.id} value={col.name}>
                        {col.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Priority
                  </span>
                  <select
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                    className="w-full font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 outline-none text-slate-800 dark:text-slate-200 cursor-pointer capitalize"
                  >
                    {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Assignee
                  </span>
                  <select
                    value={task.assigneeId || ''}
                    onChange={(e) => handleAssigneeChange(e.target.value || null)}
                    className="w-full font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="">Unassigned</option>
                    {workspaceUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Due Date
                  </span>
                  <input
                    type="date"
                    value={task.dueDate || ''}
                    onChange={(e) => handleDueDateChange(e.target.value)}
                    className="w-full font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 outline-none text-slate-800 dark:text-slate-200 cursor-pointer"
                  />
                </div>
              </div>

              {/* Labels Section */}
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Labels</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {task.labels.map((lbl) => (
                    <TagChip
                      key={lbl}
                      label={lbl}
                      onRemove={() => handleRemoveLabel(lbl)}
                    />
                  ))}
                  <div className="flex items-center gap-1">
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
                      placeholder="+ Label"
                      className="w-20 px-2 py-0.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </span>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  placeholder="Add details, markdown, or requirements..."
                  className="w-full p-3 text-xs bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-slate-800 dark:text-slate-200 resize-none leading-relaxed"
                />
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Subtasks Component */}
              <SubtaskTree taskId={task.id} subtasks={task.subtasks} />

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Attachments Component */}
              <AttachmentManager taskId={task.id} attachments={task.attachments} />

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Comments Thread */}
              <CommentThread
                taskId={task.id}
                taskTitle={task.title}
                projectId={task.projectId}
                workspaceId={task.workspaceId}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
