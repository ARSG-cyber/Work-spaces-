export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isArchived: boolean;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  columns: string[];
  initialTasks: Array<{
    title: string;
    description: string;
    priority: 'urgent' | 'high' | 'medium' | 'low';
    statusColumnName: string;
    labels: string[];
    subtasks?: string[];
  }>;
}
