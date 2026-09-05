import { Workspace } from '@/types/workspace';
import { Project } from '@/types/project';
import { Task, KanbanColumn, Attachment } from '@/types/task';
import { Comment } from '@/types/comment';
import { ActivityEvent } from '@/types/activity';
import { AppNotification, NotificationPreferences } from '@/types/notification';
import { FilterPreset } from '@/types/filter';
import { User } from '@/types/user';
import {
  INITIAL_USERS,
  INITIAL_WORKSPACES,
  INITIAL_PROJECTS,
  INITIAL_COLUMNS,
  INITIAL_TASKS,
  INITIAL_COMMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
} from './mockData';

export const APP_STORAGE_KEY = 'WORKSPACE_MANAGER_STATE_V1';

export interface AppPersistedState {
  version: number;
  users: User[];
  currentUserId: string;
  workspaces: Record<string, Workspace>;
  activeWorkspaceId: string;
  projects: Record<string, Project>;
  columns: Record<string, KanbanColumn[]>;
  tasks: Record<string, Task>;
  comments: Record<string, Comment[]>;
  activities: ActivityEvent[];
  notifications: AppNotification[];
  filterPresets: FilterPreset[];
  notificationPreferences: NotificationPreferences;
  projectViews: Record<string, 'kanban' | 'list' | 'calendar'>;
  theme: 'light' | 'dark';
}

export function getDefaultPersistedState(): AppPersistedState {
  const workspacesRecord: Record<string, Workspace> = {};
  INITIAL_WORKSPACES.forEach((w) => {
    workspacesRecord[w.id] = w;
  });

  const projectsRecord: Record<string, Project> = {};
  INITIAL_PROJECTS.forEach((p) => {
    projectsRecord[p.id] = p;
  });

  return {
    version: 1,
    users: INITIAL_USERS,
    currentUserId: 'user-1',
    workspaces: workspacesRecord,
    activeWorkspaceId: 'ws-1',
    projects: projectsRecord,
    columns: INITIAL_COLUMNS,
    tasks: INITIAL_TASKS,
    comments: INITIAL_COMMENTS,
    activities: INITIAL_ACTIVITIES,
    notifications: INITIAL_NOTIFICATIONS,
    filterPresets: [
      {
        id: 'preset-1',
        workspaceId: 'ws-1',
        name: 'Urgent Tasks',
        filters: {
          searchQuery: '',
          assigneeFilter: [],
          priorityFilter: ['urgent'],
          statusFilter: [],
          labelFilter: [],
          dueDateRange: 'all',
          sortBy: 'priority',
          sortDirection: 'desc',
          groupBy: 'status',
        },
        createdAt: new Date().toISOString(),
      },
    ],
    notificationPreferences: {
      emailAlerts: false,
      assignment: true,
      mention: true,
      dueDate: true,
      system: true,
    },
    projectViews: {
      'proj-1': 'kanban',
      'proj-2': 'kanban',
      'proj-3': 'list',
      'proj-5': 'calendar',
    },
    theme: 'dark',
  };
}

export function loadPersistedState(): AppPersistedState {
  if (typeof window === 'undefined') {
    return getDefaultPersistedState();
  }

  try {
    const raw = localStorage.getItem(APP_STORAGE_KEY);
    if (!raw) {
      const defaultState = getDefaultPersistedState();
      savePersistedState(defaultState);
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || !parsed.workspaces || !parsed.tasks) {
      console.warn('Persisted state invalid, resetting to default seed.');
      const defaultState = getDefaultPersistedState();
      savePersistedState(defaultState);
      return defaultState;
    }

    return parsed as AppPersistedState;
  } catch (error) {
    console.error('Error loading persisted state from localStorage:', error);
    return getDefaultPersistedState();
  }
}

export function savePersistedState(state: AppPersistedState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to persist app state to localStorage:', error);
  }
}

export function resetAllStorageData(): AppPersistedState {
  const defaultState = getDefaultPersistedState();
  savePersistedState(defaultState);
  return defaultState;
}

// ================= IndexedDB for Binary & Attachment Storage =================

const IDB_NAME = 'WorkspaceManagerFilesDB';
const IDB_VERSION = 1;
const IDB_STORE_NAME = 'attachments';

function openAttachmentsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = indexedDB.open(IDB_NAME, IDB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
        db.createObjectStore(IDB_STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function storeAttachmentInIDB(attachment: Attachment): Promise<void> {
  try {
    const db = await openAttachmentsDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(IDB_STORE_NAME);
      const req = store.put(attachment);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed; falling back to memory/state:', err);
  }
}

export async function getAttachmentFromIDB(id: string): Promise<Attachment | null> {
  try {
    const db = await openAttachmentsDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, 'readonly');
      const store = transaction.objectStore(IDB_STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read failed:', err);
    return null;
  }
}

export async function removeAttachmentFromIDB(id: string): Promise<void> {
  try {
    const db = await openAttachmentsDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(IDB_STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed:', err);
  }
}

// ================= Import & Export Validation =================

export interface ExportDataPayload {
  version: number;
  exportedAt: string;
  generator: string;
  data: {
    workspaces: Workspace[];
    projects: Project[];
    tasks: Task[];
    columns: KanbanColumn[];
    comments: Comment[];
    activities: ActivityEvent[];
    filterPresets: FilterPreset[];
    users: User[];
  };
}

export function generateWorkspaceExportData(state: AppPersistedState, workspaceId?: string): ExportDataPayload {
  const targetWorkspaces = workspaceId
    ? Object.values(state.workspaces).filter((w) => w.id === workspaceId)
    : Object.values(state.workspaces);

  const wsIds = new Set(targetWorkspaces.map((w) => w.id));
  const targetProjects = Object.values(state.projects).filter((p) => wsIds.has(p.workspaceId));
  const projIds = new Set(targetProjects.map((p) => p.id));
  const targetTasks = Object.values(state.tasks).filter((t) => projIds.has(t.projectId));
  const taskIds = new Set(targetTasks.map((t) => t.id));

  const targetColumns: KanbanColumn[] = [];
  Object.entries(state.columns).forEach(([pId, cols]) => {
    if (projIds.has(pId)) {
      targetColumns.push(...cols);
    }
  });

  const targetComments: Comment[] = [];
  Object.entries(state.comments).forEach(([tId, comms]) => {
    if (taskIds.has(tId)) {
      targetComments.push(...comms);
    }
  });

  const targetActivities = state.activities.filter((a) => wsIds.has(a.workspaceId));

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    generator: 'Acme Workspace Manager SaaS v1.0',
    data: {
      workspaces: targetWorkspaces,
      projects: targetProjects,
      tasks: targetTasks,
      columns: targetColumns,
      comments: targetComments,
      activities: targetActivities,
      filterPresets: state.filterPresets.filter((fp) => wsIds.has(fp.workspaceId)),
      users: state.users,
    },
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  summary?: {
    workspacesCount: number;
    projectsCount: number;
    tasksCount: number;
    commentsCount: number;
  };
}

export function validateImportJSON(jsonString: string): { result: ValidationResult; payload?: ExportDataPayload } {
  const errors: string[] = [];

  let parsed: any;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err: any) {
    return {
      result: {
        valid: false,
        errors: [`Invalid JSON format: ${err?.message || 'Syntax error'}`],
      },
    };
  }

  if (!parsed || typeof parsed !== 'object') {
    return { result: { valid: false, errors: ['Export payload must be a JSON object'] } };
  }

  if (typeof parsed.version !== 'number' || parsed.version < 1) {
    errors.push('Missing or incompatible schema version.');
  }

  if (!parsed.data || typeof parsed.data !== 'object') {
    errors.push('Missing payload "data" container object.');
    return { result: { valid: false, errors } };
  }

  const { workspaces, projects, tasks, columns } = parsed.data;

  if (!Array.isArray(workspaces) || workspaces.length === 0) {
    errors.push('The data contains no valid workspaces.');
  } else {
    workspaces.forEach((w: any, idx: number) => {
      if (!w.id || !w.name) {
        errors.push(`Workspace at index ${idx} is missing required fields (id, name).`);
      }
    });
  }

  if (projects && !Array.isArray(projects)) {
    errors.push('Field "projects" must be an array.');
  }

  if (tasks && !Array.isArray(tasks)) {
    errors.push('Field "tasks" must be an array.');
  }

  if (errors.length > 0) {
    return { result: { valid: false, errors } };
  }

  return {
    result: {
      valid: true,
      errors: [],
      summary: {
        workspacesCount: parsed.data.workspaces?.length || 0,
        projectsCount: parsed.data.projects?.length || 0,
        tasksCount: parsed.data.tasks?.length || 0,
        commentsCount: parsed.data.comments?.length || 0,
      },
    },
    payload: parsed as ExportDataPayload,
  };
}
