import React, { createContext, useContext, useState, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/helpers';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id:        string;
  type:      ToastType;
  message:   string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success:   (message: string, duration?: number) => void;
  error:     (message: string, duration?: number) => void;
  warning:   (message: string, duration?: number) => void;
  info:      (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  const showToast = (message: string, type: ToastType = 'info', duration = 4500) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    if (duration > 0) setTimeout(() => removeToast(id), duration);
  };

  const value: ToastContextType = {
    showToast,
    success: (m, d) => showToast(m, 'success', d),
    error:   (m, d) => showToast(m, 'error', d),
    warning: (m, d) => showToast(m, 'warning', d),
    info:    (m, d) => showToast(m, 'info', d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(<ToastContainer toasts={toasts} onRemove={removeToast} />, document.body)}
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />)}
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const config = {
    success: { bg: 'bg-white border-l-4 border-l-emerald-500', icon: <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />, text: 'text-slate-800' },
    error:   { bg: 'bg-white border-l-4 border-l-red-500',     icon: <AlertCircle  className="w-4 h-4 text-red-500 flex-shrink-0"   />, text: 'text-slate-800' },
    warning: { bg: 'bg-white border-l-4 border-l-amber-500',   icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />, text: 'text-slate-800' },
    info:    { bg: 'bg-white border-l-4 border-l-blue-500',    icon: <Info          className="w-4 h-4 text-blue-500 flex-shrink-0"  />, text: 'text-slate-800' },
  }[toast.type];

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3 rounded-xl shadow-xl pointer-events-auto min-w-[280px] max-w-sm border border-slate-200',
        config.bg
      )}
      style={{ animation: 'slideInRight 0.25s ease' }}
      role="alert"
    >
      <style>{`@keyframes slideInRight { from { opacity:0; transform:translateX(20px) } to { opacity:1; transform:translateX(0) } }`}</style>
      {config.icon}
      <p className={cn('text-sm font-medium flex-1 leading-snug', config.text)}>{toast.message}</p>
      <button onClick={() => onRemove(toast.id)} className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors ml-1">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}