// The children printed in the auth scene are drawn here instead, so that they
// can actually move. `school-lawn.jpg` is the same picture with them taken out.
//
// Two of the three no longer walk: they stand at the book, in
// `SchoolReaders.jsx`, which reuses `KidFigure` and the outfits below. This
// file keeps the one that still crosses the lawn, and it travels on `left`, not
// `transform`. The frame it walks in is a `cover`-cropped column whose width
// changes with the viewport, so a percentage of the container is the only
// measure that stays true at every breakpoint — and it leaves `transform` free
// for the bob, which the limbs use inside the SVG.
//
// The band is aria-hidden: it carries no information a screen reader should
// reach, and nothing here may name the school.

// The colours the printed art is built from: white shirt, red tie, a dark hem,
// and a bright bag. Only the bag, the hem and the hair change.
const OUTFITS = {
  boy: { bag: "#3f7fd6", hem: "#2f4a7a", hair: "#4a3226", skirt: false, wave: true },
  girl: { bag: "#ef7fb2", hem: "#2f4a7a", hair: "#33231b", skirt: true, wave: true },
  tiny: { bag: "#f0b73f", hem: "#3b5a35", hair: "#5a3d28", skirt: true, wave: false },
};

const WALKERS = [
  // Further away than the pair at the book, which is why it is mounted first
  // and the readers are drawn over it. `rest` is where it stands when the walk
  // is switched off. The ground line is in `em`, not a percentage — a percentage
  // would resolve against the child's own height and pin it to the same strip of
  // lawn as the readers, which makes a passer-by look like a third child at the
  // book. Higher up the frame, it reads as further back.
  //
  // The delay is set so that the scene opens with the walker on the left third.
  // A mid-crossing start parked it behind the spine for the first minute.
  { name: "tiny", scale: 0.62, bottom: "2.4em", speed: "74s", start: "-15s", rest: "18%" },
];

// A figure on its own, with no position: whoever mounts it decides where it
// stands and how big it is. A `reach` in the figure config lays the arm nearest
// the book along `--qd-reach` instead of swinging it.
export function KidFigure({ figure }) {
  const fit = { ...OUTFITS[figure.name], ...figure };
  const frontArm =
    fit.reach === "front"
      ? "qd-arm qd-arm-front qd-arm-reach"
      : fit.wave
        ? "qd-arm qd-arm-wave"
        : "qd-arm qd-arm-front";
  const backArm =
    fit.reach === "back" ? "qd-arm qd-arm-back qd-arm-reach" : "qd-arm qd-arm-back";

  return (
    <svg viewBox="0 0 48 72" className="qd-kid-svg">
      {/* The ground does not bob, so the shadow stays outside the body. */}
      <ellipse className="qd-kid-shadow" cx="24" cy="69.5" rx="12" ry="2.6" />

      <g className="qd-kid-body">
        <rect x="9" y="28" width="30" height="19" rx="7" fill={fit.bag} className="qd-kid-bag" />

        <g className="qd-kid-legs">
          <rect className="qd-leg qd-leg-back" x="19" y="46" width="5" height="19" rx="2.5" fill="#eec29a" />
          <rect className="qd-leg qd-leg-front" x="25" y="46" width="5" height="19" rx="2.5" fill="#f7d5b0" />
        </g>

        <path className="qd-shoe qd-shoe-back" d="M18 63h7v4a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z" fill="#2b2b2b" />
        <path className="qd-shoe qd-shoe-front" d="M25 63h7v4a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2z" fill="#3a3a3a" />

        <path
          className="qd-kid-hem"
          d={fit.skirt ? "M15 43h18l4 10H11z" : "M16 43h16v10H16z"}
          fill={fit.hem}
        />

        <rect x="15" y="26" width="18" height="19" rx="5" fill="#fffdf7" />
        <path className="qd-kid-tie" d="M24 27.2 26.3 30l-1.1 6.6h-2.4L21.7 30z" fill="#d63b3b" />

        <rect className={backArm} x="10" y="28" width="5" height="15" rx="2.5" fill="#eec29a" />

        <g className={frontArm}>
          <rect x="33" y="28" width="5" height="15" rx="2.5" fill="#f7d5b0" />
          <circle cx="35.5" cy="43" r="2.9" fill="#f7d5b0" />
        </g>

        <circle cx="24" cy="16.5" r="11.5" fill="#f7d5b0" />
        <path
          className="qd-kid-hair"
          d={
            fit.skirt
              ? "M12.5 16.5a11.5 11.5 0 0 1 23 0c0-6.2-3.6-9.2-11.5-9.2s-11.5 3-11.5 9.2zm23 0 4.2 11.2-4.6-1.4zM12.5 16.5 8.3 27.7l4.6-1.4z"
              : "M12.5 16.5a11.5 11.5 0 0 1 23 0c0-6.8-4-9.2-11.5-9.2s-11.5 2.4-11.5 9.2z"
          }
          fill={fit.hair}
        />

        <circle cx="20.2" cy="17.4" r="1.6" fill="#2b2b2b" />
        <circle cx="27.8" cy="17.4" r="1.6" fill="#2b2b2b" />
        <path d="M21 22.2q3 2.6 6 0" stroke="#c2604f" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <circle cx="16.4" cy="20" r="1.9" fill="#f4a6a0" opacity="0.5" />
        <circle cx="31.6" cy="20" r="1.9" fill="#f4a6a0" opacity="0.5" />
      </g>
    </svg>
  );
}

export default function SchoolKids() {
  return (
    <div className="qd-kids hidden sm:block" aria-hidden="true">
      {WALKERS.map((figure) => (
        <div
          key={figure.name}
          className="qd-kid"
          style={{
            "--qd-scale": figure.scale,
            "--qd-bottom": figure.bottom,
            "--qd-speed": figure.speed,
            "--qd-start": figure.start,
            "--qd-rest": figure.rest,
          }}
        >
          <KidFigure figure={figure} />
        </div>
      ))}
    </div>
  );
}
