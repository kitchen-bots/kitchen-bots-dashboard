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

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsState = {
  id: 'cfg-default-1',
  instanceName: 'KitchenBots India Central',
  defaultLanguage: 'English (India)',
  timezone: '(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi',
  emailReports: true,
  pushAlerts: false,
  billingUpdates: true,
  themeColor: 'primary',
};

let localSettings: AdminSettingsState = { ...DEFAULT_ADMIN_SETTINGS };

export const settingsApi = {
  getSettings: async (): Promise<AdminSettingsState> => {
    try {
      const records = await api.request<AdminSettingsState[]>({
        module: 'settings',
        action: 'getAll',
      });
      if (!records || records.length === 0) {
        return { ...localSettings };
      }
      return records[0];
    } catch (err) {
      console.warn('Failed to fetch settings from API, falling back to operational settings', err);
      return { ...localSettings };
    }
  },

  updateSettings: async (updates: Partial<AdminSettingsState>): Promise<AdminSettingsState> => {
    try {
      const records = await api.request<AdminSettingsState[]>({ module: 'settings', action: 'getAll' });
      const id = records && records.length > 0 ? records[0].id : null;

      if (id) {
        const updated = await api.request<AdminSettingsState>({
          module: 'settings',
          action: 'update',
          id,
          data: updates,
        });
        localSettings = { ...localSettings, ...updated };
        return updated;
      } else {
        const created = await api.request<AdminSettingsState>({
          module: 'settings',
          action: 'create',
          data: updates,
        });
        localSettings = { ...localSettings, ...created };
        return created;
      }
    } catch (err) {
      console.warn('Failed to persist settings to API, saving locally', err);
      localSettings = { ...localSettings, ...updates };
      return { ...localSettings };
    }
  },
};
