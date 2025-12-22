import { create } from "zustand";

interface ThemeConfig {
  // Main colors
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  background_color?: string;
  surface_color?: string;
  // Status colors
  error_color?: string;
  warning_color?: string;
  success_color?: string;
  info_color?: string;
  // Text colors
  text_primary?: string;
  text_secondary?: string;
  text_disabled?: string;
  // Component colors
  sidebar_bg?: string;
  sidebar_text?: string;
  navbar_bg?: string;
  navbar_text?: string;
  // Logos
  logo_primary?: string;
  logo_white?: string;
  logo_small?: string;
  logo_name?: string;
  favicon?: string;
  login_background?: string;
  // Typography
  font_family_primary?: string;
  font_family_secondary?: string;
  font_family_monospace?: string;
  font_size_base?: string;
  font_size_small?: string;
  font_size_large?: string;
  font_size_heading?: string;
  // Component styles
  button_radius?: string;
  card_radius?: string;
  input_radius?: string;
  // Shadows
  shadow_elevation_1?: string;
  shadow_elevation_2?: string;
  shadow_elevation_3?: string;
}

interface ThemeState {
  theme: ThemeConfig | null;
  isLoading: boolean;
  error: string | null;
  setTheme: (theme: ThemeConfig) => void;
  updateThemeProperty: (key: string, value: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetTheme: () => void;
}

const defaultTheme: ThemeConfig = {
  primary_color: "#1976D2",
  secondary_color: "#DC004E",
  accent_color: "#FFC107",
  background_color: "#FFFFFF",
  surface_color: "#F5F5F5",
  error_color: "#F44336",
  warning_color: "#FF9800",
  success_color: "#4CAF50",
  info_color: "#2196F3",
  text_primary: "#212121",
  text_secondary: "#757575",
  text_disabled: "#BDBDBD",
  sidebar_bg: "#2C3E50",
  sidebar_text: "#ECF0F1",
  navbar_bg: "#34495E",
  navbar_text: "#FFFFFF",
  logo_primary: "/assets/logos/logo.png",
  logo_white: "/assets/logos/logo-white.png",
  logo_small: "/assets/logos/logo-sm.png",
  font_family_primary: "Roboto",
  font_family_secondary: "Arial",
  font_size_base: "14px",
  button_radius: "4px",
  card_radius: "8px",
  input_radius: "4px",
};

export const useThemeStore = create<ThemeState>((set) => ({
  theme: null,
  isLoading: false,
  error: null,

  setTheme: (theme) => {
    set({ theme, error: null });
  },

  updateThemeProperty: (key, value) => {
    set((state) => ({
      theme: state.theme
        ? {
            ...state.theme,
            [key]: value,
          }
        : { [key]: value },
    }));
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  resetTheme: () => {
    set({ theme: defaultTheme, error: null });
  },
}));

