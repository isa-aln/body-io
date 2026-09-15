import { ALL, byName, repUnit } from '../data/exercises';
import type { Entry, Routine, SessionLog } from '../types';

const uid = () => Math.random().toString(36).slice(2, 9);

/** Wire format. Exercises travel by name, so a file still opens after ids change. */
interface WireEntry {
  ex: string;
  sets: number;
  reps: number;
  weight: number | null;
}
interface WireRoutine {
  name: string;
  entries: WireEntry[];
}
interface WireFile {
  app: 'body.io';
  v: 1;
  routines: WireRoutine[];
  /** training history, by exercise name so it survives data changes */
  log?: { date: string; ex: string; routineName?: string; sets: { target: number; reps: number; weight: number | null }[] }[];
}

export function toWire(routines: Routine[]): WireFile {
  return {
    app: 'body.io',
    v: 1,
    routines: routines.map((r) => ({
      name: r.name,
      entries: r.entries
        .filter((e) => ALL[e.exId])
        .map((e) => ({ ex: ALL[e.exId].n, sets: e.sets, reps: e.reps, weight: e.weight })),
    })),
  };
}

/** Anything unrecognised is dropped rather than throwing — a half-readable file still opens. */
export function fromWire(data: unknown): Routine[] {
  const file = data as Partial<WireFile>;
  if (!file || !Array.isArray(file.routines)) return [];

  const readEntries = (xs: unknown): Entry[] =>
    (Array.isArray(xs) ? xs : [])
      .map((e: any): Entry | null => {
        const ex = byName(String(e?.ex ?? ''));
        if (!ex) return null;
        return {
          exId: ex.id,
          sets: clamp(Number(e.sets) || 3, 1, 12),
          reps: clamp(Number(e.reps) || ex.reps, 1, ex.timed ? 300 : 30),
          weight: e.weight == null || Number.isNaN(Number(e.weight)) ? null : Number(e.weight),
        };
      })
      .filter((e): e is Entry => e !== null);

  const out: Routine[] = [];
  (file.routines as any[]).forEach((r) => {
    if (!r) return;
    const base = typeof r.name === 'string' && r.name.trim() ? r.name.trim() : 'Imported routine';
    // files saved before routines were flattened still carry days
    if (Array.isArray(r.days)) {
      r.days.forEach((d: any, i: number) => {
        const entries = readEntries(d?.entries);
        if (!entries.length) return;
        out.push({ id: uid(), name: r.days.length > 1 ? `${base} — ${d?.name ?? i + 1}` : base, entries });
      });
      return;
    }
    const entries = readEntries(r.entries);
    if (entries.length) out.push({ id: uid(), name: base, entries });
  });
  return out;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

export const toJSON = (routines: Routine[]) => JSON.stringify(toWire(routines), null, 2);

export function fromJSON(text: string): Routine[] {
  try {
    return fromWire(JSON.parse(text));
  } catch {
    return [];
  }
}

/** Readable version for pasting into a message. */
export function toPlainText(routine: Routine): string {
  const lines = [routine.name, ''];
  routine.entries.forEach((e) => {
    const ex = ALL[e.exId];
    const load = e.weight != null ? ` @ ${e.weight}kg` : '';
    lines.push(`  ${ex.n} — ${e.sets} × ${e.reps}${repUnit(ex)}${load}`);
  });
  return lines.join('\n');
}

/* ---- links: the routine is encoded in the URL, nothing is uploaded ---- */

const b64url = (s: string) =>
  btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const unb64url = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export const toLink = (routine: Routine) =>
  `${location.origin}${location.pathname}#/r=${b64url(JSON.stringify(toWire([routine])))}`;

export function fromLinkHash(hash: string): Routine[] {
  const m = hash.match(/#\/r=([A-Za-z0-9_-]+)/);
  if (!m) return [];
  try {
    return fromWire(JSON.parse(unb64url(m[1])));
  } catch {
    return [];
  }
}

export function download(filename: string, text: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const slug = (s: string) => s.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'routine';


/* ---- full backup: routines plus the whole training history ---- */

export function toBackup(routines: Routine[], log: SessionLog[]): string {
  const file = toWire(routines);
  file.log = log
    .filter((l) => ALL[l.exId])
    .map((l) => ({
      date: l.date,
      ex: ALL[l.exId].n,
      routineName: l.routineName,
      sets: l.sets.map((s) => ({ target: s.target, reps: s.reps, weight: s.weight })),
    }));
  return JSON.stringify(file, null, 2);
}

export function logFromJSON(text: string): SessionLog[] {
  try {
    const file = JSON.parse(text) as WireFile;
    if (!Array.isArray(file?.log)) return [];
    return file.log
      .map((l): SessionLog | null => {
        const ex = byName(String(l?.ex ?? ''));
        if (!ex || !Array.isArray(l.sets) || !l.sets.length) return null;
        return {
          date: typeof l.date === 'string' ? l.date : new Date().toISOString(),
          exId: ex.id,
          routineName: typeof l.routineName === 'string' ? l.routineName : undefined,
          sets: l.sets.map((s) => ({
            target: Number(s?.target) || 0,
            reps: Math.max(1, Number(s?.reps) || 1),
            weight: s?.weight == null || Number.isNaN(Number(s.weight)) ? null : Number(s.weight),
          })),
        };
      })
      .filter((l): l is SessionLog => l !== null);
  } catch {
    return [];
  }
}

/** Two sessions are the same if they hit the same exercise at the same moment. */
export function mergeLogs(existing: SessionLog[], incoming: SessionLog[]): SessionLog[] {
  const seen = new Set(existing.map((l) => `${l.date}|${l.exId}`));
  return [...existing, ...incoming.filter((l) => !seen.has(`${l.date}|${l.exId}`))];
}
