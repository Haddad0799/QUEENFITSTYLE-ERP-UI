import { apiClient } from '../lib/api-client';
import type { SettingsDTO, UpdateSettingsDTO } from '../types/settings';

export const settingsService = {
  get: () => apiClient.get<SettingsDTO>('/erp/settings'),

  update: (body: UpdateSettingsDTO) =>
    apiClient.patch<SettingsDTO>('/erp/settings', body),
};
