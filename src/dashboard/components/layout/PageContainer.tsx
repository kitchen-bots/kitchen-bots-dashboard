import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { Breadcrumbs, BreadcrumbItem } from './Breadcrumbs';
import { Heading, Text } from '../ui/Typography';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  homeHref?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function PageContainer({
  title,
  description,
  breadcrumbs,
  homeHref,
  actions,
  children,
  className,
  ...props
}: PageContainerProps) {
  const location = useLocation();
  const defaultHome = location.pathname.startsWith('/admin') ? '/admin' : '/dashboard';
  const resolvedHomeHref = homeHref || defaultHome;

  return (
    <div className={cn("w-full max-w-screen-2xl mx-auto flex flex-col gap-6", className)} {...props}>
      {(breadcrumbs || title || description || actions) && (
        <div className="flex flex-col gap-4">
          {breadcrumbs && (
            <Breadcrumbs items={breadcrumbs} homeHref={resolvedHomeHref} />
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {(title || description) && (
              <div className="flex flex-col gap-1">
                {title && (
                  <Heading level="h2" className="text-neutral-heading tracking-tight">
                    {title}
                  </Heading>
                )}
                {description && (
                  <Text variant="muted" className="text-sm">
                    {description}
                  </Text>
                )}
              </div>
            )}
            
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
