import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/types/project';
import { INITIAL_PROJECTS } from '@/services/mockData';

export interface ProjectState {
  projects: Record<string, Project>;
}

const initialProjectsRecord: Record<string, Project> = {};
INITIAL_PROJECTS.forEach((p) => {
  initialProjectsRecord[p.id] = p;
});

const initialState: ProjectState = {
  projects: initialProjectsRecord,
};

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Record<string, Project>>) => {
      state.projects = action.payload;
    },
    createProject: (state, action: PayloadAction<Project>) => {
      state.projects[action.payload.id] = action.payload;
    },
    updateProject: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Project> }>
    ) => {
      const { id, updates } = action.payload;
      if (state.projects[id]) {
        state.projects[id] = {
          ...state.projects[id],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    archiveProject: (state, action: PayloadAction<string>) => {
      if (state.projects[action.payload]) {
        state.projects[action.payload].isArchived = true;
        state.projects[action.payload].updatedAt = new Date().toISOString();
      }
    },
    unarchiveProject: (state, action: PayloadAction<string>) => {
      if (state.projects[action.payload]) {
        state.projects[action.payload].isArchived = false;
        state.projects[action.payload].updatedAt = new Date().toISOString();
      }
    },
    deleteProject: (state, action: PayloadAction<string>) => {
      delete state.projects[action.payload];
    },
    toggleProjectMember: (
      state,
      action: PayloadAction<{ projectId: string; userId: string }>
    ) => {
      const { projectId, userId } = action.payload;
      const proj = state.projects[projectId];
      if (proj) {
        if (proj.memberIds.includes(userId)) {
          proj.memberIds = proj.memberIds.filter((id) => id !== userId);
        } else {
          proj.memberIds.push(userId);
        }
        proj.updatedAt = new Date().toISOString();
      }
    },
  },
});

export const {
  setProjects,
  createProject,
  updateProject,
  archiveProject,
  unarchiveProject,
  deleteProject,
  toggleProjectMember,
} = projectSlice.actions;

export default projectSlice.reducer;
