import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { completeTask, getStudentProgress, listAssignedStudents } from '../../../services/api/endpoints/studentTracking';

export const trackingKeys = {
  assigned: (date: string) => ['student-tracking', 'assigned', date] as const,
  progress: (studentId: string, date: string) => ['student-tracking', 'progress', studentId, date] as const,
};

export const useAssignedStudents = (date: string, enabled: boolean) => useQuery({
  queryKey: trackingKeys.assigned(date),
  queryFn: ({ signal }) => listAssignedStudents(date, signal),
  enabled,
  retry: false,
});

export const useStudentProgress = (studentId: string, date: string, enabled = true) => useQuery({
  queryKey: trackingKeys.progress(studentId, date),
  queryFn: ({ signal }) => getStudentProgress(studentId, date, signal),
  enabled: enabled && Boolean(studentId),
  retry: false,
});

export const useCompleteTask = (studentId: string, date: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) => completeTask(taskId, completed, date),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: trackingKeys.progress(studentId, date) });
      await queryClient.invalidateQueries({ queryKey: trackingKeys.assigned(date) });
    },
  });
};
