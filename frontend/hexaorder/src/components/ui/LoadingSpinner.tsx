import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?:       'sm' | 'md' | 'lg' | 'xl';
  className?:  string;
  text?:       string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ size = 'md', className, text, fullScreen = false }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-brand-green', sizes[size])} />
      {text && <p className="text-sm text-slate-500 font-semibold">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/85 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }
  return spinner;
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-100" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-100 rounded-full w-3/4" />
        <div className="h-3 bg-slate-100 rounded-full w-full" />
        <div className="h-3 bg-slate-100 rounded-full w-5/6" />
        <div className="h-3 bg-slate-100 rounded-full w-2/3" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse">
      <div className="h-12 bg-slate-50 border-b border-slate-100" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 border-b border-slate-50 px-6 py-4 flex items-center gap-6">
          <div className="h-3 bg-slate-100 rounded-full w-1/4" />
          <div className="h-3 bg-slate-100 rounded-full w-1/3" />
          <div className="h-3 bg-slate-100 rounded-full w-1/5" />
          <div className="h-3 bg-slate-100 rounded-full w-1/6 ml-auto" />
        </div>
      ))}
    </div>
  );
}