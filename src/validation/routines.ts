import { z } from 'zod';
import { ROUTINE_CATEGORIES } from '../types/api/routines';

export const createRoutineSchema = z.object({
  title: z.string().trim().min(2, 'Título: escribe al menos 2 caracteres.').max(80, 'Título: usa como máximo 80 caracteres.'),
  description: z.string().trim().max(240, 'Descripción: usa como máximo 240 caracteres.').optional(),
  category: z.enum(ROUTINE_CATEGORIES, { message: 'Categoría: selecciona una opción disponible.' }),
  points: z.number().int('Puntos: escribe un número entero.').min(1, 'Puntos: el mínimo es 1.').max(100, 'Puntos: el máximo es 100.'),
});

export type CreateRoutineFormValues = z.infer<typeof createRoutineSchema>;
