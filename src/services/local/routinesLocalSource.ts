import { getLocalValue as getPreference, setLocalValue as setPreference } from './local-database';
import type { Routine } from '../../types/api/routines';

// Fuente LOCAL del dominio rutinas — cache de lecturas sobre @capacitor/preferences (no
// sensible, ver tech-stack.md §7). Nunca llama a la red; solo lee/escribe lo que el
// repositorio le pida. Sirve para mostrar algo mientras no hay conexión.
const LIST_CACHE_KEY = 'pasitos_magicos_routines_cache_list';
const DETAIL_CACHE_KEY_PREFIX = 'pasitos_magicos_routines_cache_detail_';
export const LOCAL_SCHEMA_VERSION = 1;
export const LOCAL_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedList {
  schemaVersion: number;
  page: number;
  routines: Routine[];
  lastSyncedAt: string;
}

export interface LocalCacheStatus {
  lastSyncedAt: string | null;
  isStale: boolean;
}

const parseCachedList = (raw: string | null): CachedList | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CachedList>;
    if (parsed.schemaVersion !== LOCAL_SCHEMA_VERSION || !Array.isArray(parsed.routines) || !parsed.lastSyncedAt) return null;
    return parsed as CachedList;
  } catch {
    return null;
  }
};

export const getCachedRoutineList = async (page: number): Promise<Routine[] | null> => {
  const raw = await getPreference(`${LIST_CACHE_KEY}_${page}`);
  return parseCachedList(raw)?.routines ?? null;
};

export const getRoutineListCacheStatus = async (page: number): Promise<LocalCacheStatus> => {
  const cached = parseCachedList(await getPreference(`${LIST_CACHE_KEY}_${page}`));
  if (!cached) return { lastSyncedAt: null, isStale: true };
  return { lastSyncedAt: cached.lastSyncedAt, isStale: Date.now() - Date.parse(cached.lastSyncedAt) > LOCAL_CACHE_TTL_MS };
};

export const setCachedRoutineList = async (page: number, routines: Routine[]): Promise<void> => {
  const payload: CachedList = { schemaVersion: LOCAL_SCHEMA_VERSION, page, routines, lastSyncedAt: new Date().toISOString() };
  await setPreference(`${LIST_CACHE_KEY}_${page}`, JSON.stringify(payload));
};

export const getCachedRoutine = async (routineId: string): Promise<Routine | null> => {
  const raw = await getPreference(`${DETAIL_CACHE_KEY_PREFIX}${routineId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Routine;
  } catch {
    return null;
  }
};

export const setCachedRoutine = async (routine: Routine): Promise<void> => {
  await setPreference(`${DETAIL_CACHE_KEY_PREFIX}${routine.id}`, JSON.stringify(routine));
};
