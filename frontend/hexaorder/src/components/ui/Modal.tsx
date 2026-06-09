import React, { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/helpers';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen:     boolean;
  onClose:    () => void;
  title?:     string;
  children:   ReactNode;
  footer?:    ReactNode;
  size?:      'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, footer, size = 'md', className }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
        <div
          className={cn('relative bg-white rounded-2xl shadow-2xl w-full border border-slate-200', sizes[size], className)}
          role="dialog"
          aria-modal="true"
          style={{ animation: 'modalIn 0.22s ease' }}
        >
          <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) scale(0.98) } to { opacity:1; transform:translateY(0) scale(1) } }`}</style>
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Close">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          )}
          <div className="px-6 py-5">{children}</div>
          {footer && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

interface ConfirmDialogProps {
  isOpen:         boolean;
  onClose:        () => void;
  onConfirm:      () => void;
  title:          string;
  message:        string;
  confirmLabel?:  string;
  cancelLabel?:   string;
  variant?:       'danger' | 'primary';
}

export function ConfirmDialog({
  isOpen, onClose, onConfirm, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>{cancelLabel}</Button>
          <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
    </Modal>
  );
}