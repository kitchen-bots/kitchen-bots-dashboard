
export const StatusBadge = ({ status }: { status: string }) => {
  const getColors = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'won':
      case 'active':
      case 'success':
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      case 'processing':
      case 'contacted':
      case 'pending':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'cancelled':
      case 'lost':
      case 'error':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'shipped':
      case 'qualified':
        return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'new':
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${getColors(status)}`}>
      {status}
    </span>
  );
};

export const RoleBadge = ({ role }: { role: string }) => {
  const getColors = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/20';
      case 'manager': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20';
      case 'customer': default: return 'bg-muted text-muted-foreground border border-border';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${getColors(role)}`}>
      {role}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const getColors = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20';
      case 'medium': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20';
      case 'low': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border border-border';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium capitalize ${getColors(priority)}`}>
      {priority}
    </span>
  );
};
