import * as remoteRoutines from '../api/endpoints/routines';
import { logger } from '../telemetry/logger';
import { localOwner } from '../local/local-database';
import { deliverReminderIntents, saveReminderIntent } from '../local/reminder-intents';
import { useSessionStore } from '../../store/sessionStore';
import { enqueueRoutineCreation, listOutboxEntries, removeOutboxEntry, updateOutboxEntry } from '../local/outboxQueue';
import { getCachedRoutine, getCachedRoutineList, getRoutineListCacheStatus, setCachedRoutine, setCachedRoutineList } from '../local/routinesLocalSource';
import type { ApiListEnvelope } from '../../types/api/common';
import type { CreateRoutineRequest, Routine } from '../../types/api/routines';

// Único punto que los hooks de features/routines pueden importar para leer/escribir rutinas.
// Orquesta remoto (services/api/endpoints/routines.ts) + local (services/local/*) + outbox.
// Los hooks y las pantallas NUNCA importan endpoints/routines.ts ni apiClient directamente —
// ver spec/features/010-cliente-http-datos-chatbot/spec.md, criterio de aceptación correspondiente.

export const listRoutines = async (page: number, signal?: AbortSignal): Promise<ApiListEnvelope<Routine>> => {
  try {
    const remote = await remoteRoutines.listRoutines(page, 10, signal);
    await setCachedRoutineList(page, remote.data).catch(() => logger.warn('No se pudo guardar la caché local'));
    return remote;
  } catch (error) {
    const cached = await getCachedRoutineList(page);
    if (cached) {
      return { data: cached, meta: { page, pageSize: cached.length, total: cached.length, totalPages: 1 } };
    }
    throw error;
  }
};

export const getRoutineListSyncStatus = getRoutineListCacheStatus;

export const getRoutine = async (routineId: string, signal?: AbortSignal): Promise<Routine> => {
  try {
    const remote = await remoteRoutines.getRoutine(routineId, signal);
    await setCachedRoutine(remote).catch(() => logger.warn('No se pudo guardar la caché local'));
    return remote;
  } catch (error) {
    const cached = await getCachedRoutine(routineId);
    if (cached) return cached;
    throw error;
  }
};

// Sin conexión: encola la creación en el outbox en vez de fallar. Con conexión: crea directo.
// `navigator.onLine` es la misma señal que usa hooks/useNetworkStatus.ts.
export const createRoutine = async (request: CreateRoutineRequest, reminderAt?: string): Promise<Routine | { queued: true }> => {
  if (!navigator.onLine) {
    await enqueueRoutineCreation(request, reminderAt);
    return { queued: true };
  }
  return remoteRoutines.createRoutine(request);
};

// Drena el outbox cuando vuelve la conectividad (invocado desde el listener de useNetworkStatus
// en el hook de features/routines, nunca automáticamente en background).
export interface SyncResult { synced: number; failed: number; remindersPending: number }
let inFlight: Promise<SyncResult> | null = null;

export const syncOutbox = (): Promise<SyncResult> => {
  if (inFlight) return inFlight;
  inFlight = drainOutbox().finally(() => { inFlight = null; });
  return inFlight;
};

const drainOutbox = async (): Promise<SyncResult> => {
  const owner = localOwner();
  if (!useSessionStore.getState().user) return { synced: 0, failed: 0, remindersPending: 0 };
  const entries = await listOutboxEntries();
  let synced = 0;
  let failed = 0;
  for (const entry of entries) {
    if (localOwner() !== owner) break;
    if (!navigator.onLine) { failed += 1; continue; }
    if (entry.attempts >= 5) {
      failed += 1;
      continue;
    }
    if (entry.lastAttemptAt && Date.now() - Date.parse(entry.lastAttemptAt) < 500 * 2 ** Math.max(0, entry.attempts - 1)) {
      failed += 1;
      continue;
    }
    try {
      const routine = entry.remoteRoutine ?? await remoteRoutines.createRoutine(entry.request);
      if (localOwner() !== owner) break;
      // Guardar el resultado remoto antes de efectos opcionales evita recrear la rutina si fallan.
      await updateOutboxEntry(entry.localId, { remoteRoutine: routine });
      if (entry.reminderAt) await saveReminderIntent(routine, entry.reminderAt);
      await removeOutboxEntry(entry.localId);
      synced += 1;
    } catch {
      if (localOwner() !== owner) break;
      failed += 1;
      const attempts = entry.attempts + 1;
      await updateOutboxEntry(entry.localId, { attempts, lastAttemptAt: new Date().toISOString() });
      break;
    }
  }
  const remindersPending = localOwner() === owner ? await deliverReminderIntents() : 0;
  return { synced, failed, remindersPending };
};
