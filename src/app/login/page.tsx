'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { Avatar } from '@/components/common/Avatar';
import { RoleBadge } from '@/components/common/Badge';
import { useToast } from '@/components/ui/Toast';
import { Lock, Mail, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();

  const mockUsers = useAppSelector((s) => s.auth.mockUsers);
  const loading = useAppSelector((s) => s.auth.loading);
  const error = useAppSelector((s) => s.auth.error);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    dispatch(loginStart());

    setTimeout(() => {
      // Check against mock users
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
    }, 400);
  };

  const handleSelectDemoUser = (user: (typeof mockUsers)[0]) => {
    setEmail(user.email);
    setPassword('password123');
    dispatch(loginStart());

    setTimeout(() => {
      dispatch(loginSuccess(user));
      toast.success('Signed in', `Active session as ${user.name}`);
      router.push('/app/dashboard');
    }, 250);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 sm:p-6 bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white text-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            🚀
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workspace Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your projects, tasks, and real-time boards.
          </p>
        </div>

        {/* Login Card */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] shadow-xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Switcher */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Quick 1-Click Demo Profiles
            </span>
            <div className="space-y-1">
              {mockUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectDemoUser(user)}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Avatar name={user.name} avatar={user.avatar} size="xs" />
                    <span className="font-medium truncate">{user.name}</span>
                  </div>
                  <RoleBadge role={user.role} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create new account
          </Link>
        </p>
      </div>
    </div>
  );
}
