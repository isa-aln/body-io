import { GROUP_OF, NAME, OUTLINE, REGIONS } from '../data/anatomy';
import type { MuscleId, View } from '../types';

interface Props {
  view: View;
  /** currently selected head - highlighted, with its group siblings dimmer */
  selected?: MuscleId | null;
  onSelect?: (id: MuscleId) => void;
  /** 0-1 per head. When given, the map becomes a heat map and stops being selectable. */
  fills?: Record<MuscleId, number> | null;
  onHover?: (id: MuscleId | null) => void;
  hovered?: MuscleId | null;
}

export default function BodyMap({ view, selected = null, onSelect, fills = null, onHover, hovered = null }: Props) {
  const heat = !!fills;
  const selectable = !!onSelect;

  return (
    <svg
      viewBox="0 0 200 420"
      className={`body-svg${heat ? ' heat' : ''}${selectable ? ' selectable' : ''}`}
      aria-label={`${view} view`}
    >
      {OUTLINE[view].map((d, i) => (
        <path key={i} className="outline" d={d} />
      ))}
      {REGIONS[view].map((r) => {
        const cls = ['m'];
        let style: React.CSSProperties | undefined;

        if (heat) {
          const p = fills![r.id] ?? 0;
          style = { fillOpacity: 0.04 + p * 0.78 };
          if (p > 0) cls.push('lit');
        } else if (selected) {
          if (r.id === selected) cls.push('sel');
          else if (GROUP_OF[r.id] === GROUP_OF[selected]) cls.push('sib');
        }
        if (hovered === r.id) cls.push('hov');

        const handlers = {
          onClick: () => onSelect?.(r.id),
          onMouseEnter: () => onHover?.(r.id),
          onMouseLeave: () => onHover?.(null),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect?.(r.id);
            }
          },
        };

        const common = {
          className: cls.join(' '),
          d: r.d,
          style,
          ...(selectable ? { tabIndex: 0, role: 'button' as const, 'aria-label': NAME[r.id] } : {}),
          ...handlers,
        };

        return (
          <g key={r.id}>
            <path {...common}>
              <title>{NAME[r.id]}</title>
            </path>
            {r.m && (
              <path {...common} transform="translate(200,0) scale(-1,1)">
                <title>{NAME[r.id]}</title>
              </path>
            )}
          </g>
        );
      })}
    </svg>
  );
}
