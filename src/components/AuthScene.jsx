import ThemeToggle from "./ThemeToggle";
import ThemeSettings from "./ThemeSettings";
import SchoolBrand from "./SchoolBrand";

// The two auth screens are the same picture: a drawn Nepali school scene on one
// side and a rounded sheet of paper overlapping its edge on the other. Only the
// card contents differ, so the scene — and the way it collapses into a strip on
// a phone — is written once here.
//
// Nothing in the scene may name the school. It is mounted with `school={null}`
// so the wordmark falls back to the product name; the real name only appears
// after a successful sign-in, on the reveal curtain.

export default function AuthScene({
  eyebrow,
  headline,
  blurb,
  highlights,
  cardTitle,
  lead,
  children,
  footer,
}) {
  return (
    <main className="qd-canvas relative min-h-dvh overflow-hidden bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Scene. Tall on a desktop, a strip above the card on a phone. */}
      <section className="qd-ink relative h-40 overflow-hidden lg:h-auto">
        <div className="qd-art absolute inset-0" aria-hidden="true" />
        <div className="qd-drift absolute -left-16 top-6 h-44 w-44 rounded-full bg-white/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-6 lg:p-10 xl:p-12">
          <SchoolBrand
            school={null}
            portal="School Portal"
            tone="dark"
            size="lg"
            className="relative qd-slide-right lg:mt-2"
          />

          <div className="hidden max-w-xl lg:block">
            <span className="qd-fade-up inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/12 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
              {eyebrow}
            </span>

            <h1 className="qd-fade-up qd-d-1 mt-5 font-display text-4xl font-extrabold leading-[1.05] text-white drop-shadow-[0_2px_12px_rgba(4,17,40,0.45)] xl:text-[2.9rem]">
              {headline}
            </h1>

            <p className="qd-fade-up qd-d-2 mt-4 max-w-md text-[15px] leading-7 text-white/85">
              {blurb}
            </p>

            {highlights && (
              <div className="qd-stagger mt-6 grid grid-cols-2 gap-3">
                {highlights.map(([title, subtitle]) => (
                  <div
                    key={title}
                    className="rounded-2xl border border-white/20 bg-white/12 p-3.5 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/20"
                  >
                    <p className="font-display text-sm font-bold text-white">
                      {title}
                    </p>
                    <p className="mt-0.5 text-xs text-white/75">{subtitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="relative hidden text-xs text-white/60 lg:block">
            © {new Date().getFullYear()} Smart LMS
          </p>
        </div>
      </section>

      {/* Card column. Negative margin pulls the paper over the scene. */}
      <section className="qd-sky relative flex justify-center px-4 pb-6 sm:px-8 lg:items-center lg:pb-8">
        <div className="qd-fade-up absolute right-4 top-4 z-10 flex items-center gap-2 sm:right-7 sm:top-6">
          <ThemeToggle />
          <ThemeSettings />
        </div>

        <div className="qd-scrollbar relative -mt-10 max-h-[calc(100dvh-6rem)] w-full max-w-md overflow-y-auto overscroll-contain pb-2 lg:my-6 lg:-ml-24 lg:max-h-[calc(100dvh-3rem)] lg:py-2">
          <div className="qd-paper rounded-3xl border border-white/70 bg-card p-5 text-slate-900 sm:p-6 dark:border-slate-700/70">
            <div className="qd-fade-up qd-d-1 mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                {eyebrow}
              </p>

              <h2 className="mt-1 font-display text-[25px] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
                {cardTitle}
              </h2>

              <p className="mt-1.5 text-[13px] leading-5 text-slate-600 dark:text-slate-400">
                {lead}
              </p>
            </div>

            {children}
          </div>

          {footer && (
            <p className="qd-fade-up qd-d-4 mt-4 flex items-center justify-center gap-1.5 text-[13px] text-slate-600 dark:text-slate-400">
              {footer}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
