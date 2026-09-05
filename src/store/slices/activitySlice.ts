import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivityEvent } from '@/types/activity';
import { INITIAL_ACTIVITIES } from '@/services/mockData';

export interface ActivityState {
  activities: ActivityEvent[];
}

const initialState: ActivityState = {
  activities: INITIAL_ACTIVITIES,
};

export const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    setActivities: (state, action: PayloadAction<ActivityEvent[]>) => {
      state.activities = action.payload;
    },
    logActivity: (state, action: PayloadAction<ActivityEvent>) => {
      state.activities.unshift(action.payload);
      if (state.activities.length > 200) {
        state.activities.pop();
      }
    },
    clearActivities: (state) => {
      state.activities = [];
    },
  },
});

export const { setActivities, logActivity, clearActivities } =
  activitySlice.actions;

export default activitySlice.reducer;
