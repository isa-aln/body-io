import { useMemo, useState } from 'react';
import { COMPOUND, EQ_LABEL, ISOLATION } from '../data/exercises';
import { NAME, short } from '../data/anatomy';
import type { Entry, Equipment, Exercise, MuscleId } from '../types';

interface Props {
  selected: MuscleId | null;
  entries: Entry[];
  onToggle: (exId: string) => void;
  pinned: string | null;
  onPin: (exId: string | null) => void;
  onHoverExercise: (exId: string | null) => void;
}

const EQ_KEYS: Equipment[] = ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight'];

export default function ExerciseBrowser({ selected, entries, onToggle, pinned, onPin, onHoverExercise }: Props) {
  const [query, setQuery] = useState('');
  const [eqFilter, setEqFilter] = useState<Set<Equipment>>(new Set());
  const [starOnly, setStarOnly] = useState(false);
  const [hideAdded, setHideAdded] = useState(false);

  const added = useMemo(() => new Set(entries.map((e) => e.exId)), [entries]);
  const filtering = !!query || eqFilter.size > 0 || starOnly || hideAdded;

  const passes = (e: Exercise) => {
    if (hideAdded && added.has(e.id)) return false;
    if (starOnly && !e.star) return false;
    if (eqFilter.size && !eqFilter.has(e.eq)) return false;
    if (query && !e.n.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  };

  const toggleEq = (k: Equipment) => {
    const next = new Set(eqFilter);
    if (next.has(k)) next.delete(k);
    else next.add(k);
    setEqFilter(next);
  };

  let iso: Exercise[];
  let comp: Exercise[];
  if (selected) {
    iso = ISOLATION.filter((e) => (e.t[selected] ?? 0) >= 0.5 && passes(e)).sort((a, b) => b.t[selected]! - a.t[selected]!);
    comp = COMPOUND.filter((e) => (e.t[selected] ?? 0) >= 0.2 && passes(e)).sort((a, b) => b.t[selected]! - a.t[selected]!);
  } else {
    iso = ISOLATION.filter(passes);
    comp = COMPOUND.filter(passes);
  }

  const label = selected ? short(NAME[selected]) : null;
  const showEmptyPrompt = !selected && !filtering;

  const row = (e: Exercise, showLevels: boolean) => {
    const inW = added.has(e.id);
    const others = Object.entries(e.t)
      .filter(([m]) => m !== selected)
      .sort((a, b) => b[1] - a[1]);

    return (
      <div className={pinned === e.id ? 'ex pinned' : 'ex'} key={e.id} onMouseEnter={() => onHoverExercise(e.id)} onMouseLeave={() => onHoverExercise(null)}>
        <div>
          <button className="name" onClick={() => onPin(pinned === e.id ? null : e.id)} title="Show on the body map">
            {e.n}
            {e.star && (
              <span className="star" title={e.star} aria-label={`Preferred for muscle gain: ${e.star}`}>
                ★
              </span>
            )}
            <span className="eq">{EQ_LABEL[e.eq]}</span>
          </button>
          {!showLevels && (
            <div className="sub">
              {others.length ? others.map(([m, w]) => `+ ${short(NAME[m])} ${Math.round(w * 100)}%`).join('   ') : 'Single-head focus'}
            </div>
          )}
        </div>
        <button className={inW ? 'add in' : 'add'} onClick={() => onToggle(e.id)}>
          {inW ? 'Added' : 'Add'}
        </button>
        {showLevels && (
          <div className="levels">
            {Object.entries(e.t)
              .sort((a, b) => b[1] - a[1])
              .map(([m, w]) => {
                const n = Math.max(1, Math.round(w * 5));
                return (
                  <div className={m === selected ? 'lv hi' : 'lv'} key={m}>
                    <span>{short(NAME[m])}</span>
                    <span className="seg">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i key={i} className={i < n ? 'on' : ''} />
                      ))}
                    </span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="toolbar">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search exercises" aria-label="Search exercises" />
        <button className={starOnly ? 'fchip star-f on' : 'fchip star-f'} onClick={() => setStarOnly(!starOnly)} title="Preferred for muscle gain">
          ★ Preferred
        </button>
        {EQ_KEYS.map((k) => (
          <button key={k} className={eqFilter.has(k) ? 'fchip on' : 'fchip'} onClick={() => toggleEq(k)}>
            {EQ_LABEL[k]}
          </button>
        ))}
        <label className="hide">
          <input type="checkbox" checked={hideAdded} onChange={(e) => setHideAdded(e.target.checked)} /> Hide added
        </label>
      </div>

      <div className="plates">
        <div className="plate">
          <div className="plate-head">
            <h2>Isolation</h2>
            <small>{showEmptyPrompt ? '' : selected ? `${iso.length} for ${label}` : `${iso.length} match`}</small>
          </div>
          <div className="plate-body">
            {showEmptyPrompt ? (
              <div className="empty">
                Pick a muscle head on the body to see the <b>isolation exercises</b> that emphasise it, or search above.
              </div>
            ) : iso.length ? (
              <>
                {selected && <div className="hint">Sorted by emphasis on {label}. Secondary heads listed with their share.</div>}
                {iso.map((e) => row(e, false))}
              </>
            ) : (
              <div className="empty">No isolation work matches{label ? ` for ${label}` : ''}.</div>
            )}
          </div>
        </div>

        <div className="plate">
          <div className="plate-head">
            <h2>Compound lifts</h2>
            <small>{showEmptyPrompt ? '' : selected ? `${comp.length} load ${label}` : `${comp.length} match`}</small>
          </div>
          <div className="plate-body">
            {showEmptyPrompt ? (
              <div className="empty">Compound lifts that load the selected head appear here, with a level bar for every head they hit.</div>
            ) : comp.length ? (
              comp.map((e) => row(e, true))
            ) : (
              <div className="empty">No compound lifts load {label ?? 'this'} meaningfully.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

