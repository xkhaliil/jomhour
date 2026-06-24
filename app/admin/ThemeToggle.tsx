"use client";

import { useState } from "react";

const THEME_KEY = "jomhour-theme";

/** Shares the same storage key as the fan live view's toggle, so a
 * preference set in one surface is reflected in the other. */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  );

  function toggle() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(THEME_KEY, next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      // Initial value depends on the pre-hydration script reading
      // localStorage, which the server can't see — harmless one-time
      // mismatch, corrected the instant React hydrates.
      suppressHydrationWarning
      className="rounded-full border border-black/10 px-2.5 py-1 text-xs font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
    >
      {theme === "light" ? "🌙" : "☀️"}
    </button>
  );
}
