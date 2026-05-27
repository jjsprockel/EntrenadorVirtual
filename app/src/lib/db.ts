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
const DB_VERSION = 1;
const KV_STORE = 'kv';

let _db: IDBPDatabase | null = null;

async function getDB(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE);
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
      return value ?? null;
    } catch {
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.put(KV_STORE, value, name);
    } catch (e) {
      console.error('[IDB] setItem failed:', e);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      const db = await getDB();
      await db.delete(KV_STORE, name);
    } catch (e) {
      console.error('[IDB] removeItem failed:', e);
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
