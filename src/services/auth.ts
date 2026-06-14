import { apiClient } from '../lib/api-client';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type MeResponse = {
  email: string;
};

export type UpdateEmailRequest = {
  newEmail: string;
  currentPassword: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export const authService = {
  login: (body: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', body),

  /** Dados da conta autenticada — usado para exibir o e-mail de login atual. */
  getMe: () => apiClient.get<MeResponse>('/auth/me'),

  updateEmail: (body: UpdateEmailRequest) =>
    apiClient.patch<void>('/auth/me/email', body),

  changePassword: (body: ChangePasswordRequest) =>
    apiClient.patch<void>('/auth/me/password', body),
};
