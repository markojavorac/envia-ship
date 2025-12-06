"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { theme } from "@/lib/themes";
import { Theme } from "@/lib/types";

interface ThemeContextValue {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Apply theme colors as CSS variables to the root element
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", theme.colors.primary);
    root.style.setProperty("--theme-secondary", theme.colors.secondary);
    root.style.setProperty("--theme-background", theme.colors.background);
    root.style.setProperty("--theme-text", theme.colors.text);
  }, []);

  return <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
