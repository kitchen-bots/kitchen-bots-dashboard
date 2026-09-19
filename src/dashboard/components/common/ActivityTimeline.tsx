import { Activity, FileText, Info, Package, Settings, ShoppingCart, User, Wrench } from 'lucide-react';

export type ActivityType = 'system' | 'product' | 'order' | 'user' | 'lead' | 'document' | 'service';
export type ActivityAction = 'created' | 'updated' | 'deleted' | 'status_change' | 'comment';

export interface Activity {
  id: string;
  type: ActivityType;
  action: ActivityAction;
  title: string;
  description?: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: string;
  metadata?: any;
}

interface ActivityTimelineProps {
  activities: Activity[];
  compact?: boolean;
}

export function ActivityTimeline({ activities, compact = false }: ActivityTimelineProps) {
  const getIcon = (type: ActivityType) => {
    switch (type) {
      case 'product': return <Package className="w-4 h-4 text-blue-600" />;
      case 'order': return <ShoppingCart className="w-4 h-4 text-green-600" />;
      case 'user': return <User className="w-4 h-4 text-purple-600" />;
      case 'lead': return <User className="w-4 h-4 text-indigo-600" />;
      case 'document': return <FileText className="w-4 h-4 text-orange-600" />;
      case 'service': return <Wrench className="w-4 h-4 text-red-600" />;
      default: return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getIconBg = (type: ActivityType) => {
    switch (type) {
      case 'product': return 'bg-blue-100 border-blue-200';
      case 'order': return 'bg-green-100 border-green-200';
      case 'user': return 'bg-purple-100 border-purple-200';
      case 'lead': return 'bg-indigo-100 border-indigo-200';
      case 'document': return 'bg-orange-100 border-orange-200';
      case 'service': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <Info className="w-8 h-8 mx-auto text-gray-300 mb-2" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-6 top-3 bottom-3 w-px bg-gray-200 -z-10" />
      <div className="space-y-6">
        {activities.map((activity, _index) => (
          <div key={activity.id} className="flex gap-4">
            <div className={`relative flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center bg-white ${getIconBg(activity.type)}`}>
              {getIcon(activity.type)}
            </div>
            <div className={`flex-1 ${compact ? 'pt-1.5' : 'pt-1 bg-white p-4 rounded-xl border border-gray-100 shadow-sm'}`}>
              <div className="flex items-center justify-between gap-4 mb-1">
                <p className="text-sm font-medium text-gray-900">
                  <span className="font-semibold">{activity.user.name}</span> {activity.title}
                </p>
                <span className="text-xs font-medium text-gray-400 whitespace-nowrap">
                  {activity.timestamp}
                </span>
              </div>
              {activity.description && (
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
