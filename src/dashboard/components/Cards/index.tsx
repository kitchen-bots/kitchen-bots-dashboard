import { ReactNode } from 'react';

export const DashboardCard = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${className}`}>
      {children}
    </div>
  );
};

export const StatCard = ({ title, value, icon, trend, trendValue }: { title: string, value: string | number, icon: ReactNode, trend?: 'up' | 'down' | 'neutral', trendValue?: string }) => {
  return (
    <DashboardCard className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        {trend && trendValue && (
          <div className="mt-2 flex items-center text-xs">
            <span className={`font-medium ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-slate-500'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
            </span>
            <span className="text-slate-400 ml-2">vs last month</span>
          </div>
        )}
      </div>
    </DashboardCard>
  );
};

export const AnalyticsCard = ({ title, children, action }: { title: string, children: ReactNode, action?: ReactNode }) => {
  return (
    <DashboardCard className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </DashboardCard>
  );
};

export const WidgetCard = ({ title, children }: { title: string, children: ReactNode }) => {
  return (
    <DashboardCard className="overflow-hidden p-0">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </DashboardCard>
  );
};
