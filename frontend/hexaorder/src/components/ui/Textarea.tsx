import React, { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '../../utils/helpers';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?:              string;
  error?:              string;
  helperText?:         string;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, containerClassName, className, ...props }, ref) => {
    return (
      <div className={containerClassName}>
        {label && (
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2.5 bg-white border rounded-lg text-sm text-slate-900 transition-all outline-none resize-y',
            'placeholder:text-slate-400',
            'focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green',
            'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
            error && 'border-red-400 focus:ring-red-100 focus:border-red-500',
            !error && 'border-slate-200 hover:border-slate-300',
            className
          )}
          {...props}
        />
        {error      && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
        {!error && helperText && <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';