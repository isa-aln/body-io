import { REGIONS, VIEW_OF } from '../data/anatomy';
import type { MuscleId, View } from '../types';

const HEADS_IN: Record<View, Set<MuscleId>> = {
  front: new Set(REGIONS.front.map((r) => r.id)),
  back: new Set(REGIONS.back.map((r) => r.id)),
};

/** Which side of the body carries most of this load. Ties go to the front. */
export function viewFor(weights: Record<MuscleId, number>, fallback: View = 'front'): View {
  let front = 0;
  let back = 0;
  Object.entries(weights).forEach(([m, v]) => {
    if (!v) return;
    if (HEADS_IN.front.has(m)) front += v;
    else if (HEADS_IN.back.has(m)) back += v;
  });
  if (!front && !back) return fallback;
  return back > front ? 'back' : 'front';
}

/** The side a single head is drawn on. */
export const viewForMuscle = (m: MuscleId): View => VIEW_OF[m]?.[0] ?? 'front';

/** Every head the given view draws. */
export const headsIn = (v: View) => HEADS_IN[v];
