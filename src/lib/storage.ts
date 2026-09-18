import { ALL } from '../data/exercises';
import type { Entry, Routine, SessionLog } from '../types';

const KEY = 'bodyio.v1';

export interface Settings {
  unit: 'kg' | 'lb';
  /** gyms the user trains at; weights are compared within a gym, not across */
  places: string[];
  activePlace: string | null;
  /** how many sessions have been logged since the last backup was taken */
  sinceBackup: number;
  seenIntro: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  unit: 'kg',
  places: [],
  activePlace: null,
  sinceBackup: 0,
  seenIntro: false,
};

export interface Store {
  routines: Routine[];
  activeRoutineId: string | null;
  log: SessionLog[];
  settings: Settings;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const validEntries = (xs: unknown): Entry[] =>
  Array.isArray(xs) ? (xs as Entry[]).filter((e) => e && ALL[e.exId]) : [];

/**
 * Routines used to hold days. Anything saved in that shape is split so each
 * day becomes a routine of its own, which is how the app works now.
 */
function normalise(raw: unknown): Routine[] {
  if (!Array.isArray(raw)) return [];
  const out: Routine[] = [];
  raw.forEach((r: any) => {
    if (!r) return;
    if (Array.isArray(r.days)) {
      r.days.forEach((d: any) => {
        const entries = validEntries(d?.entries);
        if (!entries.length) return;
        const name = r.days.length > 1 ? `${r.name} — ${d.name}` : r.name;
        out.push({ id: uid(), name: String(name || 'Routine'), entries });
      });
      return;
    }
    const entries = validEntries(r.entries);
    out.push({ id: String(r.id || uid()), name: String(r.name || 'Routine'), entries });
  });
  return out;
}

export function loadStore(): Store | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    const routines = normalise(d?.routines);
    if (!routines.length) return null;
    return {
      routines,
      activeRoutineId: routines.some((r) => r.id === d?.activeRoutineId) ? d.activeRoutineId : routines[0].id,
      log: Array.isArray(d?.log) ? d.log.filter((l: SessionLog) => ALL[l.exId]) : [],
      settings: { ...DEFAULT_SETTINGS, ...(d?.settings ?? {}) },
    };
  } catch {
    return null;
  }
}

export function saveStore(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // quota or private mode — not worth interrupting the workout over
  }
}
