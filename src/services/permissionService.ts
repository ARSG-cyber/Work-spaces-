import { UserRole } from '@/types/user';

export type AppPermissionAction =
  | 'workspace:edit_settings'
  | 'workspace:delete'
  | 'workspace:manage_members'
  | 'project:create'
  | 'project:edit'
  | 'project:archive'
  | 'project:delete'
  | 'task:create'
  | 'task:edit'
  | 'task:delete'
  | 'task:move'
  | 'comment:create'
  | 'comment:delete_any'
  | 'column:manage';

const ROLE_PERMISSIONS: Record<UserRole, AppPermissionAction[]> = {
  owner: [
    'workspace:edit_settings',
    'workspace:delete',
    'workspace:manage_members',
    'project:create',
    'project:edit',
    'project:archive',
    'project:delete',
    'task:create',
    'task:edit',
    'task:delete',
    'task:move',
    'comment:create',
    'comment:delete_any',
    'column:manage',
  ],
  admin: [
    'workspace:edit_settings',
    'workspace:manage_members',
    'project:create',
    'project:edit',
    'project:archive',
    'project:delete',
    'task:create',
    'task:edit',
    'task:delete',
    'task:move',
    'comment:create',
    'comment:delete_any',
    'column:manage',
  ],
  member: [
    'project:create',
    'task:create',
    'task:edit',
    'task:delete',
    'task:move',
    'comment:create',
  ],
  viewer: [],
};

export function hasPermission(role: UserRole, action: AppPermissionAction): boolean {
  const allowedActions = ROLE_PERMISSIONS[role] || [];
  return allowedActions.includes(action);
}

export function getRequiredRoleForAction(action: AppPermissionAction): UserRole {
  if (action === 'workspace:delete') return 'owner';
  if (
    action === 'workspace:edit_settings' ||
    action === 'workspace:manage_members' ||
    action === 'project:edit' ||
    action === 'project:archive' ||
    action === 'project:delete' ||
    action === 'comment:delete_any' ||
    action === 'column:manage'
  ) {
    return 'admin';
  }
  return 'member';
}
