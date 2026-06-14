/**
 * Configurações do sistema — GET/PATCH /erp/settings (admin).
 * Os campos seguem o camelCase retornado pela API.
 */
export type SettingsDTO = {
  whatsappPhone: string | null;
  notificationEmail: string | null;
};

export type UpdateSettingsDTO = {
  whatsappPhone: string;
  notificationEmail: string;
};
