import type {
  AccessControlProvider,
  AuthProvider,
  DataProvider,
  NotificationProvider,
} from '@refinedev/core';

export interface AuditEventInput {
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditProvider {
  record: (event: AuditEventInput) => Promise<void>;
}

export interface PlatformProviderContracts {
  auth: AuthProvider;
  data: DataProvider;
  accessControl: AccessControlProvider;
  notifications: NotificationProvider;
  audit: AuditProvider;
}
