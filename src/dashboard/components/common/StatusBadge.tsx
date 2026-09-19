
export type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  status: string;
  variant?: StatusVariant;
}

export function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getVariantClasses = (v?: StatusVariant, s?: string) => {
    if (v) {
      switch (v) {
        case 'success': return 'bg-green-100 text-green-800 border-green-200';
        case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'error': return 'bg-red-100 text-red-800 border-red-200';
        case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'neutral': return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    }
    
    // Auto-detect based on string value if no variant provided
    const str = (s || '').toLowerCase();
    if (['active', 'delivered', 'won', 'completed', 'success'].includes(str)) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    if (['draft', 'pending', 'negotiation', 'processing'].includes(str)) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (['archived', 'lost', 'cancelled', 'error', 'failed'].includes(str)) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (['contacted', 'shipped', 'proposal sent'].includes(str)) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getVariantClasses(variant, status)}`}>
      {status}
    </span>
  );
}
