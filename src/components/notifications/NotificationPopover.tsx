'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '@/store/slices/notificationSlice';
import { setActiveTaskDetailId } from '@/store/slices/uiSlice';
import { setActiveWorkspaceId } from '@/store/slices/workspaceSlice';
import { Bell, Check, Trash2, Calendar, MessageSquare, UserCheck, Settings, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function NotificationPopover() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const currentUserId = useAppSelector((s) => s.auth.currentUser?.id);
  const notifications = useAppSelector((s) =>
    s.notification.notifications.filter(
      (n) => !n.userId || n.userId === currentUserId
    )
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    dispatch(markAsRead(notif.id));
    if (notif.workspaceId) {
      dispatch(setActiveWorkspaceId(notif.workspaceId));
    }
    if (notif.taskId) {
      dispatch(setActiveTaskDetailId(notif.taskId));
      if (notif.workspaceId && notif.projectId) {
        router.push(`/app/workspaces/${notif.workspaceId}/projects/${notif.projectId}`);
      }
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    if (type === 'assignment') return <UserCheck className="w-4 h-4 text-indigo-500" />;
    if (type === 'mention') return <MessageSquare className="w-4 h-4 text-purple-500" />;
    if (type === 'due_date') return <Calendar className="w-4 h-4 text-amber-500" />;
    return <Bell className="w-4 h-4 text-slate-500" />;
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="Open notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow-xs animate-in zoom-in">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-medium bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => dispatch(markAllAsRead())}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${
                    !notif.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs font-semibold ${
                          !notif.read
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatDistanceToNow(new Date(notif.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(deleteNotification(notif.id));
                    }}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors opacity-60 hover:opacity-100"
                    aria-label="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/app/settings');
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              Notification Settings
            </button>
            <span>Auto-synced</span>
          </div>
        </div>
      )}
    </div>
  );
}
