import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const THEMES = ["dark", "light", "high-contrast"];

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("mathmate_theme") || "dark";
  });

  useEffect(() => {
    localStorage.setItem("mathmate_theme", theme);
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("dark", "light", "high-contrast");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(t => {
      const idx = THEMES.indexOf(t);
      return THEMES[(idx + 1) % THEMES.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};
