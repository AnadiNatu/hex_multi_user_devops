// src/components/ui/AdminPageHeader.tsx
// FIX: title text-white, subtitle text-slate-400.

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface Props {
  title:    string;
  subtitle?: string;
  icon:     LucideIcon;
  actions?: ReactNode;
}

export default function AdminPageHeader({ title, subtitle, icon: Icon, actions }: Props) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-green/15 flex items-center justify-center shadow-lg flex-shrink-0">
          <Icon className="w-7 h-7 text-brand-green" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && <p className="text-slate-400 mt-1 text-sm">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  );
}