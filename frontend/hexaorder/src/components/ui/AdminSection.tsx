// src/components/ui/AdminSection.tsx
// FIX: Section title text-white, subtitle text-slate-400.

import { ReactNode } from 'react';

interface Props {
  title:    string;
  subtitle?: string;
  children:  ReactNode;
  className?: string;
}

export default function AdminSection({ title, subtitle, children, className = '' }: Props) {
  return (
    <section className={`space-y-4 ${className}`}>
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}