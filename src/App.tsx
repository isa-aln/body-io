import { useEffect, useMemo, useState } from 'react';
import BodyMap from './components/BodyMap';
import ExerciseBrowser from './components/ExerciseBrowser';
import RoutineEditor from './components/RoutineEditor';
import TargetingPreview from './components/TargetingPreview';
import SessionMode from './components/SessionMode';
import ShareBar from './components/ShareBar';
import History from './components/History';
import Intro from './components/Intro';
import TrainPage from './components/TrainPage';
import { fromLinkHash, mergeLogs } from './lib/share';
import { applyProgress } from './lib/progression';
import { ALL, byName } from './data/exercises';
import { GROUP_OF, NAME, short } from './data/anatomy';
import { viewFor, viewForMuscle } from './lib/view';
import { targeting } from './lib/targeting';
import { DEFAULT_SETTINGS, loadStore, saveStore, type Settings } from './lib/storage';
import { download, toBackup } from './lib/share';
import type { Entry, MuscleId, Routine, SessionLog, View } from './types';

const uid = () => Math.random().toString(36).slice(2, 9);

const blankRoutine = (name: string): Routine => ({ id: uid(), name, entries: [] });

/**
 * The two routines a new install starts with, built by covering every muscle
 * head in the exercise data.
 *
 *  - Isolation: one exercise per head, nothing left uncovered. 27 lifts, 11 of
 *    them the preferred pick for their head, which is why it opens first.
 *  - Compound: the fewest lifts that reach the most muscle. Eight lifts cover
 *    everything except the small stuff no compound trains — calves, rotator
 *    cuff, forearms, obliques, tibialis.
 */
function seedRoutines(): Routine[] {
  const build = (name: string, list: [string, number][]): Routine => ({
    id: uid(),
    name,
    entries: list.flatMap<Entry>(([n, sets]) => {
      const ex = byName(n);
      return ex ? [{ exId: ex.id, sets, reps: ex.reps, weight: null }] : [];
    }),
  });

  return [
    build('Full cycle', [
      ['Smith machine bench press', 3],
      ['Smith machine squat', 3],
      ['Smith machine row', 3],
      ['Standing leg curl', 3],
      ['Lat pulldown', 3],
      ['Cable chest press', 3],
      ['Smith machine overhead press', 3],
      ['Triceps pushdown', 3],
      ['Face pull', 3],
    ]),
    build('Every muscle — isolation', [
      ['Pec deck fly', 2],
      ['Incline dumbbell fly', 2],
      ['Back extension', 2],
      ['Prone Y-raise', 2],
      ['Straight-arm pulldown', 2],
      ['Dumbbell shrug', 2],
      ['Face pull', 2],
      ['Cable lateral raise', 2],
      ['Front raise', 2],
      ['Reverse pec deck', 2],
      ['Hammer curl', 2],
      ['Overhead triceps extension', 2],
      ['Preacher curl', 2],
      ['Reverse curl', 2],
      ['Wrist curl', 2],
      ['Hanging leg raise', 2],
      ['Cable crunch', 2],
      ['Cable woodchop', 2],
      ['Serratus punch', 2],
      ['Hip thrust', 2],
      ['Hip abduction', 2],
      ['Hip adduction machine', 2],
      ['Leg extension', 2],
      ['Seated leg curl', 2],
      ['Standing calf raise', 2],
      ['Seated calf raise', 2],
      ['Tibialis raise', 2],
    ]),
    build('Whole body — compound', [
      ['Barbell bench press', 3],
      ['Push-up', 3],
      ['Conventional deadlift', 3],
      ['Pull-up', 3],
      ['Chest-supported row', 3],
      ['Overhead press', 3],
      ['Bulgarian split squat', 3],
      ['Front squat', 3],
    ]),
  ];
}

type Route = 'train' | 'plan' | 'session' | 'progress';

const routeFromHash = (): Route =>
  location.hash.startsWith('#/session')
    ? 'session'
    : location.hash.startsWith('#/progress')
      ? 'progress'
      : location.hash.startsWith('#/plan')
        ? 'plan'
        : 'train';

export default function App() {
  const saved = useMemo(loadStore, []);
  const [seed] = useState(() => (saved?.routines?.length ? null : seedRoutines()));
  const [routines, setRoutines] = useState<Routine[]>(saved?.routines?.length ? saved.routines : seed!);
  // seed[0] is the routine that opens on a fresh install
  const [activeId, setActiveId] = useState<string>(saved?.activeRoutineId ?? seed![0].id);
  const [log, setLog] = useState<SessionLog[]>(saved?.log ?? []);
  const [route, setRoute] = useState<Route>(routeFromHash);
  const [settings, setSettings] = useState<Settings>(saved?.settings ?? DEFAULT_SETTINGS);
  const [showIntro, setShowIntro] = useState(!saved);

  const [selected, setSelected] = useState<MuscleId | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [hoveredEx, setHoveredEx] = useState<string | null>(null);
  const [hoveredMuscle, setHoveredMuscle] = useState<MuscleId | null>(null);
  const [viewOverride, setViewOverride] = useState<View | null>(null);

  const routine = routines.find((r) => r.id === activeId) ?? routines[0];

  useEffect(() => {
    saveStore({ routines, activeRoutineId: routine.id, log, settings });
  }, [routines, routine.id, log, settings]);

  // each page has its own URL, so the back button and home-screen shortcuts work
  useEffect(() => {
    const onHash = () => setRoute(routeFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = (r: Route) => {
    location.hash = r === 'train' ? '#/' : `#/${r}`;
    setRoute(r);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (/input|select|textarea/i.test(el.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape') {
        if (pinned) setPinned(null);
        else setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pinned]);

  /**
   * Switching routine drops any muscle selection and pinned exercise, so the
   * body goes back to showing the whole routine rather than staying stuck on
   * whatever head was picked in the last one.
   */
  const pickRoutine = (id: string) => {
    setActiveId(id);
    setSelected(null);
    setPinned(null);
    setHoveredEx(null);
  };

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setSettings((s) => ({ ...s, [k]: v }));

  const addPlace = () => {
    const name = prompt('Name this gym (e.g. "Main gym", "Second gym")')?.trim();
    if (!name) return;
    setSettings((s) => ({
      ...s,
      places: s.places.includes(name) ? s.places : [...s.places, name],
      activePlace: name,
    }));
  };

  const backup = () => {
    download(`body-io-backup-${new Date().toISOString().slice(0, 10)}.json`, toBackup(routines, log));
    set('sinceBackup', 0);
  };

  const updateRoutine = (fn: (r: Routine) => Routine) =>
    setRoutines((rs) => rs.map((r) => (r.id === routine.id ? fn(r) : r)));

  const setEntries = (entries: Entry[]) => updateRoutine((r) => ({ ...r, entries }));
  const rename = (name: string) => updateRoutine((r) => ({ ...r, name }));

  const toggleExercise = (exId: string) => {
    const i = routine.entries.findIndex((e) => e.exId === exId);
    if (i >= 0) setEntries(routine.entries.filter((_, k) => k !== i));
    else setEntries([...routine.entries, { exId, sets: 3, reps: ALL[exId].reps, weight: null }]);
  };

  const selectMuscle = (id: MuscleId) => {
    setSelected(selected === id ? null : id);
    setPinned(null);
  };

  const addRoutine = () => {
    const r = blankRoutine(`Routine ${routines.length + 1}`);
    setRoutines([...routines, r]);
    pickRoutine(r.id);
    go('plan');
  };

  const duplicateRoutine = () => {
    const copy: Routine = { id: uid(), name: `${routine.name} copy`, entries: routine.entries.map((e) => ({ ...e })) };
    setRoutines([...routines, copy]);
    pickRoutine(copy.id);
  };

  const deleteRoutine = () => {
    if (routines.length === 1) return;
    const rest = routines.filter((r) => r.id !== routine.id);
    setRoutines(rest);
    pickRoutine(rest[0].id);
  };

  const importRoutines = (incoming: Routine[]) => {
    if (!incoming.length) return;
    setRoutines((rs) => [...rs, ...incoming]);
    pickRoutine(incoming[0].id);
  };

  // opening a shared link drops its routine in as a new one, then cleans the URL
  useEffect(() => {
    const shared = fromLinkHash(location.hash);
    if (!shared.length) return;
    importRoutines(shared);
    history.replaceState(null, '', location.pathname + location.search);
  }, []);

  const inspectId = hoveredEx ?? pinned;

  /** What the body is coloured by when nothing is picked: the planned work. */
  const planHead = useMemo(() => targeting(routine.entries).head, [routine.entries]);
  const planFills = useMemo(() => {
    const max = Math.max(0, ...Object.values(planHead));
    const out: Record<MuscleId, number> = {};
    Object.keys(planHead).forEach((m) => (out[m] = max ? planHead[m] / max : 0));
    return out;
  }, [planHead]);

  const fills = inspectId ? ALL[inspectId].t : selected ? null : planFills;

  /**
   * An exercise under the cursor always wins — you asked to see what it loads.
   * Otherwise the toggle decides once you've touched it, and context decides
   * until then.
   */
  const view: View = useMemo(() => {
    if (inspectId) return viewFor(ALL[inspectId].t);
    if (hoveredMuscle) return viewForMuscle(hoveredMuscle);
    if (viewOverride) return viewOverride;
    if (selected) return viewForMuscle(selected);
    return viewFor(planFills);
  }, [inspectId, hoveredMuscle, viewOverride, selected, planFills]);

  if (route === 'progress') {
    return (
      <History
        log={log}
        unit={settings.unit}
        onExit={() => go('train')}
        onClear={() => {
          if (confirm('Delete every logged session? This cannot be undone.')) setLog([]);
        }}
      />
    );
  }

  if (route === 'session') {
    return (
      <SessionMode
        routine={routine}
        log={log}
        unit={settings.unit}
        place={settings.activePlace}
        onExit={() => go('train')}
        onSave={(logs) => {
          const nextLog = [...log, ...logs];
          setLog(nextLog);
          // the routine now carries the weights and reps to aim for next time
          setEntries(applyProgress(routine.entries, nextLog, settings.activePlace));
          set('sinceBackup', settings.sinceBackup + 1);
          go('train');
        }}
      />
    );
  }

  const nav = (
    <header>
      <h1>body.io</h1>
      <nav className="pages">
        <button className={route === 'train' ? 'on' : ''} onClick={() => go('train')}>
          Train
        </button>
        <button className={route === 'plan' ? 'on' : ''} onClick={() => go('plan')}>
          Plan
        </button>
        <button onClick={() => go('progress')}>Progress</button>
        <button
          className="unit"
          onClick={() => set('unit', settings.unit === 'kg' ? 'lb' : 'kg')}
          title="Switch units"
        >
          {settings.unit}
        </button>
      </nav>
    </header>
  );

  const intro = showIntro && !settings.seenIntro && (
    <Intro
      onClose={() => {
        setShowIntro(false);
        set('seenIntro', true);
      }}
      onPlan={() => {
        setShowIntro(false);
        set('seenIntro', true);
        go('plan');
      }}
    />
  );

  if (route === 'train') {
    return (
      <>
        {intro}
        {nav}
        <TrainPage
          routines={routines}
          routine={routine}
          log={log}
          unit={settings.unit}
          places={settings.places}
          place={settings.activePlace}
          needsBackup={settings.sinceBackup >= 5}
          onPlace={(p) => set('activePlace', p)}
          onAddPlace={addPlace}
          onBackup={backup}
          onPick={pickRoutine}
          onWeight={(i, weight) => setEntries(routine.entries.map((e, k) => (k === i ? { ...e, weight } : e)))}
          onStart={() => go('session')}
          onPlan={() => go('plan')}
        />
      </>
    );
  }

  return (
    <>
      {intro}
      {nav}
      <p className="page-note">
        One routine is one session. Build it here — pick a muscle to find exercises, then set sets and reps.
        Weights go in on the Train page when you work out.
      </p>

      <main>
        <section className="body" aria-label="Body map">
          <div className="view-toggle" role="group" aria-label="Which side of the body">
            <button aria-pressed={view === 'front'} onClick={() => setViewOverride('front')}>
              Front
            </button>
            <button aria-pressed={view === 'back'} onClick={() => setViewOverride('back')}>
              Back
            </button>
          </div>

          <p className="side-line">
            {inspectId
              ? `${ALL[inspectId].n} — what it loads`
              : selected
                ? short(NAME[selected])
                : routine.entries.length
                  ? `${routine.name} — what you're training`
                  : 'Add exercises, or pick a muscle to see what trains it'}
          </p>

          <div className="body-wrap">
            <BodyMap
              view={view}
              selected={selected}
              onSelect={selectMuscle}
              fills={fills}
              hovered={hoveredMuscle}
              onHover={setHoveredMuscle}
            />
            {inspectId && <span className="inspect-tag">{ALL[inspectId].n}</span>}
            {hoveredMuscle && (
              <span className="body-tag">
                {short(NAME[hoveredMuscle])}
                {inspectId ? (
                  <b>{Math.round((ALL[inspectId].t[hoveredMuscle] ?? 0) * 100)}%</b>
                ) : !selected && planHead[hoveredMuscle] ? (
                  <b>{Math.round(planHead[hoveredMuscle] * 10) / 10} sets</b>
                ) : null}
                <small>{GROUP_OF[hoveredMuscle]}</small>
              </span>
            )}
          </div>

          {selected ? (
            <div className="selection">
              <span className="dot" aria-hidden="true" />
              <span className="what">
                {short(NAME[selected])}
                <small>{GROUP_OF[selected]}</small>
              </span>
              <button className="clear-sel" onClick={() => setSelected(null)}>
                Clear
              </button>
            </div>
          ) : (
            <p className="selection empty-sel">Tap a muscle on the body to see what trains it</p>
          )}
        </section>

        <section aria-label="Exercises">
          <ExerciseBrowser
            selected={selected}
            entries={routine.entries}
            onToggle={toggleExercise}
            pinned={pinned}
            onPin={setPinned}
            onHoverExercise={(id) => !pinned && setHoveredEx(id)}
          />
        </section>

        <section aria-label="Routine">
          <div className="wo-head">
            <h2>Routine</h2>
          </div>

          <div className="wo-bar">
            <select value={routine.id} onChange={(e) => pickRoutine(e.target.value)} aria-label="Routine">
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
            <button onClick={addRoutine}>New</button>
            <button onClick={duplicateRoutine}>Duplicate</button>
            <button onClick={deleteRoutine} disabled={routines.length === 1}>
              Delete
            </button>
          </div>

          <ShareBar
            routines={routines}
            active={routine}
            log={log}
            onImport={importRoutines}
            onImportLog={(incoming) => setLog((l) => mergeLogs(l, incoming))}
          />

          <RoutineEditor routine={routine} unit={settings.unit} log={log} onChange={setEntries} onRename={rename} />

          <TargetingPreview
            hovered={hoveredMuscle}
            onHover={setHoveredMuscle}
            entries={routine.entries}
          />
        </section>
      </main>
    </>
  );
}
