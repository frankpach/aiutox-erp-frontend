import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getThemeConfig,
  setThemeConfig,
  updateThemeConfigProperty,
} from "~/features/config/api/config.api";

interface ThemeColors {
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

/**
 * Apply theme configuration to CSS variables
 */
const coerceThemeConfig = (config: Record<string, unknown>): Record<string, string> => {
  const result: Record<string, string> = {};
  Object.entries(config).forEach(([key, value]) => {
    if (typeof value === "string") {
      result[key] = value;
    }
  });
  return result;
};

const applyThemeToCSS = (config: Record<string, unknown>) => {
  const root = document.documentElement;
  const stringConfig = coerceThemeConfig(config);

  // Map config keys to CSS variable names
  const cssVarMap: Record<string, string> = {
    primary_color: "--color-primary",
    secondary_color: "--color-secondary",
    accent_color: "--color-accent",
    background_color: "--color-background",
    surface_color: "--color-surface",
    error_color: "--color-error",
    warning_color: "--color-warning",
    success_color: "--color-success",
    info_color: "--color-info",
    text_primary: "--color-text-primary",
    text_secondary: "--color-text-secondary",
    text_disabled: "--color-text-disabled",
    sidebar_bg: "--sidebar-bg",
    sidebar_text: "--sidebar-text",
    navbar_bg: "--navbar-bg",
    navbar_text: "--navbar-text",
    font_family_primary: "--font-family-primary",
    font_family_secondary: "--font-family-secondary",
    font_family_monospace: "--font-family-monospace",
    font_size_base: "--font-size-base",
    font_size_small: "--font-size-small",
    font_size_large: "--font-size-large",
    font_size_heading: "--font-size-heading",
    button_radius: "--button-radius",
    card_radius: "--card-radius",
    input_radius: "--input-radius",
    shadow_elevation_1: "--shadow-elevation-1",
    shadow_elevation_2: "--shadow-elevation-2",
    shadow_elevation_3: "--shadow-elevation-3",
  };

  // Apply each config value to corresponding CSS variable
  Object.entries(stringConfig).forEach(([key, value]) => {
    const cssVar = cssVarMap[key];
    if (cssVar && value) {
      root.style.setProperty(cssVar, value);
    }
  });

  // Update favicon if provided
  if (stringConfig.favicon) {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = stringConfig.favicon;
    }
  }
};

/**
 * Hook to fetch and apply theme configuration
 */
export function useThemeConfig() {
  const queryClient = useQueryClient();

  // Fetch theme configuration
  const {
    data: themeData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["theme-config"],
    queryFn: async () => {
      return await getThemeConfig();
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: 2,
  });

  // Apply theme to CSS when data changes
  useEffect(() => {
    if (themeData?.config) {
      applyThemeToCSS(themeData.config);
    }
  }, [themeData]);

  // Mutation to update theme
  const updateThemeMutation = useMutation({
    mutationFn: async (newConfig: ThemeColors) => {
      return await setThemeConfig(newConfig as Record<string, unknown>);
    },
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(["theme-config"], data);
      // Apply new theme immediately
      if (data.config) {
        applyThemeToCSS(data.config);
      }
      // Refetch to ensure we have the latest data from backend
      refetch();
    },
  });

  // Mutation to update single theme property
  const updateThemePropertyMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return await updateThemeConfigProperty(key, value);
    },
    onSuccess: () => {
      // Refetch entire theme to get updated config
      refetch();
    },
  });

  return {
    theme: coerceThemeConfig(themeData?.config || {}),
    isLoading,
    error,
    updateTheme: updateThemeMutation.mutate,
    updateThemeProperty: updateThemePropertyMutation.mutate,
    isUpdating: updateThemeMutation.isPending || updateThemePropertyMutation.isPending,
    refetchTheme: refetch,
  };
}








