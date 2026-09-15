import { ALL, MAX_REPS, repUnit } from '../data/exercises';
import { recommend } from '../lib/progression';
import type { Day, Entry, SessionLog } from '../types';

interface Props {
  day: Day;
  log: SessionLog[];
  onChange: (entries: Entry[]) => void;
  onRename: (name: string) => void;
}

export default function DayEditor({ day, log, onChange, onRename }: Props) {
  const entries = day.entries;

  const patch = (i: number, p: Partial<Entry>) => {
    const next = entries.map((e, k) => (k === i ? { ...e, ...p } : e));
    onChange(next);
  };
  const remove = (i: number) => onChange(entries.filter((_, k) => k !== i));
  const move = (from: number, to: number) => {
    if (to < 0 || to >= entries.length) return;
    const next = [...entries];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    onChange(next);
  };

  if (!entries.length) {
    return (
      <>
        <input className="day-name" value={day.name} onChange={(e) => onRename(e.target.value)} aria-label="Day name" />
        <p className="empty">Nothing here yet. Pick a muscle and add exercises from either plate.</p>
      </>
    );
  }

  return (
    <>
      <input className="day-name" value={day.name} onChange={(e) => onRename(e.target.value)} aria-label="Day name" />
      <ul className="wo-list">
        {entries.map((w, i) => {
          const ex = ALL[w.exId];
          const rec = recommend(w, log);
          const maxReps = ex.timed ? 120 : MAX_REPS;
          return (
            <li key={w.exId}>
              <div className="top">
                <span>
                  <span className="mv">
                    <button onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up">
                      ▲
                    </button>
                    <button onClick={() => move(i, i + 1)} disabled={i === entries.length - 1} aria-label="Move down">
                      ▼
                    </button>
                  </span>
                  <span className="n">{ex.n}</span>
                  {ex.star && (
                    <span className="star" title={ex.star}>
                      ★
                    </span>
                  )}
                  <span className={ex.kind === 'comp' ? 't c' : 't'}>{ex.kind === 'comp' ? 'Compound' : 'Isolation'}</span>
                </span>
                <button className="rm" onClick={() => remove(i)} aria-label={`Remove ${ex.n}`}>
                  ×
                </button>
              </div>

              <div className="ctl">
                <label>
                  Sets
                  <Stepper value={w.sets} min={1} max={12} onChange={(v) => patch(i, { sets: v })} />
                </label>
                <label>
                  {ex.timed ? 'Secs' : 'Reps'}
                  <Stepper value={w.reps} min={1} max={maxReps} onChange={(v) => patch(i, { reps: v })} />
                  <span className="rr" title="Typical range for this exercise">
                    {ex.rr[0]}–{ex.rr[1]}
                    {repUnit(ex)}
                  </span>
                </label>
                <label>
                  Weight
                  <input
                    className="kg"
                    type="number"
                    step="0.5"
                    min="0"
                    value={w.weight ?? ''}
                    placeholder="—"
                    onChange={(e) => patch(i, { weight: e.target.value === '' ? null : Number(e.target.value) })}
                    aria-label="Weight in kilograms"
                  />
                  <span className="rr">kg</span>
                </label>
                <span className="vol">{w.sets} sets</span>
              </div>

              {rec.verdict !== 'hold' || rec.note.startsWith('In range') ? <p className={`rec ${rec.verdict}`}>{rec.note}</p> : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Stepper({ value, min, max, onChange }: { value: number; min: number; max: number; onChange: (v: number) => void }) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return (
    <span className="step">
      <button onClick={() => onChange(clamp(value - 1))} aria-label="Decrease">
        −
      </button>
      <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(clamp(Number(e.target.value) || min))} />
      <button onClick={() => onChange(clamp(value + 1))} aria-label="Increase">
        +
      </button>
    </span>
  );
}
