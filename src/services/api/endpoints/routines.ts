import type { ApiListEnvelope, ApiSuccessEnvelope } from '../../../types/api/common';
import type { CreateRoutineRequest, Routine } from '../../../types/api/routines';
import { apiClient } from '../apiClient';

export const listRoutines = async (page: number, pageSize = 10): Promise<ApiListEnvelope<Routine>> => {
  const { data } = await apiClient.get<ApiListEnvelope<Routine>>('/rutinas', { params: { page, pageSize } });
  return data;
};

export const getRoutine = async (routineId: string): Promise<Routine> => {
  const { data } = await apiClient.get<ApiSuccessEnvelope<Routine>>(`/rutinas/${routineId}`);
  return data.data;
};

export const createRoutine = async (request: CreateRoutineRequest): Promise<Routine> => {
  const { data } = await apiClient.post<ApiSuccessEnvelope<Routine>>('/rutinas', request);
  return data.data;
};
