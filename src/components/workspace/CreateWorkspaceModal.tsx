'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createWorkspace } from '@/store/slices/workspaceSlice';
import { setCreateWorkspaceModalOpen, showAccessDenied } from '@/store/slices/uiSlice';
import { logActivity } from '@/store/slices/activitySlice';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/ui/Toast';
import { Workspace } from '@/types/workspace';
import { hasPermission } from '@/services/permissionService';

const ICONS = ['🚀', '⚡', '💼', '🎯', '🌐', '🛠️', '📈', '🎨', '🔒', '💡'];
const COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#64748b',
];

export function CreateWorkspaceModal() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const isOpen = useAppSelector((s) => s.ui.createWorkspaceModalOpen);
  const currentUser = useAppSelector((s) => s.auth.currentUser);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💼');
  const [color, setColor] = useState('#6366f1');
  const [defaultView, setDefaultView] = useState<'kanban' | 'list' | 'calendar'>('kanban');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!currentUser) return;

    // Viewers cannot create workspaces
    if (currentUser.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Member', actionName: 'create a new workspace' }));
      return;
    }

    const newWsId = `ws-${Date.now()}`;
    const newWorkspace: Workspace = {
      id: newWsId,
      name: name.trim(),
      icon,
      color,
      defaultView,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: currentUser.id,
      members: [
        {
          userId: currentUser.id,
          role: 'owner',
          joinedAt: new Date().toISOString(),
        },
      ],
    };

    dispatch(createWorkspace(newWorkspace));
    dispatch(
      logActivity({
        id: `act-${Date.now()}`,
        workspaceId: newWsId,
        actorId: currentUser.id,
        actionType: 'member_invited',
        details: `created workspace "${newWorkspace.name}"`,
        timestamp: new Date().toISOString(),
      })
    );

    toast.success('Workspace Created', `Switched to ${newWorkspace.name}`);
    dispatch(setCreateWorkspaceModalOpen(false));
    setName('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(setCreateWorkspaceModalOpen(false))}
      title="Create New Workspace"
      description="Workspaces organize projects, tasks, and team members"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Workspace Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Engineering, Design Studio..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        {/* Icon & Color Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Icon
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 rounded flex items-center justify-center text-base transition-transform cursor-pointer ${
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
              Accent Color
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Default View */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Default Project View
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['kanban', 'list', 'calendar'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setDefaultView(view)}
                className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-colors cursor-pointer ${
                  defaultView === view
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => dispatch(setCreateWorkspaceModalOpen(false))}
            className="py-2 px-4 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="py-2 px-4 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs"
          >
            Create Workspace
          </button>
        </div>
      </form>
    </Modal>
  );
}
