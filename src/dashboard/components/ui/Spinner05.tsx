import React from 'react';
import { cn } from '../../utils/cn';

export interface Spinner05Props extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

const strokeMap = {
  sm: 'border-2',
  md: 'border-[3px]',
  lg: 'border-4',
  xl: 'border-4',
};

export function Spinner05({
  size = 'md',
  className,
  label,
  ...props
}: Spinner05Props) {
  return (
    <div
      className={cn('inline-flex flex-col items-center justify-center gap-3', className)}
      role="status"
      aria-label={label || 'Loading'}
      {...props}
    >
      <div className={cn('relative flex items-center justify-center', sizeMap[size])}>
        {/* Outer track */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-primary/20',
            strokeMap[size]
          )}
        />
        {/* Spinning gradient / arc */}
        <div
          className={cn(
            'absolute inset-0 rounded-full border-transparent border-t-primary animate-spin',
            strokeMap[size]
          )}
          style={{ animationDuration: '0.8s' }}
        />
        {/* Inner pulsing core */}
        <div className="w-2/5 h-2/5 rounded-full bg-primary/60 animate-pulse" />
      </div>
      {label && (
        <span className="text-sm font-medium text-muted-foreground animate-pulse">
          {label}
        </span>
      )}
    </div>
  );
}
