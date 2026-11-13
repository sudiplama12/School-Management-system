// The props that turn a box into a sheet of paper.
//
// This lives beside motion.js, not in components/Paper.jsx, because it is a
// function that returns props, not a component: exported from a component file
// it breaks React Fast Refresh for every component beside it.

// A row of pinned sheets never hangs straight. Six angles, cycled by position,
// is enough to look like somebody put them up and not enough to look random.
const TILT = [-0.7, 0.55, -0.35, 0.8, -0.5, 0.3];

// Spread onto whatever motion primitive moves the sheet. It is a props object
// rather than a wrapper element because a sheet that arrives and leaves is the
// same node as the sheet resting on the board: put a `qd-sheet` box inside a
// <Tear> and the shadow, the pin and the paper end up on three different layers,
// and the pin comes off with the wrong one.
//
// `className` is merged rather than passed through because a later `className`
// prop silently replaces everything spread before it, and a sheet that loses its
// class is a plain card wearing a push-pin.
export const sheetProps = (
  index = 0,
  { fold = false, stack = false, tilt, className = "" } = {}
) => ({
  className: [
    "qd-sheet",
    fold && "qd-sheet-fold",
    stack && "qd-sheet-stack",
    className,
  ]
    .filter(Boolean)
    .join(" "),
  style: { "--qd-tilt": `${tilt ?? TILT[index % TILT.length]}deg` },
});
