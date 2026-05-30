import { supabase, isSupabaseConfigured } from './supabase';
import {
  enqueueSyncItem,
  getAllSyncQueueItems,
  deleteSyncQueueItem,
  updateSyncQueueItem,
  archiveToDeadLetter,
  type SyncQueueItem,
} from './db';

export type SyncStatus = 'idle' | 'syncing' | 'offline' | 'error';

type StatusListener = (status: SyncStatus, pendingCount: number) => void;

class SyncEngine {
  private syncing = false;
  private onlineListener: (() => void) | null = null;
  private intervalHandle: ReturnType<typeof setInterval> | null = null;
  private statusListeners: Set<StatusListener> = new Set();
  private pendingCount = 0;
  private _status: SyncStatus = 'idle';

  get status(): SyncStatus {
    return this._status;
  }

  onStatusChange(listener: StatusListener) {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  private emit(status: SyncStatus, pendingCount: number) {
    this._status = status;
    this.pendingCount = pendingCount;
    this.statusListeners.forEach((l) => l(status, pendingCount));
  }

  // Enqueue a write operation for later sync to Supabase.
  // Returns immediately — write to IndexedDB first, then call this.
  async enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts'>) {
    if (!isSupabaseConfigured) return;
    await enqueueSyncItem(item);
    this.pendingCount++;
    this.emit(navigator.onLine ? 'idle' : 'offline', this.pendingCount);
    if (navigator.onLine) {
      // Process async without awaiting so callers aren't blocked
      this.processSyncQueue().catch(console.error);
    }
  }

  async processSyncQueue() {
    if (!isSupabaseConfigured || !supabase || this.syncing || !navigator.onLine) return;

    this.syncing = true;
    this.emit('syncing', this.pendingCount);

    try {
      const items = await getAllSyncQueueItems();
      this.pendingCount = items.length;

      for (const item of items) {
        try {
          await this.syncItem(item);
          await deleteSyncQueueItem(item.id);
          this.pendingCount--;
        } catch (err) {
          console.warn('[Sync] failed item:', item.table, item.operation, err);
          item.attempts++;
          if (item.attempts < 5) {
            await updateSyncQueueItem(item);
          } else {
            await archiveToDeadLetter(item);
            this.pendingCount--;
          }
        }
      }

      this.emit(this.pendingCount > 0 ? 'idle' : 'idle', this.pendingCount);
    } catch (err) {
      console.error('[Sync] processSyncQueue error:', err);
      this.emit('error', this.pendingCount);
    } finally {
      this.syncing = false;
    }
  }

  private async syncItem(item: SyncQueueItem) {
    if (!supabase) throw new Error('Supabase not configured');

    const { table, operation, payload } = item;

    if (operation === 'insert' || operation === 'update') {
      const { error } = await supabase.from(table).upsert(payload as never);
      if (error) throw error;
    } else if (operation === 'delete') {
      const { error } = await supabase.from(table).delete().eq('id', payload['id'] as string);
      if (error) throw error;
    }
  }

  start() {
    if (!isSupabaseConfigured) return;
    if (this.onlineListener) return; // Already started

    this.onlineListener = () => {
      this.emit('idle', this.pendingCount);
      this.processSyncQueue().catch(console.error);
    };
    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', () => this.emit('offline', this.pendingCount));

    // Periodic sync every 60 s when online
    this.intervalHandle = setInterval(() => {
      if (navigator.onLine) this.processSyncQueue().catch(console.error);
    }, 60_000);

    // Initial attempt
    if (navigator.onLine) this.processSyncQueue().catch(console.error);
  }

  stop() {
    if (this.onlineListener) {
      window.removeEventListener('online', this.onlineListener);
      this.onlineListener = null;
    }
    if (this.intervalHandle !== null) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }
}

export const syncEngine = new SyncEngine();
