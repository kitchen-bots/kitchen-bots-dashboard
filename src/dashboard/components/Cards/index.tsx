import { ReactNode } from 'react';

export const DashboardCard = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  return (
    <div className={`bg-card text-card-foreground rounded-lg border border-border p-6 shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const StatCard = ({ title, value, icon, trend, trendValue }: { title: string, value: string | number, icon: ReactNode, trend?: 'up' | 'down' | 'neutral', trendValue?: string }) => {
  return (
    <DashboardCard className="flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-muted rounded-md text-muted-foreground">
          {icon}
        </div>
      </div>
      <div className="mt-auto">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {trend && trendValue && (
          <div className="mt-2 flex items-center text-xs">
            <span className={`font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'}`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} {trendValue}
            </span>
            <span className="text-muted-foreground ml-2">vs last month</span>
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
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
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
      <div className="px-6 py-4 border-b border-border">
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </DashboardCard>
  );
};
