import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL, repUnit } from '../data/exercises';
import { recommend } from '../lib/progression';
import { formatWeight, roundLoad, step, toDisplay, toKg, type Unit } from '../lib/units';
import type { Routine, SessionLog, SetLog } from '../types';

interface Props {
  routine: Routine;
  log: SessionLog[];
  unit: Unit;
  place: string | null;
  onSave: (logs: SessionLog[]) => void;
  onExit: () => void;
}

/** Rest between sets. Compounds need longer than isolation. */
const restFor = (kind: string) => (kind === 'comp' ? 180 : 90);

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function SessionMode({ routine, log, unit, place, onSave, onExit }: Props) {
  /** What we set out to do, with the weight the progression engine suggests. */
  const plan = useMemo(
    () =>
      routine.entries.map((entry) => {
        const rec = recommend(entry, log, place);
        return {
          entry,
          ex: ALL[entry.exId],
          targetReps: rec.reps,
          targetWeight: rec.weight,
          note: rec.note,
        };
      }),
    [routine, log, place]
  );

  const [done, setDone] = useState<SetLog[][]>(() => plan.map(() => []));
  /** sets planned for each exercise — editable mid-session, machines get taken */
  const [setGoal, setSetGoal] = useState<number[]>(() => plan.map((p) => p.entry.sets));
  const [skipped, setSkipped] = useState<boolean[]>(() => plan.map(() => false));
  const [exIndex, setExIndex] = useState(0);
  const [reps, setReps] = useState(plan[0]?.targetReps ?? 10);
  const [weight, setWeight] = useState<number | null>(plan[0]?.targetWeight ?? null);
  const [rest, setRest] = useState(0);
  const timer = useRef<number | null>(null);
  const wakeLock = useRef<WakeLockSentinel | null>(null);

  const current = plan[exIndex];
  const setsDone = done[exIndex]?.length ?? 0;
  const goal = setGoal[exIndex] ?? current?.entry.sets ?? 0;
  const setsLeft = current ? goal - setsDone : 0;
  const finished = plan.every((_, i) => skipped[i] || done[i].length >= setGoal[i]);

  /**
   * Keep the screen on for the whole session. Without this the phone locks
   * between sets and the timer disappears exactly when you need it.
   */
  useEffect(() => {
    let cancelled = false;
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator) {
          const lock = await navigator.wakeLock.request('screen');
          if (cancelled) lock.release();
          else wakeLock.current = lock;
        }
      } catch {
        // denied or unsupported — the session still works, the screen just sleeps
      }
    };
    acquire();
    // ask once, at the start of a session, which is the only time it makes sense
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible' && !wakeLock.current) acquire();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      wakeLock.current?.release().catch(() => {});
      wakeLock.current = null;
    };
  }, []);

  /** A buzz when rest is up, for when the phone is in a pocket. */
  const restDone = () => {
    try {
      navigator.vibrate?.([200, 100, 200]);
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Rest is up', { body: current ? current.ex.n : 'Next set', silent: false });
      }
    } catch {
      // nothing to do — the on-screen timer already hit zero
    }
  };

  // rest countdown
  useEffect(() => {
    if (rest <= 0) return;
    timer.current = window.setInterval(
      () =>
        setRest((r) => {
          if (r <= 1) restDone();
          return Math.max(0, r - 1);
        }),
      1000
    );
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
    if (doneHere >= goal) {
      // move to the next exercise that still has sets left
      const nextIdx = plan.findIndex((_, i) => i > exIndex && !skipped[i] && next[i].length < setGoal[i]);
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
      .map((p, i) => ({
        date,
        routineName: routine.name,
        place: place ?? undefined,
        exId: p.entry.exId,
        sets: done[i],
      }))
      .filter((l) => l.sets.length > 0);
    onSave(logs);
  };

  const lastSet = done[exIndex][setsDone - 1];

  return (
    <div className="session">
      <div className="session-head">
        <h2>{routine.name}</h2>
        <span className="progress">
          {plan.filter((_, i) => done[i].length >= setGoal[i]).length} / {plan.length} done
          {place ? ` · ${place}` : ''}
        </span>
        <button onClick={onExit}>Close</button>
      </div>

      <div className="now">
        <p className="ex-name">{current.ex.n}</p>
        <p className="target">
          Set {Math.min(setsDone + 1, goal)} of {goal} ·{' '}
          {current.targetWeight != null ? formatWeight(current.targetWeight, unit) : 'bodyweight'} ×{' '}
          {current.targetReps}
          {repUnit(current.ex)}
        </p>
        <p className="note">{current.note}</p>

        <div className="dots" aria-label="Sets completed">
          {Array.from({ length: goal }, (_, i) => (
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
            <span>Weight ({unit})</span>
            <span className="big-step">
              <button
                onClick={() => setWeight((w) => Math.max(0, toKg(toDisplay(w ?? 0, unit) - step(unit), unit)))}
                aria-label="Less weight"
              >
                −
              </button>
              <input
                type="number"
                inputMode="decimal"
                step={unit === 'kg' ? 0.5 : 1}
                value={weight == null ? '' : roundLoad(toDisplay(weight, unit), unit)}
                placeholder="—"
                onChange={(e) => setWeight(e.target.value === '' ? null : toKg(Number(e.target.value), unit))}
                aria-label={`Weight in ${unit}`}
              />
              <button
                onClick={() => setWeight((w) => toKg(toDisplay(w ?? 0, unit) + step(unit), unit))}
                aria-label="More weight"
              >
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
              Undo last ({lastSet.weight != null ? `${formatWeight(lastSet.weight, unit)} × ` : ''}
              {lastSet.reps})
            </button>
          )}
          <button onClick={() => setSetGoal((g) => g.map((n, i) => (i === exIndex ? n + 1 : n)))}>
            + a set
          </button>
          <button
            onClick={() => {
              setSkipped((sk) => sk.map((v, i) => (i === exIndex ? true : v)));
              const nextIdx = plan.findIndex((_, i) => i > exIndex && !skipped[i] && done[i].length < setGoal[i]);
              if (nextIdx >= 0) goTo(nextIdx);
            }}
          >
            Skip this one
          </button>
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
          const complete = sets.length >= setGoal[i];
          const isSkipped = skipped[i] && !sets.length;
          return (
            <li
              key={`${p.entry.exId}-${i}`}
              className={i === exIndex ? 'on' : isSkipped ? 'skipped' : complete ? 'complete' : ''}
            >
              <button className="pick" onClick={() => goTo(i)}>
                {p.ex.n}
              </button>
              <span className="logged">
                {sets.length
                  ? sets.map((s) => `${s.reps}${repUnit(p.ex)}`).join(' · ')
                  : isSkipped
                    ? 'skipped'
                    : `${setGoal[i]} sets`}
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
