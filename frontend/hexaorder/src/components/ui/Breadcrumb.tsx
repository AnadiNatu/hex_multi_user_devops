// src/components/ui/Breadcrumb.tsx
// FIX: Breadcrumb text is now visible on dark backgrounds.
// Active crumb: text-white. Separator + parent crumbs: text-slate-400.
// Clickable parent crumbs: text-slate-300 hover:text-white.

import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface Props {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = '' }: Props) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 ${className}`}>
      <Link to="/dashboard"
            className="flex items-center text-slate-400 hover:text-white transition-colors">
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1">
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
            {isLast || !item.href ? (
              <span className={`text-sm font-semibold ${isLast ? 'text-white' : 'text-slate-400'}`}>
                {item.label}
              </span>
            ) : (
              <Link to={item.href}
                    className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}