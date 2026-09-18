import { ALL, repUnit } from '../data/exercises';
import { historyFor, recommend, sessionWeight } from '../lib/progression';
import { formatWeight, roundLoad, toDisplay, toKg, type Unit } from '../lib/units';
import type { Routine, SessionLog } from '../types';

interface Props {
  routines: Routine[];
  routine: Routine;
  log: SessionLog[];
  unit: Unit;
  places: string[];
  place: string | null;
  needsBackup: boolean;
  onPick: (id: string) => void;
  onWeight: (entryIndex: number, weight: number | null) => void;
  onPlace: (place: string | null) => void;
  onAddPlace: () => void;
  onBackup: () => void;
  onStart: () => void;
  onPlan: () => void;
}

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

/** When this routine was last trained, judged by its exercises. */
function lastDone(routine: Routine, log: SessionLog[]): string | null {
  const dates = routine.entries
    .flatMap((e) => historyFor(log, e.exId))
    .map((s) => s.date)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}

export default function TrainPage({
  routines,
  routine,
  log,
  unit,
  places,
  place,
  needsBackup,
  onPick,
  onWeight,
  onPlace,
  onAddPlace,
  onBackup,
  onStart,
  onPlan,
}: Props) {
  return (
    <div className="train">
      {needsBackup && (
        <div className="backup-nudge">
          <span>
            Your training history only lives in this browser. Clearing site data would wipe it.
          </span>
          <button onClick={onBackup}>Back it up</button>
        </div>
      )}

      {(places.length > 0 || log.length > 0) && (
        <div className="place-bar">
          <label>
            Gym
            <select
              value={place ?? ''}
              onChange={(e) => (e.target.value === '__add' ? onAddPlace() : onPlace(e.target.value || null))}
            >
              <option value="">Not set</option>
              {places.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
              <option value="__add">Add a gym…</option>
            </select>
          </label>
          <small>Weights are compared within a gym, so a Smith machine never sets your barbell target.</small>
        </div>
      )}

      <div className="routine-cards">
        {routines.map((r) => {
          const done = lastDone(r, log);
          return (
            <button key={r.id} className={`rcard${r.id === routine.id ? ' on' : ''}`} onClick={() => onPick(r.id)}>
              <span className="rn">{r.name}</span>
              <small>
                {r.entries.length} exercise{r.entries.length === 1 ? '' : 's'}
                {done ? ` · last ${dateLabel(done)}` : ''}
              </small>
            </button>
          );
        })}
      </div>

      <div className="train-head">
        <h2>{routine.name}</h2>
        <button className="start" onClick={onStart} disabled={!routine.entries.length}>
          Start session
        </button>
      </div>

      {!routine.entries.length ? (
        <p className="empty">
          Nothing in this routine yet.{' '}
          <button className="linkish" onClick={onPlan}>
            Plan it
          </button>
        </p>
      ) : (
        <ul className="train-list">
          {routine.entries.map((e, i) => {
            const ex = ALL[e.exId];
            const rec = recommend(e, log, place);
            const past = historyFor(log, e.exId, place);
            const last = past[past.length - 1];
            return (
              <li key={`${e.exId}-${i}`}>
                <div className="line">
                  <span className="nm">
                    {ex.n}
                    {ex.star && (
                      <span className="star" title={ex.star}>
                        ★
                      </span>
                    )}
                  </span>
                  <span className={`verdict ${rec.verdict}`}>
                    {rec.verdict === 'increase'
                      ? 'go up'
                      : rec.verdict === 'deload'
                        ? 'drop back'
                        : rec.verdict === 'new'
                          ? 'first time'
                          : 'repeat'}
                  </span>
                </div>

                <div className="prescription">
                  <label>
                    <input
                      type="number"
                      min={0}
                      step={unit === 'kg' ? 0.5 : 1}
                      value={e.weight == null ? '' : roundLoad(toDisplay(e.weight, unit), unit)}
                      placeholder="—"
                      onChange={(ev) =>
                        onWeight(i, ev.target.value === '' ? null : toKg(Number(ev.target.value), unit))
                      }
                      aria-label={`Weight for ${ex.n}`}
                    />
                    <span>{unit}</span>
                  </label>
                  <span className="by">
                    {e.sets} × {e.reps}
                    {repUnit(ex)}
                  </span>
                  {last && (
                    <span className="last">
                      last {dateLabel(last.date)}:{' '}
                      {sessionWeight(last) != null ? `${formatWeight(sessionWeight(last), unit)} ` : ''}
                      {last.sets.map((s) => s.reps).join(', ')}
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
