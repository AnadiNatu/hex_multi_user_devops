import React, { ReactNode } from 'react';
import { cn } from '../../utils/helpers';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize    = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children:   ReactNode;
  variant?:   BadgeVariant;
  size?:      BadgeSize;
  leftIcon?:  ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  pill?:      boolean;
  outline?:   boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-emerald-50 text-brand-green border-brand-green/20',
  success: 'bg-green-50 text-green-700 border-green-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error:   'bg-red-50 text-red-700 border-red-200',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
};

const outlineVariantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white text-slate-700 border-slate-300',
  primary: 'bg-white text-brand-green border-brand-green',
  success: 'bg-white text-green-700 border-green-500',
  warning: 'bg-white text-amber-700 border-amber-500',
  error:   'bg-white text-red-700 border-red-500',
  info:    'bg-white text-blue-700 border-blue-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function Badge({
  children,
  variant   = 'default',
  size      = 'md',
  leftIcon,
  rightIcon,
  className,
  pill      = true,
  outline   = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-semibold border transition-colors',
        outline ? outlineVariantStyles[variant] : variantStyles[variant],
        sizeStyles[size],
        pill ? 'rounded-full' : 'rounded-md',
        className
      )}
    >
      {leftIcon  && <span className="flex-shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </span>
  );
}