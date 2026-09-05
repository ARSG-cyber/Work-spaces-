import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types/user';
import { INITIAL_USERS } from '@/services/mockData';

export interface AuthState {
  currentUser: User | null;
  mockUsers: User[];
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: INITIAL_USERS[0],
  mockUsers: INITIAL_USERS,
  isAuthenticated: true,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.loading = false;
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    switchUser: (state, action: PayloadAction<string>) => {
      const found = state.mockUsers.find((u) => u.id === action.payload);
      if (found) {
        state.currentUser = found;
        state.isAuthenticated = true;
      }
    },
    updateProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
        // also update in mockUsers list
        state.mockUsers = state.mockUsers.map((u) =>
          u.id === state.currentUser?.id ? { ...u, ...action.payload } : u
        );
      }
    },
    setMockUsers: (state, action: PayloadAction<User[]>) => {
      state.mockUsers = action.payload;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  switchUser,
  updateProfile,
  setMockUsers,
} = authSlice.actions;

export default authSlice.reducer;
