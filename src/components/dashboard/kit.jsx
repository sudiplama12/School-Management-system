// Shared presentational building blocks for the redesigned role dashboards.
// Everything here animates on mount so all four portals enter the same way;
// callers add qd-d-1…qd-d-8 to stagger siblings.

export function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section
      className={`qd-fade-up rounded-3xl border border-slate-200/70 bg-card p-5 shadow-sm transition duration-300 hover:shadow-md hover:shadow-slate-200/70 sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
            )}
          </div>

          {action}
        </div>
      )}

      {children}
    </section>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  accent = "from-emerald-500 to-teal-500",
}) {
  return (
    <div className="qd-fade-up group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-card p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/60">
      <div
        className={`qd-drift absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-xl transition duration-500 group-hover:opacity-20`}
      />

      <div className="relative flex items-center justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-sm transition duration-300 group-hover:scale-110`}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
      </div>

      <p className="relative mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="relative text-sm font-medium text-slate-500">{label}</p>
      {hint && <p className="relative mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Legend({ items = [] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
      {items.map((item, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: item.color }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function ProgressBar({ value = 0, color = "#059669", track = "var(--chart-track)" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full" style={{ background: track }}>
      <div
        className="h-full rounded-full transition-[width] duration-1000 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="qd-skeleton flex h-[170px] items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-400">
      Loading chart…
    </div>
  );
}

export function EmptyChart({ message = "No data yet" }) {
  return (
    <div className="flex h-[170px] items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-400">
      {message}
    </div>
  );
}

export function QuickAction({ icon: Icon, title, description, onClick, accent = "from-emerald-500 to-teal-500" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="qd-fade-up group rounded-3xl border border-slate-200/70 bg-card p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-lg hover:shadow-emerald-100/60"
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-sm`}
      >
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>

      <p className="mt-1.5 text-xs leading-5 text-slate-500">{description}</p>

      <span className="mt-3 inline-block text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 transition group-hover:opacity-100">
        Open →
      </span>
    </button>
  );
}
