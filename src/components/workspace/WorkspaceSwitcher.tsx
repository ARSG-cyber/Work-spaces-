'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setActiveWorkspaceId } from '@/store/slices/workspaceSlice';
import { setCreateWorkspaceModalOpen } from '@/store/slices/uiSlice';
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';

export function WorkspaceSwitcher() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const workspaces = useAppSelector((s) => Object.values(s.workspace.workspaces));
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);
  const activeWorkspace = useAppSelector(
    (s) => s.workspace.workspaces[activeWorkspaceId] || workspaces[0]
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!activeWorkspace) return null;

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#0f1523] shadow-xs hover:shadow-sm transition-all cursor-pointer text-left"
        aria-label="Switch workspace"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0 shadow-2xs"
            style={{ backgroundColor: `${activeWorkspace.color}15`, color: activeWorkspace.color }}
          >
            {activeWorkspace.icon}
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-slate-900 dark:text-white truncate">
              {activeWorkspace.name}
            </span>
            <span className="block text-[10px] text-slate-400 capitalize">
              {activeWorkspace.members.length} members
            </span>
          </div>
        </div>
        <ChevronsUpDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 w-full min-w-60 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-1.5 border-b border-slate-100 dark:border-slate-800">
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Workspaces
            </div>
            <div className="space-y-0.5 mt-0.5">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspace.id;
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      dispatch(setActiveWorkspaceId(ws.id));
                      setIsOpen(false);
                      router.push(`/app/workspaces/${ws.id}`);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-900 dark:text-indigo-200'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{ws.icon}</span>
                      <span className="truncate">{ws.name}</span>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                dispatch(setCreateWorkspaceModalOpen(true));
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors cursor-pointer font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push(`/app/workspaces/${activeWorkspace.id}/settings`);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Workspace Settings</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
