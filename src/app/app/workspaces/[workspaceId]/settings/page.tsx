'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  updateWorkspace,
  deleteWorkspace,
  updateMemberRole,
  removeWorkspaceMember,
  addWorkspaceMember,
} from '@/store/slices/workspaceSlice';
import { showConfirmDialog, showAccessDenied } from '@/store/slices/uiSlice';
import { UserRole } from '@/types/user';
import { Avatar } from '@/components/common/Avatar';
import { RoleBadge } from '@/components/common/Badge';
import { useToast } from '@/components/ui/Toast';
import {
  ArrowLeft,
  Save,
  ShieldAlert,
  UserPlus,
  Trash2,
  Users,
} from 'lucide-react';

interface WorkspaceSettingsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

const WS_ICONS = ['🚀', '⚡', '💼', '🎯', '🌐', '🛠️', '📈', '🎨', '🔒', '💡'];
const WS_COLORS = [
  '#6366f1',
  '#ec4899',
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#8b5cf6',
  '#06b6d4',
  '#64748b',
];

export default function WorkspaceSettingsPage({ params }: WorkspaceSettingsPageProps) {
  const resolvedParams = use(params);
  const { workspaceId } = resolvedParams;

  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();

  const workspace = useAppSelector((s) => s.workspace.workspaces[workspaceId]);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const currentUser = useAppSelector((s) => s.auth.currentUser);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('💼');
  const [color, setColor] = useState('#6366f1');
  const [defaultView, setDefaultView] = useState<'kanban' | 'list' | 'calendar'>('kanban');

  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedInviteUserId, setSelectedInviteUserId] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('member');

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
      setIcon(workspace.icon);
      setColor(workspace.color);
      setDefaultView(workspace.defaultView);
    }
  }, [workspace]);

  if (!workspace) {
    return <div className="p-8 text-center text-slate-500">Workspace not found.</div>;
  }

  const members = workspace.members.map((m) => {
    const user = mockUsers.find((u) => u.id === m.userId);
    return { ...m, user };
  });

  // Users eligible to be invited
  const nonMembers = mockUsers.filter(
    (u) => !workspace.members.some((m) => m.userId === u.id)
  );

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (currentUser?.role === 'viewer') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'edit workspace settings' }));
      return;
    }

    dispatch(
      updateWorkspace({
        id: workspace.id,
        updates: {
          name: name.trim(),
          icon,
          color,
          defaultView,
        },
      })
    );
    toast.success('Workspace Updated');
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (currentUser?.role !== 'owner' && currentUser?.role !== 'admin') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'manage member roles' }));
      return;
    }
    dispatch(updateMemberRole({ workspaceId: workspace.id, userId, role: newRole }));
    toast.info('Role Updated');
  };

  const handleRemoveMember = (userId: string, userName: string) => {
    if (currentUser?.role !== 'owner' && currentUser?.role !== 'admin') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'remove workspace members' }));
      return;
    }
    if (userId === workspace.ownerId) {
      toast.warning('Cannot Remove Owner', 'The workspace owner cannot be removed.');
      return;
    }
    dispatch(removeWorkspaceMember({ workspaceId: workspace.id, userId }));
    toast.info('Member Removed', `${userName} was removed from workspace.`);
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInviteUserId) return;

    if (currentUser?.role !== 'owner' && currentUser?.role !== 'admin') {
      dispatch(showAccessDenied({ requiredRole: 'Admin', actionName: 'invite members' }));
      return;
    }

    const targetUser = mockUsers.find((u) => u.id === selectedInviteUserId);
    dispatch(
      addWorkspaceMember({
        workspaceId: workspace.id,
        member: {
          userId: selectedInviteUserId,
          role: inviteRole,
          joinedAt: new Date().toISOString(),
        },
      })
    );

    toast.success('Member Invited', `${targetUser?.name} added as ${inviteRole}.`);
    setShowInviteModal(false);
    setSelectedInviteUserId('');
  };

  const handleDeleteWorkspace = () => {
    if (currentUser?.role !== 'owner') {
      dispatch(showAccessDenied({ requiredRole: 'Owner', actionName: 'delete this workspace' }));
      return;
    }

    dispatch(
      showConfirmDialog({
        title: 'Delete Workspace',
        message: `Permanently delete "${workspace.name}" and all of its associated projects and tasks? This action is catastrophic and irreversible.`,
        confirmLabel: 'Delete Workspace',
        isDestructive: true,
        actionType: 'delete_workspace',
        payload: { workspaceId: workspace.id },
      })
    );
    router.push('/app/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Back button & Title */}
      <div>
        <Link
          href={`/app/workspaces/${workspaceId}`}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace Overview</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Workspace Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure branding, manage team access, and view administrative controls.
        </p>
      </div>

      {/* General Settings */}
      <form
        onSubmit={handleSaveGeneral}
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] p-6 space-y-5 shadow-xs"
      >
        <h2 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Workspace Identity
        </h2>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Workspace Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
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
              {WS_ICONS.map((ic) => (
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
              Color Theme
            </label>
            <div className="flex flex-wrap gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              {WS_COLORS.map((c) => (
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
            Default View for New Projects
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['kanban', 'list', 'calendar'] as const).map((view) => (
              <button
                key={view}
                type="button"
                onClick={() => setDefaultView(view)}
                className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-colors cursor-pointer ${
                  defaultView === view
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-500 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Members & Roles Management */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Team Members ({members.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Assign roles to control who can view, edit, and administrate.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Member</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {members.map((m) => {
            if (!m.user) return null;
            const isOwner = m.userId === workspace.ownerId;
            return (
              <div
                key={m.userId}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <Avatar name={m.user.name} avatar={m.user.avatar} size="sm" />
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {m.user.name}
                    </p>
                    <p className="text-[11px] text-slate-400">{m.user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <select
                    value={m.role}
                    disabled={isOwner}
                    onChange={(e) => handleRoleChange(m.userId, e.target.value as UserRole)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold capitalize outline-none cursor-pointer disabled:opacity-60"
                  >
                    <option value="owner" disabled={!isOwner}>
                      Owner
                    </option>
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>

                  {!isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(m.userId, m.user?.name || '')}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Member Inline Dialog */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold">Invite Teammate to Workspace</h3>
            <p className="text-xs text-slate-500">
              Select a mock user to simulate an incoming invitation to this workspace.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">User</label>
                <select
                  required
                  value={selectedInviteUserId}
                  onChange={(e) => setSelectedInviteUserId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  <option value="">Select teammate to invite...</option>
                  {nonMembers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
                {nonMembers.length === 0 && (
                  <p className="text-[11px] text-amber-500 mt-1">
                    All mock users are already members of this workspace.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Assigned Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 capitalize"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedInviteUserId}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white disabled:opacity-50"
                >
                  Invite Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 p-6 space-y-4">
        <h2 className="text-base font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" />
          <span>Danger Zone</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
          <div>
            <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Delete Workspace
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Permanently delete this workspace, including all associated projects, columns, and tasks. Requires Owner role.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDeleteWorkspace}
            className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Delete Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
