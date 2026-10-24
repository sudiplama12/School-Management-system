import { School } from "lucide-react";

// One crest block for the sign-in page and all four sidebars, so the school's
// name and colours are literally rendered from the same place. Before sign-in
// it is mounted with `school={null}` and falls back to "Smart LMS"; the real
// name arrives with the login response and lives in AuthContext.

const TONES = {
  dark: {
    mark: "bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 shadow-emerald-500/25",
    name: "text-white",
    portal: "text-emerald-400/90",
    code: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  light: {
    mark: "bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-700/25",
    name: "text-slate-900",
    portal: "text-emerald-700 dark:text-emerald-300",
    code: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:text-emerald-300",
  },
};

const SIZES = {
  sm: { mark: "h-10 w-10 rounded-xl", icon: 21, name: "text-[13px]", portal: "text-[10px]" },
  lg: { mark: "h-12 w-12 rounded-2xl sm:h-14 sm:w-14", icon: 28, name: "text-lg", portal: "text-[11px]" },
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
        <School size={s.icon} strokeWidth={2.2} />
      </div>

      <div className="min-w-0">
        <p className={`${s.name} font-serif font-bold leading-tight ${t.name}`}>
          {name}
        </p>

        {portal && (
          <p
            className={`${s.portal} mt-0.5 font-semibold uppercase tracking-[0.18em] ${t.portal}`}
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
