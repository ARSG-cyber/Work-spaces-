export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Subtask {
  id: string;
  parentId: string | null;
  title: string;
  completed: boolean;
  children?: Subtask[];
}

export interface Attachment {
  id: string;
  taskId: string;
  name: string;
  size: number;
  type: string;
  dataUrl: string;
  createdAt: string;
}

export interface KanbanColumn {
  id: string;
  projectId: string;
  name: string;
  color: string;
  order: number;
}

export interface Task {
  id: string;
  projectId: string;
  workspaceId: string;
  title: string;
  description: string;
  status: string; // matches KanbanColumn id or name
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
  labels: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  order: number;
  createdAt: string;
  updatedAt: string;
}
