import { api } from './base.api';

export interface AdminSettingsState {
  id?: string;
  instanceName: string;
  defaultLanguage: string;
  timezone: string;
  emailReports: boolean;
  pushAlerts: boolean;
  billingUpdates: boolean;
  themeColor: string;
}

export const settingsApi = {
  getSettings: async (): Promise<AdminSettingsState> => {
    let records = await api.request<AdminSettingsState[]>({
      module: 'settings',
      action: 'getAll'
    });
    if (records.length === 0) {
      // Default fallback
      return {
        instanceName: 'KitchenBots India Central',
        defaultLanguage: 'English (India)',
        timezone: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi',
        emailReports: true,
        pushAlerts: false,
        billingUpdates: true,
        themeColor: 'primary'
      };
    }
    return records[0];
  },

  updateSettings: async (updates: Partial<AdminSettingsState>): Promise<AdminSettingsState> => {
    let records = await api.request<AdminSettingsState[]>({ module: 'settings', action: 'getAll' });
    let id = records.length > 0 ? records[0].id : null;
    
    if (id) {
      return await api.request<AdminSettingsState>({
        module: 'settings',
        action: 'update',
        id,
        data: updates
      });
    } else {
      return await api.request<AdminSettingsState>({
        module: 'settings',
        action: 'create',
        data: updates
      });
    }
  }
};
