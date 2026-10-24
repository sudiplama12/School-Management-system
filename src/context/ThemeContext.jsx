import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Five independent preferences — appearance, accent colour, wallpaper, how
// transparent the surfaces are, and how much motion the app is allowed to use —
// each persisted separately so changing one never disturbs the others.
//
// Appearance puts `dark` on <html>, which activates every Tailwind `dark:`
// utility and the palette overrides in index.css together. The other four put
// `data-accent`, `data-wallpaper`, `data-surface` / `data-motion` on <html>, and
// index.css keys whole colour ramps, backdrop gradients, translucency and
// animation timings off those attributes — so one attribute can recolour,
// re-dress, thin or retime the app without touching a class name anywhere. The
// pre-paint script in index.html applies them all before React mounts, so a
// reload never flashes the wrong theme.

const THEME_KEY = "lms_theme";
const ACCENT_KEY = "lms_accent";
const MOTION_KEY = "lms_motion";
const WALLPAPER_KEY = "lms_wallpaper";
const SURFACE_KEY = "lms_surface";
const QUERY = "(prefers-color-scheme: dark)";

export const APPEARANCES = [
  { id: "light", label: "Light", hint: "Bright paper surfaces" },
  { id: "dark", label: "Dark", hint: "Deep slate, easy on the eye" },
  { id: "system", label: "System", hint: "Follow the operating system" },
];

// `primary` and `highlight` are only what the picker paints as a swatch. The
// ramps the app actually uses live in index.css under `data-accent`.
export const ACCENTS = [
  { id: "emerald", label: "Emerald", primary: "#10b981", highlight: "#fbbf24" },
  { id: "ocean", label: "Ocean", primary: "#3b82f6", highlight: "#22d3ee" },
  { id: "amethyst", label: "Amethyst", primary: "#8b5cf6", highlight: "#e879f9" },
  { id: "rose", label: "Rose", primary: "#f43f5e", highlight: "#fb923c" },
  { id: "lagoon", label: "Lagoon", primary: "#14b8a6", highlight: "#a3e635" },
  { id: "sunset", label: "Sunset", primary: "#f97316", highlight: "#facc15" },
  { id: "indigo", label: "Indigo", primary: "#4f46e5", highlight: "#38bdf8" },
  { id: "graphite", label: "Graphite", primary: "#64748b", highlight: "#a1a1aa" },
];

// Degrees, not a switch: `full` is the value the timings in index.css were
// written for, so it is the one that needs no attribute at all.
export const MOTIONS = [
  { id: "reduced", label: "Calm", hint: "Nothing moves — pages arrive settled" },
  {
    id: "full",
    label: "Normal",
    hint: "Card reveals and a backdrop that drifts slowly",
  },
  {
    id: "rich",
    label: "Rich",
    hint: "Springier reveals, a sheen on hover, two pools of light",
  },
];

// `plain` needs no attribute; each other id selects a gradient set in
// index.css, which is why the picker tiles can preview them for free — they
// read the very same variables the app paints with, so preview and result
// cannot drift. `size` is the one wallpaper that needs a repeating tile.
//
// The abstract set is mixed from the accent ramps and recolours with it; the
// nature set keeps its own foliage palette — a meadow is green whatever the
// buttons are — and the panel groups them so that choice is visible.
export const WALLPAPERS = [
  { id: "plain", label: "Plain", group: "Backdrop" },
  { id: "aurora", label: "Aurora", group: "Abstract", css: "var(--qd-wp-aurora)" },
  { id: "blueprint", label: "Grid", group: "Abstract", css: "var(--qd-wp-blueprint)" },
  { id: "dots", label: "Dots", group: "Abstract", css: "var(--qd-wp-dots)", size: "var(--qd-wp-dots-size)" },
  { id: "beams", label: "Beams", group: "Abstract", css: "var(--qd-wp-beams)" },
  { id: "rings", label: "Rings", group: "Abstract", css: "var(--qd-wp-rings)" },
  { id: "tartan", label: "Tartan", group: "Abstract", css: "var(--qd-wp-tartan)" },
  { id: "meadow", label: "Meadow", group: "Nature", css: "var(--qd-wp-meadow)" },
  { id: "hills", label: "Hills", group: "Nature", css: "var(--qd-wp-hills)" },
  { id: "sky", label: "Sky", group: "Nature", css: "var(--qd-wp-sky)" },
  { id: "grove", label: "Grove", group: "Nature", css: "var(--qd-wp-grove)" },
];

// Degrees of transparency. `solid` is the default and needs no attribute; the
// other two make every card a window onto the wallpaper instead of a wall.
export const SURFACES = [
  { id: "solid", label: "Solid", hint: "Opaque paper cards" },
  { id: "frosted", label: "Frosted", hint: "A little of the backdrop shows through" },
  { id: "glass", label: "Glass", hint: "Cards turn to frosted glass" },
];

const readTheme = () => {
  const stored = localStorage.getItem(THEME_KEY);
  return APPEARANCES.some((a) => a.id === stored) ? stored : "system";
};

const readAccent = () => {
  const stored = localStorage.getItem(ACCENT_KEY);
  return ACCENTS.some((a) => a.id === stored) ? stored : "emerald";
};

const readMotion = () => {
  const stored = localStorage.getItem(MOTION_KEY);
  return MOTIONS.some((m) => m.id === stored) ? stored : "full";
};

const readWallpaper = () => {
  const stored = localStorage.getItem(WALLPAPER_KEY);
  return WALLPAPERS.some((w) => w.id === stored) ? stored : "plain";
};

const readSurface = () => {
  const stored = localStorage.getItem(SURFACE_KEY);
  return SURFACES.some((s) => s.id === stored) ? stored : "solid";
};

const systemIsDark = () => window.matchMedia(QUERY).matches;

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [setting, setSetting] = useState(readTheme);
  const [accent, setAccent] = useState(readAccent);
  const [motion, setMotion] = useState(readMotion);
  const [wallpaper, setWallpaper] = useState(readWallpaper);
  const [surface, setSurface] = useState(readSurface);
  const [isDark, setIsDark] = useState(() =>
    readTheme() === "system" ? systemIsDark() : readTheme() === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  useEffect(() => {
    const root = document.documentElement;

    if (accent === "emerald") {
      root.removeAttribute("data-accent");
    } else {
      root.setAttribute("data-accent", accent);
    }
  }, [accent]);

  useEffect(() => {
    const root = document.documentElement;

    if (wallpaper === "plain") {
      root.removeAttribute("data-wallpaper");
    } else {
      root.setAttribute("data-wallpaper", wallpaper);
    }
  }, [wallpaper]);

  useEffect(() => {
    const root = document.documentElement;

    if (surface === "solid") {
      root.removeAttribute("data-surface");
    } else {
      root.setAttribute("data-surface", surface);
    }
  }, [surface]);

  useEffect(() => {
    const root = document.documentElement;

    if (motion === "full") {
      root.removeAttribute("data-motion");
    } else {
      root.setAttribute("data-motion", motion);
    }
  }, [motion]);

  // Only meaningful while the setting is "system": the OS can change mid-session.
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = (event) => {
      if (localStorage.getItem(THEME_KEY) === "system") {
        setIsDark(event.matches);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const applyTheme = useCallback((next) => {
    localStorage.setItem(THEME_KEY, next);
    setSetting(next);
    setIsDark(next === "system" ? systemIsDark() : next === "dark");
  }, []);

  const applyAccent = useCallback((next) => {
    localStorage.setItem(ACCENT_KEY, next);
    setAccent(next);
  }, []);

  const applyMotion = useCallback((next) => {
    localStorage.setItem(MOTION_KEY, next);
    setMotion(next);
  }, []);

  const applyWallpaper = useCallback((next) => {
    localStorage.setItem(WALLPAPER_KEY, next);
    setWallpaper(next);
  }, []);

  const applySurface = useCallback((next) => {
    localStorage.setItem(SURFACE_KEY, next);
    setSurface(next);
  }, []);

  const toggle = useCallback(() => applyTheme(isDark ? "light" : "dark"), [applyTheme, isDark]);

  const value = useMemo(
    () => ({
      setting,
      isDark,
      accent,
      motion,
      wallpaper,
      surface,
      setTheme: applyTheme,
      setAccent: applyAccent,
      setMotion: applyMotion,
      setWallpaper: applyWallpaper,
      setSurface: applySurface,
      toggleTheme: toggle,
    }),
    [
      setting,
      isDark,
      accent,
      motion,
      wallpaper,
      surface,
      applyTheme,
      applyAccent,
      applyMotion,
      applyWallpaper,
      applySurface,
      toggle,
    ]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  }

  return context;
}
