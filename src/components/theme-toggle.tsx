"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const subscribe = (callback: () => void) => {
  window.addEventListener("sharekit-theme-change", callback);
  return () => window.removeEventListener("sharekit-theme-change", callback);
};
const getTheme = (): Theme => document.documentElement.dataset.theme === "dark" ? "dark" : "light";
const getServerTheme = (): Theme => "light";
const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.dispatchEvent(new Event("sharekit-theme-change"));
};

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("sharekit-theme");
    const nextTheme = storedTheme === "dark" || storedTheme === "light"
      ? storedTheme
      : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem("sharekit-theme", nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
