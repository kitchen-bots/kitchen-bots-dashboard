import React from 'react';
import { CheckCircle, Clock, XCircle, FileText, Package, Truck, Info, Play } from 'lucide-react';
import { TimelineEvent, TimelineEventType } from '../../../dashboard/types/sales';
import { format } from 'date-fns';

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(' ');

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const getEventIcon = (type: TimelineEventType) => {
  switch (type) {
    case 'CREATED':
    case 'EDITED':
    case 'NOTE_ADDED':
      return <FileText className="h-4 w-4 text-blue-500" />;
    case 'STATUS_CHANGED':
      return <Clock className="h-4 w-4 text-purple-500" />;
    case 'APPROVED':
    case 'CONVERTED_TO_ORDER':
    case 'PAYMENT_RECEIVED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'REJECTED':
    case 'CANCELLED':
    case 'REFUNDED':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'INVENTORY_RESERVED':
    case 'INVENTORY_RELEASED':
      return <Package className="h-4 w-4 text-amber-500" />;
    case 'PACKED':
    case 'SHIPPED':
    case 'DELIVERED':
      return <Truck className="h-4 w-4 text-indigo-500" />;
    default:
      return <Info className="h-4 w-4 text-gray-500" />;
  }
};

export const Timeline: React.FC<TimelineProps> = ({ events, className }) => {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No timeline events found.</p>
      </div>
    );
  }

  return (
    <div className={cn('relative space-y-4', className)}>
      {events.map((event, idx) => (
        <div key={event.id} className="relative flex items-start gap-3">
          {/* Connecting Line */}
          {idx < events.length - 1 && (
            <span className="absolute left-[17px] top-8 -bottom-4 w-px bg-border" aria-hidden="true" />
          )}

          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-card shadow-xs shrink-0 mt-0.5">
            {getEventIcon(event.type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 p-3.5 rounded-lg border border-border shadow-xs flex flex-col transition-colors bg-card text-card-foreground hover:bg-muted/20">
             <div className="flex items-center justify-between gap-2 mb-1">
               <div className="font-semibold text-xs text-foreground truncate">{event.type.replace(/_/g, ' ')}</div>
               <time className="text-[11px] font-medium text-primary shrink-0 whitespace-nowrap">{format(new Date(event.timestamp), 'MMM d, h:mm a')}</time>
             </div>
             <div className="text-muted-foreground text-xs leading-relaxed break-words mb-2">{event.description}</div>
             {event.statusFrom && event.statusTo && (
               <div className="flex items-center text-[11px] text-muted-foreground bg-muted/30 rounded p-1.5 mt-1 border border-border">
                 <span className="font-medium px-1.5 py-0.5 rounded bg-muted text-foreground">{event.statusFrom}</span>
                 <Play className="h-3 w-3 mx-1.5 text-muted-foreground shrink-0" />
                 <span className="font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">{event.statusTo}</span>
               </div>
             )}
             <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center">
               <span className="font-medium mr-1">By:</span> {event.userName}
             </div>
             {event.metadata && Object.keys(event.metadata).length > 0 && (
               <div className="mt-1.5 text-[11px] bg-muted/30 p-1.5 rounded border border-border overflow-hidden text-ellipsis whitespace-nowrap">
                 <span className="font-medium text-foreground">Details: </span>
                 {JSON.stringify(event.metadata)}
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};
