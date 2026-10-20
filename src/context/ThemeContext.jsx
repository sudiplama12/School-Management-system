import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Three settings — light, dark, or follow the operating system — persisted in
// localStorage. The class itself is applied to <html> so every Tailwind `dark:`
// utility and the palette overrides in index.css activate together; the
// pre-paint script in index.html does the same thing before React mounts so a
// dark-mode visitor never sees a white flash.

const STORAGE_KEY = "lms_theme";
const QUERY = "(prefers-color-scheme: dark)";

const read = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return ["light", "dark", "system"].includes(stored) ? stored : "system";
};

const systemIsDark = () => window.matchMedia(QUERY).matches;

export const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [setting, setSetting] = useState(read);
  const [isDark, setIsDark] = useState(() =>
    read() === "system" ? systemIsDark() : read() === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  // Only meaningful while the setting is "system": the OS can change mid-session.
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const onChange = (event) => {
      if (localStorage.getItem(STORAGE_KEY) === "system") {
        setIsDark(event.matches);
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const apply = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, next);
    setSetting(next);
    setIsDark(next === "system" ? systemIsDark() : next === "dark");
  }, []);

  const toggle = useCallback(
    () => apply(isDark ? "light" : "dark"),
    [apply, isDark]
  );

  const value = useMemo(
    () => ({ setting, isDark, setTheme: apply, toggleTheme: toggle }),
    [setting, isDark, apply, toggle]
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
