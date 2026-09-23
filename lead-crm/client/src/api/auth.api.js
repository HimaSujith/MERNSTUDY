import { apiClient } from './axiosClient';

export const authApi = {
  login: (email, password) => apiClient.post('/auth/login', { email, password }).then((r) => r.data),
  refresh: () => apiClient.post('/auth/refresh').then((r) => r.data),
  logout: () => apiClient.post('/auth/logout').then((r) => r.data),
  me: () => apiClient.get('/auth/me').then((r) => r.data),
  changePassword: (currentPassword, newPassword) =>
    apiClient.patch('/auth/me/password', { currentPassword, newPassword }).then((r) => r.data),
};
