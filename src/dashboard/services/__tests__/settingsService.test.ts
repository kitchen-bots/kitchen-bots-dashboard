import { describe, it, expect } from 'vitest';
import { settingsService } from '../settingsService';
import { DEFAULT_ADMIN_SETTINGS } from '../../api/settings.api';

describe('settingsService', () => {
  it('should retrieve admin settings with fallback', async () => {
    const settings = await settingsService.getSettings();
    expect(settings).toBeDefined();
    expect(settings.instanceName).toBe(DEFAULT_ADMIN_SETTINGS.instanceName);
    expect(settings.defaultLanguage).toBe(DEFAULT_ADMIN_SETTINGS.defaultLanguage);
  });

  it('should update admin settings locally when API is offline', async () => {
    const updated = await settingsService.updateSettings({
      instanceName: 'KitchenBots Mumbai Operations',
      emailReports: false,
    });
    expect(updated).toBeDefined();
    expect(updated.instanceName).toBe('KitchenBots Mumbai Operations');
    expect(updated.emailReports).toBe(false);

    // Verify subsequent read reflects the update
    const current = await settingsService.getSettings();
    expect(current.instanceName).toBe('KitchenBots Mumbai Operations');
  });
});
