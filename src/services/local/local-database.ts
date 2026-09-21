import { getPreference, removePreference } from '../storage/preferences';
import { useSessionStore } from '../../store/sessionStore';

const STORE = 'records';
let connection: Promise<IDBDatabase> | undefined;
export const localOwner = (): string => useSessionStore.getState().user?.id ?? 'device';

const openDatabase = (): Promise<IDBDatabase> => {
  if (connection) return connection;
  connection = new Promise((resolve, reject) => {
    const request = indexedDB.open('pasitos-magicos-local', 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error('Local database blocked'));
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => { db.close(); connection = undefined; };
      resolve(db);
    };
  });
  connection.catch(() => { connection = undefined; });
  return connection;
};

const readValue = async (key: string): Promise<string | null> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readonly');
    const request = transaction.objectStore(STORE).get(key);
    transaction.oncomplete = () => resolve(typeof request.result === 'string' ? request.result : null);
    transaction.onabort = () => reject(transaction.error ?? new Error('Local read failed'));
    transaction.onerror = () => reject(transaction.error);
  });
};

const changeValue = async (key: string, change: (value: string | null) => string | null): Promise<void> => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    const store = transaction.objectStore(STORE);
    const request = store.get(key);
    request.onsuccess = () => {
      try {
        const value = change(typeof request.result === 'string' ? request.result : null);
        if (value === null) store.delete(key);
        else store.put(value, key);
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    };
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('Local write failed'));
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getLocalValue = async (key: string, owner = localOwner()): Promise<string | null> => {
  const scopedKey = `${owner}:${key}`;
  const current = await readValue(scopedKey);
  if (current !== null) return current;
  const legacy = await getPreference(key);
  if (legacy === null || localOwner() !== owner) return null;
  // No se elimina la copia anterior hasta confirmar la transacción de migración.
  await changeValue(scopedKey, value => value ?? legacy);
  await removePreference(key);
  return readValue(scopedKey);
};

export const updateLocalValue = async (key: string, change: (value: string | null) => string | null, owner = localOwner()): Promise<void> => {
  await getLocalValue(key, owner);
  if (localOwner() !== owner) throw new Error('Session changed');
  await changeValue(`${owner}:${key}`, value => {
    if (localOwner() !== owner) throw new Error('Session changed');
    return change(value);
  });
};

export const setLocalValue = async (key: string, value: string, owner = localOwner()): Promise<void> =>
  updateLocalValue(key, () => value, owner);

export const removeLocalValue = async (key: string): Promise<void> => updateLocalValue(key, () => null);

export const clearLocalDatabase = async (): Promise<void> => {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error);
    transaction.onerror = () => reject(transaction.error);
  });
};
