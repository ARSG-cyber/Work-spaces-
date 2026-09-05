export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  mentions: string[];
  createdAt: string;
  updatedAt: string;
}
