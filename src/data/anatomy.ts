import type { MuscleId, View } from '../types';

export interface Group {
  g: string;
  parts: Record<MuscleId, string>;
}

export const GROUPS: Group[] = [
  {
    g: 'Chest',
    parts: {
      upperChest: 'Upper chest (clavicular)',
      midChest: 'Mid chest (sternal)',
      lowerChest: 'Lower chest (costal)',
    },
  },
  {
    g: 'Shoulders',
    parts: {
      frontDelts: 'Front delt',
      sideDelts: 'Side delt',
      rearDelts: 'Rear delt',
      rotatorCuff: 'Rotator cuff (infraspinatus / teres)',
    },
  },
  {
    g: 'Back',
    parts: {
      upperTraps: 'Upper traps',
      midTraps: 'Mid traps',
      lowerTraps: 'Lower traps',
      rhomboids: 'Rhomboids',
      lats: 'Lats',
      erectors: 'Spinal erectors',
    },
  },
  {
    g: 'Arms',
    parts: {
      bicepsLong: 'Biceps long head (outer)',
      bicepsShort: 'Biceps short head (inner)',
      brachialis: 'Brachialis',
      tricepsLong: 'Triceps long head',
      tricepsLateral: 'Triceps lateral head',
      brachioradialis: 'Brachioradialis',
      forearmFlexors: 'Forearm flexors',
      forearmExtensors: 'Forearm extensors',
    },
  },
  {
    g: 'Core',
    parts: {
      upperAbs: 'Upper abs',
      lowerAbs: 'Lower abs',
      obliques: 'Obliques',
      serratus: 'Serratus anterior',
    },
  },
  {
    g: 'Hips',
    parts: {
      gluteMax: 'Glute max',
      gluteMed: 'Glute med',
      hipFlexors: 'Hip flexors',
      adductors: 'Adductors',
    },
  },
  {
    g: 'Thighs',
    parts: {
      rectusFemoris: 'Rectus femoris',
      vastusLateralis: 'Vastus lateralis (outer quad)',
      vastusMedialis: 'Vastus medialis (teardrop)',
      bicepsFemoris: 'Biceps femoris (outer hamstring)',
      semis: 'Semitendinosus / semimembranosus (inner hamstring)',
    },
  },
  {
    g: 'Lower leg',
    parts: {
      gastrocMedial: 'Gastrocnemius (medial)',
      gastrocLateral: 'Gastrocnemius (lateral)',
      soleus: 'Soleus',
      tibialis: 'Tibialis anterior',
    },
  },
];

export const NAME: Record<MuscleId, string> = {};
export const GROUP_OF: Record<MuscleId, string> = {};
GROUPS.forEach((G) =>
  Object.entries(G.parts).forEach(([k, v]) => {
    NAME[k] = v;
    GROUP_OF[k] = G.g;
  })
);

/** Strip the parenthetical from a muscle name. */
export const short = (s: string) => s.replace(/\s*\(.*\)/, '');

/* ---- Figure geometry: 200 x 420 viewBox ---- */
const OUTLINE_COMMON = [
  'M100,7 C110,7 116,16 116,26 C116,38 108,46 100,46 C92,46 84,38 84,26 C84,16 90,7 100,7 Z',
  'M91,45 L90,60 M109,45 L110,60',
  'M90,60 Q74,66 58,70 L66,96 Q66,124 72,150 Q74,172 76,180 L100,196 L124,180 Q126,172 128,150 Q134,124 134,96 L142,70 Q126,66 110,60 Z',
  'M58,70 Q44,78 46,100 L40,150 L32,210 Q30,224 34,246 L46,246 Q48,224 44,212 L54,150 L66,100 Z',
  'M142,70 Q156,78 154,100 L160,150 L168,210 Q170,224 166,246 L154,246 Q152,224 156,212 L146,150 L134,100 Z',
  'M76,180 L72,200 Q68,240 76,290 Q70,320 78,380 L76,408 L96,408 L94,382 Q92,320 94,290 L96,240 L100,196 Z',
  'M124,180 L128,200 Q132,240 124,290 Q130,320 122,380 L124,408 L104,408 L106,382 Q108,320 106,290 L104,240 L100,196 Z',
  'M76,290 L94,290 M106,290 L124,290',
];

export const OUTLINE: Record<View, string[]> = {
  front: OUTLINE_COMMON,
  back: OUTLINE_COMMON,
};

export interface Region {
  id: MuscleId;
  /** mirror: draw a flipped copy for the other side of the body */
  m: boolean;
  d: string;
}

export const REGIONS: Record<View, Region[]> = {
  front: [
    { id: 'sideDelts', m: true, d: 'M60,70 Q44,80 46,100 L52,110 L58,100 Q54,84 64,72 Z' },
    { id: 'frontDelts', m: true, d: 'M64,72 Q56,84 58,100 L66,100 Q70,88 68,76 Z' },
    { id: 'upperChest', m: true, d: 'M98,66 L66,72 Q68,80 72,84 L98,82 Z' },
    { id: 'midChest', m: true, d: 'M98,82 L72,84 Q64,96 70,108 L98,106 Z' },
    { id: 'lowerChest', m: true, d: 'M98,106 L70,108 Q76,120 98,116 Z' },
    { id: 'serratus', m: true, d: 'M68,110 L76,116 L78,140 L70,132 Z' },
    { id: 'bicepsLong', m: true, d: 'M52,104 L44,150 L49,150 L60,106 Z' },
    { id: 'bicepsShort', m: true, d: 'M60,106 L49,150 L54,150 L66,108 Z' },
    { id: 'brachialis', m: true, d: 'M48,104 L42,150 L44,150 L52,104 Z' },
    { id: 'brachioradialis', m: true, d: 'M40,152 L32,210 L37,210 L44,154 Z' },
    { id: 'forearmFlexors', m: true, d: 'M44,154 L37,210 L44,210 L52,156 Z' },
    { id: 'upperAbs', m: false, d: 'M88,118 L112,118 L112,150 L88,150 Z' },
    { id: 'lowerAbs', m: false, d: 'M89,150 L111,150 L108,192 L92,192 Z' },
    { id: 'obliques', m: true, d: 'M72,118 L88,120 L89,180 L78,176 Z' },
    { id: 'hipFlexors', m: true, d: 'M80,182 L92,184 L96,204 L84,202 Z' },
    { id: 'adductors', m: true, d: 'M96,204 L100,198 L97,256 L90,246 Z' },
    { id: 'vastusLateralis', m: true, d: 'M72,204 L82,200 L84,282 L76,290 Q68,250 72,204 Z' },
    { id: 'rectusFemoris', m: true, d: 'M82,200 L94,202 L92,266 L84,282 Z' },
    { id: 'vastusMedialis', m: true, d: 'M92,256 L96,250 L94,290 L88,292 Q86,278 92,256 Z' },
    { id: 'tibialis', m: true, d: 'M78,298 L86,298 L86,368 L80,372 Z' },
  ],
  back: [
    { id: 'upperTraps', m: true, d: 'M90,60 L58,70 L66,76 L100,92 L100,60 Z' },
    { id: 'midTraps', m: true, d: 'M66,76 L100,92 L100,108 L78,102 Z' },
    { id: 'rhomboids', m: true, d: 'M78,102 L100,108 L100,132 L84,124 Z' },
    { id: 'lowerTraps', m: true, d: 'M84,124 L100,132 L100,164 L92,154 Z' },
    { id: 'rearDelts', m: true, d: 'M60,70 Q44,80 46,100 L54,108 L64,104 Q62,84 64,72 Z' },
    { id: 'rotatorCuff', m: true, d: 'M64,80 L78,102 L70,116 L66,98 Z' },
    { id: 'lats', m: true, d: 'M66,100 L70,116 L84,124 L92,134 L96,170 Q84,178 76,160 L68,124 Z' },
    { id: 'erectors', m: true, d: 'M90,150 L100,150 L100,196 L88,196 Z' },
    { id: 'tricepsLateral', m: true, d: 'M46,102 L56,104 L50,152 L42,150 Z' },
    { id: 'tricepsLong', m: true, d: 'M56,104 L66,108 L58,154 L50,152 Z' },
    { id: 'forearmExtensors', m: true, d: 'M40,154 L52,156 L46,212 L34,210 Z' },
    { id: 'gluteMed', m: true, d: 'M74,182 L98,186 L94,200 L76,198 Z' },
    { id: 'gluteMax', m: true, d: 'M76,198 L100,196 L100,232 Q84,240 74,222 Z' },
    { id: 'bicepsFemoris', m: true, d: 'M72,236 L86,236 L82,292 L74,290 Q68,260 72,236 Z' },
    { id: 'semis', m: true, d: 'M86,236 L98,234 L94,292 L82,292 Z' },
    { id: 'gastrocLateral', m: true, d: 'M74,302 L84,300 L88,348 L78,346 Z' },
    { id: 'gastrocMedial', m: true, d: 'M84,300 L94,300 L94,346 L88,348 Z' },
    { id: 'soleus', m: true, d: 'M78,346 L94,346 L92,376 L80,378 Z' },
  ],
};

/** Which views a muscle head is visible in. */
export const VIEW_OF: Record<MuscleId, View[]> = {};
(Object.entries(REGIONS) as [View, Region[]][]).forEach(([v, rs]) =>
  rs.forEach((r) => {
    (VIEW_OF[r.id] = VIEW_OF[r.id] || []).push(v);
  })
);

/**
 * A head is drawn on one side only. Listing one in both views makes it light up
 * whichever side is on screen, which reads as a bug, so catch it while editing.
 */
if (import.meta.env.DEV) {
  const both = Object.entries(VIEW_OF).filter(([, vs]) => vs.length > 1);
  if (both.length) {
    console.warn('These muscle heads are drawn on both views:', both.map(([m]) => m).join(', '));
  }
}
