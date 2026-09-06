export const ROUTINE_CATEGORIES = ['ESCUELA', 'HOGAR', 'CALMA', 'AUTOCUIDADO'] as const;
export type RoutineCategory = (typeof ROUTINE_CATEGORIES)[number];

export interface Routine {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  category: RoutineCategory;
  points: number;
  completed: boolean;
  createdAt: string;
}

export interface CreateRoutineRequest {
  title: string;
  description?: string;
  category: RoutineCategory;
  points: number;
}
