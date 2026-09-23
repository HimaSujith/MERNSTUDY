import { apiClient } from './axiosClient';

export const dashboardApi = {
  summary: () => apiClient.get('/dashboard/summary').then((r) => r.data),
};
