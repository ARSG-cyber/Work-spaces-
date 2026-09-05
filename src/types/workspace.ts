import { UserRole } from './user';

export interface WorkspaceMember {
  userId: string;
  role: UserRole;
  joinedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  color: string;
  defaultView: 'kanban' | 'list' | 'calendar';
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  members: WorkspaceMember[];
}
