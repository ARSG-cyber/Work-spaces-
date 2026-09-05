'use client';

import React from 'react';

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showStatus?: boolean;
  status?: 'online' | 'busy' | 'offline';
}

const sizeClasses = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
  xl: 'w-14 h-14 text-xl',
};

export function Avatar({
  name,
  avatar,
  size = 'md',
  className = '',
  showStatus = false,
  status = 'online',
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  // Consistent background color based on name hash
  const getBgColor = (n: string) => {
    const colors = [
      'bg-indigo-600 text-white',
      'bg-rose-600 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white',
      'bg-purple-600 text-white',
      'bg-cyan-600 text-white',
      'bg-blue-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < n.length; i++) {
      hash = n.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {avatar && !imgError ? (
        <img
          src={avatar}
          alt={name}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-800 shadow-xs`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${getBgColor(
            name
          )} font-semibold rounded-full flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-800 shadow-xs select-none`}
        >
          {getInitials(name)}
        </div>
      )}
      {showStatus && (
        <span
          className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
            status === 'online'
              ? 'bg-emerald-500'
              : status === 'busy'
              ? 'bg-rose-500'
              : 'bg-slate-400'
          }`}
        />
      )}
    </div>
  );
}
