import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL, repUnit } from '../data/exercises';
import { recommend } from '../lib/progression';
import type { Routine, SessionLog, SetLog } from '../types';

interface Props {
  routine: Routine;
  log: SessionLog[];
  onSave: (logs: SessionLog[]) => void;
  onExit: () => void;
}

/** Rest between sets. Compounds need longer than isolation. */
const restFor = (kind: string) => (kind === 'comp' ? 180 : 90);

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function SessionMode({ routine, log, onSave, onExit }: Props) {
  /** What we set out to do, with the weight the progression engine suggests. */
  const plan = useMemo(
    () =>
      routine.entries.map((entry) => {
        const rec = recommend(entry, log);
        return {
          entry,
          ex: ALL[entry.exId],
          targetReps: rec.reps,
          targetWeight: rec.weight,
          note: rec.note,
        };
      }),
    [routine, log]
  );

  const [done, setDone] = useState<SetLog[][]>(() => plan.map(() => []));
  const [exIndex, setExIndex] = useState(0);
  const [reps, setReps] = useState(plan[0]?.targetReps ?? 10);
  const [weight, setWeight] = useState<number | null>(plan[0]?.targetWeight ?? null);
  const [rest, setRest] = useState(0);
  const timer = useRef<number | null>(null);

  const current = plan[exIndex];
  const setsDone = done[exIndex]?.length ?? 0;
  const setsLeft = current ? current.entry.sets - setsDone : 0;
  const finished = plan.every((p, i) => done[i].length >= p.entry.sets);

  // rest countdown
  useEffect(() => {
    if (rest <= 0) return;
    timer.current = window.setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [rest > 0]);

  // when the exercise changes, prefill from its plan
  const goTo = (i: number) => {
    const p = plan[i];
    if (!p) return;
    setExIndex(i);
    setReps(p.targetReps);
    setWeight(p.targetWeight);
    setRest(0);
  };

  if (!plan.length) {
    return (
      <div className="session">
        <div className="session-head">
          <h2>{routine.name}</h2>
          <button onClick={onExit}>Close</button>
        </div>
        <p className="empty">Nothing in this routine yet. Add exercises first.</p>
      </div>
    );
  }

  const logSet = () => {
    const next = done.map((sets, i) =>
      i === exIndex ? [...sets, { target: current.targetReps, reps, weight }] : sets
    );
    setDone(next);

    const doneHere = next[exIndex].length;
    if (doneHere >= current.entry.sets) {
      // move to the next exercise that still has sets left
      const nextIdx = plan.findIndex((p, i) => i > exIndex && next[i].length < p.entry.sets);
      if (nextIdx >= 0) {
        goTo(nextIdx);
        setRest(restFor(current.ex.kind));
        return;
      }
    }
    setRest(restFor(current.ex.kind));
  };

  const undoSet = () => {
    setDone(done.map((sets, i) => (i === exIndex ? sets.slice(0, -1) : sets)));
    setRest(0);
  };

  const finish = () => {
    const date = new Date().toISOString();
    const logs: SessionLog[] = plan
      .map((p, i) => ({ date, routineName: routine.name, exId: p.entry.exId, sets: done[i] }))
      .filter((l) => l.sets.length > 0);
    onSave(logs);
  };

  const lastSet = done[exIndex][setsDone - 1];

  return (
    <div className="session">
      <div className="session-head">
        <h2>{routine.name}</h2>
        <span className="progress">
          {plan.filter((p, i) => done[i].length >= p.entry.sets).length} / {plan.length} done
        </span>
        <button onClick={onExit}>Close</button>
      </div>

      <div className="now">
        <p className="ex-name">{current.ex.n}</p>
        <p className="target">
          Set {Math.min(setsDone + 1, current.entry.sets)} of {current.entry.sets} ·{' '}
          {current.targetWeight != null ? `${current.targetWeight}kg` : 'bodyweight'} × {current.targetReps}
          {repUnit(current.ex)}
        </p>
        <p className="note">{current.note}</p>

        <div className="dots" aria-label="Sets completed">
          {Array.from({ length: current.entry.sets }, (_, i) => (
            <i key={i} className={i < setsDone ? 'on' : ''} />
          ))}
        </div>

        <div className="entry">
          <label>
            <span>{current.ex.timed ? 'Seconds' : 'Reps done'}</span>
            <span className="big-step">
              <button onClick={() => setReps((r) => Math.max(1, r - 1))} aria-label="Fewer">
                −
              </button>
              <input
                type="number"
                inputMode="numeric"
                value={reps}
                onChange={(e) => setReps(Math.max(1, Number(e.target.value) || 1))}
                aria-label="Reps completed"
              />
              <button onClick={() => setReps((r) => r + 1)} aria-label="More">
                +
              </button>
            </span>
          </label>

          <label>
            <span>Weight</span>
            <span className="big-step">
              <button
                onClick={() => setWeight((w) => Math.max(0, (w ?? 0) - 2.5))}
                aria-label="Less weight"
              >
                −
              </button>
              <input
                type="number"
                inputMode="decimal"
                step={0.5}
                value={weight ?? ''}
                placeholder="—"
                onChange={(e) => setWeight(e.target.value === '' ? null : Number(e.target.value))}
                aria-label="Weight in kilograms"
              />
              <button onClick={() => setWeight((w) => (w ?? 0) + 2.5)} aria-label="More weight">
                +
              </button>
            </span>
          </label>
        </div>

        <div className="actions">
          <button className="go" onClick={logSet} disabled={setsLeft <= 0}>
            {setsLeft <= 0 ? 'All sets done' : 'Log set'}
          </button>
          {setsDone > 0 && (
            <button onClick={undoSet}>
              Undo last ({lastSet.weight != null ? `${lastSet.weight}kg × ` : ''}
              {lastSet.reps})
            </button>
          )}
        </div>

        {rest > 0 && (
          <div className="rest">
            <span className="clock">{mmss(rest)}</span>
            <span>rest</span>
            <button onClick={() => setRest(0)}>Skip</button>
            <button onClick={() => setRest((r) => r + 30)}>+30s</button>
          </div>
        )}
      </div>

      <ul className="queue">
        {plan.map((p, i) => {
          const sets = done[i];
          const complete = sets.length >= p.entry.sets;
          return (
            <li key={`${p.entry.exId}-${i}`} className={i === exIndex ? 'on' : complete ? 'complete' : ''}>
              <button className="pick" onClick={() => goTo(i)}>
                {p.ex.n}
              </button>
              <span className="logged">
                {sets.length ? sets.map((s) => `${s.reps}${repUnit(p.ex)}`).join(' · ') : `${p.entry.sets} sets`}
              </span>
            </li>
          );
        })}
      </ul>

      <button className="finish" onClick={finish}>
        {finished ? 'Finish session' : 'Finish early and save'}
      </button>
    </div>
  );
}
