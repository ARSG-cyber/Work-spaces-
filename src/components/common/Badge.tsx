'use client';

import React from 'react';
import { TaskPriority } from '@/types/task';
import { UserRole } from '@/types/user';
import { AlertCircle, ArrowUp, ArrowRight, ArrowDown, Shield, ShieldCheck, UserCheck, Eye } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, showIcon = true, size = 'sm' }: PriorityBadgeProps) {
  const configs = {
    urgent: {
      label: 'Urgent',
      className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/60',
      icon: AlertCircle,
    },
    high: {
      label: 'High',
      className: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-900/60',
      icon: ArrowUp,
    },
    medium: {
      label: 'Medium',
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/60',
      icon: ArrowRight,
    },
    low: {
      label: 'Low',
      className: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800',
      icon: ArrowDown,
    },
  };

  const current = configs[priority] || configs.medium;
  const Icon = current.icon;
  const sizeClass = size === 'sm' ? 'text-[11px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded border ${current.className} ${sizeClass} tracking-wide select-none`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
    </span>
  );
}

interface RoleBadgeProps {
  role: UserRole;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const configs = {
    owner: {
      label: 'Owner',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/60',
      icon: ShieldCheck,
    },
    admin: {
      label: 'Admin',
      className: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/60',
      icon: Shield,
    },
    member: {
      label: 'Member',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60',
      icon: UserCheck,
    },
    viewer: {
      label: 'Viewer',
      className: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      icon: Eye,
    },
  };

  const current = configs[role] || configs.member;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${current.className} select-none`}
    >
      <Icon className="w-3 h-3" />
      <span>{current.label}</span>
    </span>
  );
}

interface TagChipProps {
  label: string;
  onRemove?: () => void;
  className?: string;
}

export function TagChip({ label, onRemove, className = '' }: TagChipProps) {
  return (
    <span
      className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 ${className}`}
    >
      <span>#{label}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          &times;
        </button>
      )}
    </span>
  );
}
