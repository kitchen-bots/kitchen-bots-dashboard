import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  homeHref?: string;
}

export function Breadcrumbs({
  items,
  homeHref,
  className,
  ...props
}: BreadcrumbsProps) {
  const location = useLocation();
  const defaultHome = location.pathname.startsWith('/admin') ? '/admin' : '/dashboard';
  const resolvedHomeHref = homeHref || defaultHome;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-neutral-body", className)}
      {...props}
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            to={resolvedHomeHref}
            className="flex items-center hover:text-brand-primary transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4 text-neutral-border" />
            {item.href && index !== items.length - 1 ? (
              <Link
                to={item.href}
                className="hover:text-brand-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="text-neutral-heading font-medium"
                aria-current="page"
              >
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
