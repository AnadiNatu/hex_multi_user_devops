import React, { ReactNode } from 'react';
import { cn } from '../../utils/helpers';
import { Button } from './Button';

interface EmptyStateProps {
  icon?:        ReactNode;
  title:        string;
  description?: string;
  action?:      { label: string; onClick: () => void; icon?: ReactNode };
  className?:   string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200',
      'transition-colors hover:border-slate-300',
      className
    )}>
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-slate-50 rounded-2xl text-slate-300">
            {icon}
          </div>
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto leading-relaxed">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick} leftIcon={action.icon} size="sm">
          {action.label}
        </Button>
      )}
    </div>
  );
}