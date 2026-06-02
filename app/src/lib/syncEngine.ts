import { supabase, isSupabaseConfigured } from './supabase';
import {
  enqueueSyncItem,
  getAllSyncQueueItems,
  deleteSyncQueueItem,
  updateSyncQueueItem,
  archiveToDeadLetter,
  type SyncQueueItem,
} from './db';
import type { Routine, RoutineDay } from '@/types/routine';
import type { Session, CompletedSet } from '@/types/session';

// ── Type mappers (local → DB row) ─────────────────────────────────────────────

function toDbRoutine(r: Routine) {
  return {
    id: r.id,
    user_id: r.userId!,
    name: r.name,
    objective: r.objective,
    level: r.level,
    structure: r.structure,
    days_per_week: r.daysPerWeek,
    duration_weeks: r.durationWeeks ?? null,
    periodization: r.periodization as unknown,
    active: r.active,
    started_at: r.startedAt?.toISOString() ?? null,
    archived_at: null,
  };
}

function toDbRoutineDay(day: RoutineDay, routineId: string) {
  return {
    id: day.id,
    routine_id: routineId,
    day_name: day.dayName,
    day_order: day.dayOfWeek ?? 0,
    muscle_groups: day.muscleGroups,
    exercises: day.exercises as unknown,
  };
}

function toDbSession(s: Session) {
  const iso = (d: Date | string | undefined) =>
    d instanceof Date ? d.toISOString() : d ? String(d) : null;
  return {
    id: s.id,
    user_id: s.userId!,
    routine_id: s.routineId || null,
    routine_day_id: s.dayId || null,
    session_date: iso(s.date)!,
    started_at: iso(s.startedAt)!,
    completed_at: iso(s.completedAt),
    total_volume_kg: s.totalVolume ?? null,
    notes: s.notes ?? null,
  };
}

function toDbSessionSet(
  set: CompletedSet,
  sessionId: string,
  userId: string,
  exerciseCode: string,
  originalCode: string,
) {
  const ts = set.timestamp instanceof Date ? set.timestamp.toISOString() : String(set.timestamp);
  return {
    id: crypto.randomUUID(),
    session_id: sessionId,
    user_id: userId,
    exercise_code: exerciseCode,
    original_exercise_code: originalCode !== exerciseCode ? originalCode : null,
    set_number: set.setNumber,
    weight_kg: set.weight,
    reps: set.reps,
    rir: set.rir ?? null,
    status: set.status,
    completed_at: ts,
  };
}

// ── SyncEngine ────────────────────────────────────────────────────────────────

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

  // Low-level: enqueue a single table operation.
  async enqueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'attempts'>) {
    if (!isSupabaseConfigured) return;
    await enqueueSyncItem(item);
    this.pendingCount++;
    this.emit(navigator.onLine ? 'idle' : 'offline', this.pendingCount);
    if (navigator.onLine) {
      this.processSyncQueue().catch(console.error);
    }
  }

  // High-level helpers called from stores ─────────────────────────────────────

  async enqueueRoutine(routine: Routine) {
    if (!isSupabaseConfigured || !routine.userId) return;
    await this.enqueue({ table: 'routines', operation: 'update', payload: toDbRoutine(routine) as Record<string, unknown> });
    for (const day of routine.days) {
      await this.enqueue({ table: 'routine_days', operation: 'update', payload: toDbRoutineDay(day, routine.id) as Record<string, unknown> });
    }
  }

  async enqueueDeleteRoutine(routine: Routine) {
    if (!isSupabaseConfigured || !routine.userId) return;
    for (const day of routine.days) {
      await this.enqueue({ table: 'routine_days', operation: 'delete', payload: { id: day.id } });
    }
    await this.enqueue({ table: 'routines', operation: 'delete', payload: { id: routine.id } });
  }

  async enqueueSession(session: Session) {
    if (!isSupabaseConfigured || !session.userId) return;
    await this.enqueue({ table: 'sessions', operation: 'insert', payload: toDbSession(session) as Record<string, unknown> });
    for (const ex of session.exercises) {
      for (const set of ex.completedSets) {
        await this.enqueue({
          table: 'session_sets',
          operation: 'insert',
          payload: toDbSessionSet(set, session.id, session.userId, ex.exerciseCode, ex.originalCode) as Record<string, unknown>,
        });
      }
    }
  }

  // ── Queue processing ─────────────────────────────────────────────────────────

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

      this.emit('idle', this.pendingCount);
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
    if (this.onlineListener) return;

    this.onlineListener = () => {
      this.emit('idle', this.pendingCount);
      this.processSyncQueue().catch(console.error);
    };
    window.addEventListener('online', this.onlineListener);
    window.addEventListener('offline', () => this.emit('offline', this.pendingCount));

    this.intervalHandle = setInterval(() => {
      if (navigator.onLine) this.processSyncQueue().catch(console.error);
    }, 60_000);

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
