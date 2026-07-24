import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

// ============================================
// TYPES - Exported for external components
// ============================================
export type ThemeColors = {
  background: string;
  card: string;
  themeButton: string;
  text: string;
  subtitle: string;
  label: string;
  inputBorder: string;
  buttonBg: string;
  buttonText: string;
  tabsBackground: string;
  tabActive: string;
  tabTextActive: string;
};

// ============================================
// THEME COLORS - Default/Fallback values
// ============================================
const lightColors: ThemeColors = {
  background: "#f8fafc",
  card: "#ffffff",
  themeButton: "#ffffff",
  text: "#0f172a",
  subtitle: "#64748b",
  label: "#64748b",
  inputBorder: "#e2e8f0",
  buttonBg: "#0ea5e9",
  buttonText: "#ffffff",
  tabsBackground: "#f1f5f9",
  tabActive: "#ffffff",
  tabTextActive: "#0ea5e9",
};

const darkColors: ThemeColors = {
  background: "#020617",
  card: "#0f172a",
  themeButton: "#1e293b",
  text: "#ffffff",
  subtitle: "#94a3b8",
  label: "#94a3b8",
  inputBorder: "#1e293b",
  buttonBg: "#0ea5e9",
  buttonText: "#ffffff",
  tabsBackground: "#1e293b",
  tabActive: "#334155",
  tabTextActive: "#38bdf8",
};

// ============================================
// STORAGE KEY
// ============================================
const THEME_STORAGE_KEY = "@drbank_theme_dark_mode";

// ============================================
// CONTEXT TYPE
// ============================================
type ThemeContextType = {
  darkMode: boolean;
  toggleDarkMode: () => void;
  colors: ThemeColors;
  isHydrated: boolean; // Track if AsyncStorage has been loaded
};

// ============================================
// DEFAULT CONTEXT - Always has valid values (no undefined)
// ============================================
const defaultThemeContext: ThemeContextType = {
  darkMode: false,
  toggleDarkMode: () => {},
  colors: lightColors,
  isHydrated: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

// ============================================
// SUBSCRIPTION STORE FOR HYDRATION STATUS
// ============================================
const createHydrationStore = () => {
  let isHydrated = false;
  let listeners: Set<() => void> = new Set();

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot: () => isHydrated,
    getServerSnapshot: () => true, // SSR support
    setHydrated: (value: boolean) => {
      isHydrated = value;
      listeners.forEach((listener) => listener());
    },
  };
};

const hydrationStore = createHydrationStore();

// ============================================
// THEME PROVIDER
// ============================================
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize with default theme (synchronous - no blank screen)
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize colors to prevent recalculation
  const colors = useMemo(
    () => (darkMode ? darkColors : lightColors),
    [darkMode]
  );

  // Memoized toggle function
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const newValue = !prev;
      // Persist to AsyncStorage (fire and forget - don't block)
      AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newValue)).catch(
        (err) => console.warn("Failed to save theme:", err)
      );
      return newValue;
    });
  }, []);

  // Hydrate from AsyncStorage on mount (non-blocking)
  useEffect(() => {
    let cancelled = false;

    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (!cancelled && stored !== null) {
          setDarkMode(JSON.parse(stored));
        }
      } catch (error) {
        console.warn("Failed to load theme:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          hydrationStore.setHydrated(true);
        }
      }
    };

    loadTheme();

    return () => {
      cancelled = true;
    };
  }, []);

  // Use sync external store for hydration status
  const isHydrated = useSyncExternalStore(
    hydrationStore.subscribe,
    hydrationStore.getSnapshot,
    hydrationStore.getServerSnapshot
  );

  // Memoize the context value
  const contextValue = useMemo(
    () => ({
      darkMode,
      toggleDarkMode,
      colors,
      isHydrated,
    }),
    [darkMode, toggleDarkMode, colors, isHydrated]
  );

  return (
    <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
  );
};

// ============================================
// HOOK - Safe to use, always returns valid values
// ============================================
export const useTheme = () => {
  const context = useContext(ThemeContext);

  // Return default context if not provider (fallback for safety)
  if (!context || context === defaultThemeContext) {
    return {
      darkMode: false,
      toggleDarkMode: () => {},
      colors: lightColors,
      isHydrated: true,
    };
  }

  return context;
};

// ============================================
// SELECTOR HOOKS - For optimized re-renders
// ============================================
export const useThemeColors = () => {
  const { colors } = useTheme();
  return colors;
};

export const useIsDarkMode = () => {
  const { darkMode } = useTheme();
  return darkMode;
};

// ============================================
// LOADING CONTEXT - For detecting when screens are ready
// ============================================
type LoadingContextType = {
  isScreenReady: boolean;
  setScreenReady: (ready: boolean) => void;
};

const LoadingContext = createContext<LoadingContextType>({
  isScreenReady: false,
  setScreenReady: () => {},
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isScreenReady, setScreenReady] = useState(false);

  const value = useMemo(
    () => ({ isScreenReady, setScreenReady }),
    [isScreenReady]
  );

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export const useScreenReady = () => useContext(LoadingContext);
