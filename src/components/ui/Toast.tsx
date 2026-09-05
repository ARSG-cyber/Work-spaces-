'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
  action?: ToastAction;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  success: (title: string, message?: string, action?: ToastAction) => void;
  error: (title: string, message?: string, action?: ToastAction) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? 4500;
      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string, action?: ToastAction) => {
      showToast({ title, message, type: 'success', action });
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, message?: string, action?: ToastAction) => {
      showToast({ title, message, type: 'error', action, duration: 6000 });
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      showToast({ title, message, type: 'warning' });
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      showToast({ title, message, type: 'info' });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Render Portal */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full"
      >
        {toasts.map((toast) => {
          let Icon = CheckCircle2;
          let borderColor = 'border-emerald-500/30 dark:border-emerald-500/20';
          let iconColor = 'text-emerald-500';
          if (toast.type === 'error') {
            Icon = AlertCircle;
            borderColor = 'border-rose-500/30 dark:border-rose-500/20';
            iconColor = 'text-rose-500';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            borderColor = 'border-amber-500/30 dark:border-amber-500/20';
            iconColor = 'text-amber-500';
          } else if (toast.type === 'info') {
            Icon = Info;
            borderColor = 'border-indigo-500/30 dark:border-indigo-500/20';
            iconColor = 'text-indigo-500';
          }

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-3 bg-white/95 text-slate-900 dark:bg-slate-900/95 dark:text-slate-100 ${borderColor}`}
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{toast.title}</p>
                {toast.message && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      removeToast(toast.id);
                    }}
                    className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}
