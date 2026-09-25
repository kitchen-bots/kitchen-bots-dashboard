import { Spinner05 } from '../ui/Spinner05';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullPage?: boolean;
  label?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'lg',
  fullPage = false,
  label = 'Loading...',
  className
}: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className={cn(
        "fixed inset-0 z-50 flex min-h-screen w-screen flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-all duration-300 animate-in fade-in-50",
        className
      )}>
        <div className="flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-card/60 border border-border/50 shadow-xl backdrop-blur-lg">
          <Spinner05 size={size} />
          {label && (
            <p className="text-sm font-medium text-foreground tracking-wide">
              {label}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-center p-6", className)}>
      <Spinner05 size={size} label={label} />
    </div>
  );
}
