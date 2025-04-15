
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
      
      // Aplicar variáveis CSS personalizadas
      if (systemTheme === "dark") {
        applyDarkTheme(root);
      } else {
        applyLightTheme(root);
      }
      return;
    }

    root.classList.add(theme);
    
    // Aplicar variáveis CSS personalizadas
    if (theme === "dark") {
      applyDarkTheme(root);
    } else {
      applyLightTheme(root);
    }
  }, [theme]);

  const applyDarkTheme = (root: HTMLElement) => {
    // Tema escuro com fundo preto, elementos azul escuro e texto branco
    root.style.setProperty("--background", "0 0% 0%"); // Fundo preto puro
    root.style.setProperty("--foreground", "0 0% 100%"); // Texto branco puro
    
    root.style.setProperty("--card", "0 0% 0%"); // Cards com fundo preto
    root.style.setProperty("--card-foreground", "0 0% 100%"); // Texto branco nos cards
    
    root.style.setProperty("--popover", "0 0% 0%"); // Popovers com fundo preto
    root.style.setProperty("--popover-foreground", "0 0% 100%"); // Texto branco nos popovers
    
    root.style.setProperty("--primary", "210 100% 30%"); // Azul escuro para elementos primários
    root.style.setProperty("--primary-foreground", "0 0% 100%"); // Texto branco sobre elementos primários
    
    root.style.setProperty("--secondary", "210 100% 15%"); // Tons mais escuros para elementos secundários
    root.style.setProperty("--secondary-foreground", "0 0% 100%"); // Texto branco sobre elementos secundários
    
    root.style.setProperty("--muted", "0 0% 10%"); // Elementos mutados em tom de cinza muito escuro
    root.style.setProperty("--muted-foreground", "0 0% 70%"); // Texto cinza claro para elementos mutados
    
    root.style.setProperty("--accent", "210 100% 20%"); // Azul escuro para elementos de destaque
    root.style.setProperty("--accent-foreground", "0 0% 100%"); // Texto branco para elementos de destaque
    
    root.style.setProperty("--destructive", "0 70% 40%"); // Vermelho mais escuro para ações destrutivas
    root.style.setProperty("--destructive-foreground", "0 0% 100%"); // Texto branco sobre botões destrutivos
    
    root.style.setProperty("--border", "210 100% 15%"); // Bordas em azul escuro
    root.style.setProperty("--input", "0 0% 10%"); // Campos de entrada com fundo preto
    root.style.setProperty("--ring", "210 100% 30%"); // Destaque de foco em azul escuro
    
    // Atualizar variáveis específicas da barra lateral também
    root.style.setProperty("--sidebar-background", "0 0% 5%"); // Sidebar ligeiramente mais clara que o fundo principal
    root.style.setProperty("--sidebar-foreground", "0 0% 100%");
    root.style.setProperty("--sidebar-primary", "210 100% 30%");
    root.style.setProperty("--sidebar-primary-foreground", "0 0% 100%");
    root.style.setProperty("--sidebar-accent", "210 100% 15%");
    root.style.setProperty("--sidebar-accent-foreground", "0 0% 100%");
    root.style.setProperty("--sidebar-border", "210 100% 15%");
    root.style.setProperty("--sidebar-ring", "210 100% 30%");
  };

  const applyLightTheme = (root: HTMLElement) => {
    // Resetar para valores padrão do tema claro
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
    root.style.removeProperty("--sidebar-background");
    root.style.removeProperty("--sidebar-foreground");
    root.style.removeProperty("--sidebar-primary");
    root.style.removeProperty("--sidebar-primary-foreground");
    root.style.removeProperty("--sidebar-accent");
    root.style.removeProperty("--sidebar-accent-foreground");
    root.style.removeProperty("--sidebar-border");
    root.style.removeProperty("--sidebar-ring");
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
