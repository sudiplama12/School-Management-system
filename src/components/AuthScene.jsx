import SchoolBrand from "./SchoolBrand";
import ThemeToggle from "./ThemeToggle";
import ThemeSettings from "./ThemeSettings";

// The two auth screens are the same picture: a drawn Nepali school scene and a
// rounded sheet of paper overlapping its edge. Only the card contents differ,
// so the scene — and the way it collapses into a strip above the card — is
// written once here.
//
// Responsiveness rule: the page is a normal scrolling document up to `lg`,
// where it becomes one fixed viewport with the card as the only scroller. A
// phone never gets two scrollbars, and nothing is ever clipped off the bottom.
//
// Nothing in the scene may name the school. It is mounted with `school={null}`
// so the wordmark falls back to the product name; the real name only appears
// after a successful sign-in, on the reveal curtain.

export default function AuthScene({
  eyebrow,
  headline,
  blurb,
  highlights,
  cardEyebrow,
  cardTitle,
  lead,
  children,
  footer,
}) {
  return (
    <main className="qd-canvas relative bg-slate-50 lg:h-dvh lg:grid lg:grid-cols-[1.05fr_1fr] lg:overflow-hidden">
      {/* Scene: a strip on a phone, a full column from lg up. */}
      <section className="qd-ink relative h-40 overflow-hidden sm:h-52 lg:h-auto">
        <div className="qd-art absolute inset-0" aria-hidden="true" />
        <div className="qd-drift absolute -left-16 top-6 h-44 w-44 rounded-full bg-white/20 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-5 sm:p-6 lg:p-10 xl:p-12">
          {/* The crest is printed on the art, so on a short strip it would sit
              on the bright sky. It only appears once the column is tall. */}
          <SchoolBrand
            school={null}
            portal="School Portal"
            tone="dark"
            size="lg"
            className="qd-slide-right hidden lg:flex"
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
              <div className="qd-stagger mt-6 grid grid-cols-1 gap-3 min-[430px]:grid-cols-2">
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

      {/* Card column. The negative margin pulls the paper over the scene. */}
      <section className="qd-sky relative flex justify-center px-4 pb-10 sm:px-6 lg:items-center lg:px-8 lg:py-6">
        <div className="w-full max-w-md lg:max-h-[calc(100dvh-3rem)] lg:overscroll-contain lg:overflow-y-auto qd-scrollbar lg:py-1">
          <div className="qd-paper -mt-12 rounded-3xl border border-slate-200 bg-card p-5 text-slate-900 sm:p-6 lg:mt-0">
            {/* The wordmark and the theme chips live inside the card, so they
                can never land on top of the form at any width. */}
            <div className="mb-5 flex items-center justify-between gap-3">
              <SchoolBrand
                school={null}
                portal="School Portal"
                tone="light"
                className="min-w-0 lg:hidden"
              />

              <div className="ml-auto flex shrink-0 items-center gap-2">
                <ThemeToggle />
                <ThemeSettings />
              </div>
            </div>

            <div className="qd-fade-up qd-d-1 mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                {cardEyebrow}
              </p>

              <h2 className="mt-1 font-display text-[25px] font-extrabold leading-tight tracking-tight text-slate-900">
                {cardTitle}
              </h2>

              <p className="mt-1.5 text-[13px] leading-5 text-slate-600">
                {lead}
              </p>
            </div>

            {children}
          </div>

          {footer && (
            <p className="qd-fade-up qd-d-4 mt-4 flex flex-wrap items-center justify-center gap-1.5 text-[13px] text-slate-600">
              {footer}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
