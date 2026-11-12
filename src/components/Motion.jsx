import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { useTheme } from "../context/ThemeContext";
import {
  fadeOut,
  grown,
  popFrom,
  revealDelay,
  risen,
  settled,
  transitionFor,
} from "../utils/motion";

// The JavaScript half of the animation layer.
//
// index.css keeps the ambient loops — the drifting backdrop, the bobbing crest,
// the hover sheen — because an infinite GPU keyframe does not belong in a JS
// runtime. What lives here is what keyframes cannot express: a panel that
// animates *out* as well as in, a spring that settles instead of a curve that
// stops, a chip that travels between two measured positions, and a reveal that
// waits until you have actually scrolled to it.
//
// Every one reads the Animation control in the theme panel, so Calm stops the
// library too. On top of that the operating system's reduced-motion request is
// honoured here even though the CSS layer deliberately ignores it: scripted
// movement is the one kind that can make a person physically ill, and the CSS
// exemption exists only because Windows raises that request whenever *desktop*
// animation is switched off.

const useDegree = () => {
  const { motion: degree } = useTheme();

  return useReducedMotion() ? "reduced" : degree;
};

const Box = (as) => motion[as] || motion.div;

// Content rising into place. `index` spaces a list apart one step per row;
// `inView` holds a row back until the reader has actually scrolled to it.
export function Reveal({
  as = "div",
  index = 0,
  inView = false,
  className = "",
  children,
  ...rest
}) {
  const degree = useDegree();
  const Motion = Box(as);
  const delay = revealDelay(degree, index);

  // The delay is only claimed when a row actually asks for one, so a plain
  // list of `<Reveal index={0}>` children carries no dead transition object.
  const transition = delay > 0 ? transitionFor(degree, { delay }) : transitionFor(degree);
  const common = { className, variants: { hidden: risen(degree), show: settled }, ...rest };

  if (inView) {
    return (
      <Motion
        {...common}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        transition={transition}
      >
        {children}
      </Motion>
    );
  }

  return (
    <Motion {...common} initial="hidden" animate="show" transition={transition}>
      {children}
    </Motion>
  );
}

// A popover, menu or dropdown: appears hinged at the control that opened it and
// collapses back the same way. Put it inside <AnimatePresence>, at the place
// that decides whether it is open.
export function Pop({ as = "div", origin = "top right", className = "", children, ...rest }) {
  const degree = useDegree();
  const Motion = Box(as);

  return (
    <Motion
      className={className}
      style={{ transformOrigin: origin }}
      initial={popFrom(degree)}
      animate={grown}
      exit={fadeOut(0.96, degree)}
      transition={transitionFor(degree)}
      {...rest}
    >
      {children}
    </Motion>
  );
}

// Anything that arrives and leaves as a whole: a dialog's backdrop, a page
// inside the portal shell. Put a <Pop> panel inside it and closing reads as one
// gesture instead of a panel escaping a haze.
export function Fade({ as = "div", className = "", children, ...rest }) {
  const degree = useDegree();
  const Motion = Box(as);

  return (
    <Motion
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: degree === "reduced" ? 0 : 0.18 }}
      {...rest}
    >
      {children}
    </Motion>
  );
}

// The chip behind a selected option, sliding to wherever the selection is now.
// `x` is a percentage of the chip's own width, so it tracks the real width of
// the row at every breakpoint instead of a hand-counted calc().
export function Slide({ as = "span", x = "0%", className = "", ...rest }) {
  const degree = useDegree();
  const Motion = Box(as);

  return (
    <Motion
      className={className}
      initial={false}
      animate={{ x }}
      transition={transitionFor(degree, { delay: 0 })}
      {...rest}
    />
  );
}

// A panel you can pick up and put anywhere. `floating` is the whole switch: while
// the panel is docked the library keeps its hands off it, so the same element can
// be a fixed column at one moment and a draggable sheet the next.
export function Float({
  as = "div",
  floating = false,
  x,
  y,
  style,
  onDragEnd,
  className = "",
  children,
  ...rest
}) {
  const Motion = Box(as);

  return (
    <Motion
      className={className}
      drag={floating}
      dragMomentum={false}
      dragElastic={0.06}
      onDragEnd={onDragEnd}
      style={floating ? { ...style, x, y } : style}
      {...rest}
    >
      {children}
    </Motion>
  );
}

// Re-exported so a page that opens something only has to import from one place.
export { AnimatePresence };
