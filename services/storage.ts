import { supabase } from '../supabaseClient';
import { BodyStat, ExerciseBase, Routine, WorkoutSessionLog, SetLog } from '../types';
import { INITIAL_EXERCISES } from '../constants';

const KEYS = {
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
  // === ROUTINES ===
  getRoutines: async (): Promise<Routine[]> => {
    try {
      const { data, error } = await supabase
        .from('routines')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(r => ({
        id: r.id,
        name: r.name,
        days: r.days,
        createdAt: r.created_at
      })) || [];
    } catch (error) {
      console.error('Error loading routines:', error);
      return [];
    }
  },

  saveRoutines: async (routines: Routine[]) => {
    try {
      // Eliminar todas las rutinas existentes
      await supabase.from('routines').delete().neq('id', '');
      
      // Insertar nuevas rutinas
      const routinesToInsert = routines.map(r => ({
        id: r.id,
        name: r.name,
        days: r.days,
        created_at: r.createdAt
      }));
      
      const { error } = await supabase.from('routines').insert(routinesToInsert);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving routines:', error);
    }
  },

  // === EXERCISES ===
  getExercises: async (): Promise<ExerciseBase[]> => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Primera vez: cargar ejercicios iniciales
        await StorageService.saveExercises(INITIAL_EXERCISES);
        return INITIAL_EXERCISES;
      }
      
      return data.map(e => ({
        id: e.id,
        muscleGroup: e.muscle_group,
        name: e.name,
        variants: e.variants
      }));
    } catch (error) {
      console.error('Error loading exercises:', error);
      return INITIAL_EXERCISES;
    }
  },

  saveExercises: async (exercises: ExerciseBase[]) => {
    try {
      // Eliminar ejercicios existentes
      await supabase.from('exercises').delete().neq('id', '');
      
      // Insertar nuevos ejercicios
      const exercisesToInsert = exercises.map(e => ({
        id: e.id,
        muscle_group: e.muscleGroup,
        name: e.name,
        variants: e.variants
      }));
      
      const { error } = await supabase.from('exercises').insert(exercisesToInsert);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving exercises:', error);
    }
  },

  // === BODY STATS ===
  getBodyStats: async (): Promise<BodyStat[]> => {
    try {
      const { data, error } = await supabase
        .from('body_stats')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(s => ({
        id: s.id,
        date: s.date,
        weight: s.weight,
        bodyFat: s.body_fat,
        waist: s.waist,
        chest: s.chest,
        arm: s.arm
      })) || [];
    } catch (error) {
      console.error('Error loading body stats:', error);
      return [];
    }
  },

  saveBodyStats: async (stats: BodyStat[]) => {
    try {
      // Eliminar stats existentes
      await supabase.from('body_stats').delete().neq('id', '');
      
      // Insertar nuevos stats
      const statsToInsert = stats.map(s => ({
        id: s.id,
        date: s.date,
        weight: s.weight,
        body_fat: s.bodyFat,
        waist: s.waist,
        chest: s.chest,
        arm: s.arm
      }));
      
      const { error } = await supabase.from('body_stats').insert(statsToInsert);
      if (error) throw error;
    } catch (error) {
      console.error('Error saving body stats:', error);
    }
  },

  // === WORKOUT LOGS ===
  getWorkoutLogs: async (): Promise<WorkoutSessionLog[]> => {
    try {
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(l => ({
        id: l.id,
        routineId: l.routine_id,
        routineName: l.routine_name,
        dayId: l.day_id,
        dayName: l.day_name,
        date: l.date,
        weekId: l.week_id,
        exercises: l.exercises
      })) || [];
    } catch (error) {
      console.error('Error loading workout logs:', error);
      return [];
    }
  },

  saveWorkoutLog: async (log: WorkoutSessionLog) => {
    try {
      const logToInsert = {
        id: log.id,
        routine_id: log.routineId,
        routine_name: log.routineName,
        day_id: log.dayId,
        day_name: log.dayName,
        date: log.date,
        week_id: log.weekId,
        exercises: log.exercises
      };
      
      const { error } = await supabase
        .from('workout_logs')
        .upsert(logToInsert);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error saving workout log:', error);
    }
  },

  deleteWorkoutLog: async (id: string) => {
    try {
      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting workout log:', error);
    }
  },

  // === LOCAL STORAGE (para datos temporales) ===
  getActiveRoutineId: (): string | null => {
    return localStorage.getItem(KEYS.ACTIVE_ROUTINE);
  },
  
  setActiveRoutineId: (id: string) => {
    localStorage.setItem(KEYS.ACTIVE_ROUTINE, id);
  },

  saveSessionDraft: (logs: Record<string, SetLog[]>, dayId: string) => {
    localStorage.setItem(KEYS.SESSION_DRAFT, JSON.stringify({ dayId, logs, timestamp: Date.now() }));
  },
  
  getSessionDraft: (): { dayId: string, logs: Record<string, SetLog[]> } | null => {
    const data = localStorage.getItem(KEYS.SESSION_DRAFT);
    if (!data) return null;
    const parsed = JSON.parse(data);
    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(KEYS.SESSION_DRAFT);
      return null;
    }
    return parsed;
  },
  
  clearSessionDraft: () => {
    localStorage.removeItem(KEYS.SESSION_DRAFT);
    localStorage.removeItem(KEYS.SESSION_START_TIME);
  },
  
  saveSessionStartTime: (time: number) => {
    localStorage.setItem(KEYS.SESSION_START_TIME, time.toString());
  },
  
  getSessionStartTime: (): number | null => {
    const time = localStorage.getItem(KEYS.SESSION_START_TIME);
    return time ? parseInt(time) : null;
  },

  // === EXERCISE HISTORY ===
  getExerciseHistory: async (variantId: string, limit: number = 3) => {
    try {
      const logs = await StorageService.getWorkoutLogs();
      const history: { date: number, sets: any[] }[] = [];

      for (const session of logs) {
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
    } catch (error) {
      console.error('Error getting exercise history:', error);
      return [];
    }
  },

  // === BACKUP & RESTORE ===
  createBackup: async (): Promise<string> => {
    const backup: AppBackup = {
      version: 1,
      timestamp: Date.now(),
      routines: await StorageService.getRoutines(),
      exercises: await StorageService.getExercises(),
      stats: await StorageService.getBodyStats(),
      logs: await StorageService.getWorkoutLogs()
    };
    return JSON.stringify(backup, null, 2);
  },

restoreData: async (data: Partial<AppBackup>, mode: 'merge' | 'overwrite' = 'overwrite'): Promise<boolean> => {
  try {
    if (mode === 'overwrite') {
      if (data.routines) await StorageService.saveRoutines(data.routines);
      if (data.exercises) await StorageService.saveExercises(data.exercises);
      if (data.stats) await StorageService.saveBodyStats(data.stats);

      if (data.logs) {
        // Eliminar los logs existentes y reemplazarlos por los nuevos
        await StorageService.saveWorkoutLogs(data.logs);
      }
    } else {
      // MODO MERGE: fusiona con los datos existentes
      if (data.routines) {
        const existing = await StorageService.getRoutines();
        await StorageService.saveRoutines([...existing, ...data.routines]);
      }

      if (data.exercises) {
        const existing = await StorageService.getExercises();
        await StorageService.saveExercises([...existing, ...data.exercises]);
      }

      if (data.stats) {
        const existing = await StorageService.getBodyStats();
        await StorageService.saveBodyStats([...existing, ...data.stats]);
      }

      if (data.logs) {
        const existing = await StorageService.getWorkoutLogs();
        await StorageService.saveWorkoutLogs([...existing, ...data.logs]);
      }
    }

    return true;
  } catch (err) {
    console.error("Error restoring data:", err);
    return false;
  }
},
