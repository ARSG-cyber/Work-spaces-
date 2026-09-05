'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { switchUser, logout } from '@/store/slices/authSlice';
import { Avatar } from '@/components/common/Avatar';
import { RoleBadge } from '@/components/common/Badge';
import { useToast } from '@/components/ui/Toast';
import {
  UserCheck,
  Settings,
  LogOut,
  ChevronDown,
  User as UserIcon,
  Shield,
} from 'lucide-react';

export function UserMenu() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = useAppSelector((s) => s.auth.currentUser);
  const mockUsers = useAppSelector((s) => s.auth.mockUsers);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!currentUser) return null;

  const handleSwitchUser = (userId: string) => {
    dispatch(switchUser(userId));
    const target = mockUsers.find((u) => u.id === userId);
    toast.info('Switched User', `Active as ${target?.name} (${target?.role})`);
    setIsOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Logged Out', 'Your session has been ended.');
    router.push('/login');
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        aria-label="User profile menu"
      >
        <Avatar name={currentUser.name} avatar={currentUser.avatar} size="sm" showStatus />
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-xs font-semibold leading-none text-slate-800 dark:text-slate-200">
            {currentUser.name}
          </span>
          <span className="text-[10px] text-slate-400 capitalize mt-0.5">
            {currentUser.role}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1523] text-slate-900 dark:text-slate-100 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
          {/* User Profile Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-3">
              <Avatar name={currentUser.name} avatar={currentUser.avatar} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {currentUser.email}
                </p>
                <div className="mt-1.5">
                  <RoleBadge role={currentUser.role} />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Mock User Switcher */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="px-2 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Switch Mock User (Test Roles)
            </div>
            <div className="space-y-0.5 mt-1">
              {mockUsers.map((user) => {
                const isActive = user.id === currentUser.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSwitchUser(user.id)}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-900 dark:text-indigo-200'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Avatar name={user.name} avatar={user.avatar} size="xs" />
                      <span className="truncate">{user.name}</span>
                    </div>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {user.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Options */}
          <div className="p-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                router.push('/app/settings');
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Preferences</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
