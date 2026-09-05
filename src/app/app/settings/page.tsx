'use client';

import React, { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateProfile } from '@/store/slices/authSlice';
import { setTheme, toggleTheme, showConfirmDialog } from '@/store/slices/uiSlice';
import { updatePreferences } from '@/store/slices/notificationSlice';
import { setNetworkFailureRate, setSimulatedLiveEnabled, setSyncStatus } from '@/store/slices/syncSlice';
import {
  generateWorkspaceExportData,
  validateImportJSON,
  resetAllStorageData,
  loadPersistedState,
  savePersistedState,
} from '@/services/storageService';
import { Avatar } from '@/components/common/Avatar';
import { useToast } from '@/components/ui/Toast';
import {
  User,
  Bell,
  Sun,
  Moon,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  Save,
  Radio,
  Sliders,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const theme = useAppSelector((s) => s.ui.theme);
  const notifPreferences = useAppSelector((s) => s.notification.preferences);
  const networkFailureRate = useAppSelector((s) => s.sync.networkFailureRate);
  const simulatedLiveEnabled = useAppSelector((s) => s.sync.simulatedLiveEnabled);
  const activeWorkspaceId = useAppSelector((s) => s.workspace.activeWorkspaceId);

  // Profile form state
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');

  // Import preview state
  const [importPreview, setImportPreview] = useState<any | null>(null);

  if (!currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    dispatch(updateProfile({ name: name.trim(), email: email.trim(), avatar: avatar.trim() }));
    toast.success('Profile Updated', 'Your profile details were saved.');
  };

  const handleExportData = () => {
    const currentState = loadPersistedState();
    const exportPayload = generateWorkspaceExportData(currentState, activeWorkspaceId);
    const jsonStr = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `workspace-manager-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workspace Exported', 'JSON file downloaded successfully.');
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const { result, payload } = validateImportJSON(text);

      if (!result.valid) {
        toast.error('Import Failed', result.errors.join(' '));
        return;
      }

      setImportPreview(payload);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;
    try {
      const currentState = loadPersistedState();
      // Merge imported data
      importPreview.data.workspaces.forEach((w: any) => {
        currentState.workspaces[w.id] = w;
      });
      importPreview.data.projects.forEach((p: any) => {
        currentState.projects[p.id] = p;
      });
      importPreview.data.tasks.forEach((t: any) => {
        currentState.tasks[t.id] = t;
      });

      savePersistedState(currentState);
      toast.success('Data Imported Successfully', 'Reloading application state...');
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err: any) {
      toast.error('Import Failed', err?.message || 'Error processing data.');
    }
  };

  const handleFactoryReset = () => {
    dispatch(
      showConfirmDialog({
        title: 'Factory Reset All Data',
        message:
          'This will wipe all local storage and IndexedDB attachments, restoring the default seed dataset. Are you completely sure?',
        confirmLabel: 'Reset Everything',
        isDestructive: true,
        actionType: 'reset_data',
        payload: {},
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Application & User Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, notifications, appearance, and workspace data persistence.
        </p>
      </div>

      {/* User Profile Card */}
      <form
        onSubmit={handleSaveProfile}
        className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-5 shadow-xs"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <User className="w-4 h-4 text-indigo-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Profile Details</h2>
        </div>

        <div className="flex items-center gap-4">
          <Avatar name={name || currentUser.name} avatar={avatar} size="lg" />
          <div className="space-y-1">
            <span className="text-xs font-semibold block text-slate-800 dark:text-slate-200">
              Avatar URL
            </span>
            <input
              type="url"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 w-72 text-slate-800 dark:text-slate-200 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>

      {/* Preferences & Appearance Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Preferences & Appearance
        </h2>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Color Theme
            </p>
            <p className="text-xs text-slate-500">
              Currently active: <span className="font-semibold capitalize">{theme} mode</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => dispatch(setTheme('light'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => dispatch(setTheme('dark'))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-950/60 text-indigo-300 font-bold'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        {/* Notification Toggles */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Notification Preferences
            </h3>
          </div>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs cursor-pointer">
              <span>Task Assignment Notifications</span>
              <input
                type="checkbox"
                checked={notifPreferences.assignment}
                onChange={(e) =>
                  dispatch(updatePreferences({ assignment: e.target.checked }))
                }
                className="w-4 h-4 accent-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs cursor-pointer">
              <span>@Mention in Comments Notifications</span>
              <input
                type="checkbox"
                checked={notifPreferences.mention}
                onChange={(e) =>
                  dispatch(updatePreferences({ mention: e.target.checked }))
                }
                className="w-4 h-4 accent-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs cursor-pointer">
              <span>Approaching Due Date Alerts</span>
              <input
                type="checkbox"
                checked={notifPreferences.dueDate}
                onChange={(e) =>
                  dispatch(updatePreferences({ dueDate: e.target.checked }))
                }
                className="w-4 h-4 accent-indigo-600"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Network Simulation & Testing Card */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-4 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sliders className="w-4 h-4 text-purple-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Client Simulation & Optimistic UI Testing
          </h2>
        </div>

        {/* Live Simulation Toggle */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Simulated Teammate Live Updates
            </p>
            <p className="text-slate-500">
              Mock teammates occasionally comment or move tasks to simulate active collaboration.
            </p>
          </div>
          <input
            type="checkbox"
            checked={simulatedLiveEnabled}
            onChange={(e) => dispatch(setSimulatedLiveEnabled(e.target.checked))}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Simulated Network Failure Rate */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Simulate Network Failure Rate (Optimistic Rollback Testing)
            </span>
            <span className="font-bold text-indigo-600">
              {Math.round(networkFailureRate * 100)}%
            </span>
          </div>
          <p className="text-slate-500">
            When set above 0%, actions test optimistic UI updates and state rollback on simulated network timeout.
          </p>
          <div className="flex gap-2 pt-1">
            {[0, 0.1, 0.25, 0.5].map((rate) => (
              <button
                key={rate}
                type="button"
                onClick={() => dispatch(setNetworkFailureRate(rate))}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                  networkFailureRate === rate
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {rate === 0 ? '0% (Standard)' : `${rate * 100}% Failure`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management: Export & Import */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
          Workspace Data Portability
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Export */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Export Data</p>
              <p className="text-slate-500 mt-0.5">
                Download all active projects, tasks, comments, and activities as structured JSON.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>

          {/* Import */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs space-y-3">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Import Data</p>
              <p className="text-slate-500 mt-0.5">
                Upload a verified JSON backup to merge into your workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Select File...</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Import Preview Confirmation Dialog */}
        {importPreview && (
          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs space-y-3">
            <h3 className="font-bold text-indigo-900 dark:text-indigo-200">
              Valid JSON Import Payload Detected
            </h3>
            <div className="grid grid-cols-3 gap-2 py-1">
              <span className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                Workspaces: {importPreview.data.workspaces?.length || 0}
              </span>
              <span className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                Projects: {importPreview.data.projects?.length || 0}
              </span>
              <span className="bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                Tasks: {importPreview.data.tasks?.length || 0}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg"
              >
                Confirm Import
              </button>
              <button
                type="button"
                onClick={() => setImportPreview(null)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Danger Zone: Factory Reset */}
      <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 space-y-4">
        <h2 className="text-sm font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-rose-700 dark:text-rose-400">
              Reset Application to Default Mock State
            </p>
            <p className="text-slate-500">
              Clear all local changes, attachments, and preferences, restoring factory seed data.
            </p>
          </div>
          <button
            type="button"
            onClick={handleFactoryReset}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}
