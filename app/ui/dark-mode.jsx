"use client";

import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";

export default function DarkMode() {
  // Check if user has dark mode enabled in localStorage
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  // Apply dark mode class to <html> tag
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="mb-4 p-2 rounded-full bg-black dark:bg-white"
    >
      {darkMode ? (
        <MoonIcon className="w-6" />
      ) : (
        <SunIcon className="w-6 text-white" />
      )}
    </button>
  );
}
