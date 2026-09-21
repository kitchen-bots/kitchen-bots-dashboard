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
    <div className={cn('relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent', className)}>
      {events.map((event) => (
        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className="flex items-center justify-center w-9 h-9 rounded-md border border-border bg-card shadow-xs shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {getEventIcon(event.type)}
          </div>
          
          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3.5 rounded-lg border border-border shadow-xs flex flex-col transition-colors bg-card text-card-foreground hover:bg-muted/20">
             <div className="flex items-center justify-between space-x-2 mb-1">
               <div className="font-semibold text-xs text-foreground">{event.type.replace(/_/g, ' ')}</div>
               <time className="text-[11px] font-medium text-primary">{format(new Date(event.timestamp), 'MMM d, h:mm a')}</time>
             </div>
             <div className="text-muted-foreground text-xs mb-2">{event.description}</div>
             {event.statusFrom && event.statusTo && (
               <div className="flex items-center text-[11px] text-muted-foreground bg-muted/30 rounded p-1.5 mt-1 border border-border">
                 <span className="font-medium px-1.5 py-0.5 rounded bg-muted text-foreground">{event.statusFrom}</span>
                 <Play className="h-3 w-3 mx-1.5 text-muted-foreground" />
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
