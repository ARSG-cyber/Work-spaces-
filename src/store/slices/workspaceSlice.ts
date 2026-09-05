import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace, WorkspaceMember } from '@/types/workspace';
import { UserRole } from '@/types/user';
import { INITIAL_WORKSPACES } from '@/services/mockData';

export interface WorkspaceState {
  workspaces: Record<string, Workspace>;
  activeWorkspaceId: string;
}

const initialWorkspacesRecord: Record<string, Workspace> = {};
INITIAL_WORKSPACES.forEach((w) => {
  initialWorkspacesRecord[w.id] = w;
});

const initialState: WorkspaceState = {
  workspaces: initialWorkspacesRecord,
  activeWorkspaceId: INITIAL_WORKSPACES[0]?.id || 'ws-1',
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<Record<string, Workspace>>) => {
      state.workspaces = action.payload;
    },
    setActiveWorkspaceId: (state, action: PayloadAction<string>) => {
      if (state.workspaces[action.payload]) {
        state.activeWorkspaceId = action.payload;
      }
    },
    createWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces[action.payload.id] = action.payload;
      state.activeWorkspaceId = action.payload.id;
    },
    updateWorkspace: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Workspace> }>
    ) => {
      const { id, updates } = action.payload;
      if (state.workspaces[id]) {
        state.workspaces[id] = {
          ...state.workspaces[id],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteWorkspace: (state, action: PayloadAction<string>) => {
      delete state.workspaces[action.payload];
      const remainingIds = Object.keys(state.workspaces);
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = remainingIds[0] || '';
      }
    },
    addWorkspaceMember: (
      state,
      action: PayloadAction<{ workspaceId: string; member: WorkspaceMember }>
    ) => {
      const { workspaceId, member } = action.payload;
      const ws = state.workspaces[workspaceId];
      if (ws) {
        const existingIdx = ws.members.findIndex((m) => m.userId === member.userId);
        if (existingIdx >= 0) {
          ws.members[existingIdx] = member;
        } else {
          ws.members.push(member);
        }
        ws.updatedAt = new Date().toISOString();
      }
    },
    updateMemberRole: (
      state,
      action: PayloadAction<{ workspaceId: string; userId: string; role: UserRole }>
    ) => {
      const { workspaceId, userId, role } = action.payload;
      const ws = state.workspaces[workspaceId];
      if (ws) {
        const member = ws.members.find((m) => m.userId === userId);
        if (member) {
          member.role = role;
          ws.updatedAt = new Date().toISOString();
        }
      }
    },
    removeWorkspaceMember: (
      state,
      action: PayloadAction<{ workspaceId: string; userId: string }>
    ) => {
      const { workspaceId, userId } = action.payload;
      const ws = state.workspaces[workspaceId];
      if (ws) {
        ws.members = ws.members.filter((m) => m.userId !== userId);
        ws.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  setWorkspaces,
  setActiveWorkspaceId,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addWorkspaceMember,
  updateMemberRole,
  removeWorkspaceMember,
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
