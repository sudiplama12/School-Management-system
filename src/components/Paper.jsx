// The paper objects the printed half of the school is made of: a mark drawn in a
// register, a stamp pressed on a result.
//
// The textures live in index.css because they are paint, not behaviour, and the
// sheet props live in utils/paper.js because they are not a component. What
// lives here is the stroke that has to be drawn in the right order.
//
// Nothing in this file takes a slate colour. Paper is the one surface in the
// app that is the same in both themes, so the classes set their own type colour
// and a page that adds `text-slate-*` on top of them will get a caption that is
// unreadable in dark mode.

export function Pin() {
  return <span aria-hidden="true" className="qd-pin" />;
}

// The four marks a register is written with, as pen strokes that draw
// themselves in. `pathLength` is pinned at 100 so one dash length in the CSS
// fits every one of these shapes.
const MARKS = {
  present: <path pathLength={100} d="M4 13.2 9.1 18.3 20 6.4" />,

  // A cross is two strokes with a lift between them, so the second one waits.
  absent: (
    <>
      <path pathLength={100} d="M6.2 6 17.8 18" />
      <path pathLength={100} className="qd-pen-2" d="M17.8 6 6.2 18" />
    </>
  ),

  // Late is a tick with the pen still down: a dot of ink where it stopped.
  late: (
    <>
      <path pathLength={100} d="M4.6 13.6 8.9 17.6 16.6 8.2" />
      <circle className="qd-pen-dot" cx="20" cy="17.4" r="1.5" />
    </>
  ),

  // A circled line is what a mark on sanctioned leave looks like in a book.
  leave: (
    <>
      <path pathLength={100} d="M7.4 12h9.2" />
      <circle pathLength={100} className="qd-pen-2" cx="12" cy="12" r="7.4" />
    </>
  ),
};

// Absent is the one mark kept in red pen, because that is what a teacher's red
// pen is for and a page of blue crosses says nothing.
const INK = { absent: "var(--qd-pen-red)" };

export function PenMark({ kind = "present", size = 22, className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      className={`qd-pen ${className}`}
      style={{ stroke: INK[kind] || "var(--qd-pen)" }}
      strokeWidth="2.4"
    >
      {MARKS[kind] ?? MARKS.present}
    </svg>
  );
}

// A rubber stamp pressed onto the finished page.
export function Stamp({ children, className = "" }) {
  return <span className={`qd-stamp ${className}`}>{children}</span>;
}
