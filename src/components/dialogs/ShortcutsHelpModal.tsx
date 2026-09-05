'use client';

import React from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setShortcutsHelpOpen } from '@/store/slices/uiSlice';
import { Modal } from '@/components/common/Modal';
import { Keyboard } from 'lucide-react';

export function ShortcutsHelpModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.ui.shortcutsHelpOpen);

  const shortcuts = [
    { key: '⌘ / Ctrl + K', description: 'Open Command Palette' },
    { key: 'C', description: 'Create New Task' },
    { key: '/', description: 'Open Global Search' },
    { key: '1', description: 'Switch to Kanban View' },
    { key: '2', description: 'Switch to List / Table View' },
    { key: '3', description: 'Switch to Calendar View' },
    { key: '⌘ / Ctrl + Z', description: 'Undo last task action' },
    { key: '⌘ / Ctrl + ⇧ + Z', description: 'Redo reverted action' },
    { key: 'Escape', description: 'Close active drawer / modal' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(setShortcutsHelpOpen(false))}
      title="Keyboard Shortcuts"
      description="Navigate and manage tasks at speed"
      maxWidth="md"
    >
      <div className="flex flex-col gap-2.5">
        {shortcuts.map((sc, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/80 last:border-0 text-sm"
          >
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              {sc.description}
            </span>
            <kbd className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs font-mono">
              {sc.key}
            </kbd>
          </div>
        ))}
      </div>
    </Modal>
  );
}
