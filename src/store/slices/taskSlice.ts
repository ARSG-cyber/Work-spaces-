import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, Subtask, Attachment, TaskPriority } from '@/types/task';
import { INITIAL_TASKS } from '@/services/mockData';

export interface TaskState {
  tasks: Record<string, Task>;
  selectedTaskIds: string[]; // for bulk operations
}

const initialState: TaskState = {
  tasks: INITIAL_TASKS,
  selectedTaskIds: [],
};

// Recursive helper for subtask toggling / updating
function updateSubtaskRecursively(
  subtasks: Subtask[],
  subtaskId: string,
  updater: (sub: Subtask) => Subtask
): Subtask[] {
  return subtasks.map((sub) => {
    if (sub.id === subtaskId) {
      return updater(sub);
    }
    if (sub.children && sub.children.length > 0) {
      return {
        ...sub,
        children: updateSubtaskRecursively(sub.children, subtaskId, updater),
      };
    }
    return sub;
  });
}

// Recursive helper for removing a subtask
function removeSubtaskRecursively(subtasks: Subtask[], subtaskId: string): Subtask[] {
  return subtasks
    .filter((sub) => sub.id !== subtaskId)
    .map((sub) => {
      if (sub.children && sub.children.length > 0) {
        return {
          ...sub,
          children: removeSubtaskRecursively(sub.children, subtaskId),
        };
      }
      return sub;
    });
}

// Recursive helper for inserting a child subtask
function insertChildSubtask(
  subtasks: Subtask[],
  parentId: string,
  newSubtask: Subtask
): Subtask[] {
  return subtasks.map((sub) => {
    if (sub.id === parentId) {
      return {
        ...sub,
        children: [...(sub.children || []), newSubtask],
      };
    }
    if (sub.children && sub.children.length > 0) {
      return {
        ...sub,
        children: insertChildSubtask(sub.children, parentId, newSubtask),
      };
    }
    return sub;
  });
}

// Recursive helper to find a subtask by id
function findSubtaskById(subtasks: Subtask[], id: string): Subtask | null {
  for (const s of subtasks) {
    if (s.id === id) return s;
    if (s.children && s.children.length > 0) {
      const found = findSubtaskById(s.children, id);
      if (found) return found;
    }
  }
  return null;
}

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Record<string, Task>>) => {
      state.tasks = action.payload;
    },
    createTask: (state, action: PayloadAction<Task>) => {
      state.tasks[action.payload.id] = action.payload;
    },
    updateTask: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Task> }>
    ) => {
      const { id, updates } = action.payload;
      if (state.tasks[id]) {
        state.tasks[id] = {
          ...state.tasks[id],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      delete state.tasks[action.payload];
      state.selectedTaskIds = state.selectedTaskIds.filter((id) => id !== action.payload);
    },
    duplicateTask: (state, action: PayloadAction<string>) => {
      const original = state.tasks[action.payload];
      if (original) {
        const newId = `task-${Date.now()}`;
        const cloned: Task = {
          ...original,
          id: newId,
          title: `${original.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtasks: JSON.parse(JSON.stringify(original.subtasks)),
          attachments: JSON.parse(JSON.stringify(original.attachments)),
        };
        state.tasks[newId] = cloned;
      }
    },
    moveTaskColumn: (
      state,
      action: PayloadAction<{ taskId: string; newStatus: string; newOrder?: number }>
    ) => {
      const { taskId, newStatus, newOrder } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        task.status = newStatus;
        if (typeof newOrder === 'number') {
          task.order = newOrder;
        }
        task.updatedAt = new Date().toISOString();
      }
    },
    toggleTaskComplete: (state, action: PayloadAction<string>) => {
      const task = state.tasks[action.payload];
      if (task) {
        task.status = task.status === 'Done' ? 'In Progress' : 'Done';
        task.updatedAt = new Date().toISOString();
      }
    },
    // Subtask actions
    addSubtask: (
      state,
      action: PayloadAction<{ taskId: string; parentId: string | null; title: string }>
    ) => {
      const { taskId, parentId, title } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        const newSubtask: Subtask = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          parentId,
          title,
          completed: false,
          children: [],
        };
        if (!parentId) {
          task.subtasks.push(newSubtask);
        } else {
          task.subtasks = insertChildSubtask(task.subtasks, parentId, newSubtask);
        }
        task.updatedAt = new Date().toISOString();
      }
    },
    toggleSubtask: (
      state,
      action: PayloadAction<{ taskId: string; subtaskId: string }>
    ) => {
      const { taskId, subtaskId } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        task.subtasks = updateSubtaskRecursively(task.subtasks, subtaskId, (s) => ({
          ...s,
          completed: !s.completed,
        }));
        task.updatedAt = new Date().toISOString();
      }
    },
    updateSubtaskTitle: (
      state,
      action: PayloadAction<{ taskId: string; subtaskId: string; title: string }>
    ) => {
      const { taskId, subtaskId, title } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        task.subtasks = updateSubtaskRecursively(task.subtasks, subtaskId, (s) => ({
          ...s,
          title,
        }));
        task.updatedAt = new Date().toISOString();
      }
    },
    deleteSubtask: (
      state,
      action: PayloadAction<{ taskId: string; subtaskId: string }>
    ) => {
      const { taskId, subtaskId } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        task.subtasks = removeSubtaskRecursively(task.subtasks, subtaskId);
        task.updatedAt = new Date().toISOString();
      }
    },
    convertSubtaskToTask: (
      state,
      action: PayloadAction<{ taskId: string; subtaskId: string }>
    ) => {
      const { taskId, subtaskId } = action.payload;
      const parentTask = state.tasks[taskId];
      if (parentTask) {
        const sub = findSubtaskById(parentTask.subtasks, subtaskId);
        if (sub) {
          // Remove from parent
          parentTask.subtasks = removeSubtaskRecursively(parentTask.subtasks, subtaskId);
          parentTask.updatedAt = new Date().toISOString();

          // Create new top-level task
          const newTaskId = `task-${Date.now()}`;
          const newTask: Task = {
            id: newTaskId,
            projectId: parentTask.projectId,
            workspaceId: parentTask.workspaceId,
            title: sub.title,
            description: `Converted from subtask of "${parentTask.title}"`,
            status: parentTask.status,
            priority: parentTask.priority,
            dueDate: parentTask.dueDate,
            assigneeId: parentTask.assigneeId,
            labels: [...parentTask.labels],
            subtasks: sub.children || [],
            attachments: [],
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          state.tasks[newTaskId] = newTask;
        }
      }
    },
    convertTaskToSubtask: (
      state,
      action: PayloadAction<{ taskId: string; targetParentTaskId: string }>
    ) => {
      const { taskId, targetParentTaskId } = action.payload;
      const taskToConvert = state.tasks[taskId];
      const targetTask = state.tasks[targetParentTaskId];
      if (taskToConvert && targetTask && taskId !== targetParentTaskId) {
        const newSubtask: Subtask = {
          id: `sub-${Date.now()}`,
          parentId: null,
          title: taskToConvert.title,
          completed: taskToConvert.status === 'Done',
          children: taskToConvert.subtasks,
        };
        targetTask.subtasks.push(newSubtask);
        targetTask.updatedAt = new Date().toISOString();
        delete state.tasks[taskId];
        state.selectedTaskIds = state.selectedTaskIds.filter((id) => id !== taskId);
      }
    },
    // Attachments
    addAttachment: (
      state,
      action: PayloadAction<{ taskId: string; attachment: Attachment }>
    ) => {
      const { taskId, attachment } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        task.attachments.push(attachment);
        task.updatedAt = new Date().toISOString();
      }
    },
    removeAttachment: (
      state,
      action: PayloadAction<{ taskId: string; attachmentId: string }>
    ) => {
      const { taskId, attachmentId } = action.payload;
      const task = state.tasks[taskId];
      if (task) {
        task.attachments = task.attachments.filter((a) => a.id !== attachmentId);
        task.updatedAt = new Date().toISOString();
      }
    },
    // Bulk operations
    toggleSelectTask: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      if (state.selectedTaskIds.includes(id)) {
        state.selectedTaskIds = state.selectedTaskIds.filter((tid) => tid !== id);
      } else {
        state.selectedTaskIds.push(id);
      }
    },
    selectAllTasks: (state, action: PayloadAction<string[]>) => {
      state.selectedTaskIds = action.payload;
    },
    clearSelectedTasks: (state) => {
      state.selectedTaskIds = [];
    },
    bulkUpdateStatus: (state, action: PayloadAction<{ status: string }>) => {
      state.selectedTaskIds.forEach((id) => {
        if (state.tasks[id]) {
          state.tasks[id].status = action.payload.status;
          state.tasks[id].updatedAt = new Date().toISOString();
        }
      });
      state.selectedTaskIds = [];
    },
    bulkUpdateAssignee: (state, action: PayloadAction<{ assigneeId: string | null }>) => {
      state.selectedTaskIds.forEach((id) => {
        if (state.tasks[id]) {
          state.tasks[id].assigneeId = action.payload.assigneeId;
          state.tasks[id].updatedAt = new Date().toISOString();
        }
      });
      state.selectedTaskIds = [];
    },
    bulkDeleteTasks: (state) => {
      state.selectedTaskIds.forEach((id) => {
        delete state.tasks[id];
      });
      state.selectedTaskIds = [];
    },
  },
});

export const {
  setTasks,
  createTask,
  updateTask,
  deleteTask,
  duplicateTask,
  moveTaskColumn,
  toggleTaskComplete,
  addSubtask,
  toggleSubtask,
  updateSubtaskTitle,
  deleteSubtask,
  convertSubtaskToTask,
  convertTaskToSubtask,
  addAttachment,
  removeAttachment,
  toggleSelectTask,
  selectAllTasks,
  clearSelectedTasks,
  bulkUpdateStatus,
  bulkUpdateAssignee,
  bulkDeleteTasks,
} = taskSlice.actions;

export default taskSlice.reducer;
