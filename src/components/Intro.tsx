interface Props {
  onClose: () => void;
  onPlan: () => void;
}

/** Shown once, on a device with no data. Three sentences, then out of the way. */
export default function Intro({ onClose, onPlan }: Props) {
  return (
    <div className="intro-scrim" role="dialog" aria-modal="true" aria-labelledby="introTitle">
      <div className="intro">
        <h2 id="introTitle">
          body<span>.io</span>
        </h2>
        <p className="lede">Three things, in order.</p>

        <ol className="intro-steps">
          <li>
            <b>Plan</b>
            <span>
              Tap a muscle on the body to see every exercise that trains it, and how much of the work each head
              takes. Add what you want to a routine.
            </span>
          </li>
          <li>
            <b>Train</b>
            <span>
              Open the routine at the gym and hit start. One exercise at a time, with a rest timer. Tell it how
              many reps you actually got.
            </span>
          </li>
          <li>
            <b>Progress</b>
            <span>
              It compares what you did against what it asked for, and sets the next weight. Hit the top of the
              range on every set and it goes up.
            </span>
          </li>
        </ol>

        <div className="intro-foot">
          <button className="go" onClick={onPlan}>
            Build a routine
          </button>
          <button onClick={onClose}>Look around first</button>
        </div>
      </div>
    </div>
  );
}
