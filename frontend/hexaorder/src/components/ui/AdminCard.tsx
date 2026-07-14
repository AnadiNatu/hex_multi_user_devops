// src/components/ui/AdminCard.tsx
// FIX: consistent dark card styling throughout admin pages.

import { ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface Props {
  children:   ReactNode;
  className?: string;
}

export default function AdminCard({ children, className }: Props) {
  return (
    <div className={cn(
      'bg-slate-900/70 border border-slate-700 rounded-2xl shadow-xl backdrop-blur-sm p-6',
      className
    )}>
      {children}
    </div>
  );
}