import { apiClient } from './axiosClient';

export const leadsApi = {
  list: (params) => apiClient.get('/leads', { params }).then((r) => r.data),
  get: (id) => apiClient.get(`/leads/${id}`).then((r) => r.data),
  create: (payload) => apiClient.post('/leads', payload).then((r) => r.data),
  update: (id, payload) => apiClient.patch(`/leads/${id}`, payload).then((r) => r.data),
  changeStatus: (id, status, lostReason) =>
    apiClient.patch(`/leads/${id}/status`, { status, lostReason }).then((r) => r.data),
  assign: (id, assignedTo) => apiClient.patch(`/leads/${id}/assign`, { assignedTo }).then((r) => r.data),
  addNote: (id, message) => apiClient.post(`/leads/${id}/notes`, { message }).then((r) => r.data),
  activity: (id) => apiClient.get(`/leads/${id}/activity`).then((r) => r.data),
  remove: (id) => apiClient.delete(`/leads/${id}`).then((r) => r.data),
};
