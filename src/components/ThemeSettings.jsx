import { useEffect, useRef, useState } from "react";
import { Ban, Check, Monitor, Moon, Palette, Sun } from "lucide-react";

import {
  ACCENTS,
  APPEARANCES,
  MOTIONS,
  SURFACES,
  WALLPAPERS,
  useTheme,
} from "../context/ThemeContext";

// The full theme control: appearance, accent colour, wallpaper, how transparent
// the surfaces are and how much motion the app is allowed to use — all live, all
// persisted by ThemeContext.
// It replaces the old single light/dark switch in the portal header while
// ThemeToggle stays on the sign-in cards, where a compact switch is the right
// amount of control.

// The mini surfaces the appearance tiles paint. `band` is mixed from the accent
// ramp so the preview tracks the colour the user just picked.
const PREVIEWS = {
  light: { surface: "#ffffff", band: "16%", line: "#cbd5e1", ink: "#0f172a" },
  dark: { surface: "#101a24", band: "42%", line: "#334155", ink: "#f1f5f9" },
  system: { surface: "#f8fafc", band: "22%", line: "#94a3b8", ink: "#0f172a" },
};

const bandOn = (mix) =>
  `color-mix(in oklab, var(--color-emerald-500) ${mix}, #ffffff)`;
const bandIn = (mix) =>
  `color-mix(in oklab, var(--color-emerald-500) ${mix}, #101a24)`;

function Preview({ appearance }) {
  const p = PREVIEWS[appearance];

  return (
    <span
      aria-hidden="true"
      className="relative block h-11 w-full overflow-hidden rounded-lg border border-slate-200"
      style={{ background: p.surface }}
    >
      {appearance === "system" ? (
        <>
          <span className="absolute inset-y-0 left-0 w-1/2" style={{ background: "#ffffff" }} />
          <span className="absolute inset-y-0 right-0 w-1/2" style={{ background: "#101a24" }} />
        </>
      ) : null}

      <span
        className="absolute inset-x-1.5 top-1.5 h-2.5 rounded"
        style={{
          background:
            appearance === "dark"
              ? bandIn(p.band)
              : appearance === "system"
                ? `linear-gradient(90deg, ${bandOn(p.band)} 50%, ${bandIn(p.band)} 50%)`
                : bandOn(p.band),
        }}
      />
      <span
        className="absolute inset-x-1.5 top-5 h-1.5 rounded"
        style={{ background: p.line, width: "62%" }}
      />
      <span
        className="absolute bottom-1.5 left-1.5 h-1.5 w-8 rounded"
        style={{ background: p.ink, opacity: 0.45 }}
      />
    </span>
  );
}

// A backdrop tile: the same custom property index.css paints the shell with, so
// what the picker shows is literally what gets chosen.
function WallpaperTile({ option }) {
  if (!option.css) {
    return (
      <span className="relative flex h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800">
        <Ban size={13} className="text-slate-400" />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className="block h-10 w-full rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-800"
      style={{
        backgroundImage: option.css,
        backgroundSize: option.size || "auto",
        backgroundRepeat: option.size ? "repeat" : "no-repeat",
      }}
    />
  );
}

// The wallpaper list is long enough to need two labelled rows — the abstract set
// that recolours with the accent, and the nature set that does not.
function WallpaperGrid({ heading, options, active, onPick }) {
  return (
    <div className="mt-2">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
        {heading}
      </p>

      <div role="radiogroup" aria-label={heading} className="grid grid-cols-4 gap-2">
        {options.map((option) => {
          const on = active === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={on}
              title={option.label}
              aria-label={option.label}
              onClick={() => onPick(option.id)}
              className={`relative rounded-lg p-0.5 transition ${
                on ? "ring-2 ring-emerald-500 ring-offset-1 ring-offset-card" : "hover:scale-105"
              }`}
            >
              <WallpaperTile option={option} />

              {on && (
                <Check
                  size={13}
                  strokeWidth={3}
                  className="absolute bottom-1 right-1 text-emerald-600 drop-shadow-[0_1px_0_rgba(255,255,255,0.8)] dark:text-emerald-300"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ThemeSettings({ align = "right", className = "" }) {
  const {
    setting,
    isDark,
    accent,
    motion,
    wallpaper,
    surface,
    setTheme,
    setAccent,
    setMotion,
    setWallpaper,
    setSurface,
  } = useTheme();

  const [open, setOpen] = useState(false);
  const wrap = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const onPointer = (event) => {
      if (!wrap.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer);
    window.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = (list, id) => list.find((o) => o.id === id)?.label || id;

  const wallpaperGroup = (group) => WALLPAPERS.filter((w) => group.includes(w.group));

  return (
    <div ref={wrap} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Theme settings"
        title="Theme settings"
        className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
          open
            ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:text-emerald-300"
            : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        }`}
      >
        <Palette size={17} />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Theme settings"
          className={`qd-scrollbar absolute top-12 z-50 max-h-[min(41rem,85vh)] w-[20rem] overflow-y-auto rounded-2xl border border-slate-200 bg-card p-4 shadow-2xl shadow-slate-900/10 ${
            align === "right" ? "qd-pop-tr right-0" : "qd-pop-tl left-0"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Appearance
          </p>

          <div role="radiogroup" aria-label="Appearance" className="mt-2 grid grid-cols-3 gap-2">
            {APPEARANCES.map((option) => {
              const active = setting === option.id;
              const Icon = option.id === "system" ? Monitor : option.id === "dark" ? Moon : Sun;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={option.hint}
                  onClick={() => setTheme(option.id)}
                  className={`rounded-xl border p-1.5 text-left transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/25"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Preview appearance={option.id} />

                  <span className="mt-1.5 flex items-center gap-1 px-0.5 pb-0.5">
                    <Icon
                      size={12}
                      className={active ? "text-emerald-700 dark:text-emerald-300" : "text-slate-400"}
                    />
                    <span
                      className={`text-[11px] font-semibold ${
                        active ? "text-emerald-800 dark:text-emerald-300" : "text-slate-600"
                      }`}
                    >
                      {option.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Accent colour
          </p>

          <div
            role="radiogroup"
            aria-label="Accent colour"
            className="mt-2 grid grid-cols-4 gap-x-2 gap-y-2.5"
          >
            {ACCENTS.map((option) => {
              const active = accent === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={option.label}
                  aria-label={option.label}
                  onClick={() => setAccent(option.id)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full transition ${
                    active
                      ? "ring-2 ring-slate-900/70 ring-offset-2 ring-offset-card dark:ring-white/80"
                      : "ring-1 ring-slate-200 hover:scale-105"
                  }`}
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${option.primary} 0 55%, ${option.highlight} 55% 100%)`,
                  }}
                >
                  {active && (
                    <Check
                      size={15}
                      className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]"
                      strokeWidth={3}
                    />
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Wallpaper
          </p>

          <WallpaperGrid
            heading="Abstract"
            options={wallpaperGroup(["Backdrop", "Abstract"])}
            active={wallpaper}
            onPick={setWallpaper}
          />
          <WallpaperGrid
            heading="Nature"
            options={wallpaperGroup(["Nature"])}
            active={wallpaper}
            onPick={setWallpaper}
          />

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Card surface
          </p>

          <div role="radiogroup" aria-label="Card surface" className="mt-2 grid grid-cols-3 gap-2">
            {SURFACES.map((option) => {
              const active = surface === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={option.hint}
                  onClick={() => setSurface(option.id)}
                  className={`rounded-xl border px-2 py-2 text-center transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/25 dark:text-emerald-300"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-[11px] font-semibold">{option.label}</span>
                  <span className="mt-1 flex justify-center gap-0.5" aria-hidden="true">
                    {SURFACES.map((dot) => (
                      <span
                        key={dot.id}
                        className={`h-1 w-1 rounded-full ${
                          active && SURFACES.indexOf(option) >= SURFACES.indexOf(dot)
                            ? "bg-emerald-500"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">
            Animation
          </p>

          <div role="radiogroup" aria-label="Animation" className="mt-2 grid grid-cols-3 gap-2">
            {MOTIONS.map((option) => {
              const active = motion === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  title={option.hint}
                  onClick={() => setMotion(option.id)}
                  className={`rounded-xl border px-2 py-2 text-center transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/25 dark:text-emerald-300"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <span className="block text-[11px] font-semibold">{option.label}</span>
                  <span className="mt-1 flex justify-center gap-0.5" aria-hidden="true">
                    {MOTIONS.map((dot) => (
                      <span
                        key={dot.id}
                        className={`h-1 w-1 rounded-full ${
                          active && MOTIONS.indexOf(option) >= MOTIONS.indexOf(dot)
                            ? "bg-emerald-500"
                            : "bg-slate-300 dark:bg-slate-600"
                        }`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[11px] leading-snug text-slate-500">
            {isDark ? "Dark" : "Light"} · {label(ACCENTS, accent)} ·{" "}
            {label(WALLPAPERS, wallpaper)} · {label(SURFACES, surface)} ·{" "}
            {label(MOTIONS, motion)} — saved on this device.
          </p>
        </div>
      )}
    </div>
  );
}
