"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    // Run once on mount to initialize theme from localStorage or prefers-color-scheme
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored) {
        setTheme(stored);
        if (stored === "dark") {
          //document.documentElement.setAttribute("data-theme", "dark");
          document.body.setAttribute("data-theme", "dark");
        } else {
          //document.documentElement.setAttribute("data-theme", "light");
          document.body.setAttribute("data-theme", "light");
        }
      } else {
        // Default to system preference if available
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
        const initTheme: Theme = prefersDark ? "dark" : "light";
        setTheme(initTheme);
        if (initTheme === "dark") {
          //document.documentElement.setAttribute("data-theme", "dark");
          document.body.setAttribute("data-theme", "dark");
        } else {
          //document.documentElement.setAttribute("data-theme", "light");
          document.body.setAttribute("data-theme", "light");
        }
      }
    }
  }, []);

  function toggleTheme() {
    if (theme === "dark") {
      //document.documentElement.setAttribute("data-theme", "light");
      document.body.setAttribute("data-theme", "light");
      setTheme("light");
      if (typeof window !== "undefined") localStorage.setItem("theme", "light");
    } else {
      //document.documentElement.setAttribute("data-theme", "dark");
      document.body.setAttribute("data-theme", "dark");
      setTheme("dark");
      if (typeof window !== "undefined") localStorage.setItem("theme", "dark");
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
