"use client";

import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      aria-pressed={theme === "dark"}
      className="cursor-pointer"
      onClick={() => toggleTheme()}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
