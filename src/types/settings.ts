/**
 * Configurações do sistema — GET/PATCH /erp/settings (admin).
 * Os campos seguem o snake_case retornado pela API.
 */
export type SettingsDTO = {
  whatsapp_phone: string | null;
  notification_email: string | null;
};

export type UpdateSettingsDTO = {
  whatsapp_phone: string;
  notification_email: string;
};
