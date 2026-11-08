import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function ProgressBar({
  progress,
  size = 'md',
  showLabel = false,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(progress || 0)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const getGradient = (pct: number) => {
    if (pct >= 80) return 'from-emerald-500 to-green-600';
    if (pct >= 50) return 'from-indigo-500 to-blue-600';
    if (pct >= 25) return 'from-amber-500 to-yellow-500';
    return 'from-rose-500 to-red-500';
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Progresso</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className={`w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ease-out ${getGradient(
            clamped,
          )}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

