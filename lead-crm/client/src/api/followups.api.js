import { apiClient } from './axiosClient';

export const followUpsApi = {
  list: (params) => apiClient.get('/followups', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/followups/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post('/followups', payload).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/followups/${id}`, payload).then((r) => r.data),
  complete: (id) => apiClient.patch(`/followups/${id}/complete`).then((r) => r.data),
  cancel: (id) => apiClient.patch(`/followups/${id}/cancel`).then((r) => r.data),
};
