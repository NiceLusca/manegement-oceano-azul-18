
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "app-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      
      // Adiciona classes customizadas para modo escuro
      if (systemTheme === "dark") {
        root.style.setProperty("--background", "240 10% 3.9%");
        root.style.setProperty("--card", "240 10% 3.9%");
        root.style.setProperty("--popover", "240 10% 3.9%");
        root.style.setProperty("--primary", "0 0% 98%");
        root.style.setProperty("--secondary", "240 3.7% 15.9%");
      }
      return;
    }

    root.classList.add(theme);
    
    // Adiciona classes customizadas para modo escuro
    if (theme === "dark") {
      root.style.setProperty("--background", "240 10% 3.9%");
      root.style.setProperty("--card", "240 10% 3.9%");
      root.style.setProperty("--popover", "240 10% 3.9%");
      root.style.setProperty("--primary", "0 0% 98%");
      root.style.setProperty("--secondary", "240 3.7% 15.9%");
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
