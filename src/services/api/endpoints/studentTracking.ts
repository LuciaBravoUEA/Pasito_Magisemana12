import { apiClient } from '../apiClient';
import type { ApiListEnvelope, ApiSuccessEnvelope } from '../../../types/api/common';
import { studentProgressSchema, studentSummarySchema, taskProgressSchema, type StudentProgress, type StudentSummary, type TaskProgress } from '../../../types/api/student-tracking';

const today = (): string => new Date().toISOString().slice(0, 10);

export const listAssignedStudents = async (date = today(), signal?: AbortSignal): Promise<StudentSummary[]> => {
  const { data } = await apiClient.get<ApiListEnvelope<unknown>>('/estudiantes/asignados', { params: { date }, signal });
  return studentSummarySchema.array().parse(data.data);
};

export const getStudentProgress = async (studentId: string, date = today(), signal?: AbortSignal): Promise<StudentProgress> => {
  const { data } = await apiClient.get<ApiSuccessEnvelope<unknown>>(`/estudiantes/${studentId}/progreso`, { params: { date }, signal });
  return studentProgressSchema.parse(data.data);
};

export const completeTask = async (taskId: string, completed: boolean, date = today()): Promise<TaskProgress> => {
  const { data } = await apiClient.post<ApiSuccessEnvelope<unknown>>(`/tareas/${taskId}/completar`, { completed, date });
  return taskProgressSchema.parse(data.data);
};
