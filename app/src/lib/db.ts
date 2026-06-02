import { openDB, type IDBPDatabase } from 'idb';
import type { StateStorage } from 'zustand/middleware';

// ── DB Schema ─────────────────────────────────────────────────────────────────
//
// We use a single object store ("kv") as a generic key-value store so every
// Zustand store can persist its JSON blob under its own namespaced key.
// This is simple and sufficient: user data volumes stay small (< 5 MB).
//
// Future: If sessions grow large, add a dedicated indexed store.

const DB_NAME = 'entrenador-virtual';
const DB_VERSION = 2;
const KV_STORE = 'kv';
const SYNC_QUEUE_STORE = 'sync_queue';
const SYNC_DEAD_LETTER_STORE = 'sync_dead_letter';

let _db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore(KV_STORE);
      }
      if (oldVersion < 2) {
        // Sync queue for offline-first cloud sync
        db.createObjectStore(SYNC_QUEUE_STORE, { keyPath: 'id' });
        db.createObjectStore(SYNC_DEAD_LETTER_STORE, { keyPath: 'id' });
      }
    },
  });
  return _db;
}

// ── Zustand persist storage adapter ──────────────────────────────────────────

export const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const db = await getDB();
      const value = await db.get(KV_STORE, name);
      if (value !== undefined) return value;
      // IDB returned nothing — try localStorage (Safari private mode fallback)
      return localStorage.getItem(name);
    } catch {
      // IDB unavailable (Safari private mode) — fall back to localStorage
      try { return localStorage.getItem(name); } catch { return null; }
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    let idbOk = false;
    try {
      const db = await getDB();
      await db.put(KV_STORE, value, name);
      idbOk = true;
    } catch (e) {
      console.error('[IDB] setItem failed, using localStorage:', e);
    }
    if (!idbOk) {
      try { localStorage.setItem(name, value); } catch { /* quota exceeded */ }
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.delete(KV_STORE, name);
    } catch {
      try { localStorage.removeItem(name); } catch { /* ignore */ }
    }
  },
};

// ── Helpers for bulk operations (export / import / reset) ─────────────────────

export async function exportAllData(): Promise<Record<string, unknown>> {
  const db = await getDB();
  const keys = await db.getAllKeys(KV_STORE);
  const result: Record<string, unknown> = {};
  for (const key of keys) {
    const raw = await db.get(KV_STORE, key);
    try {
      result[key as string] = JSON.parse(raw);
    } catch {
      result[key as string] = raw;
    }
  }
  return result;
}

export async function importAllData(data: Record<string, unknown>): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(KV_STORE, 'readwrite');
  for (const [key, value] of Object.entries(data)) {
    await tx.store.put(
      typeof value === 'string' ? value : JSON.stringify(value),
      key,
    );
  }
  await tx.done;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear(KV_STORE);
}

// ── Sync Queue helpers (used by syncEngine) ──────────────────────────────────

export interface SyncQueueItem {
  id: string;
  table: 'sessions' | 'session_sets' | 'routines' | 'routine_days' | 'profiles';
  operation: 'insert' | 'update' | 'delete';
  payload: Record<string, unknown>;
  createdAt: number;
  attempts: number;
}

export async function enqueueSyncItem(
  item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts'>,
): Promise<void> {
  const db = await getDB();
  await db.put(SYNC_QUEUE_STORE, {
    ...item,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    attempts: 0,
  } satisfies SyncQueueItem);
}

export async function getAllSyncQueueItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAll(SYNC_QUEUE_STORE);
}

export async function deleteSyncQueueItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(SYNC_QUEUE_STORE, id);
}

export async function updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put(SYNC_QUEUE_STORE, item);
}

export async function archiveToDeadLetter(item: SyncQueueItem): Promise<void> {
  const db = await getDB();
  await db.put(SYNC_DEAD_LETTER_STORE, item);
  await db.delete(SYNC_QUEUE_STORE, item.id);
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB();
  return db.count(SYNC_QUEUE_STORE);
}
