
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

export function LoadingSpinner({ size = 'md', fullPage = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-2',
    lg: 'h-16 w-16 border-4'
  };

  const spinner = (
    <div className={`animate-spin rounded-full border-b-primary-600 border-gray-200 ${sizeClasses[size]}`} />
  );

  if (fullPage) {
    return (
      <div className="flex h-full min-h-[400px] w-full items-center justify-center bg-white/50 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
}
