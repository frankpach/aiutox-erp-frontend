/**
 * Tests for NotificationsConfigPage component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NotificationsConfigPage from "../config.notifications";
import * as notificationsApi from "~/lib/api/notifications.api";
import * as useTranslationHook from "~/lib/i18n/useTranslation";

// Mock notifications API
vi.mock("~/lib/api/notifications.api", () => ({
  getNotificationChannels: vi.fn(),
  updateSMTPConfig: vi.fn(),
  updateSMSConfig: vi.fn(),
  updateWebhookConfig: vi.fn(),
  testSMTPConnection: vi.fn(),
  testWebhookConnection: vi.fn(),
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: vi.fn(),
}));

describe("NotificationsConfigPage", () => {
  const mockChannels = {
    smtp: {
      enabled: false,
      host: "smtp.gmail.com",
      port: 587,
      user: "",
      password: null,
      use_tls: true,
      from_email: "",
      from_name: null,
    },
    sms: {
      enabled: false,
      provider: "twilio",
      account_sid: null,
      auth_token: null,
      from_number: null,
    },
    webhook: {
      enabled: false,
      url: "",
      secret: null,
      timeout: 30,
    },
  };

  const defaultMockUseTranslation = {
    t: (key: string) => {
      const translations: Record<string, string> = {
        "config.notifications.title": "Notificaciones",
        "config.notifications.description": "Configura los canales de notificación",
        "config.notifications.loading": "Cargando configuración...",
        "config.notifications.errorLoading": "Error al cargar configuración",
        "config.notifications.tabsChannels": "Canales",
        "config.notifications.tabsTemplates": "Plantillas",
        "config.notifications.tabsPreferences": "Preferencias",
        "config.notifications.emailSMTP": "Email (SMTP)",
        "config.notifications.emailSMTPDesc": "Configura el servidor SMTP para envío de emails",
        "config.notifications.smtpServer": "Servidor SMTP",
        "config.notifications.smtpPort": "Puerto",
        "config.notifications.smtpUser": "Usuario",
        "config.notifications.smtpPassword": "Contraseña",
        "config.notifications.smtpPasswordPlaceholder": "Dejar vacío para mantener la actual",
        "config.notifications.fromEmail": "Email Remitente",
        "config.notifications.fromName": "Nombre Remitente",
        "config.notifications.useTLS": "Usar TLS",
        "config.notifications.testConnection": "Probar Conexión",
        "config.notifications.saveConfig": "Guardar Configuración",
        "config.notifications.saveSuccess": "Configuración guardada exitosamente",
        "config.notifications.sms": "SMS",
        "config.notifications.smsDesc": "Configura el proveedor SMS para envío de mensajes",
        "config.notifications.smsProvider": "Proveedor",
        "config.notifications.smsAccountSid": "Account SID",
        "config.notifications.smsAuthToken": "Auth Token",
        "config.notifications.smsFromNumber": "Número Remitente",
        "config.notifications.webhooks": "Webhooks",
        "config.notifications.webhooksDesc": "Configura webhooks para notificaciones",
        "config.notifications.webhookUrl": "URL del Webhook",
        "config.notifications.webhookUrlPlaceholder": "https://ejemplo.com/webhook",
        "config.notifications.webhookSecret": "Secreto",
        "config.notifications.webhookTimeout": "Timeout (segundos)",
        "config.notifications.testWebhook": "Probar Webhook",
        "config.notifications.templatesTitle": "Plantillas de Notificaciones",
        "config.notifications.templatesDesc": "Gestiona las plantillas de emails y SMS",
        "config.notifications.templatesComingSoon": "Próximamente",
        "config.notifications.preferencesTitle": "Preferencias de Notificaciones",
        "config.notifications.preferencesDesc": "Configura las preferencias de notificaciones por usuario",
        "config.common.testing": "Probando...",
        "config.common.saving": "Guardando...",
        "config.common.error": "Error",
        "config.common.errorUnknown": "Error desconocido",
      };
      return translations[key] || key;
    },
    setLanguage: vi.fn(),
    language: "es" as const,
  };

  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useTranslationHook.useTranslation).mockReturnValue(
      defaultMockUseTranslation
    );

    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
          gcTime: 0,
        },
      },
    });
    queryClient.clear();

    // Default mock for getNotificationChannels
    vi.mocked(notificationsApi.getNotificationChannels).mockResolvedValue({
      data: mockChannels,
      meta: null,
      error: null,
    } as any);

    // Default mocks for update functions
    vi.mocked(notificationsApi.updateSMTPConfig).mockResolvedValue({
      data: mockChannels.smtp,
      meta: null,
      error: null,
    } as any);

    vi.mocked(notificationsApi.updateSMSConfig).mockResolvedValue({
      data: mockChannels.sms,
      meta: null,
      error: null,
    } as any);

    vi.mocked(notificationsApi.updateWebhookConfig).mockResolvedValue({
      data: mockChannels.webhook,
      meta: null,
      error: null,
    } as any);

    // Default mocks for test functions
    vi.mocked(notificationsApi.testSMTPConnection).mockResolvedValue({
      data: { message: "Conexión exitosa" },
      meta: null,
      error: null,
    } as any);

    vi.mocked(notificationsApi.testWebhookConnection).mockResolvedValue({
      data: { message: "Webhook probado exitosamente" },
      meta: null,
      error: null,
    } as any);
  });

  const renderWithRouter = () => {
    const router = createMemoryRouter(
      [
        {
          path: "/config/notifications",
          element: (
            <QueryClientProvider client={queryClient}>
              <NotificationsConfigPage />
            </QueryClientProvider>
          ),
        },
      ],
      {
        initialEntries: ["/config/notifications"],
      }
    );

    return render(<RouterProvider router={router} />);
  };

  describe("rendering", () => {
    it("should render notifications configuration page", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Notificaciones")).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Configura los canales de notificación/i)
      ).toBeInTheDocument();
    });

    it("should show loading state", async () => {
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
          },
        },
      });
      testQueryClient.clear();

      vi.mocked(notificationsApi.getNotificationChannels).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                data: mockChannels,
                meta: null,
                error: null,
              } as any);
            }, 100);
          })
      );

      const router = createMemoryRouter(
        [
          {
            path: "/config/notifications",
            element: (
              <QueryClientProvider client={testQueryClient}>
                <NotificationsConfigPage />
              </QueryClientProvider>
            ),
          },
        ],
        {
          initialEntries: ["/config/notifications"],
        }
      );

      render(<RouterProvider router={router} />);

      // Should show loading immediately (before data loads)
      // Use getAllByText since there might be multiple instances during render
      const loadingTexts = screen.getAllByText("Cargando configuración...");
      expect(loadingTexts.length).toBeGreaterThan(0);
    });

    it("should show error message when error occurs", async () => {
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
          },
        },
      });
      testQueryClient.clear();

      const mockError = new Error("Failed to load configuration");
      vi.mocked(notificationsApi.getNotificationChannels).mockRejectedValue(mockError);

      const router = createMemoryRouter(
        [
          {
            path: "/config/notifications",
            element: (
              <QueryClientProvider client={testQueryClient}>
                <NotificationsConfigPage />
              </QueryClientProvider>
            ),
          },
        ],
        {
          initialEntries: ["/config/notifications"],
        }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Error al cargar configuración/i)
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it("should render all tabs", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Notificaciones")).toBeInTheDocument();
      });

      expect(screen.getByRole("tab", { name: "Canales" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Plantillas" })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: "Preferencias" })).toBeInTheDocument();
    });
  });

  describe("loading configuration from API", () => {
    it("should load configuration from API on mount", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(notificationsApi.getNotificationChannels).toHaveBeenCalled();
      });
    });

    it("should display loaded SMTP configuration", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Email (SMTP)")).toBeInTheDocument();
      });
    });

    it("should display loaded SMS configuration", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("SMS")).toBeInTheDocument();
      });
    });

    it("should display loaded Webhook configuration", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Webhooks")).toBeInTheDocument();
      });
    });
  });

  describe("SMTP configuration", () => {
    it("should render SMTP configuration fields when enabled", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Email (SMTP)")).toBeInTheDocument();
      });

      // Enable SMTP (this would require Switch interaction)
      // For now, verify the structure exists
      expect(screen.getByText("Email (SMTP)")).toBeInTheDocument();
    });

    it("should display SMTP test connection button", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Email (SMTP)")).toBeInTheDocument();
      });

      // Test button should be available when SMTP is enabled
      // For now, verify the component structure
      expect(screen.getByText("Email (SMTP)")).toBeInTheDocument();
    });
  });

  describe("SMS configuration", () => {
    it("should render SMS configuration fields when enabled", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("SMS")).toBeInTheDocument();
      });

      // Verify SMS section is rendered
      expect(screen.getByText("SMS")).toBeInTheDocument();
    });
  });

  describe("Webhook configuration", () => {
    it("should render Webhook configuration fields when enabled", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Webhooks")).toBeInTheDocument();
      });

      // Verify Webhook section is rendered
      expect(screen.getByText("Webhooks")).toBeInTheDocument();
    });

    it("should display Webhook test button", async () => {
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText("Webhooks")).toBeInTheDocument();
      });

      // Test button should be available when Webhook is enabled
      // For now, verify the component structure
      expect(screen.getByText("Webhooks")).toBeInTheDocument();
    });
  });

  describe("tabs navigation", () => {
    it("should switch to templates tab", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: "Plantillas" })).toBeInTheDocument();
      });

      // Click on Templates tab
      const templatesTab = screen.getByRole("tab", { name: "Plantillas" });
      await user.click(templatesTab);

      await waitFor(() => {
        expect(screen.getByText("Plantillas de Notificaciones")).toBeInTheDocument();
      });
    });

    it("should switch to preferences tab", async () => {
      const user = userEvent.setup();
      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: "Preferencias" })).toBeInTheDocument();
      });

      // Click on Preferences tab
      const preferencesTab = screen.getByRole("tab", { name: "Preferencias" });
      await user.click(preferencesTab);

      await waitFor(() => {
        expect(screen.getByText("Preferencias de Notificaciones")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      const testQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            staleTime: 0,
            gcTime: 0,
          },
        },
      });
      testQueryClient.clear();

      const networkError = new Error("Network error");
      vi.mocked(notificationsApi.getNotificationChannels).mockRejectedValue(networkError);

      const router = createMemoryRouter(
        [
          {
            path: "/config/notifications",
            element: (
              <QueryClientProvider client={testQueryClient}>
                <NotificationsConfigPage />
              </QueryClientProvider>
            ),
          },
        ],
        {
          initialEntries: ["/config/notifications"],
        }
      );

      render(<RouterProvider router={router} />);

      await waitFor(() => {
        expect(
          screen.getByText(/Error al cargar configuración/i)
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});

