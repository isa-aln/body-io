import type { Equipment, Exercise, MuscleId } from '../types';

type Raw = { n: string; t: Record<MuscleId, number> };

const ISOLATION_RAW: Raw[] = [
  { n: 'Cable fly (mid)', t: { midChest: 1, upperChest: 0.4, lowerChest: 0.4, frontDelts: 0.3 } },
  { n: 'Cable front raise', t: { frontDelts: 1, upperChest: 0.2 } },
  { n: 'Cable rear delt fly', t: { rearDelts: 1, rhomboids: 0.3, midTraps: 0.3, rotatorCuff: 0.2 } },
  { n: 'Cable upright row', t: { sideDelts: 0.9, upperTraps: 0.8, frontDelts: 0.3 } },
  { n: 'Cable shrug', t: { upperTraps: 1, forearmFlexors: 0.3 } },
  { n: 'Cable overhead triceps extension', t: { tricepsLong: 1, tricepsLateral: 0.5 } },
  { n: 'Cable pull-through', t: { gluteMax: 1, semis: 0.7, bicepsFemoris: 0.7, erectors: 0.4 } },
  { n: 'Standing dumbbell curl', t: { bicepsShort: 0.9, bicepsLong: 0.8, brachialis: 0.4, forearmFlexors: 0.3 } },
  { n: 'Cable curl', t: { bicepsShort: 0.9, bicepsLong: 0.8, brachialis: 0.3 } },
  { n: 'Bayesian curl', t: { bicepsLong: 1, bicepsShort: 0.6, brachialis: 0.3 } },
  { n: 'Machine lateral raise', t: { sideDelts: 1 } },
  { n: 'Machine rear delt fly', t: { rearDelts: 1, rhomboids: 0.3, midTraps: 0.3 } },
  { n: 'Dumbbell shrug', t: { upperTraps: 1, forearmFlexors: 0.3 } },
  { n: 'Smith machine shrug', t: { upperTraps: 1 } },
  { n: 'Dumbbell triceps kickback', t: { tricepsLateral: 0.9, tricepsLong: 0.6 } },
  { n: 'Rope pushdown', t: { tricepsLateral: 1, tricepsLong: 0.6 } },
  { n: 'Machine leg extension', t: { rectusFemoris: 1, vastusLateralis: 0.9, vastusMedialis: 0.9 } },
  { n: 'Glute-ham raise', t: { bicepsFemoris: 1, semis: 1, erectors: 0.4 } },
  { n: 'Smith machine calf raise', t: { gastrocMedial: 1, gastrocLateral: 0.9, soleus: 0.4 } },
  { n: 'Incline dumbbell fly', t: { upperChest: 1, midChest: 0.4, frontDelts: 0.3 } },
  { n: 'Low-to-high cable fly', t: { upperChest: 1, frontDelts: 0.3, midChest: 0.3 } },
  { n: 'Flat dumbbell fly', t: { midChest: 1, upperChest: 0.3, lowerChest: 0.4 } },
  { n: 'Pec deck fly', t: { midChest: 1, upperChest: 0.4, lowerChest: 0.5 } },
  { n: 'High-to-low cable crossover', t: { lowerChest: 1, midChest: 0.5 } },
  { n: 'Front raise', t: { frontDelts: 1, upperChest: 0.15 } },
  { n: 'Lateral raise', t: { sideDelts: 1, upperTraps: 0.2 } },
  { n: 'Cable lateral raise', t: { sideDelts: 1 } },
  { n: 'Reverse pec deck', t: { rearDelts: 1, rhomboids: 0.3, midTraps: 0.3, rotatorCuff: 0.2 } },
  { n: 'Face pull', t: { rearDelts: 0.8, rotatorCuff: 0.6, midTraps: 0.4, rhomboids: 0.4 } },
  { n: 'Cable external rotation', t: { rotatorCuff: 1 } },
  { n: 'Prone Y-raise', t: { lowerTraps: 1, rearDelts: 0.4, rotatorCuff: 0.3 } },
  { n: 'Barbell shrug', t: { upperTraps: 1, forearmFlexors: 0.3 } },
  { n: 'Straight-arm pulldown', t: { lats: 1, lowerTraps: 0.3, tricepsLong: 0.3 } },
  { n: 'Back extension', t: { erectors: 1, gluteMax: 0.4, semis: 0.3, bicepsFemoris: 0.3 } },
  { n: 'Barbell curl', t: { bicepsShort: 0.9, bicepsLong: 0.9, brachialis: 0.4, forearmFlexors: 0.3 } },
  { n: 'Incline dumbbell curl', t: { bicepsLong: 1, bicepsShort: 0.6 } },
  { n: 'Preacher curl', t: { bicepsShort: 1, bicepsLong: 0.6, brachialis: 0.4 } },
  { n: 'Concentration curl', t: { bicepsShort: 1, bicepsLong: 0.5 } },
  { n: 'Hammer curl', t: { brachialis: 1, brachioradialis: 0.8, bicepsLong: 0.5 } },
  { n: 'Reverse curl', t: { brachioradialis: 1, forearmExtensors: 0.5, brachialis: 0.5 } },
  { n: 'Triceps pushdown', t: { tricepsLateral: 1, tricepsLong: 0.5 } },
  { n: 'Overhead triceps extension', t: { tricepsLong: 1, tricepsLateral: 0.5 } },
  { n: 'Skull crusher', t: { tricepsLong: 0.9, tricepsLateral: 0.8 } },
  { n: 'Wrist curl', t: { forearmFlexors: 1 } },
  { n: 'Reverse wrist curl', t: { forearmExtensors: 1 } },
  { n: 'Cable crunch', t: { upperAbs: 1, lowerAbs: 0.5 } },
  { n: 'Reverse crunch', t: { lowerAbs: 1, upperAbs: 0.3 } },
  { n: 'Hanging leg raise', t: { lowerAbs: 1, hipFlexors: 0.6, upperAbs: 0.4, obliques: 0.2 } },
  { n: 'Plank', t: { upperAbs: 0.6, lowerAbs: 0.6, obliques: 0.4 } },
  { n: 'Side plank', t: { obliques: 1, gluteMed: 0.3 } },
  { n: 'Cable woodchop', t: { obliques: 1, upperAbs: 0.3, serratus: 0.3 } },
  { n: 'Serratus punch', t: { serratus: 1, frontDelts: 0.2 } },
  { n: 'Hip thrust', t: { gluteMax: 1, semis: 0.3, bicepsFemoris: 0.3 } },
  { n: 'Cable kickback', t: { gluteMax: 1, gluteMed: 0.3 } },
  { n: 'Hip abduction', t: { gluteMed: 1, gluteMax: 0.3 } },
  { n: 'Hip adduction machine', t: { adductors: 1 } },
  { n: 'Cable hip flexion', t: { hipFlexors: 1, rectusFemoris: 0.3, lowerAbs: 0.3 } },
  { n: 'Leg extension', t: { rectusFemoris: 1, vastusLateralis: 0.9, vastusMedialis: 0.9 } },
  { n: 'Sissy squat', t: { rectusFemoris: 1, vastusMedialis: 0.7, vastusLateralis: 0.7 } },
  { n: 'Lying leg curl', t: { bicepsFemoris: 1, semis: 1, gastrocMedial: 0.3 } },
  { n: 'Seated leg curl', t: { semis: 1, bicepsFemoris: 0.9 } },
  { n: 'Standing leg curl', t: { bicepsFemoris: 1, semis: 0.9, gastrocMedial: 0.2, gluteMax: 0.2 } },
  { n: 'Nordic curl', t: { bicepsFemoris: 1, semis: 1, gastrocMedial: 0.2 } },
  { n: 'Standing calf raise', t: { gastrocMedial: 1, gastrocLateral: 0.9, soleus: 0.4 } },
  { n: 'Seated calf raise', t: { soleus: 1, gastrocMedial: 0.3, gastrocLateral: 0.3 } },
  { n: 'Tibialis raise', t: { tibialis: 1 } },
];

const COMPOUND_RAW: Raw[] = [
  { n: 'Cable chest press', t: { midChest: 1, upperChest: 0.5, lowerChest: 0.5, frontDelts: 0.5, tricepsLateral: 0.5, tricepsLong: 0.4 } },
  { n: 'Single-arm cable row', t: { lats: 1, rhomboids: 0.7, midTraps: 0.6, rearDelts: 0.5, bicepsShort: 0.4, obliques: 0.3 } },
  { n: 'Smith machine squat', t: { vastusLateralis: 0.9, vastusMedialis: 0.9, rectusFemoris: 0.7, gluteMax: 0.6, adductors: 0.5, erectors: 0.3 } },
  { n: 'Smith machine bench press', t: { midChest: 1, lowerChest: 0.7, upperChest: 0.5, frontDelts: 0.6, tricepsLateral: 0.5, tricepsLong: 0.5 } },
  { n: 'Smith machine incline press', t: { upperChest: 1, midChest: 0.6, frontDelts: 0.8, tricepsLong: 0.5 } },
  { n: 'Smith machine overhead press', t: { frontDelts: 1, sideDelts: 0.6, tricepsLong: 0.7, tricepsLateral: 0.6, upperTraps: 0.4 } },
  { n: 'Smith machine row', t: { rhomboids: 0.9, midTraps: 0.9, lats: 0.8, rearDelts: 0.6, bicepsShort: 0.5 } },
  { n: 'Machine chest press', t: { midChest: 1, lowerChest: 0.6, upperChest: 0.5, frontDelts: 0.5, tricepsLateral: 0.5 } },
  { n: 'Machine shoulder press', t: { frontDelts: 1, sideDelts: 0.6, tricepsLong: 0.6, tricepsLateral: 0.5 } },
  { n: 'Seated cable row', t: { rhomboids: 1, midTraps: 0.9, lats: 0.8, rearDelts: 0.5, bicepsShort: 0.5, brachialis: 0.4 } },
  { n: 'Single-arm dumbbell row', t: { lats: 1, rhomboids: 0.7, midTraps: 0.6, rearDelts: 0.5, bicepsShort: 0.4 } },
  { n: 'Hack squat', t: { vastusLateralis: 1, vastusMedialis: 1, rectusFemoris: 0.6, gluteMax: 0.5, adductors: 0.4 } },
  { n: 'Goblet squat', t: { vastusLateralis: 0.8, vastusMedialis: 0.8, rectusFemoris: 0.6, gluteMax: 0.6, adductors: 0.5, upperAbs: 0.4 } },
  { n: 'Push-up', t: { midChest: 0.9, lowerChest: 0.5, upperChest: 0.4, frontDelts: 0.5, tricepsLateral: 0.5, serratus: 0.4 } },
  {
    n: 'Barbell back squat',
    t: { vastusLateralis: 0.9, vastusMedialis: 0.9, rectusFemoris: 0.6, gluteMax: 0.7, adductors: 0.6, erectors: 0.5, semis: 0.3, bicepsFemoris: 0.3, upperAbs: 0.3 },
  },
  {
    n: 'Front squat',
    t: { vastusMedialis: 1, vastusLateralis: 0.9, rectusFemoris: 0.8, gluteMax: 0.5, adductors: 0.5, erectors: 0.4, midTraps: 0.3, upperAbs: 0.5 },
  },
  { n: 'Leg press', t: { vastusLateralis: 1, vastusMedialis: 1, rectusFemoris: 0.5, gluteMax: 0.5, adductors: 0.4 } },
  {
    n: 'Walking lunge',
    t: { gluteMax: 0.8, gluteMed: 0.5, vastusLateralis: 0.8, vastusMedialis: 0.8, rectusFemoris: 0.6, semis: 0.4, adductors: 0.3 },
  },
  {
    n: 'Bulgarian split squat',
    t: { gluteMax: 0.9, gluteMed: 0.6, vastusLateralis: 0.8, vastusMedialis: 0.8, rectusFemoris: 0.5, adductors: 0.4, semis: 0.3 },
  },
  {
    n: 'Conventional deadlift',
    t: { erectors: 0.9, gluteMax: 0.9, bicepsFemoris: 0.7, semis: 0.7, adductors: 0.5, vastusLateralis: 0.4, vastusMedialis: 0.4, upperTraps: 0.6, midTraps: 0.4, lats: 0.4, forearmFlexors: 0.6, brachioradialis: 0.3 },
  },
  {
    n: 'Sumo deadlift',
    t: { adductors: 0.9, gluteMax: 0.9, vastusLateralis: 0.6, vastusMedialis: 0.6, erectors: 0.6, bicepsFemoris: 0.5, semis: 0.5, upperTraps: 0.5, forearmFlexors: 0.5 },
  },
  { n: 'Romanian deadlift', t: { semis: 1, bicepsFemoris: 1, gluteMax: 0.8, erectors: 0.6, forearmFlexors: 0.3, upperTraps: 0.3 } },
  { n: 'Good morning', t: { erectors: 0.9, semis: 0.8, bicepsFemoris: 0.8, gluteMax: 0.6 } },
  { n: 'Barbell bench press', t: { midChest: 1, lowerChest: 0.7, upperChest: 0.5, frontDelts: 0.6, tricepsLateral: 0.5, tricepsLong: 0.5 } },
  { n: 'Incline bench press', t: { upperChest: 1, midChest: 0.6, frontDelts: 0.8, tricepsLong: 0.5, tricepsLateral: 0.4 } },
  { n: 'Dip', t: { lowerChest: 1, midChest: 0.6, tricepsLong: 0.8, tricepsLateral: 0.8, frontDelts: 0.4 } },
  {
    n: 'Overhead press',
    t: { frontDelts: 1, sideDelts: 0.6, tricepsLong: 0.7, tricepsLateral: 0.6, upperTraps: 0.4, upperChest: 0.3, serratus: 0.3, upperAbs: 0.2 },
  },
  {
    n: 'Pull-up',
    t: { lats: 1, bicepsLong: 0.5, bicepsShort: 0.5, brachialis: 0.5, lowerTraps: 0.5, rhomboids: 0.4, rearDelts: 0.3, forearmFlexors: 0.4, brachioradialis: 0.3 },
  },
  { n: 'Chin-up', t: { lats: 0.9, bicepsShort: 0.8, bicepsLong: 0.7, brachialis: 0.5, lowerTraps: 0.4, rhomboids: 0.3 } },
  { n: 'Lat pulldown', t: { lats: 1, bicepsLong: 0.5, brachialis: 0.4, lowerTraps: 0.4, rhomboids: 0.3, rearDelts: 0.2 } },
  {
    n: 'Barbell bent-over row',
    t: { rhomboids: 0.9, midTraps: 0.9, lats: 0.8, rearDelts: 0.6, bicepsShort: 0.5, brachialis: 0.4, erectors: 0.5, forearmFlexors: 0.3 },
  },
  { n: 'Chest-supported row', t: { rhomboids: 1, midTraps: 0.9, lats: 0.7, rearDelts: 0.6, bicepsLong: 0.4 } },
  { n: "Farmer's carry", t: { forearmFlexors: 1, upperTraps: 0.8, obliques: 0.6, upperAbs: 0.4, gluteMed: 0.4 } },
];

const EQUIP: Record<Exclude<Equipment, 'other'>, string[]> = {
  barbell: [
    'Smith machine squat',
    'Smith machine bench press',
    'Smith machine incline press',
    'Smith machine overhead press',
    'Smith machine row',
    'Smith machine shrug',
    'Smith machine calf raise','Barbell shrug', 'Barbell curl', 'Preacher curl', 'Reverse curl', 'Skull crusher', 'Wrist curl', 'Reverse wrist curl', 'Hip thrust', 'Barbell back squat', 'Front squat', 'Conventional deadlift', 'Sumo deadlift', 'Romanian deadlift', 'Good morning', 'Barbell bench press', 'Incline bench press', 'Overhead press', 'Barbell bent-over row'],
  dumbbell: [
    'Standing dumbbell curl',
    'Dumbbell shrug',
    'Dumbbell triceps kickback',
    'Single-arm dumbbell row',
    'Goblet squat','Incline dumbbell fly', 'Flat dumbbell fly', 'Front raise', 'Lateral raise', 'Prone Y-raise', 'Incline dumbbell curl', 'Concentration curl', 'Hammer curl', 'Overhead triceps extension', 'Walking lunge', 'Bulgarian split squat', "Farmer's carry"],
  cable: [
    'Cable fly (mid)',
    'Cable front raise',
    'Cable rear delt fly',
    'Cable upright row',
    'Cable shrug',
    'Cable overhead triceps extension',
    'Cable pull-through',
    'Cable chest press',
    'Single-arm cable row',
    'Cable curl',
    'Bayesian curl',
    'Rope pushdown',
    'Seated cable row','Low-to-high cable fly', 'High-to-low cable crossover', 'Cable lateral raise', 'Face pull', 'Cable external rotation', 'Straight-arm pulldown', 'Triceps pushdown', 'Cable crunch', 'Cable woodchop', 'Serratus punch', 'Cable kickback', 'Cable hip flexion'],
  machine: [
    'Machine lateral raise',
    'Machine rear delt fly',
    'Machine leg extension',
    'Machine chest press',
    'Machine shoulder press',
    'Hack squat','Pec deck fly', 'Reverse pec deck', 'Hip abduction', 'Hip adduction machine', 'Leg extension', 'Lying leg curl', 'Seated leg curl', 'Standing leg curl', 'Standing calf raise', 'Seated calf raise', 'Leg press', 'Lat pulldown', 'Chest-supported row'],
  bodyweight: ['Glute-ham raise', 'Push-up','Back extension', 'Reverse crunch', 'Hanging leg raise', 'Plank', 'Side plank', 'Sissy squat', 'Nordic curl', 'Tibialis raise', 'Dip', 'Pull-up', 'Chin-up'],
};

const EQ_OF: Record<string, Equipment> = {};
(Object.entries(EQUIP) as [Equipment, string[]][]).forEach(([k, list]) => list.forEach((n) => (EQ_OF[n] = k)));

export const EQ_LABEL: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  other: 'Other',
};

/** [low, high, default] reps. */
const REPS: Record<string, [number, number, number]> = {
  'Cable fly (mid)': [12, 15, 14], 'Cable front raise': [12, 15, 14], 'Cable rear delt fly': [12, 15, 14],
  'Cable upright row': [10, 14, 12], 'Cable shrug': [10, 14, 12], 'Cable overhead triceps extension': [10, 14, 12],
  'Cable pull-through': [10, 14, 12], 'Cable chest press': [8, 12, 10], 'Single-arm cable row': [8, 12, 10],
  'Smith machine squat': [6, 10, 8], 'Smith machine bench press': [6, 10, 8], 'Smith machine incline press': [8, 10, 8],
  'Smith machine overhead press': [6, 10, 8], 'Smith machine row': [8, 12, 10], 'Smith machine shrug': [10, 14, 12],
  'Smith machine calf raise': [10, 14, 12], 'Machine chest press': [8, 12, 10], 'Machine shoulder press': [8, 12, 10],
  'Seated cable row': [8, 12, 10], 'Single-arm dumbbell row': [8, 12, 10], 'Hack squat': [8, 12, 10],
  'Goblet squat': [10, 14, 12], 'Push-up': [10, 15, 12], 'Standing dumbbell curl': [8, 12, 10],
  'Cable curl': [10, 14, 12], 'Bayesian curl': [10, 14, 12], 'Machine lateral raise': [12, 15, 14], 'Machine rear delt fly': [12, 15, 14],
  'Dumbbell shrug': [10, 14, 12], 'Dumbbell triceps kickback': [12, 15, 14], 'Rope pushdown': [10, 14, 12],
  'Machine leg extension': [10, 14, 12], 'Glute-ham raise': [6, 10, 8],
  'Barbell back squat': [6, 8, 6], 'Front squat': [6, 8, 6], 'Conventional deadlift': [4, 6, 4], 'Sumo deadlift': [4, 6, 4], 'Romanian deadlift': [8, 10, 8], 'Good morning': [8, 12, 10],
  'Barbell bench press': [6, 8, 6], 'Incline bench press': [8, 10, 8], 'Overhead press': [6, 8, 6], 'Barbell bent-over row': [8, 10, 8],
  Dip: [8, 12, 10], 'Pull-up': [6, 10, 8], 'Chin-up': [6, 10, 8], 'Lat pulldown': [8, 12, 10], 'Chest-supported row': [8, 12, 10], 'Leg press': [10, 12, 10], 'Walking lunge': [10, 12, 10], 'Bulgarian split squat': [8, 12, 10], "Farmer's carry": [30, 40, 30],
  'Incline dumbbell fly': [10, 14, 12], 'Low-to-high cable fly': [12, 16, 14], 'Flat dumbbell fly': [10, 14, 12], 'Pec deck fly': [12, 16, 14], 'High-to-low cable crossover': [12, 16, 14],
  'Front raise': [12, 16, 14], 'Lateral raise': [14, 20, 16], 'Cable lateral raise': [14, 20, 16], 'Reverse pec deck': [14, 20, 16], 'Face pull': [16, 20, 18], 'Cable external rotation': [16, 20, 18], 'Prone Y-raise': [12, 16, 14],
  'Barbell shrug': [10, 14, 12], 'Straight-arm pulldown': [12, 16, 14], 'Back extension': [12, 16, 14],
  'Barbell curl': [8, 12, 10], 'Incline dumbbell curl': [10, 12, 10], 'Preacher curl': [10, 12, 10], 'Concentration curl': [10, 14, 12], 'Hammer curl': [10, 12, 10], 'Reverse curl': [10, 14, 12],
  'Triceps pushdown': [10, 14, 12], 'Overhead triceps extension': [10, 14, 12], 'Skull crusher': [8, 12, 10], 'Wrist curl': [16, 20, 18], 'Reverse wrist curl': [16, 20, 18],
  'Cable crunch': [12, 16, 14], 'Reverse crunch': [12, 20, 16], 'Hanging leg raise': [10, 14, 12], Plank: [40, 60, 40], 'Side plank': [30, 40, 30], 'Cable woodchop': [12, 16, 14], 'Serratus punch': [12, 16, 14],
  'Hip thrust': [8, 12, 10], 'Cable kickback': [12, 16, 14], 'Hip abduction': [16, 20, 18], 'Hip adduction machine': [16, 20, 18], 'Cable hip flexion': [12, 16, 14],
  'Leg extension': [10, 14, 12], 'Sissy squat': [10, 14, 12], 'Lying leg curl': [10, 14, 12], 'Seated leg curl': [10, 14, 12], 'Standing leg curl': [10, 14, 12], 'Nordic curl': [4, 8, 6],
  'Standing calf raise': [10, 14, 12], 'Seated calf raise': [16, 20, 18], 'Tibialis raise': [16, 24, 20],
};

/** "Reps" are seconds for these. */
export const TIMED = new Set(['Plank', 'Side plank', "Farmer's carry"]);
export const MAX_REPS = 20;

/** Preferred picks for hypertrophy, with the reason shown on hover. */
const STARS: Record<string, string> = {
  'Incline bench press': 'Upper chest: loads the clavicular fibres in a deep stretch with heavy, progressable weight.',
  'Pec deck fly': 'Mid chest: stable, tension at full stretch, no shoulder stability limiting the set.',
  Dip: 'Lower chest: deepest loaded stretch of the costal fibres; easy to add weight.',
  'Overhead press': 'Front delts: heaviest loadable movement for the anterior head.',
  'Cable lateral raise': 'Side delts: tension stays on through the whole arc, unlike dumbbells which go slack at the bottom.',
  'Reverse pec deck': 'Rear delts: stable, isolates the posterior head, easy to take to failure safely.',
  'Pull-up': 'Lats: full stretch at the bottom, high load; lat pulldown is an equal swap.',
  'Chest-supported row': 'Upper back: removes the lower-back limiter so the rhomboids and mid-traps reach failure first.',
  'Romanian deadlift': 'Hamstrings/glutes: hip hinge with the hamstrings lengthened under heavy load.',
  'Bayesian curl':
    'Biceps long head: the arm sits behind the body, so the long head is loaded at full stretch with the cable keeping tension the whole way.',
  'Incline dumbbell curl': 'Biceps long head: trains the muscle at long length, which drives more growth.',
  'Preacher curl': 'Biceps short head: stable, strict, strong stretch at the bottom.',
  'Overhead triceps extension': 'Triceps long head: overhead position lengthens the long head.',
  'Cable crunch': 'Abs: progressively loadable spinal flexion, unlike bodyweight crunches.',
  'Hanging leg raise': 'Lower abs: high demand on the lower rectus and hip flexors.',
  'Barbell back squat': 'Quads/glutes: heaviest loaded stretch across the whole lower body.',
  'Leg extension': 'Rectus femoris: the only exercise that trains it with the hip extended.',
  'Seated leg curl': 'Hamstrings: seated (hip flexed) lengthens the hamstrings.',
  'Hip thrust': 'Glute max: peak contraction under heavy load; pair with a stretched movement for full coverage.',
  'Bulgarian split squat': 'Glutes: deep stretch in a single-leg pattern with strong glute med demand.',
  'Standing calf raise': 'Gastrocnemius: knee straight so the gastroc is lengthened; pause at the bottom.',
};

function build(raw: Raw[], kind: 'iso' | 'comp', prefix: string): Exercise[] {
  return raw.map((e, i) => {
    const timed = TIMED.has(e.n);
    let r = REPS[e.n] ?? (kind === 'comp' ? [6, 10, 8] : [10, 14, 12]);
    if (!timed) r = r.map((x) => Math.min(MAX_REPS, x)) as [number, number, number];
    return {
      id: prefix + i,
      n: e.n,
      kind,
      t: e.t,
      eq: EQ_OF[e.n] ?? 'other',
      star: STARS[e.n] ?? null,
      rr: [r[0], r[1]],
      reps: r[2],
      timed,
    };
  });
}

export const ISOLATION = build(ISOLATION_RAW, 'iso', 'i');
export const COMPOUND = build(COMPOUND_RAW, 'comp', 'c');

/** id -> exercise */
export const ALL: Record<string, Exercise> = Object.fromEntries([...ISOLATION, ...COMPOUND].map((e) => [e.id, e]));

export const byName = (n: string) => Object.values(ALL).find((e) => e.n === n);
export const repUnit = (e: Exercise) => (e.timed ? 's' : '');
