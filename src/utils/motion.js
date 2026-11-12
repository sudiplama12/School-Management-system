// Timings for the animation library, keyed by the same three Animation choices
// the theme panel offers (see MOTIONS in ThemeContext): `reduced` is labelled
// Calm, unset is Normal, `rich` is Rich.
//
// The distances and gaps are the numbers index.css already used for its CSS
// keyframes, so moving a page onto the library does not change how far or how
// fast it feels. What the library adds is the part keyframes cannot do: an
// animation for leaving as well as arriving, a spring that settles instead of a
// curve that stops, and movement that follows a real layout change.

// px travelled on the way in, and how far a panel shrinks before it grows.
const DISTANCE = { reduced: 0, full: 18, rich: 34 };
const SHRINK = { reduced: 1, full: 0.94, rich: 0.88 };

// Seconds between siblings in a cascade.
const GAP = { reduced: 0, full: 0.06, rich: 0.095 };

// A 40-row sheet must not drip in one tile at a time, so the cascade stops
// counting after this many steps and the rest arrive together.
export const MAX_STEPS = 10;

// Normal is tuned to land like the CSS `--qd-ease` curve: firm, no overshoot.
// Rich matches `--qd-ease-back`, which does overshoot, so it is underdamped.
export function transitionFor(degree, extra) {
  const base =
    degree === "reduced"
      ? { duration: 0 }
      : degree === "rich"
        ? { type: "spring", stiffness: 180, damping: 16, mass: 1 }
        : { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };

  return extra ? { ...base, ...extra } : base;
}

// `index` is the slot in a cascade; slot 1 is what a Stagger hands its first
// child, so it doubles as the gap in seconds.
export const revealDelay = (degree, index = 0) =>
  GAP[degree] * Math.min(index, MAX_STEPS);

export const risen = (degree) => ({ opacity: 0, y: DISTANCE[degree] });

export const settled = { opacity: 1, y: 0 };

export const popFrom = (degree) => ({ opacity: 0, scale: SHRINK[degree], y: -8 });

export const grown = { opacity: 1, scale: 1, y: 0 };

// Leaving is always a short tween, never the entrance spring played backwards:
// a panel the user has dismissed has to go immediately. Under Calm even that
// tween is switched off, since an exit is the one thing a keyframe could not do
// before and nobody wants to wait for it.
export const fadeOut = (scale, degree = "full") => ({
  opacity: 0,
  scale,
  transition: { duration: degree === "reduced" ? 0 : 0.13 },
});
