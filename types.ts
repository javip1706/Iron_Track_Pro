export enum MuscleGroup {
  Biceps = 'Biceps',
  Triceps = 'Triceps',
  Abdominales = 'Abdominales',
  Piernas = 'Piernas',
  Hombro = 'Hombro',
  Pecho = 'Pecho',
  Espalda = 'Espalda',
  Cardio = 'Cardio',
}

export enum ExerciseType {
  Normal = 'Normal',
  Superserie = 'Superserie',
  Biserie = 'Biserie',
  BIIO = 'Series BIIO'
}

export interface Variant {
  id: string;
  name: string;
}

export interface ExerciseBase {
  id: string;
  muscleGroup: MuscleGroup;
  name: string;
  variants: Variant[];
}

export interface ScheduledExercise {
  id: string; // unique instance id
  exerciseBaseId: string;
  variantId: string;
  targetSets: number;
  targetReps: string; // string to allow ranges like "8-12"
  restTimeSeconds: number;
  type: ExerciseType;
  linkedToNext?: boolean; // If true, this exercise is visually linked to the next one (Superset)
  notes?: string;
}

export interface RoutineDay {
  id: string;
  name: string; // e.g., "Día 1 - Torso"
  exercises: ScheduledExercise[];
}

export interface Routine {
  id: string;
  name: string;
  days: RoutineDay[];
  createdAt: number;
  lastUsed?: number;
}

export interface SetLog {
  setNumber: number;
  weight: number;
  reps: number;
  reps2?: number; // For BIIO
  reps3?: number; // For BIIO
  completed: boolean;
  actualRestTime?: number; // How long the user actually rested after this set
}

// New interface to store a snapshot of what was actually done, independent of the Routine ID
export interface CompletedExerciseLog {
    exerciseBaseId: string;
    variantId: string;
    exerciseName: string;
    variantName: string;
    sets: SetLog[];
}

export interface WorkoutSessionLog {
  id: string;
  routineId: string;
  routineName: string;
  dayId: string;
  dayName: string;
  date: number; // timestamp
  weekId: string; // "W47-25"
  startTime?: number;
  endTime?: number;
  duration?: number; // milliseconds
  exercises: CompletedExerciseLog[]; // Snapshot of exercises performed
}

export interface BodyStat {
  id: string;
  date: number;
  weight: number;
  bodyFat?: number;
  waist?: number;
  chest?: number;
  arm?: number;
}

// PWA Install Event Definition
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface Window {
    deferredPrompt: BeforeInstallPromptEvent | null;
  }
}