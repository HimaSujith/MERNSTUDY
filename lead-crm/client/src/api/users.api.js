import { apiClient } from './axiosClient';

export const usersApi = {
  list: (params) => apiClient.get('/users', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/users/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post('/users', payload).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/users/${id}`, payload).then((r) => r.data),
  deactivate: (id) => apiClient.patch(`/users/${id}/deactivate`).then((r) => r.data),
  resetPassword: (id, newPassword) =>
    apiClient.patch(`/users/${id}/reset-password`, { newPassword }).then((r) => r.data),
};
