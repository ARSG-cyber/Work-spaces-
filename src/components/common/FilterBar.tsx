'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setSearchQuery,
  toggleAssigneeFilter,
  togglePriorityFilter,
  toggleStatusFilter,
  setDueDateRange,
  setSortBy,
  toggleSortDirection,
  setGroupBy,
  resetFilters,
  saveFilterPreset,
  applyFilterPreset,
  deleteFilterPreset,
} from '@/store/slices/filterSlice';
import { TaskPriority } from '@/types/task';
import { Avatar } from '@/components/common/Avatar';
import { PriorityBadge } from '@/components/common/Badge';
import { useToast } from '@/components/ui/Toast';
import {
  Search,
  Filter,
  ArrowUpDown,
  Layers,
  Bookmark,
  Plus,
  Trash2,
  RotateCcw,
  Check,
  ChevronDown,
  X,
} from 'lucide-react';

interface FilterBarProps {
  projectId: string;
  showGroupBy?: boolean;
}

export function FilterBar({ projectId, showGroupBy = true }: FilterBarProps) {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const filterState = useAppSelector((s) => s.filter);
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);
  const activeWorkspace = useAppSelector((s) => s.workspace.workspaces[activeWorkspaceId]);
  const columns = useAppSelector((s) => s.column.columns[projectId] || []);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);

  const [presetName, setPresetName] = useState('');
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    'assignee' | 'priority' | 'status' | 'due' | 'sort' | 'group' | 'presets' | null
  >(null);

  const workspaceUsers = mockUsers.filter((u) =>
    activeWorkspace?.members.some((m) => m.userId === u.id)
  );

  const savedPresets = filterState.savedPresets.filter(
    (p) => p.workspaceId === activeWorkspaceId
  );

  const isFiltered =
    filterState.searchQuery ||
    filterState.assigneeFilter.length > 0 ||
    filterState.priorityFilter.length > 0 ||
    filterState.statusFilter.length > 0 ||
    filterState.dueDateRange !== 'all';

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;
    dispatch(saveFilterPreset({ name: presetName.trim(), workspaceId: activeWorkspaceId }));
    toast.success('Preset Saved', `Filter preset "${presetName}" stored.`);
    setPresetName('');
    setShowPresetModal(false);
  };

  const toggleDropdown = (name: typeof openDropdown) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] text-xs shadow-2xs">
      {/* Left: Quick search & Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative flex items-center min-w-44">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
          <input
            type="text"
            value={filterState.searchQuery}
            onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            placeholder="Filter tasks..."
            className="w-full pl-8 pr-6 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          {filterState.searchQuery && (
            <button
              type="button"
              onClick={() => dispatch(setSearchQuery(''))}
              className="absolute right-2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Assignee Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('assignee')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filterState.assigneeFilter.length > 0
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Assignee</span>
            {filterState.assigneeFilter.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {filterState.assigneeFilter.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'assignee' && (
            <div className="absolute left-0 top-full mt-1 w-48 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] shadow-xl z-30 p-1.5 animate-in fade-in">
              <div className="space-y-0.5">
                {workspaceUsers.map((user) => {
                  const isSelected = filterState.assigneeFilter.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => dispatch(toggleAssigneeFilter(user.id))}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Avatar name={user.name} avatar={user.avatar} size="xs" />
                        <span className="truncate">{user.name}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Priority Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('priority')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filterState.priorityFilter.length > 0
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Priority</span>
            {filterState.priorityFilter.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {filterState.priorityFilter.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'priority' && (
            <div className="absolute left-0 top-full mt-1 w-40 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] shadow-xl z-30 p-1.5 animate-in fade-in">
              <div className="space-y-0.5">
                {(['urgent', 'high', 'medium', 'low'] as TaskPriority[]).map((p) => {
                  const isSelected = filterState.priorityFilter.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => dispatch(togglePriorityFilter(p))}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs cursor-pointer capitalize"
                    >
                      <span>{p}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Status / Column Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('status')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filterState.statusFilter.length > 0
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Status</span>
            {filterState.statusFilter.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                {filterState.statusFilter.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'status' && (
            <div className="absolute left-0 top-full mt-1 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] shadow-xl z-30 p-1.5 animate-in fade-in">
              <div className="space-y-0.5">
                {columns.map((col) => {
                  const isSelected = filterState.statusFilter.includes(col.name);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => dispatch(toggleStatusFilter(col.name))}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-left text-xs cursor-pointer"
                    >
                      <span>{col.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Due Date Range Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('due')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
              filterState.dueDateRange !== 'all'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 capitalize'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span>Due: {filterState.dueDateRange}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {openDropdown === 'due' && (
            <div className="absolute left-0 top-full mt-1 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] shadow-xl z-30 p-1.5 animate-in fade-in">
              <div className="space-y-0.5">
                {(['all', 'overdue', 'today', 'week', 'month'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      dispatch(setDueDateRange(r));
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs capitalize cursor-pointer ${
                      filterState.dueDateRange === r
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-600'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{r}</span>
                    {filterState.dueDateRange === r && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Reset Filter Button */}
        {isFiltered && (
          <button
            type="button"
            onClick={() => dispatch(resetFilters())}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors p-1"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Right: Sort, Group-By, and Presets */}
      <div className="flex items-center gap-2">
        {/* Sort selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('sort')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">Sort: {filterState.sortBy}</span>
          </button>

          {openDropdown === 'sort' && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] shadow-xl z-30 p-1.5 animate-in fade-in">
              <div className="space-y-0.5">
                {(['dueDate', 'priority', 'createdAt', 'title'] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      dispatch(setSortBy(s));
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs capitalize cursor-pointer ${
                      filterState.sortBy === s
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-600'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{s}</span>
                    {filterState.sortBy === s && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <button
                  type="button"
                  onClick={() => dispatch(toggleSortDirection())}
                  className="w-full text-left px-2 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-[11px]"
                >
                  Direction: {filterState.sortDirection.toUpperCase()}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Group-By selector (for list view) */}
        {showGroupBy && (
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleDropdown('group')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span className="capitalize">Group: {filterState.groupBy}</span>
            </button>

            {openDropdown === 'group' && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] shadow-xl z-30 p-1.5 animate-in fade-in">
                <div className="space-y-0.5">
                  {(['none', 'status', 'assignee', 'priority', 'label'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        dispatch(setGroupBy(g));
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs capitalize cursor-pointer ${
                        filterState.groupBy === g
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-600'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{g}</span>
                      {filterState.groupBy === g && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Presets Button & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('presets')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Saved Filter Presets"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {openDropdown === 'presets' && (
            <div className="absolute right-0 top-full mt-1 w-52 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] shadow-xl z-30 p-1.5 animate-in fade-in">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Saved Presets
              </div>
              <div className="space-y-0.5 mt-1">
                {savedPresets.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic px-2 py-1">
                    No saved presets.
                  </p>
                ) : (
                  savedPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          dispatch(applyFilterPreset(preset));
                          setOpenDropdown(null);
                          toast.info('Applied Preset', preset.name);
                        }}
                        className="flex-1 text-left truncate font-medium hover:text-indigo-600"
                      >
                        {preset.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => dispatch(deleteFilterPreset(preset.id))}
                        className="text-slate-400 hover:text-rose-500 p-1"
                        title="Delete preset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 mt-1.5 pt-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setOpenDropdown(null);
                    setShowPresetModal(true);
                  }}
                  className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer font-medium"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Save current filters as preset</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save Preset Inline Dialog */}
      {showPresetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0f1523] border border-slate-200 dark:border-slate-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-semibold mb-1">Save Filter Preset</h3>
            <p className="text-xs text-slate-500 mb-3">
              Store current search, assignee, priority, and sort options.
            </p>
            <form onSubmit={handleSavePreset}>
              <input
                type="text"
                required
                autoFocus
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="e.g. My Urgent Backend Tasks"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 mb-3 outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPresetModal(false)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
