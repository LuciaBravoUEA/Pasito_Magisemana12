import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createRoutine, getRoutine, listRoutines } from '../../../services/api/endpoints/routines';
import { getUserErrorMessage } from '../../../services/api/errorMapper';
import type { Routine } from '../../../types/api/routines';
import type { RemoteData } from '../../../types/remote-data';

export const routineKeys = {
  all: ['routines'] as const,
  list: (page: number) => ['routines', 'list', { page }] as const,
  detail: (routineId: string) => ['routines', 'detail', routineId] as const,
};

export const useRoutines = (page: number) => {
  const query = useQuery({ queryKey: routineKeys.list(page), queryFn: () => listRoutines(page) });
  let state: RemoteData<Routine[]>;
  if (query.isPending) state = { status: 'loading' };
  else if (query.isError) state = { status: 'error', message: getUserErrorMessage(query.error), retry: () => void query.refetch() };
  else if (query.data.data.length === 0) state = { status: 'empty' };
  else state = { status: 'success', data: query.data.data };
  return { state, meta: query.data?.meta };
};

export const useRoutine = (routineId: string, enabled: boolean) => {
  const query = useQuery({ queryKey: routineKeys.detail(routineId), queryFn: () => getRoutine(routineId), enabled });
  let state: RemoteData<Routine>;
  if (query.isPending) state = { status: 'loading' };
  else if (query.isError) state = { status: 'error', message: getUserErrorMessage(query.error), retry: () => void query.refetch() };
  else state = { status: 'success', data: query.data };
  return state;
};

export const useCreateRoutine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRoutine,
    onSuccess: async routine => {
      queryClient.setQueryData(routineKeys.detail(routine.id), routine);
      await queryClient.invalidateQueries({ queryKey: ['routines', 'list'] });
    },
  });
};
