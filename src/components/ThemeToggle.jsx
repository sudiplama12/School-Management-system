import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// A single sliding switch for the two themes. The thumb travels the width of
// the pill and the icons counter-rotate, so the control reads as a physical
// flip rather than a swap. `tone` lets it sit on the light header or on the
// dark sign-in brand panel without a second component.

const TONES = {
  light: {
    track: "border-slate-200 bg-slate-100",
    thumb: "bg-card text-amber-600 dark:text-amber-400 shadow-slate-300/60",
    idle: "text-slate-400",
  },
  dark: {
    track: "border-white/15 bg-white/10",
    thumb: "bg-amber-400 text-emerald-950 shadow-black/30",
    idle: "text-emerald-200/60",
  },
};

export default function ThemeToggle({ tone = "light", className = "" }) {
  const { isDark, toggleTheme } = useTheme();
  const t = TONES[tone] || TONES.light;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={toggleTheme}
      className={`relative inline-flex h-9 w-[68px] shrink-0 items-center rounded-full border px-1 transition duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/25 ${t.track} ${className}`}
    >
      {/* Both icons live in the track; the thumb covers whichever is inactive. */}
      <span
        className={`absolute left-2.5 transition-opacity duration-300 ${
          isDark ? "opacity-0" : `opacity-100 ${t.idle}`
        }`}
      >
        <Sun size={15} />
      </span>

      <span
        className={`absolute right-2.5 transition-opacity duration-300 ${
          isDark ? `opacity-100 ${t.idle}` : "opacity-0"
        }`}
      >
        <Moon size={15} />
      </span>

      <span
        className={`z-10 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-out ${t.thumb} ${
          isDark ? "translate-x-[32px]" : "translate-x-0"
        }`}
      >
        <span
          className="transition-transform duration-500"
          style={{ transform: isDark ? "rotate(-180deg)" : "rotate(0deg)" }}
        >
          {isDark ? <Moon size={15} /> : <Sun size={15} />}
        </span>
      </span>
    </button>
  );
}
