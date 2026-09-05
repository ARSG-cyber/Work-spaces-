export type NotificationType = 'assignment' | 'mention' | 'due_date' | 'system';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  taskId?: string;
  projectId?: string;
  workspaceId?: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  emailAlerts?: boolean;
  assignment: boolean;
  mention: boolean;
  dueDate: boolean;
  system: boolean;
}
