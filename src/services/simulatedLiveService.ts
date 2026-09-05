import { AppDispatch, RootState } from '@/store';
import { addComment } from '@/store/slices/commentSlice';
import { logActivity } from '@/store/slices/activitySlice';
import { addNotification } from '@/store/slices/notificationSlice';
import { moveTaskColumn } from '@/store/slices/taskSlice';

const SIMULATED_COMMENTS = [
  'Just reviewed the latest commit. Everything looks solid!',
  'Updated the technical specification in the shared drive.',
  'Tested the flow on mobile viewport. Touch targets feel great.',
  'Pushed an updated diagram for the auth handshake.',
  'Verified the contrast ratios on the dark cards — WCAG AA compliant.',
];

export function runLiveSimulationTick(dispatch: AppDispatch, getState: () => RootState) {
  const state = getState();
  if (!state.sync.simulatedLiveEnabled) return;

  const currentUserId = state.auth.currentUser?.id;
  const mockTeammates = state.auth.mockUsers.filter((u) => u.id !== currentUserId);
  if (mockTeammates.length === 0) return;

  const actor = mockTeammates[Math.floor(Math.random() * mockTeammates.length)];
  const allTasks = Object.values(state.task.tasks).filter(
    (t) => t.workspaceId === state.workspace.activeWorkspaceId
  );
  if (allTasks.length === 0) return;

  const randomTask = allTasks[Math.floor(Math.random() * allTasks.length)];
  const randomChoice = Math.random();

  if (randomChoice < 0.6) {
    // Add comment
    const commentText =
      SIMULATED_COMMENTS[Math.floor(Math.random() * SIMULATED_COMMENTS.length)];
    const newCommentId = `comm-${Date.now()}`;
    dispatch(
      addComment({
        id: newCommentId,
        taskId: randomTask.id,
        authorId: actor.id,
        content: commentText,
        mentions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );

    dispatch(
      logActivity({
        id: `act-${Date.now()}`,
        taskId: randomTask.id,
        taskTitle: randomTask.title,
        projectId: randomTask.projectId,
        workspaceId: randomTask.workspaceId,
        actorId: actor.id,
        actionType: 'comment_added',
        details: 'commented on task',
        timestamp: new Date().toISOString(),
      })
    );

    // If current user is assignee, send notification
    if (randomTask.assigneeId === currentUserId) {
      dispatch(
        addNotification({
          id: `notif-${Date.now()}`,
          userId: currentUserId,
          title: 'New Comment',
          message: `${actor.name} commented on "${randomTask.title}"`,
          type: 'mention',
          taskId: randomTask.id,
          projectId: randomTask.projectId,
          workspaceId: randomTask.workspaceId,
          read: false,
          createdAt: new Date().toISOString(),
        })
      );
    }
  } else {
    // Move status
    const currentCols = state.column.columns[randomTask.projectId] || [];
    if (currentCols.length > 1) {
      const otherCols = currentCols.filter((c) => c.name !== randomTask.status);
      const nextCol = otherCols[Math.floor(Math.random() * otherCols.length)];
      if (nextCol) {
        dispatch(
          moveTaskColumn({
            taskId: randomTask.id,
            newStatus: nextCol.name,
          })
        );
        dispatch(
          logActivity({
            id: `act-${Date.now()}`,
            taskId: randomTask.id,
            taskTitle: randomTask.title,
            projectId: randomTask.projectId,
            workspaceId: randomTask.workspaceId,
            actorId: actor.id,
            actionType: 'status_changed',
            details: `moved task to ${nextCol.name}`,
            timestamp: new Date().toISOString(),
          })
        );
      }
    }
  }
}
