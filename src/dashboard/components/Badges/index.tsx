
export const StatusBadge = ({ status }: { status: string }) => {
  const getColors = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'won':
      case 'active':
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'processing':
      case 'contacted':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'lost':
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'shipped':
      case 'qualified':
        return 'bg-blue-100 text-blue-800';
      case 'new':
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getColors(status)}`}>
      {status}
    </span>
  );
};

export const RoleBadge = ({ role }: { role: string }) => {
  const getColors = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'customer': default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getColors(role)}`}>
      {role}
    </span>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => {
  const getColors = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getColors(priority)}`}>
      {priority}
    </span>
  );
};
