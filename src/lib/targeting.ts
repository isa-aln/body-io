import { ALL } from '../data/exercises';
import { GROUP_OF, GROUPS } from '../data/anatomy';
import type { Entry, MuscleId } from '../types';

export interface Targeting {
  /** sets landing on each muscle head, weighted by how hard the exercise loads it */
  head: Record<MuscleId, number>;
  /** sets per muscle group */
  group: Record<string, number>;
  total: number;
}

/**
 * Everything is measured in sets. An exercise that loads a head at 0.5 gives
 * that head half a set per set performed. No effort/RPE multiplier - if it's in
 * the plan, it counts.
 */
export function targeting(entries: Entry[]): Targeting {
  const head: Record<MuscleId, number> = {};
  entries.forEach((w) => {
    const ex = ALL[w.exId];
    if (!ex) return;
    Object.entries(ex.t).forEach(([m, v]) => {
      head[m] = (head[m] ?? 0) + v * w.sets;
    });
  });
  const group: Record<string, number> = {};
  Object.entries(head).forEach(([m, v]) => {
    group[GROUP_OF[m]] = (group[GROUP_OF[m]] ?? 0) + v;
  });
  const total = Object.values(head).reduce((a, b) => a + b, 0);
  return { head, group, total };
}

/**
 * Hard sets per group, counting each exercise once per group at its strongest
 * head. This is the number to compare against weekly volume landmarks - the
 * targeting() group figure double-counts an exercise that hits several heads in
 * the same group.
 */
export function setsPerGroup(entries: Entry[]): Record<string, number> {
  const out: Record<string, number> = {};
  entries.forEach((w) => {
    const ex = ALL[w.exId];
    if (!ex) return;
    const perGroup: Record<string, number> = {};
    Object.entries(ex.t).forEach(([m, v]) => {
      perGroup[GROUP_OF[m]] = Math.max(perGroup[GROUP_OF[m]] ?? 0, v);
    });
    Object.entries(perGroup).forEach(([g, v]) => {
      out[g] = (out[g] ?? 0) + v * w.sets;
    });
  });
  return out;
}

export const ALL_GROUPS = GROUPS.map((G) => G.g);
export const fmtPct = (p: number) => Math.round(p * 100) + '%';
