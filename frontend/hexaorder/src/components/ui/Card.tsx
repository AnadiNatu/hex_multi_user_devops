import React, { ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps {
  children:  ReactNode;
  className?: string;
  padding?:   'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?:   () => void;
}

interface CardHeaderProps { children: ReactNode; className?: string; }
interface CardBodyProps   { children: ReactNode; className?: string; }
interface CardFooterProps { children: ReactNode; className?: string; }

const paddingStyles = {
  none: 'p-0',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
};

export function Card({ children, className, padding = 'md', hoverable = false, clickable = false, onClick }: CardProps) {
  const Component = clickable || onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-250',
        paddingStyles[padding],
        hoverable  && 'hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5',
        clickable  && 'cursor-pointer hover:shadow-md hover:border-brand-green/40 hover:-translate-y-1',
        onClick    && 'focus:outline-none focus:ring-2 focus:ring-brand-green/20',
        className
      )}
    >
      {children}
    </Component>
  );
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('border-b border-slate-100 pb-4 mb-4', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('border-t border-slate-100 pt-4 mt-4', className)}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body   = CardBody;
Card.Footer = CardFooter;