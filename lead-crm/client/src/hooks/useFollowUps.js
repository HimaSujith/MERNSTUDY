import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { followUpsApi } from '../api/followups.api';

export function useFollowUps(params) {
  return useQuery({
    queryKey: ['followups', params],
    queryFn: () => followUpsApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useCreateFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: followUpsApi.create,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['followups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      if (variables?.lead) qc.invalidateQueries({ queryKey: ['leads', variables.lead, 'activity'] });
    },
  });
}

export function useCompleteFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: followUpsApi.complete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      qc.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useCancelFollowUp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: followUpsApi.cancel,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['followups'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
