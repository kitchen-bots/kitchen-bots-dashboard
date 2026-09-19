import { TimelineEvent, AuditTrail } from '../../types/sales';

export class TimelineService {
  private static events: TimelineEvent[] = [];
  private static auditLogs: AuditTrail[] = [];

  static addTimelineEntry(event: Omit<TimelineEvent, 'timestamp'> & { timestamp?: string }): TimelineEvent {
    const newEvent: TimelineEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString()
    };
    this.events.push(newEvent);
    return newEvent;
  }

  static getEventsForEntity(entityId: string): TimelineEvent[] {
    return this.events
      .filter(e => e.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static addAuditLog(log: Omit<AuditTrail, 'timestamp'> & { timestamp?: string }): AuditTrail {
    const newLog: AuditTrail = {
      ...log,
      timestamp: log.timestamp || new Date().toISOString()
    };
    this.auditLogs.push(newLog);
    return newLog;
  }

  static getAuditLogsForEntity(entityId: string): AuditTrail[] {
    return this.auditLogs
      .filter(e => e.entityId === entityId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}
