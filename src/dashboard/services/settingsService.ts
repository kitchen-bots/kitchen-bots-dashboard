import { settingsApi, AdminSettingsState } from '../api/settings.api';

export const settingsService = {
  getSettings: async (): Promise<AdminSettingsState> => {
    return await settingsApi.getSettings();
  },

  updateSettings: async (updates: Partial<AdminSettingsState>): Promise<AdminSettingsState> => {
    return await settingsApi.updateSettings(updates);
  }
};
