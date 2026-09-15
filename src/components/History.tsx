import { useMemo, useState } from 'react';
import { ALL, repUnit } from '../data/exercises';
import { historyFor, sessionReps, sessionWeight } from '../lib/progression';
import type { SessionLog } from '../types';

interface Props {
  log: SessionLog[];
  onExit: () => void;
  onClear: () => void;
}

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: '2-digit' });

/** Weight over time. Flat line means the reps are doing the work instead. */
function Trend({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const w = 100;
  const h = 28;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * (h - 4) - 2;
      return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
  return (
    <svg className="trend" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export default function History({ log, onExit, onClear }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  /** One row per exercise, most recently trained first. */
  const rows = useMemo(() => {
    const ids = [...new Set(log.map((l) => l.exId))].filter((id) => ALL[id]);
    return ids
      .map((id) => {
        const sessions = historyFor(log, id);
        const last = sessions[sessions.length - 1];
        const weights = sessions.map((s) => sessionWeight(s)).filter((w): w is number => w != null);
        const best = weights.length ? Math.max(...weights) : null;
        return { id, ex: ALL[id], sessions, last, weights, best };
      })
      .sort((a, b) => b.last.date.localeCompare(a.last.date));
  }, [log]);

  const totalSets = log.reduce((a, l) => a + l.sets.length, 0);
  const days = new Set(log.map((l) => l.date.slice(0, 10))).size;

  return (
    <div className="history">
      <div className="session-head">
        <h2>Progress</h2>
        <span className="progress">
          {days} session{days === 1 ? '' : 's'} · {totalSets} sets
        </span>
        <button onClick={onExit}>Close</button>
      </div>

      {!rows.length ? (
        <p className="empty">Nothing logged yet. Finish a session and it shows up here.</p>
      ) : (
        <ul className="hist-list">
          {rows.map((r) => {
            const isOpen = open === r.id;
            const lastW = sessionWeight(r.last);
            return (
              <li key={r.id} className={isOpen ? 'open' : ''}>
                <button className="hrow" onClick={() => setOpen(isOpen ? null : r.id)} aria-expanded={isOpen}>
                  <span className="nm">
                    {r.ex.n}
                    <small>
                      {r.sessions.length} session{r.sessions.length === 1 ? '' : 's'} · last {dateLabel(r.last.date)}
                    </small>
                  </span>
                  <Trend points={r.weights} />
                  <span className="now">
                    {lastW != null ? `${lastW}kg` : '—'}
                    {r.best != null && lastW != null && r.best > lastW && <small>best {r.best}kg</small>}
                  </span>
                </button>

                {isOpen && (
                  <table className="sessions">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Weight</th>
                        <th>Asked</th>
                        <th>Did</th>
                      </tr>
                    </thead>
                    <tbody>
                      {r.sessions
                        .slice()
                        .reverse()
                        .map((s, i) => {
                          const hit = s.sets.every((x) => x.reps >= (x.target ?? 0));
                          return (
                            <tr key={i} className={hit ? 'hit' : ''}>
                              <td>
                                {dateLabel(s.date)}
                                {s.routineName && <small> {s.routineName}</small>}
                              </td>
                              <td>{sessionWeight(s) != null ? `${sessionWeight(s)}kg` : '—'}</td>
                              <td>{s.sets[0]?.target ?? '—'}</td>
                              <td>
                                {s.sets.map((x) => x.reps).join(', ')}
                                {repUnit(r.ex)}
                                <small> {sessionReps(s)} total</small>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {rows.length > 0 && (
        <button className="clear" onClick={onClear}>
          Clear all history
        </button>
      )}
    </div>
  );
}
