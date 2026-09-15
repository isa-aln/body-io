import { GROUPS, short } from '../data/anatomy';
import type { MuscleId } from '../types';

interface Props {
  selected: MuscleId | null;
  onSelect: (id: MuscleId) => void;
}

export default function MusclePicker({ selected, onSelect }: Props) {
  return (
    <div className="groups">
      {GROUPS.map((G) => (
        <div className="grp" key={G.g}>
          <div className="gname">{G.g}</div>
          <div className="muscle-chips">
            {Object.entries(G.parts).map(([k, v]) => (
              <button key={k} className={k === selected ? 'chip sel' : 'chip'} onClick={() => onSelect(k)}>
                {short(v)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
