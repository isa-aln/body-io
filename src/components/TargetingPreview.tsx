import { useState } from 'react';
import { GROUP_OF, NAME, short } from '../data/anatomy';
import { setsPerGroup, targeting } from '../lib/targeting';
import type { Entry, MuscleId } from '../types';

interface Props {
  entries: Entry[];
  /** hovering a row lights the head up on the one body map */
  hovered: MuscleId | null;
  onHover: (m: MuscleId | null) => void;
}

export default function TargetingPreview({ entries, hovered, onHover }: Props) {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const { head, total } = targeting(entries);
  const groupSets = setsPerGroup(entries);
  const maxHead = Math.max(0, ...Object.values(head));
  const maxGroup = Math.max(0, ...Object.values(groupSets));

  const toggle = (g: string) => {
    const next = new Set(openGroups);
    if (next.has(g)) next.delete(g);
    else next.add(g);
    setOpenGroups(next);
  };

  const groups = Object.keys(groupSets).sort((a, b) => groupSets[b] - groupSets[a]);

  return (
    <div className="preview">
      <h2>Targeting</h2>

      {!total ? (
        <p className="empty">The body map fills in as you add exercises.</p>
      ) : (
        <>
          <ul className="pct-list">
            {groups.map((g) => {
              const n = groupSets[g];
              const open = openGroups.has(g);
              const heads = Object.keys(head)
                .filter((m) => GROUP_OF[m] === g)
                .sort((a, b) => head[b] - head[a]);
              return (
                <li key={g} className={`grp-row ${open ? 'open' : ''}`}>
                  <button className="row-btn" onClick={() => toggle(g)} aria-expanded={open}>
                    <span className="nm">{g}</span>
                    <span className="bar">
                      <i style={{ width: `${maxGroup ? (n / maxGroup) * 100 : 0}%` }} />
                    </span>
                    <span className="v">{round(n)}</span>
                  </button>
                  {open && (
                    <ul className="heads">
                      {heads.map((m) => (
                        <li
                          key={m}
                          className={hovered === m ? 'head-row hov' : 'head-row'}
                          onMouseEnter={() => onHover(m)}
                          onMouseLeave={() => onHover(null)}
                        >
                          <span className="nm">{short(NAME[m])}</span>
                          <span className="bar">
                            <i style={{ width: `${maxHead ? (head[m] / maxHead) * 100 : 0}%` }} />
                          </span>
                          <span className="v">{round(head[m])}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
            <li className="total">
              <span className="nm">Sets this routine</span>
              <span className="bar" />
              <span className="v">{entries.reduce((a, e) => a + e.sets, 0)}</span>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}

const round = (n: number) => (Math.round(n * 10) / 10).toString();
