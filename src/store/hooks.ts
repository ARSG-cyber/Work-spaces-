import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './index';
import { recordHistory, popPast, pushFuture, popFuture } from './slices/historySlice';
import { setTasks } from './slices/taskSlice';
import { Task } from '@/types/task';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook to trigger Undo and Redo with snapshot restoration
export function useHistory() {
  const dispatch = useAppDispatch();
  const past = useAppSelector((s) => s.history.past);
  const future = useAppSelector((s) => s.history.future);
  const currentTasks = useAppSelector((s) => s.task.tasks);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = () => {
    if (!canUndo) return;
    const previousSnapshot = past[past.length - 1];
    // Push current tasks to future
    dispatch(
      pushFuture({
        description: previousSnapshot.description,
        tasksSnapshot: currentTasks,
      })
    );
    // Pop from past
    dispatch(popPast());
    // Restore tasks
    dispatch(setTasks(previousSnapshot.tasksSnapshot));
  };

  const redo = () => {
    if (!canRedo) return;
    const nextSnapshot = future[future.length - 1];
    // Push current tasks to past
    dispatch(
      recordHistory({
        description: nextSnapshot.description,
        tasksSnapshot: currentTasks,
      })
    );
    // Pop from future
    dispatch(popFuture());
    // Restore tasks
    dispatch(setTasks(nextSnapshot.tasksSnapshot));
  };

  const captureHistory = (description: string, tasksToRecord?: Record<string, Task>) => {
    dispatch(
      recordHistory({
        description,
        tasksSnapshot: tasksToRecord || currentTasks,
      })
    );
  };

  return { undo, redo, canUndo, canRedo, captureHistory };
}
