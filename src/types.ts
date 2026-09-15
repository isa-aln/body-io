export type MuscleId = string;
export type Equipment = 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight' | 'other';
export type Kind = 'iso' | 'comp';
export type View = 'front' | 'back';

/** An exercise definition. `t` maps muscle-head id -> how hard that head is loaded (0-1). */
export interface Exercise {
  id: string;
  n: string;
  kind: Kind;
  t: Record<MuscleId, number>;
  eq: Equipment;
  star: string | null;
  /** typical rep range [low, high] */
  rr: [number, number];
  /** default reps */
  reps: number;
  /** true when "reps" are really seconds (planks, carries) */
  timed: boolean;
}

/** One line in a routine. */
export interface Entry {
  exId: string;
  sets: number;
  reps: number;
  /** kg. null = not decided yet / bodyweight */
  weight: number | null;
}

/** A routine is one session's worth of work. A week is several routines. */
export interface Routine {
  id: string;
  name: string;
  entries: Entry[];
}

/** What actually happened, logged set by set. This is what feeds progression. */
export interface SetLog {
  /** what the app asked for on this set */
  target: number;
  /** what actually happened */
  reps: number;
  weight: number | null;
}

export interface SessionLog {
  /** which routine produced this, for the history view */
  routineName?: string;
  /** ISO date string */
  date: string;
  exId: string;
  /** which gym / machine, so weights don't get mixed between venues */
  place?: string;
  sets: SetLog[];
}
