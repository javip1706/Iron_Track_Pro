import { BodyStat, ExerciseBase, Routine, WorkoutSessionLog, SetLog } from '../types';
import { INITIAL_EXERCISES } from '../constants';

const KEYS = {
  ROUTINES: 'it_routines',
  EXERCISES: 'it_exercises',
  STATS: 'it_stats',
  LOGS: 'it_logs',
  ACTIVE_ROUTINE: 'it_active_routine_id',
  SESSION_DRAFT: 'it_session_draft', 
  SESSION_START_TIME: 'it_session_start_time'
};

export interface AppBackup {
    version: number;
    timestamp: number;
    routines?: Routine[];
    exercises?: ExerciseBase[];
    stats?: BodyStat[];
    logs?: WorkoutSessionLog[];
}

export const StorageService = {
  getRoutines: (): Routine[] => {
    const data = localStorage.getItem(KEYS.ROUTINES);
    return data ? JSON.parse(data) : [];
  },
  saveRoutines: (routines: Routine[]) => {
    localStorage.setItem(KEYS.ROUTINES, JSON.stringify(routines));
  },

  getExercises: (): ExerciseBase[] => {
    const data = localStorage.getItem(KEYS.EXERCISES);
    return data ? JSON.parse(data) : INITIAL_EXERCISES;
  },
  saveExercises: (exercises: ExerciseBase[]) => {
    localStorage.setItem(KEYS.EXERCISES, JSON.stringify(exercises));
  },

  getBodyStats: (): BodyStat[] => {
    const data = localStorage.getItem(KEYS.STATS);
    return data ? JSON.parse(data) : [];
  },
  saveBodyStats: (stats: BodyStat[]) => {
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  },

  getWorkoutLogs: (): WorkoutSessionLog[] => {
    const data = localStorage.getItem(KEYS.LOGS);
    return data ? JSON.parse(data) : [];
  },
  saveWorkoutLog: (log: WorkoutSessionLog) => {
    const logs = StorageService.getWorkoutLogs();
    const existingIndex = logs.findIndex(l => l.id === log.id);
    if (existingIndex >= 0) {
        logs[existingIndex] = log;
    } else {
        logs.push(log);
    }
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },
  deleteWorkoutLog: (id: string) => {
    const logs = StorageService.getWorkoutLogs().filter(l => l.id !== id);
    localStorage.setItem(KEYS.LOGS, JSON.stringify(logs));
  },

  getActiveRoutineId: (): string | null => {
    return localStorage.getItem(KEYS.ACTIVE_ROUTINE);
  },
  setActiveRoutineId: (id: string) => {
    localStorage.setItem(KEYS.ACTIVE_ROUTINE, id);
  },

  // --- Draft / Auto-save Methods ---
  saveSessionDraft: (logs: Record<string, SetLog[]>, dayId: string) => {
      // Small optimization: don't save if empty
      localStorage.setItem(KEYS.SESSION_DRAFT, JSON.stringify({ dayId, logs, timestamp: Date.now() }));
  },
  getSessionDraft: (): { dayId: string, logs: Record<string, SetLog[]> } | null => {
      const data = localStorage.getItem(KEYS.SESSION_DRAFT);
      if (!data) return null;
      try {
        const parsed = JSON.parse(data);
        // Valid for 24 hours
        if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(KEYS.SESSION_DRAFT);
            return null;
        }
        return parsed;
      } catch (e) {
        return null;
      }
  },
  clearSessionDraft: () => {
      localStorage.removeItem(KEYS.SESSION_DRAFT);
      localStorage.removeItem(KEYS.SESSION_START_TIME);
  },
  
  // Session Timer Persistence
  saveSessionStartTime: (time: number) => {
      localStorage.setItem(KEYS.SESSION_START_TIME, time.toString());
  },
  getSessionStartTime: (): number | null => {
      const time = localStorage.getItem(KEYS.SESSION_START_TIME);
      return time ? parseInt(time) : null;
  },

  // History Helper
  getExerciseHistory: (variantId: string, limit: number = 3) => {
      const logs = StorageService.getWorkoutLogs();
      const sortedLogs = logs.sort((a, b) => b.date - a.date);
      
      const history: { date: number, sets: any[] }[] = [];

      for (const session of sortedLogs) {
          if (history.length >= limit) break;
          
          if (session.exercises) {
              const matchingEx = session.exercises.find(e => e.variantId === variantId);
              if (matchingEx && matchingEx.sets) {
                  history.push({
                      date: session.date,
                      sets: matchingEx.sets
                  });
              }
          }
      }
      return history;
  },

  // Backup & Restore
  createBackup: (): string => {
      const backup: AppBackup = {
          version: 1,
          timestamp: Date.now(),
          routines: StorageService.getRoutines(),
          exercises: StorageService.getExercises(),
          stats: StorageService.getBodyStats(),
          logs: StorageService.getWorkoutLogs()
      };
      return JSON.stringify(backup, null, 2);
  },

  restoreData: (data: Partial<AppBackup>, mode: 'merge' | 'overwrite' = 'overwrite'): boolean => {
      try {
          if (mode === 'overwrite') {
              if (data.routines) localStorage.setItem(KEYS.ROUTINES, JSON.stringify(data.routines));
              if (data.exercises) localStorage.setItem(KEYS.EXERCISES, JSON.stringify(data.exercises));
              if (data.stats) localStorage.setItem(KEYS.STATS, JSON.stringify(data.stats));
              if (data.logs) localStorage.setItem(KEYS.LOGS, JSON.stringify(data.logs));
          } else {
              // Merge Logic
              if (data.routines) {
                  const current = StorageService.getRoutines();
                  const merged = [...current];
                  data.routines.forEach(r => {
                      if (!merged.find(c => c.id === r.id)) merged.push(r);
                  });
                  localStorage.setItem(KEYS.ROUTINES, JSON.stringify(merged));
              }
              if (data.exercises) {
                   const current = StorageService.getExercises();
                   const merged = [...current];
                   data.exercises.forEach(ex => {
                       const existing = merged.find(c => c.id === ex.id);
                       if (!existing) {
                           merged.push(ex);
                       } else {
                           ex.variants.forEach(v => {
                               if(!existing.variants.find(ev => ev.id === v.id)) {
                                   existing.variants.push(v);
                               }
                           });
                       }
                   });
                   localStorage.setItem(KEYS.EXERCISES, JSON.stringify(merged));
              }
              if (data.stats) {
                  const current = StorageService.getBodyStats();
                  const merged = [...current, ...data.stats].sort((a,b) => a.date - b.date);
                  const unique = merged.filter((v,i,a) => a.findIndex(t => t.id === v.id) === i);
                  localStorage.setItem(KEYS.STATS, JSON.stringify(unique));
              }
              if (data.logs) {
                  const current = StorageService.getWorkoutLogs();
                  const merged = [...current, ...data.logs].sort((a,b) => b.date - a.date);
                   const unique = merged.filter((v,i,a) => a.findIndex(t => t.id === v.id) === i);
                  localStorage.setItem(KEYS.LOGS, JSON.stringify(unique));
              }
          }
          return true;
      } catch (e) {
          console.error("Restore failed", e);
          return false;
      }
  },
  
  clearAllData: () => {
      localStorage.clear();
  }
};