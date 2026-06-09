import React, { ReactNode, useState } from 'react';
import { cn } from '../../utils/helpers';
import { ChevronUp, X } from 'lucide-react';

interface WidgetProps {
  children:    ReactNode;
  className?:  string;
  title?:      ReactNode;
  subtitle?:   string;
  footer?:     ReactNode;
  noPadding?:  boolean;
  collapsible?: boolean;
  closable?:   boolean;
  onClose?:    () => void;
}

export function Widget({
  children,
  className,
  title,
  subtitle,
  footer,
  noPadding,
  collapsible = false,
  closable    = false,
  onClose,
}: WidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isClosed,    setIsClosed]    = useState(false);

  const handleClose = () => { setIsClosed(true); onClose?.(); };

  if (isClosed) return null;

  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden',
        'transition-all duration-250 hover:shadow-md hover:border-slate-300',
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex-1">
            {typeof title === 'string' ? (
              <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
            ) : (
              <div>{title}</div>
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-1.5">
            {collapsible && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                <ChevronUp className={cn('w-4 h-4 text-slate-400 transition-transform', isCollapsed && 'rotate-180')} />
              </button>
            )}
            {closable && (
              <button
                onClick={handleClose}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      )}

      {!isCollapsed && (
        <>
          <div className={cn(noPadding ? 'p-0' : 'p-6')}>
            {children}
          </div>
          {footer && (
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100">
              {footer}
            </div>
          )}
        </>
      )}
    </div>
  );
}