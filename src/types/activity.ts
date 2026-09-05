export type ActivityActionType =
  | 'task_created'
  | 'task_updated'
  | 'status_changed'
  | 'assignee_changed'
  | 'priority_changed'
  | 'subtask_toggled'
  | 'comment_added'
  | 'task_deleted'
  | 'project_created'
  | 'project_archived'
  | 'member_invited';

export interface ActivityEvent {
  id: string;
  taskId?: string;
  taskTitle?: string;
  projectId?: string;
  projectName?: string;
  workspaceId: string;
  actorId: string;
  actionType: ActivityActionType;
  details: string;
  timestamp: string;
}
