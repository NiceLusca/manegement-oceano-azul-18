
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
      
      // Add custom CSS variables for dark mode
      if (systemTheme === "dark") {
        applyDarkTheme(root);
      } else {
        applyLightTheme(root);
      }
      return;
    }

    root.classList.add(theme);
    
    // Add custom CSS variables for dark mode
    if (theme === "dark") {
      applyDarkTheme(root);
    } else {
      applyLightTheme(root);
    }
  }, [theme]);

  const applyDarkTheme = (root: HTMLElement) => {
    // Improved dark mode color palette
    root.style.setProperty("--background", "240 10% 3.9%");
    root.style.setProperty("--foreground", "0 0% 98%");
    root.style.setProperty("--card", "240 10% 3.9%");
    root.style.setProperty("--card-foreground", "0 0% 98%");
    root.style.setProperty("--popover", "240 10% 3.9%");
    root.style.setProperty("--popover-foreground", "0 0% 98%");
    root.style.setProperty("--primary", "252 59% 65%");  // Improved primary color
    root.style.setProperty("--primary-foreground", "0 0% 98%");
    root.style.setProperty("--secondary", "240 5% 18%"); // Slightly lighter secondary
    root.style.setProperty("--secondary-foreground", "0 0% 98%");
    root.style.setProperty("--muted", "240 5% 16%");     // Improved muted background
    root.style.setProperty("--muted-foreground", "240 5% 64.9%");
    root.style.setProperty("--accent", "240 4.8% 20%");  // Improved accent
    root.style.setProperty("--accent-foreground", "0 0% 98%");
    root.style.setProperty("--destructive", "0 62.8% 40.6%"); // More visible destructive
    root.style.setProperty("--destructive-foreground", "0 0% 98%");
    root.style.setProperty("--border", "240 5% 15.9%");  // More visible border
    root.style.setProperty("--input", "240 5% 15.9%");
    root.style.setProperty("--ring", "252 59% 65%");     // Match primary
  };

  const applyLightTheme = (root: HTMLElement) => {
    // Reset to default light theme values
    root.style.removeProperty("--background");
    root.style.removeProperty("--foreground");
    root.style.removeProperty("--card");
    root.style.removeProperty("--card-foreground");
    root.style.removeProperty("--popover");
    root.style.removeProperty("--popover-foreground");
    root.style.removeProperty("--primary");
    root.style.removeProperty("--primary-foreground");
    root.style.removeProperty("--secondary");
    root.style.removeProperty("--secondary-foreground");
    root.style.removeProperty("--muted");
    root.style.removeProperty("--muted-foreground");
    root.style.removeProperty("--accent");
    root.style.removeProperty("--accent-foreground");
    root.style.removeProperty("--destructive");
    root.style.removeProperty("--destructive-foreground");
    root.style.removeProperty("--border");
    root.style.removeProperty("--input");
    root.style.removeProperty("--ring");
  };

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
