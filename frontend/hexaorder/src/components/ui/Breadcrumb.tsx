import React, { Fragment, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/helpers';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

interface BreadcrumbProps {
  items:      BreadcrumbItem[];
  className?: string;
  showHome?:  boolean;
  separator?: ReactNode;
}

export function Breadcrumb({
  items,
  className,
  showHome  = true,
  separator = <ChevronRight className="w-3.5 h-3.5" />,
}: BreadcrumbProps) {
  const allItems = showHome
    ? [{ label: 'Home', href: '/dashboard', icon: <Home className="w-3.5 h-3.5" /> }, ...items]
    : items;

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-5', className)}>
      <ol className="flex items-center flex-wrap gap-y-1 text-xs">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <Fragment key={index}>
              <li className="flex items-center">
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-brand-green transition-colors font-semibold"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      'flex items-center gap-1.5 font-semibold',
                      isLast ? 'text-slate-800' : 'text-slate-400'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </span>
                )}
              </li>
              {!isLast && (
                <li className="text-slate-300 mx-1.5" aria-hidden="true">
                  {separator}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}