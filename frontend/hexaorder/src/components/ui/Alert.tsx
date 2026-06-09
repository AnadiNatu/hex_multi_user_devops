import React, { ReactNode } from 'react';
import { cn } from '../../utils/helpers';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface AlertProps {
  variant?:     'success' | 'error' | 'warning' | 'info';
  title?:       string;
  children:     ReactNode;
  dismissible?: boolean;
  onDismiss?:   () => void;
  className?:   string;
}

export function Alert({ variant = 'info', title, children, dismissible, onDismiss, className }: AlertProps) {
  const variants = {
    success: { bg: 'bg-emerald-50', border: 'border-l-4 border-emerald-500 border-y border-r border-emerald-200', text: 'text-emerald-800', icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> },
    error:   { bg: 'bg-red-50',     border: 'border-l-4 border-red-500 border-y border-r border-red-200',         text: 'text-red-800',     icon: <AlertCircle  className="w-4 h-4 text-red-500"     /> },
    warning: { bg: 'bg-amber-50',   border: 'border-l-4 border-amber-500 border-y border-r border-amber-200',     text: 'text-amber-800',   icon: <AlertTriangle className="w-4 h-4 text-amber-500"  /> },
    info:    { bg: 'bg-blue-50',    border: 'border-l-4 border-blue-500 border-y border-r border-blue-200',       text: 'text-blue-800',    icon: <Info          className="w-4 h-4 text-blue-500"   /> },
  };

  const config = variants[variant];

  return (
    <div
      className={cn('rounded-lg p-4 flex items-start gap-3', config.bg, config.border, config.text, className)}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-bold mb-1 text-sm">{title}</h4>}
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
      {dismissible && (
        <button onClick={onDismiss} className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}