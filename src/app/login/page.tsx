'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { toggleTheme } from '@/store/slices/uiSlice';
import { Avatar } from '@/components/common/Avatar';
import { RoleBadge } from '@/components/common/Badge';
import { useToast } from '@/components/ui/Toast';
import {
  Lock,
  Mail,
  ArrowRight,
  Shield,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  Kanban,
  Calendar,
  Layers,
  Zap,
  Sun,
  Moon,
  Users,
  Database,
  CheckSquare,
  Square,
  Activity,
} from 'lucide-react';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();

  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const loading = useAppSelector((s) => s.auth.loading);
  const error = useAppSelector((s) => s.auth.error);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const theme = useAppSelector((s) => s.ui.theme);

  // If already authenticated in current session, forward to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/app/dashboard');
    }
  }, [isAuthenticated, router]);

  const [authMode, setAuthMode] = useState<'demo' | 'credentials'>('demo');
  const [email, setEmail] = useState('alex.rivera@acme.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Interactive demo preview state on the showcase side
  const [interactiveTasks, setInteractiveTasks] = useState([
    { id: 'preview-1', title: 'Revamp Dark Theme Tokens & UI', done: true, priority: 'High' },
    { id: 'preview-2', title: 'Implement IndexedDB Sync Architecture', done: true, priority: 'Urgent' },
    { id: 'preview-3', title: 'Hierarchical Nested Subtask Tree', done: false, priority: 'Medium' },
  ]);

  const togglePreviewTask = (id: string) => {
    setInteractiveTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    dispatch(loginStart());

    setTimeout(() => {
      const found = mockUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (found) {
        dispatch(loginSuccess(found));
        toast.success('Welcome back!', `Logged in as ${found.name} (${found.role})`);
        router.push('/app/dashboard');
      } else {
        dispatch(loginFailure('Invalid credentials. Select a demo account below or sign up.'));
      }
    }, 350);
  };

  const handleSelectDemoUser = (user: (typeof mockUsers)[0]) => {
    setEmail(user.email);
    setPassword('password123');
    dispatch(loginStart());

    setTimeout(() => {
      dispatch(loginSuccess(user));
      toast.success('Signed in', `Active session as ${user.name} (${user.role})`);
      router.push('/app/dashboard');
    }, 200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white text-lg flex items-center justify-center shadow-md shadow-indigo-500/25">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                Workspace Manager
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
                v2.4 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Modern SaaS Productivity Platform
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px]">All Systems Operational</span>
          </div>

          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle color theme"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-slate-600 dark:text-slate-300 shadow-xs"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center w-full">
          {/* Left Column: Telling about the website & Showcase */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Next-Gen Engineering & Team Productivity</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Plan, track, and ship software with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-500 to-pink-500">
                  frictionless velocity
                </span>
                .
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
                Workspace Manager is a comprehensive platform engineered for modern teams.
                Seamlessly pivot between high-density <strong>Kanban boards</strong>, multidimensional{' '}
                <strong>data tables</strong>, and <strong>calendar schedules</strong> with offline-ready persistence
                and simulated real-time collaboration.
              </p>
            </div>

            {/* 4 Feature Value Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-md hover:border-indigo-500/40 transition-all">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2.5">
                  <Kanban className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Multi-View Workflow Engine
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Toggle dynamically between Kanban columns, sorting list tables, and monthly project calendars.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-md hover:border-indigo-500/40 transition-all">
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-2.5">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Nested Subtasks & Checklists
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Break down complex epics with hierarchical checklist subtasks, custom priorities, and label tags.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-md hover:border-indigo-500/40 transition-all">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Offline-First Local Storage
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Zero downtime. Changes sync locally into IndexedDB & state storage, queueing when offline.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-md hover:border-indigo-500/40 transition-all">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5">
                  <Activity className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  Simulated Live Teammates
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                  Simulated real-time collaborative activity stream, notification events, and role-based access.
                </p>
              </div>
            </div>

            {/* Interactive Live Board Preview Card */}
            <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-br from-white/90 to-slate-50/90 dark:from-[#0d1424]/90 dark:to-[#080d1a]/90 backdrop-blur-md shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">🚀</span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Live Interactive Project Preview
                    </h4>
                    <span className="text-[10px] text-slate-400">
                      Acme Engineering • NextGen SaaS Platform
                    </span>
                  </div>
                </div>
                <div className="flex -space-x-1.5 items-center">
                  {mockUsers.slice(0, 4).map((u) => (
                    <Avatar key={u.id} name={u.name} avatar={u.avatar} size="xs" />
                  ))}
                  <span className="text-[10px] pl-2 font-medium text-slate-400">+5 more</span>
                </div>
              </div>

              {/* Interactive checklist mini-tasks */}
              <div className="space-y-1.5">
                {interactiveTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => togglePreviewTask(task.id)}
                    className="flex items-center justify-between p-2 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {task.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span
                        className={`truncate font-medium ${
                          task.done
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : task.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>💡 Click any task above to test real-time checklist state!</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {interactiveTasks.filter((t) => t.done).length} of {interactiveTasks.length} Completed
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Advanced Login Console */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0c1220]/95 backdrop-blur-xl shadow-2xl space-y-6">
              {/* Header inside Card */}
              <div className="text-center space-y-1.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome to Workspace
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Sign in to access your projects, tasks, and real-time boards.
                </p>
              </div>

              {/* Segmented Mode Selector */}
              <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode('demo')}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'demo'
                      ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>1-Click Demo Access</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('credentials')}
                  className={`py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authMode === 'credentials'
                      ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Email & Password</span>
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium animate-in fade-in">
                  {error}
                </div>
              )}

              {/* Tab 1: 1-Click Instant Demo Profiles */}
              {authMode === 'demo' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Select a Teammate Role
                    </span>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                      Simulated RBAC
                    </span>
                  </div>

                  <div className="space-y-2">
                    {mockUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        disabled={loading}
                        onClick={() => handleSelectDemoUser(user)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 text-xs transition-all cursor-pointer text-left group"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Avatar name={user.name} avatar={user.avatar} size="sm" showStatus />
                          <div className="truncate">
                            <span className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 block truncate">
                              {user.name}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate">
                              {user.title || user.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <RoleBadge role={user.role} />
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Standard Credentials Form */}
              {authMode === 'credentials' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alex.rivera@acme.io"
                        className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('alex.rivera@acme.io');
                          setPassword('password123');
                        }}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                      >
                        Fill demo password
                      </button>
                    </div>
                    <div className="relative flex items-center">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Stay signed in</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Sign In to Workspace</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Security Badges & Footer */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center space-y-3">
                <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-500" /> End-to-End Encrypted
                  </span>
                  <span>•</span>
                  <span>IndexedDB Local-First</span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Create new workspace account
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Page Footer */}
      <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span>© 2026 Workspace Manager Inc.</span>
          <span>•</span>
          <span>Enterprise SaaS Productivity</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Fast Keyboard Shortcuts (<kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">⌘K</kbd> / <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">/</kbd>)</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
