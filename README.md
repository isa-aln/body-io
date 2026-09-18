# body.io — Phase 1 port

Drop-in replacement for the `src/` folder of the Vite React+TS project you just
created, plus an `index.html` with the right title.

## Installing

From inside `body-io/`:

1. Unzip so that `src/` and `index.html` land next to `package.json`, overwriting
   what Vite generated.
2. Delete leftovers from the template you no longer need: `src/App.css`,
   `src/assets/`.
3. `npm run dev`

No extra dependencies — it's plain React, no UI library.

## Layout

```
src/
  types.ts                  shared TypeScript types
  data/anatomy.ts           muscle groups, heads, SVG paths for both views
  data/exercises.ts         exercise library: targeting, equipment, rep ranges, star picks
  lib/targeting.ts          sets per head and per group
  lib/progression.ts        logged reps -> next session's weight
  lib/storage.ts            localStorage load/save
  components/BodyMap.tsx    the figure: selectable, or a heat map when given fills
  components/MusclePicker.tsx
  components/ExerciseBrowser.tsx   search, filters, isolation/compound plates
  components/DayEditor.tsx  sets / reps / weight for one day
  components/TargetingPreview.tsx
  App.tsx                   state and layout
```

## What changed from the HTML version

**Effort/RPE is gone.** Volume is plain set counts everywhere. Three sets is
three sets — no 0.85 multiplier to reason about. `targeting()` gives sets per
muscle head weighted by how hard the exercise loads it; `setsPerGroup()` counts
each exercise once per group at its strongest head, which is the number to
compare against weekly landmarks.

**Presets, customs and the week planner are replaced by one routine model.** A
routine has a length of 1 day, 2 days, or a week, and holds that many days of
exercises. Routines are editable — there's no read-only/fine-tune split. The
targeting preview toggles between the current day and the whole routine.

**Weight and progression are in.** Every entry has a `weight` field, and
`lib/progression.ts` holds the rule: all sets at the top of the range -> add
2.5kg upper / 5kg lower (1kg on isolation); inside the range -> same weight,
chase one more rep; below the bottom twice running -> drop 10%. `recommend()`
takes an entry plus the log and returns the next prescription with a one-line
note — that note is what the watch will show. Nothing writes to the log yet;
that's session mode.

## Not ported

Share (text/image/link), the print sheet, quick-start routine builder, and the
balance assistant. All of it is in the original HTML and can come back once the
core is settled — but session mode matters more than any of them.

## Next

1. Session mode: one exercise at a time, target weight x reps, rest timer, a rep
   entry per set that writes a `SessionLog`. This is the screen you'll use in the
   gym and the one the watch mirrors.
2. PWA manifest + service worker so it installs on the iPhone.
3. Supabase for accounts and sync.
