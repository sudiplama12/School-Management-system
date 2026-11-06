import { School } from "lucide-react";

// One crest block for the sign-in page and all four sidebars, so the school's
// name and colours are literally rendered from the same place. Before sign-in
// it is mounted with `school={null}` and falls back to "Smart LMS"; the real
// name arrives with the login response and lives in AuthContext.
//
// The wordmark is the one place the reference art is followed exactly: a round
// crest, then the name in the rounded display face with a small line under it.
// The name itself still has to stay hidden until a sign-in succeeds, so what
// reads as the logo before login is always the product name.

const TONES = {
  dark: {
    mark: "bg-white/12 text-white ring-1 ring-white/25 shadow-black/20",
    name: "text-white",
    portal: "text-amber-300",
    code: "border-white/20 bg-white/10 text-emerald-100",
  },
  light: {
    mark: "bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-700/25",
    name: "text-slate-900",
    portal: "text-emerald-700 dark:text-emerald-300",
    code: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:text-emerald-300",
  },
};

const SIZES = {
  sm: { mark: "h-10 w-10 rounded-2xl", icon: 21, name: "text-[15px]", portal: "text-[10px]" },
  lg: {
    mark: "h-12 w-12 rounded-[1.1rem] sm:h-14 sm:w-14 sm:rounded-2xl",
    icon: 28,
    name: "text-xl",
    portal: "text-[11px]",
  },
};

export default function SchoolBrand({
  school,
  portal,
  tone = "dark",
  size = "sm",
  showCode = false,
  className = "",
}) {
  const t = TONES[tone] || TONES.dark;
  const s = SIZES[size] || SIZES.sm;

  const name = school?.name || "Smart LMS";

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex ${s.mark} shrink-0 items-center justify-center shadow-lg ${t.mark} qd-float`}
        aria-hidden="true"
      >
        <School size={s.icon} strokeWidth={2.4} />
      </div>

      <div className="min-w-0">
        <p
          className={`${s.name} font-display font-extrabold leading-tight tracking-tight ${t.name}`}
        >
          {name}
        </p>

        {portal && (
          <p
            className={`${s.portal} mt-0.5 font-bold uppercase tracking-[0.2em] ${t.portal}`}
          >
            {portal}
          </p>
        )}

        {showCode && school?.code && (
          <span
            className={`mt-1.5 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider ${t.code}`}
          >
            {school.code}
          </span>
        )}
      </div>
    </div>
  );
}
