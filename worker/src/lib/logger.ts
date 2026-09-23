/**
 * Redacted structured logging. Never log tokens, request bodies, customer
 * personal data, or secrets. Only operational metadata reaches logs.
 */

export interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  status?: number;
  durationMs?: number;
  actorUid?: string;
}

function emit(level: 'info' | 'warn' | 'error', ctx: Record<string, unknown>, message: string): void {
  const entry = JSON.stringify({ level, time: new Date().toISOString(), message, ...ctx });
  if (level === 'error') {
    console.error(entry);
  } else if (level === 'warn') {
    console.warn(entry);
  } else {
    console.log(entry);
  }
}

export const log = {
  request(ctx: RequestContext, message = 'request'): void {
    emit('info', { kind: 'request', ...ctx }, message);
  },
  info(ctx: Record<string, unknown>, message: string): void {
    emit('info', ctx, message);
  },
  warn(ctx: Record<string, unknown>, message: string): void {
    emit('warn', ctx, message);
  },
  error(ctx: Record<string, unknown>, message: string): void {
    emit('error', ctx, message);
  },
};
