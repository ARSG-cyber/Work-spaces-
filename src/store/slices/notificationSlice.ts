import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppNotification, NotificationPreferences } from '@/types/notification';
import { INITIAL_NOTIFICATIONS } from '@/services/mockData';

export interface NotificationState {
  notifications: AppNotification[];
  preferences: NotificationPreferences;
}

const initialState: NotificationState = {
  notifications: INITIAL_NOTIFICATIONS,
  preferences: {
    emailAlerts: false,
    assignment: true,
    mention: true,
    dueDate: true,
    system: true,
  },
};

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setNotifications: (state, action: PayloadAction<AppNotification[]>) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action: PayloadAction<AppNotification>) => {
      // Check if user has notification preference enabled for this type
      const type = action.payload.type;
      if (
        (type === 'assignment' && !state.preferences.assignment) ||
        (type === 'mention' && !state.preferences.mention) ||
        (type === 'due_date' && !state.preferences.dueDate) ||
        (type === 'system' && !state.preferences.system)
      ) {
        return;
      }
      state.notifications.unshift(action.payload);
      if (state.notifications.length > 50) {
        state.notifications.pop();
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notif = state.notifications.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((n) => {
        n.read = true;
      });
    },
    deleteNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<NotificationPreferences>>
    ) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
  },
});

export const {
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updatePreferences,
} = notificationSlice.actions;

export default notificationSlice.reducer;
