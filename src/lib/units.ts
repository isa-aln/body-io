export type Unit = 'kg' | 'lb';

const LB = 2.2046226218;

/** Everything is stored in kg; this is display only. */
export const toDisplay = (kg: number, unit: Unit) => (unit === 'kg' ? kg : kg * LB);
export const toKg = (value: number, unit: Unit) => (unit === 'kg' ? value : value / LB);

/** Round to something you can actually load on a bar or a stack. */
export const roundLoad = (value: number, unit: Unit) =>
  unit === 'kg' ? Math.round(value * 2) / 2 : Math.round(value);

export function formatWeight(kg: number | null, unit: Unit): string {
  if (kg == null) return '—';
  const v = roundLoad(toDisplay(kg, unit), unit);
  return `${v}${unit}`;
}

/** Step for the +/- buttons. */
export const step = (unit: Unit) => (unit === 'kg' ? 2.5 : 5);
