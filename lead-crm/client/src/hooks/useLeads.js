import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api/leads.api';

export function useLeads(params) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useLead(id) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: () => leadsApi.get(id),
    enabled: !!id,
  });
}

export function useLeadActivity(id) {
  return useQuery({
    queryKey: ['leads', id, 'activity'],
    queryFn: () => leadsApi.activity(id),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leadsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLead(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => leadsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads', id] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useChangeLeadStatus(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ status, lostReason }) => leadsApi.changeStatus(id, status, lostReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads', id] });
      qc.invalidateQueries({ queryKey: ['leads', id, 'activity'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

export function useAssignLead(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assignedTo) => leadsApi.assign(id, assignedTo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leads', id] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useAddLeadNote(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (message) => leadsApi.addNote(id, message),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads', id, 'activity'] }),
  });
}
