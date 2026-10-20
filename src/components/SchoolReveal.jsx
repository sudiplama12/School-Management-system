import { useEffect, useRef, useState } from "react";
import { School } from "lucide-react";

// Plays once between a successful sign-in and the portal: the school's name is
// deliberately withheld from the login screen, so this is where it appears.
// HOLD matches .qd-track and EXIT matches .qd-curtain-out in index.css.

const HOLD = 2200;
const EXIT = 550;

export default function SchoolReveal({ school, user, onDone }) {
  const [leaving, setLeaving] = useState(false);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const reduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const hold = reduced ? 350 : HOLD;
    const exit = reduced ? 60 : EXIT;

    const first = setTimeout(() => setLeaving(true), hold);
    const second = setTimeout(() => done.current?.(), hold + exit);

    return () => {
      clearTimeout(first);
      clearTimeout(second);
    };
  }, []);

  const skip = () => {
    setLeaving(true);
    setTimeout(() => done.current?.(), 220);
  };

  const name = school?.name || "Smart LMS";
  const words = name.split(" ");

  return (
    <div
      role="status"
      aria-label={`Welcome to ${name}`}
      onClick={skip}
      className={`qd-ink fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 px-6 ${
        leaving ? "qd-curtain-out" : "qd-fade-in"
      }`}
    >
      <div className="qd-drift absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/25 blur-3xl" />
      <div className="qd-drift-slow absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl" />

      {/* Halo rings + slow dashed orbit behind the crest */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <span className="qd-halo absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/40" />
        <span
          className="qd-halo absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/30"
          style={{ animationDelay: "900ms" }}
        />
        <span className="qd-spin-slow absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-400/20" />
      </div>

      <div className="relative flex w-full max-w-2xl flex-col items-center text-center">
        <div className="qd-pop qd-shine flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-emerald-950 shadow-2xl shadow-emerald-500/30 sm:h-24 sm:w-24">
          <School size={44} strokeWidth={2.1} />
        </div>

        <p
          className="qd-fade-up qd-d-2 mt-8 text-[11px] font-bold uppercase tracking-[0.42em] text-emerald-300/80"
          style={{ animationDelay: "180ms" }}
        >
          {school?.shortName ? `${school.shortName} · ` : ""}
          {school?.session ? `Session ${school.session}` : "Welcome"}
        </p>

        <h1 className="mt-4 flex max-w-xl flex-wrap items-center justify-center font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
          {words.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="qd-word"
              style={{ animationDelay: `${260 + i * 95}ms` }}
            >
              {word}
              {i < words.length - 1 ? "\u00A0" : ""}
            </span>
          ))}
        </h1>

        <span
          className="qd-line mt-6 block h-px w-40 bg-gradient-to-r from-transparent via-amber-300/70 to-transparent"
          style={{ animationDelay: "620ms" }}
        />

        <p
          className="qd-fade-up mt-6 max-w-md text-base leading-7 text-emerald-100/80"
          style={{ animationDelay: "760ms" }}
        >
          {school?.tagline || "One connected platform for every portal."}
        </p>

        <p
          className="qd-fade-up mt-3 text-sm text-emerald-100/55"
          style={{ animationDelay: "900ms" }}
        >
          Welcome back
          {user?.name ? `, ${String(user.name).split(" ")[0]}` : ""} — opening
          your portal…
        </p>

        <div
          className="qd-fade-up mt-9 h-1 w-44 overflow-hidden rounded-full bg-white/10"
          style={{ animationDelay: "980ms" }}
        >
          <span className="qd-track block h-full w-full rounded-full bg-gradient-to-r from-amber-300 to-amber-500" />
        </div>

        <p className="qd-fade-in mt-5 text-[11px] uppercase tracking-[0.2em] text-emerald-100/35">
          Tap anywhere to skip
        </p>
      </div>
    </div>
  );
}
