import { useEffect, useRef } from "react";

import { KidFigure } from "./SchoolKids";

// The giant storybook on the lawn, with the boy and the girl standing at it.
// They used to walk past it like the third child; they are fixed here instead,
// one on each page, each with the arm nearest the spine laid along the cover so
// the two of them hold it open.
//
// The page is no longer turned by a loop. It is turned by the pointer: moving
// from the left edge of the window to the right carries the sheet from the
// right-hand page over the spine and down onto the left, and moving back brings
// it back. That is direct manipulation rather than ambient motion, so it still
// works on the Calm setting, where everything else in the scene stands still.
//
// The turn is `scaleX` about the crease in the SVG's own units, so the sheet
// squashes towards a line exactly where the spine is at every rendered size. The
// book never reaches a true zero width — a page exactly edge-on is a hairline
// spike, which reads as a fault in the picture rather than as paper — and each
// step of the arc tilts it, which is what lifts the free end off the page below.
//
// The book and the two children are one box, sized from the height of the frame
// because the art is `cover`-cropped. The children are measured off that box
// rather than off the em scale the walker uses, so the pair can never drift away
// from the book when the column changes shape.

const READERS = [
  // `reach` picks the arm nearest the book: the left child reaches right with
  // the front arm, the right child reaches left with the back one.
  { name: "boy", side: "left", reach: "front", wave: false },
  { name: "girl", side: "right", reach: "back", wave: false },
];

const RIGHT_LINES = [
  "M112,62 Q146,55 180,44",
  "M112,55 Q146,48 178,37",
  "M114,48 Q146,41 174,31",
];

const LEFT_LINES = [
  "M88,62 Q54,55 20,44",
  "M88,55 Q54,48 22,37",
  "M86,48 Q54,41 26,31",
];

const RIGHT_PAGE = "M100,48 C126,40 158,32 186,26 L190,50 C160,52 128,56 100,68 Z";
const LEFT_PAGE = "M100,48 C74,40 42,32 14,26 L10,50 C40,52 72,56 100,68 Z";

function Ink({ lines }) {
  return (
    <g className="qd-sb-ink">
      {lines.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  );
}

export default function SchoolReaders() {
  const box = useRef(null);

  useEffect(() => {
    const el = box.current;

    const turn = (event) => {
      const p = Math.min(1, Math.max(0, event.clientX / (window.innerWidth - 1)));
      const angle = p * Math.PI;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      // Which side of the spine the sheet is on. It decides the sign of the
      // width, and the tilt leans the other way: a page rising off the right
      // hand side tips down towards the spine, one coming down on the left
      // tips the other way.
      const side = cos < 0 ? -1 : 1;

      // The sheet never reaches a true zero width: a page exactly edge-on is a
      // hairline spike, which reads as a fault in the picture rather than as
      // paper.
      el.style.setProperty("--qd-sx", (Math.max(0.06, Math.abs(cos)) * side).toFixed(3));
      el.style.setProperty("--qd-arc", `${(-3 * sin).toFixed(2)}px`);
      el.style.setProperty("--qd-tilt", `${(-side * 10 * sin).toFixed(2)}deg`);
      el.style.setProperty("--qd-curl", `${(-11 * sin).toFixed(2)}deg`);
      el.style.setProperty("--qd-lift", (sin * sin).toFixed(3));
    };

    window.addEventListener("pointermove", turn);
    return () => window.removeEventListener("pointermove", turn);
  }, []);

  return (
    <div className="qd-reading hidden sm:block" ref={box} aria-hidden="true">
      <svg viewBox="0 0 200 100" className="qd-storybook-svg" preserveAspectRatio="xMidYMax meet">
        {/* Two ellipses, one wider and paler than the other: a single hard oval
            under a book this size reads as a puddle. */}
        <ellipse className="qd-sb-shadow qd-sb-shadow-far" cx="100" cy="81" rx="80" ry="7" />
        <ellipse className="qd-sb-shadow" cx="100" cy="80" rx="62" ry="4.5" />

        <path
          className="qd-sb-cover"
          d="M6,28 C38,34 72,42 100,50 C128,42 162,34 194,28 L196,58 Q150,64 100,78 Q50,64 4,58 Z"
        />
        {/* A ribbon over the front edge. Shorter and wider it reads as a leg
            the book is standing on. */}
        <path className="qd-sb-tab" d="M97,70 L104,70 L107,93 L100.5,88.5 L94,93 Z" />

        <path className="qd-sb-stack" d="M10,50 C40,52 72,56 100,68 L100,73 C72,61 40,57 10,55 Z" />
        <path className="qd-sb-stack" d="M190,50 C160,52 128,56 100,68 L100,73 C128,61 160,57 190,55 Z" />
        <path className="qd-sb-cut" d="M10,52.5 C40,54.5 72,58.5 100,70.5" />
        <path className="qd-sb-cut" d="M190,52.5 C160,54.5 128,58.5 100,70.5" />

        <path className="qd-sb-page" d={LEFT_PAGE} />
        <Ink lines={LEFT_LINES} />
        <path className="qd-sb-page" d={RIGHT_PAGE} />
        <Ink lines={RIGHT_LINES} />

        <path
          className="qd-sb-crease"
          d="M100,48 C96.6,54 96.6,62 100,68 C103.4,62 103.4,54 100,48 Z"
        />

        {/* The sheet the turning page leaves behind, darkening while it is in
            the air. */}
        <path className="qd-sb-lift" d={RIGHT_PAGE} />

        <g className="qd-sb-turn">
          <path className="qd-sb-page" d={RIGHT_PAGE} />
          <Ink lines={RIGHT_LINES} />
          <path className="qd-sb-curl" d="M186,26 L170,30 L183,39 Z" />
        </g>

        <g transform="translate(104 90) rotate(-8)">
          <path className="qd-sb-graphite" d="M0,3 L4.5,0.8 L4.5,5.2 Z" />
          <path className="qd-sb-wood" d="M4.5,0.8 L13,0 L13,6 L4.5,5.2 Z" />
          <rect className="qd-sb-body" x="13" y="0" width="18" height="6" />
          <rect className="qd-sb-ferrule" x="31" y="0" width="3.5" height="6" />
          <rect className="qd-sb-eraser" x="34.5" y="0" width="4" height="6" rx="1.6" />
        </g>
      </svg>

      {READERS.map((figure) => (
        <div key={figure.name} className={`qd-reader qd-reader-${figure.side}`}>
          <KidFigure figure={figure} />
        </div>
      ))}
    </div>
  );
}
