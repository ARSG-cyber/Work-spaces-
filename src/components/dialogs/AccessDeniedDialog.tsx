'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { hideAccessDenied } from '@/store/slices/uiSlice';
import { switchUser } from '@/store/slices/authSlice';
import { ShieldAlert, UserCheck } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { RoleBadge } from '@/components/common/Badge';

export function AccessDeniedDialog() {
  const dispatch = useAppDispatch();
  const accessDenied = useAppSelector((s) => s.ui.accessDeniedModal);
  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);

  if (!accessDenied.isOpen) return null;

  const handleSwitchToAdmin = () => {
    // Find an Admin or Owner user
    const privilegedUser =
      mockUsers.find((u) => u.role === 'admin' || u.role === 'owner') || mockUsers[0];
    if (privilegedUser) {
      dispatch(switchUser(privilegedUser.id));
      dispatch(hideAccessDenied());
    }
  };

  return (
    <Modal
      isOpen={accessDenied.isOpen}
      onClose={() => dispatch(hideAccessDenied())}
      maxWidth="md"
      showCloseButton
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Access Restricted
        </h3>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs leading-relaxed">
          You don't have permission to {accessDenied.actionName || 'perform this operation'}.
        </p>

        <div className="my-5 w-full bg-slate-50 dark:bg-slate-900/60 rounded-lg p-3.5 border border-slate-200/80 dark:border-slate-800 text-xs flex flex-col gap-2.5 text-left">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Required Role:</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400 capitalize">
              {accessDenied.requiredRole || 'Admin'} or higher
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Your Current Role:</span>
            {currentUser && <RoleBadge role={currentUser.role} />}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full mt-2">
          <button
            type="button"
            onClick={() => dispatch(hideAccessDenied())}
            className="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={handleSwitchToAdmin}
            className="flex-1 py-2.5 px-4 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            Switch to Admin
          </button>
        </div>
      </div>
    </Modal>
  );
}
