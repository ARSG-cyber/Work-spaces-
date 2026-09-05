'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setGlobalSearchOpen, setActiveTaskDetailId } from '@/store/slices/uiSlice';
import { setActiveWorkspaceId } from '@/store/slices/workspaceSlice';
import { Search, CheckSquare, Folder, Building, X, ExternalLink } from 'lucide-react';
import { PriorityBadge } from '@/components/common/Badge';

export function GlobalSearchDialog() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isOpen = useAppSelector((s) => s.ui.globalSearchOpen);
  const workspaces = useAppSelector((s) => Object.values(s.workspace.workspaces));
  const projects = useAppSelector((s) => Object.values(s.project.projects));
  const tasks = useAppSelector((s) => Object.values(s.task.tasks));

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  const matchingWorkspaces = trimmed
    ? workspaces.filter((w) => w.name.toLowerCase().includes(trimmed))
    : [];

  const matchingProjects = trimmed
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed)
      )
    : [];

  const matchingTasks = trimmed
    ? tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(trimmed) ||
          t.description.toLowerCase().includes(trimmed) ||
          t.labels.some((l) => l.toLowerCase().includes(trimmed))
      )
    : [];

  const hasResults =
    matchingWorkspaces.length > 0 ||
    matchingProjects.length > 0 ||
    matchingTasks.length > 0;

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark
              key={i}
              className="bg-amber-200 dark:bg-amber-900/60 dark:text-amber-200 text-amber-950 rounded-xs px-0.5"
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => dispatch(setGlobalSearchOpen(false))}
      />

      <div className="relative w-full max-w-2xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 shadow-2xl transition-all duration-150 animate-in zoom-in-95 z-10 overflow-hidden flex flex-col max-h-[75vh]">
        {/* Header Search Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all workspaces, projects, and tasks..."
            className="flex-1 bg-transparent text-sm placeholder-slate-400 focus:outline-none text-slate-900 dark:text-slate-100"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded bg-slate-50 dark:bg-slate-800">
            ESC
          </kbd>
        </div>

        {/* Results Stream */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
          {!trimmed ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-2">
              <Search className="w-8 h-8 opacity-40 text-slate-400" />
              <p className="text-sm font-medium">Type anything to search across your workspace</p>
              <p className="text-xs text-slate-500">
                Tasks, projects, workspaces, descriptions, labels
              </p>
            </div>
          ) : !hasResults ? (
            <div className="py-12 text-center text-slate-400">
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for a different keyword or check spelling.
              </p>
            </div>
          ) : (
            <>
              {/* Workspaces category */}
              {matchingWorkspaces.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Building className="w-3.5 h-3.5" />
                    <span>Workspaces ({matchingWorkspaces.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingWorkspaces.map((w) => (
                      <div
                        key={w.id}
                        onClick={() => {
                          dispatch(setActiveWorkspaceId(w.id));
                          dispatch(setGlobalSearchOpen(false));
                          router.push(`/app/workspaces/${w.id}`);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{w.icon}</span>
                          <span className="text-sm font-medium">
                            {highlightText(w.name, query)}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects category */}
              {matchingProjects.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <Folder className="w-3.5 h-3.5" />
                    <span>Projects ({matchingProjects.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingProjects.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          dispatch(setActiveWorkspaceId(p.workspaceId));
                          dispatch(setGlobalSearchOpen(false));
                          router.push(
                            `/app/workspaces/${p.workspaceId}/projects/${p.id}`
                          );
                        }}
                        className="flex items-start justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base">{p.icon}</span>
                            <span className="text-sm font-medium">
                              {highlightText(p.name, query)}
                            </span>
                            {p.isArchived && (
                              <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                                Archived
                              </span>
                            )}
                          </div>
                          {p.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                              {highlightText(p.description, query)}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks category */}
              {matchingTasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Tasks ({matchingTasks.length})</span>
                  </div>
                  <div className="space-y-1">
                    {matchingTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => {
                          dispatch(setActiveWorkspaceId(t.workspaceId));
                          dispatch(setActiveTaskDetailId(t.id));
                          dispatch(setGlobalSearchOpen(false));
                          router.push(
                            `/app/workspaces/${t.workspaceId}/projects/${t.projectId}`
                          );
                        }}
                        className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                      >
                        <div className="min-w-0 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                              {highlightText(t.title, query)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">
                              Status: {t.status}
                            </span>
                            {t.labels.length > 0 && (
                              <span className="text-xs text-indigo-500 dark:text-indigo-400">
                                #{t.labels[0]}
                              </span>
                            )}
                          </div>
                        </div>
                        <PriorityBadge priority={t.priority} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
