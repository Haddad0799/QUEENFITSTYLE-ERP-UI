import { apiClient } from '../lib/api-client';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export const authService = {
  login: (body: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', body),

  changePassword: (body: ChangePasswordRequest) =>
    apiClient.patch<void>('/auth/me/password', body),
};
