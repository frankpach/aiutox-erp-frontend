/**
 * Tests for ThemeConfigPage component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeConfigPage from "../config.theme";
import * as useThemeConfigHook from "~/hooks/useThemeConfig";
import apiClient from "~/lib/api/client";

// Mock useThemeConfig
vi.mock("~/hooks/useThemeConfig", () => ({
  useThemeConfig: vi.fn(),
}));

// Mock showToast
vi.mock("~/components/common/Toast", () => ({
  showToast: vi.fn(),
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "config.theme.title": "Tema y Apariencia",
        "config.theme.description": "Personaliza los colores, logos y estilos",
        "config.theme.errorLoading": "Error al cargar el tema",
        "config.theme.saveSuccess": "Tema guardado exitosamente",
        "config.theme.errorSaving": "Error al guardar el tema",
        "config.theme.tabColors": "Colores",
        "config.theme.tabLogos": "Logos",
        "config.theme.tabTypography": "Tipografía",
        "config.theme.tabComponents": "Componentes",
        "config.theme.primaryColor": "Color Primario",
        "config.theme.secondaryColor": "Color Secundario",
        "config.theme.accentColor": "Color de Acento",
        "config.theme.backgroundColor": "Fondo",
        "config.theme.surfaceColor": "Superficie",
        "config.theme.errorColor": "Error",
        "config.theme.warningColor": "Advertencia",
        "config.theme.successColor": "Éxito",
        "config.theme.infoColor": "Información",
        "config.theme.textPrimary": "Texto Principal",
        "config.theme.textSecondary": "Texto Secundario",
        "config.theme.textDisabled": "Texto Deshabilitado",
        "config.theme.sidebarBg": "Fondo Sidebar",
        "config.theme.sidebarText": "Texto Sidebar",
        "config.theme.navbarBg": "Fondo Navbar",
        "config.theme.navbarText": "Texto Navbar",
        "config.theme.logoPrimary": "Logo Principal",
        "config.theme.logoWhite": "Logo Blanco",
        "config.theme.logoSmall": "Logo Pequeño",
        "config.theme.favicon": "Favicon",
        "config.theme.fontFamilyPrimary": "Fuente Principal",
        "config.theme.fontFamilySecondary": "Fuente Secundaria",
        "config.theme.fontSizeBase": "Tamaño Base",
        "config.theme.buttonRadius": "Radio de Botones",
        "config.theme.cardRadius": "Radio de Tarjetas",
        "config.theme.inputRadius": "Radio de Inputs",
        "config.common.saveChanges": "Guardar Cambios",
        "config.common.reset": "Restablecer",
        "config.common.saving": "Guardando...",
      };
      return translations[key] || key;
    },
    setLanguage: vi.fn(),
    language: "es",
  }),
}));

// Mock apiClient for useTranslation hook
vi.mock("~/lib/api/client", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("ThemeConfigPage", () => {
  const mockTheme = {
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
    favicon: "/assets/logos/favicon.ico",
    font_family_primary: "Roboto",
    font_family_secondary: "Arial",
    font_size_base: "14px",
    button_radius: "4px",
    card_radius: "8px",
    input_radius: "4px",
  };

  const defaultMockUseThemeConfig = {
    theme: mockTheme,
    themeLight: mockTheme,
    themeDark: mockTheme,
    isLoading: false,
    isUpdating: false,
    error: null,
    updateTheme: vi.fn(),
    updateThemeProperty: vi.fn(),
    refetchTheme: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useThemeConfigHook.useThemeConfig).mockReturnValue(
      defaultMockUseThemeConfig
    );
    // Mock apiClient.get for useTranslation hook (general config query)
    (apiClient.get as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        success: true,
        data: {
          language: "es",
        },
      },
    });
  });

  // Create QueryClient wrapper for tests
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        },
      },
    });

    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    Wrapper.displayName = "QueryClientWrapper";
    return Wrapper;
  };

  const renderWithRouter = () => {
    const router = createMemoryRouter(
      [
        {
          path: "/config/theme",
          element: <ThemeConfigPage />,
        },
      ],
      {
        initialEntries: ["/config/theme"],
      }
    );

    const Wrapper = createWrapper();

    return render(
      <Wrapper>
        <RouterProvider router={router} />
      </Wrapper>
    );
  };

  describe("rendering", () => {
    it("should render theme configuration page", () => {
      renderWithRouter();

      expect(screen.getByText("Tema y Apariencia")).toBeInTheDocument();
      expect(
        screen.getByText(/Personaliza los colores, logos y estilos/i)
      ).toBeInTheDocument();
    });

    it("should show loading state", () => {
      vi.mocked(useThemeConfigHook.useThemeConfig).mockReturnValue({
        ...defaultMockUseThemeConfig,
        isLoading: true,
      });

      renderWithRouter();

      // PageLayout renders loading state with skeleton
      // Check for skeleton elements
      const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should show error message when error occurs", () => {
      const mockError = new Error("Failed to load theme");
      vi.mocked(useThemeConfigHook.useThemeConfig).mockReturnValue({
        ...defaultMockUseThemeConfig,
        error: mockError,
      });

      renderWithRouter();

      // PageLayout renders error state with error message
      const errorMessage = screen.queryByText(/Failed to load theme/i);
      expect(errorMessage).toBeInTheDocument();
    });

    it("should render all tabs", () => {
      renderWithRouter();

      // Use getAllByRole and filter if there are multiple elements
      const colorTabs = screen.getAllByRole("tab", { name: "Colores" });
      expect(colorTabs[0]).toBeInTheDocument();

      const logoTabs = screen.getAllByRole("tab", { name: "Logos" });
      expect(logoTabs[0]).toBeInTheDocument();

      const typographyTabs = screen.getAllByRole("tab", { name: "Tipografía" });
      expect(typographyTabs[0]).toBeInTheDocument();

      const componentTabs = screen.getAllByRole("tab", { name: "Componentes" });
      expect(componentTabs[0]).toBeInTheDocument();
    });

    it("should render action buttons", () => {
      renderWithRouter();

      expect(
        screen.getByRole("button", { name: "Restablecer" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Guardar Cambios" })
      ).toBeInTheDocument();
    });
  });

  describe("Colors tab", () => {
    it("should render color inputs", () => {
      renderWithRouter();

      // Main colors
      expect(screen.getByLabelText("Color Primario")).toBeInTheDocument();
      expect(screen.getByLabelText("Color Secundario")).toBeInTheDocument();
      expect(screen.getByLabelText("Color de Acento")).toBeInTheDocument();
      expect(screen.getByLabelText("Fondo")).toBeInTheDocument();
      expect(screen.getByLabelText("Superficie")).toBeInTheDocument();

      // Status colors
      expect(screen.getByLabelText("Error")).toBeInTheDocument();
      expect(screen.getByLabelText("Advertencia")).toBeInTheDocument();
      expect(screen.getByLabelText("Éxito")).toBeInTheDocument();
      expect(screen.getByLabelText("Información")).toBeInTheDocument();

      // Text colors
      expect(screen.getByLabelText("Texto Principal")).toBeInTheDocument();
      expect(screen.getByLabelText("Texto Secundario")).toBeInTheDocument();
      expect(screen.getByLabelText("Texto Deshabilitado")).toBeInTheDocument();

      // Component colors
      expect(screen.getByLabelText("Fondo Sidebar")).toBeInTheDocument();
      expect(screen.getByLabelText("Texto Sidebar")).toBeInTheDocument();
      expect(screen.getByLabelText("Fondo Navbar")).toBeInTheDocument();
      expect(screen.getByLabelText("Texto Navbar")).toBeInTheDocument();
    });

    it("should display current color values", () => {
      renderWithRouter();

      const primaryColorInput = screen.getByLabelText("Color Primario");
      const textInput = primaryColorInput
        .closest("div")
        ?.querySelector('input[type="text"]') as HTMLInputElement;

      expect(textInput?.value).toBe("#1976D2");
    });

    it("should update color value on change", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      const primaryColorInput = screen.getByLabelText("Color Primario");
      const textInput = primaryColorInput
        .closest("div")
        ?.querySelector('input[type="text"]') as HTMLInputElement;

      await user.clear(textInput);
      await user.type(textInput, "#FF5733");

      expect(textInput.value).toBe("#FF5733");
    });
  });

  describe("Logos tab", () => {
    it("should render logo inputs", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole("tab", { name: "Logos" }));

      expect(screen.getByLabelText("Logo Principal")).toBeInTheDocument();
      expect(screen.getByLabelText("Logo Blanco")).toBeInTheDocument();
      expect(screen.getByLabelText("Logo Pequeño")).toBeInTheDocument();
      expect(screen.getByLabelText("Favicon")).toBeInTheDocument();
    });

    it("should display current logo values", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole("tab", { name: "Logos" }));

      const logoInput = screen.getByLabelText("Logo Principal");
      expect((logoInput as HTMLInputElement).value).toBe("/assets/logos/logo.png");
    });

    it("should update logo value on change", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole("tab", { name: "Logos" }));

      const logoInput = screen.getByLabelText("Logo Principal");
      await user.clear(logoInput);
      await user.type(logoInput, "/assets/logos/custom-logo.png");

      expect((logoInput as HTMLInputElement).value).toBe("/assets/logos/custom-logo.png");
    });
  });

  describe("Typography tab", () => {
    it("should render typography inputs", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole("tab", { name: "Tipografía" }));

      expect(screen.getByLabelText("Fuente Principal")).toBeInTheDocument();
      expect(screen.getByLabelText("Fuente Secundaria")).toBeInTheDocument();
      expect(screen.getByLabelText("Tamaño Base")).toBeInTheDocument();
    });

    it("should display current typography values", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole("tab", { name: "Tipografía" }));

      // Select component displays the value in the SelectValue
      // The label is present, checking the select exists
      const fontSelect = screen.getByLabelText("Fuente Principal");
      expect(fontSelect).toBeInTheDocument();
    });
  });

  describe("Components tab", () => {
    it("should render component style inputs", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await user.click(screen.getByRole("tab", { name: "Componentes" }));

      expect(screen.getByLabelText("Radio de Botones")).toBeInTheDocument();
      expect(screen.getByLabelText("Radio de Tarjetas")).toBeInTheDocument();
      expect(screen.getByLabelText("Radio de Inputs")).toBeInTheDocument();
    });
  });

  describe("save functionality", () => {
    it("should call updateTheme when save button is clicked", async () => {
      const user = userEvent.setup();
      const mockUpdateTheme = vi.fn();

      vi.mocked(useThemeConfigHook.useThemeConfig).mockReturnValue({
        ...defaultMockUseThemeConfig,
        updateTheme: mockUpdateTheme,
      });

      renderWithRouter();

      // Change a color
      const primaryColorInput = screen.getByLabelText("Color Primario");
      const textInput = primaryColorInput
        .closest("div")
        ?.querySelector('input[type="text"]') as HTMLInputElement;

      await user.clear(textInput);
      await user.type(textInput, "#FF5733");

      // Click save
      const saveButton = screen.getByRole("button", { name: "Guardar Cambios" });
      await user.click(saveButton);

      expect(mockUpdateTheme).toHaveBeenCalled();
    });

    it("should disable save button while updating", () => {
      vi.mocked(useThemeConfigHook.useThemeConfig).mockReturnValue({
        ...defaultMockUseThemeConfig,
        isUpdating: true,
      });

      renderWithRouter();

      // Just verify the save button is disabled when updating
      const saveButton = screen.getByRole("button", { name: "Guardar Cambios" });
      expect(saveButton).toBeDisabled();
    });
  });

  describe("reset functionality", () => {
    it("should reset changes when reset button is clicked", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      // Change a color
      const primaryColorInput = screen.getByLabelText("Color Primario");
      const textInput = primaryColorInput
        .closest("div")
        ?.querySelector('input[type="text"]') as HTMLInputElement;

      await user.clear(textInput);
      await user.type(textInput, "#FF5733");

      // Click reset
      const resetButton = screen.getByRole("button", { name: "Restablecer" });
      await user.click(resetButton);

      // Value should be reset to original
      await waitFor(() => {
        expect(textInput.value).toBe("#1976D2");
      });
    });

    it("should disable reset button while updating", () => {
      vi.mocked(useThemeConfigHook.useThemeConfig).mockReturnValue({
        ...defaultMockUseThemeConfig,
        isUpdating: true,
      });

      renderWithRouter();

      const resetButton = screen.getByRole("button", { name: "Restablecer" });
      expect(resetButton).toBeDisabled();
    });
  });

  describe("default values", () => {
    it("should use default values when theme is empty", () => {
      vi.mocked(useThemeConfigHook.useThemeConfig).mockReturnValue({
        ...defaultMockUseThemeConfig,
        theme: {},
      });

      renderWithRouter();

      const primaryColorInput = screen.getByLabelText("Color Primario");
      const textInput = primaryColorInput
        .closest("div")
        ?.querySelector('input[type="text"]') as HTMLInputElement;

      // Should show default value from component (not from mock)
      expect(textInput?.value).toBe("#1976D2");
    });
  });

  describe("tab navigation", () => {
    it("should switch between tabs", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      // Start on Colors tab (default)
      expect(screen.getByLabelText("Color Primario")).toBeInTheDocument();

      // Switch to Logos tab
      await user.click(screen.getByRole("tab", { name: "Logos" }));
      expect(screen.getByLabelText("Logo Principal")).toBeInTheDocument();
      expect(screen.queryByLabelText("Color Primario")).not.toBeInTheDocument();

      // Switch to Typography tab
      await user.click(screen.getByRole("tab", { name: "Tipografía" }));
      expect(screen.getByLabelText("Fuente Principal")).toBeInTheDocument();
      expect(screen.queryByLabelText("Logo Principal")).not.toBeInTheDocument();

      // Switch to Components tab
      await user.click(screen.getByRole("tab", { name: "Componentes" }));
      expect(screen.getByLabelText("Radio de Botones")).toBeInTheDocument();
      expect(screen.queryByLabelText("Fuente Principal")).not.toBeInTheDocument();
    });
  });
});




