import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Comment } from '@/types/comment';
import { INITIAL_COMMENTS } from '@/services/mockData';

export interface CommentState {
  comments: Record<string, Comment[]>;
}

const initialState: CommentState = {
  comments: INITIAL_COMMENTS,
};

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    setComments: (state, action: PayloadAction<Record<string, Comment[]>>) => {
      state.comments = action.payload;
    },
    addComment: (state, action: PayloadAction<Comment>) => {
      const { taskId } = action.payload;
      if (!state.comments[taskId]) {
        state.comments[taskId] = [];
      }
      state.comments[taskId].push(action.payload);
    },
    updateComment: (
      state,
      action: PayloadAction<{ taskId: string; commentId: string; content: string }>
    ) => {
      const { taskId, commentId, content } = action.payload;
      if (state.comments[taskId]) {
        const comm = state.comments[taskId].find((c) => c.id === commentId);
        if (comm) {
          comm.content = content;
          comm.updatedAt = new Date().toISOString();
        }
      }
    },
    deleteComment: (
      state,
      action: PayloadAction<{ taskId: string; commentId: string }>
    ) => {
      const { taskId, commentId } = action.payload;
      if (state.comments[taskId]) {
        state.comments[taskId] = state.comments[taskId].filter((c) => c.id !== commentId);
      }
    },
  },
});

export const { setComments, addComment, updateComment, deleteComment } =
  commentSlice.actions;

export default commentSlice.reducer;
