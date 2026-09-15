import { ALL } from '../data/exercises';
import { GROUP_OF } from '../data/anatomy';
import type { Entry, Exercise, SessionLog, SetLog } from '../types';

/** Smallest jump worth making on each kind of exercise, in kg. */
export function increment(ex: Exercise): number {
  const lower = new Set(['Hips', 'Thighs', 'Lower leg']);
  const groups = new Set(Object.keys(ex.t).map((m) => GROUP_OF[m]));
  if (ex.kind === 'comp') return [...groups].some((g) => lower.has(g)) ? 5 : 2.5;
  // isolation: 2.5kg is a huge relative jump on a lateral raise
  return 1;
}

export type Verdict = 'increase' | 'hold' | 'deload' | 'new';

export interface Recommendation {
  weight: number | null;
  reps: number;
  sets: number;
  verdict: Verdict;
  /** one line the app (or the watch) can show */
  note: string;
}

/** Every session logged for one exercise, oldest first. */
export const historyFor = (log: SessionLog[], exId: string) =>
  log.filter((h) => h.exId === exId).sort((a, b) => a.date.localeCompare(b.date));

/** The weight actually used in a session — the heaviest set, ignoring blanks. */
export const sessionWeight = (s: SessionLog): number | null => {
  const ws = s.sets.map((x) => x.weight).filter((w): w is number => w != null);
  return ws.length ? Math.max(...ws) : null;
};

/** Total reps in a session — what shows progress while the weight is fixed. */
export const sessionReps = (s: SessionLog) => s.sets.reduce((a, x) => a + x.reps, 0);

const met = (set: SetLog) => set.reps >= (set.target ?? 0);
const round = (n: number) => Math.round(n * 2) / 2;

/**
 * Double progression, judged on what was asked for against what was done.
 *
 *   every set met its target, and the target was the top of the range
 *       -> add weight, drop back to the bottom of the range
 *   every set met its target, with room left in the range
 *       -> same weight, ask for one more rep
 *   a set came up short but stayed inside the range
 *       -> same weight, same target, try again
 *   short of the range twice running
 *       -> drop about 10% and rebuild
 */
export function recommend(entry: Entry, history: SessionLog[]): Recommendation {
  const ex = ALL[entry.exId];
  const [low, high] = ex.rr;
  const past = historyFor(history, entry.exId);
  const last = past[past.length - 1];

  if (!last || !last.sets.length) {
    return {
      weight: entry.weight,
      reps: entry.reps,
      sets: entry.sets,
      verdict: 'new',
      note: 'Nothing logged yet. Pick a weight you can hold form on — the next one comes from what you do.',
    };
  }

  const weight = sessionWeight(last) ?? entry.weight;
  const target = last.sets[0]?.target ?? entry.reps;
  const step = increment(ex);
  const recap = `Last time ${weight != null ? weight + 'kg ' : ''}${last.sets.map((s) => s.reps).join(', ')} against ${target}.`;

  if (last.sets.every(met)) {
    if (target >= high) {
      return {
        weight: weight == null ? null : round(weight + step),
        reps: low,
        sets: entry.sets,
        verdict: 'increase',
        note: `${recap} Top of the range on every set, so add ${step}kg and start again at ${low}.`,
      };
    }
    const next = Math.min(high, target + 1);
    return {
      weight,
      reps: next,
      sets: entry.sets,
      verdict: 'hold',
      note: `${recap} Same weight, go for ${next} this time.`,
    };
  }

  if (last.sets.some((s) => s.reps < low)) {
    const prev = past[past.length - 2];
    if (prev && prev.sets.some((s) => s.reps < low) && weight != null) {
      return {
        weight: round(weight * 0.9),
        reps: low,
        sets: entry.sets,
        verdict: 'deload',
        note: `${recap} Under ${low} reps twice running — drop about 10% and build back up.`,
      };
    }
    return {
      weight,
      reps: Math.max(low, target),
      sets: entry.sets,
      verdict: 'hold',
      note: `${recap} Below ${low}, so repeat this weight before moving on.`,
    };
  }

  const weakest = Math.min(...last.sets.map((s) => s.reps));
  return {
    weight,
    reps: target,
    sets: entry.sets,
    verdict: 'hold',
    note: `${recap} Short by ${target - weakest} on your worst set — same weight until every set reaches ${target}.`,
  };
}

/** Roll a finished session into the plan, so the day is ready next time. */
export function applyProgress(entries: Entry[], log: SessionLog[]): Entry[] {
  return entries.map((e) => {
    if (!historyFor(log, e.exId).length) return e;
    const rec = recommend(e, log);
    return { ...e, weight: rec.weight, reps: rec.reps };
  });
}
