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
    <div className={cn('relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent', className)}>
      {events.map((event) => (
        <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          {/* Icon */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white bg-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {getEventIcon(event.type)}
          </div>
          
          {/* Content */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm flex flex-col transition-all bg-white hover:shadow-md">
             <div className="flex items-center justify-between space-x-2 mb-1">
               <div className="font-bold text-slate-900">{event.type.replace(/_/g, ' ')}</div>
               <time className="font-caveat font-medium text-indigo-500">{format(new Date(event.timestamp), 'MMM d, h:mm a')}</time>
             </div>
             <div className="text-slate-500 text-sm mb-2">{event.description}</div>
             {event.statusFrom && event.statusTo && (
               <div className="flex items-center text-xs text-slate-500 bg-slate-50 rounded p-2 mt-2 border border-slate-100">
                 <span className="font-medium px-2 py-0.5 rounded bg-slate-200">{event.statusFrom}</span>
                 <Play className="h-3 w-3 mx-2 text-slate-400" />
                 <span className="font-medium px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">{event.statusTo}</span>
               </div>
             )}
             <div className="text-xs text-slate-400 mt-2 flex items-center">
               <span className="font-medium mr-1">By:</span> {event.userName}
             </div>
             {event.metadata && Object.keys(event.metadata).length > 0 && (
               <div className="mt-2 text-xs bg-slate-50 p-2 rounded border border-slate-100 overflow-hidden text-ellipsis whitespace-nowrap">
                 <span className="font-medium text-slate-600">Details: </span>
                 {JSON.stringify(event.metadata)}
               </div>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};
