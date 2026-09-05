'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideConfirmDialog } from '@/store/slices/uiSlice';
import { deleteTask } from '@/store/slices/taskSlice';
import { deleteProject } from '@/store/slices/projectSlice';
import { deleteWorkspace } from '@/store/slices/workspaceSlice';
import { deleteComment } from '@/store/slices/commentSlice';
import { deleteColumn } from '@/store/slices/columnSlice';
import { resetAllStorageData } from '@/services/storageService';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/ui/Toast';

export function ConfirmDialog() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const confirmState = useAppSelector((s) => s.ui.confirmDialog);

  if (!confirmState.isOpen) return null;

  const handleConfirm = () => {
    const { actionType, payload } = confirmState;

    if (actionType === 'delete_task' && payload?.taskId) {
      dispatch(deleteTask(payload.taskId));
      toast.success('Task Deleted', 'Task has been permanently removed.');
    } else if (actionType === 'delete_project' && payload?.projectId) {
      dispatch(deleteProject(payload.projectId));
      toast.success('Project Deleted', 'Project was deleted from workspace.');
    } else if (actionType === 'delete_workspace' && payload?.workspaceId) {
      dispatch(deleteWorkspace(payload.workspaceId));
      toast.success('Workspace Deleted', 'Workspace was removed.');
    } else if (actionType === 'delete_comment' && payload?.taskId && payload?.commentId) {
      dispatch(deleteComment({ taskId: payload.taskId, commentId: payload.commentId }));
      toast.success('Comment Deleted');
    } else if (actionType === 'delete_column' && payload?.projectId && payload?.columnId) {
      dispatch(deleteColumn({ projectId: payload.projectId, columnId: payload.columnId }));
      toast.success('Column Removed');
    } else if (actionType === 'reset_data') {
      resetAllStorageData();
      window.location.reload();
    }

    dispatch(hideConfirmDialog());
  };

  return (
    <Modal
      isOpen={confirmState.isOpen}
      onClose={() => dispatch(hideConfirmDialog())}
      maxWidth="sm"
      showCloseButton
    >
      <div className="flex flex-col items-center text-center py-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            confirmState.isDestructive
              ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {confirmState.title || 'Are you sure?'}
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          {confirmState.message}
        </p>

        <div className="flex gap-2.5 w-full mt-6">
          <button
            type="button"
            onClick={() => dispatch(hideConfirmDialog())}
            className="flex-1 py-2 px-4 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            {confirmState.cancelLabel || 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg text-white transition-colors cursor-pointer shadow-xs ${
              confirmState.isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {confirmState.confirmLabel || 'Confirm'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
