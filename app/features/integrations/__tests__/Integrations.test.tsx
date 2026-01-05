/**
 * Integrations tests
 * Basic unit tests for Integrations module
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { 
  useIntegrations,
  useIntegration,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useActivateIntegration,
  useDeactivateIntegration,
  useTestIntegration,
  useIntegrationStats,
  useIntegrationLogs,
  useIntegrationWebhooks,
  useCreateIntegrationWebhook,
  useUpdateIntegrationWebhook,
  useDeleteIntegrationWebhook,
  useIntegrationEvents,
  useIntegrationHealth,
  useIntegrationCredentials,
  useUpdateIntegrationCredentials,
  useIntegrationConfig,
  useUpdateIntegrationConfig,
  useAvailableIntegrationTypes,
  useSyncIntegration
} from "~/features/integrations/hooks/useIntegrations";
import type { Integration, IntegrationStats, IntegrationWebhook, IntegrationLog, IntegrationEvent, IntegrationHealth, IntegrationCredentials, IntegrationConfig } from "~/features/integrations/types/integrations.types";

// Mock api client
const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

vi.mock("~/lib/api/client", () => ({
  default: mockApiClient,
}));

// Mock data
const mockIntegration: Integration = {
  id: "integration-123",
  tenant_id: "tenant-123",
  name: "Stripe Integration",
  type: "stripe",
  status: "active",
  config: {
    api_key: "sk_test_123",
    webhook_secret: "whsec_123",
  },
  last_sync_at: "2025-01-01T00:00:00Z",
  error_message: null,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockIntegrationStats: IntegrationStats = {
  total_integrations: 10,
  active_integrations: 7,
  inactive_integrations: 2,
  error_integrations: 1,
  pending_integrations: 0,
  most_used_types: [
    { type: "stripe", count: 4 },
    { type: "twilio", count: 3 },
    { type: "slack", count: 2 },
  ],
  recent_activity: [
    {
      integration_id: "integration-123",
      integration_name: "Stripe Integration",
      action: "activated",
      timestamp: "2025-01-01T00:00:00Z",
    },
  ],
};

const mockIntegrationWebhook: IntegrationWebhook = {
  id: "webhook-123",
  integration_id: "integration-123",
  event_type: "payment.completed",
  url: "https://example.com/webhook",
  secret: "webhook-secret",
  active: true,
  last_triggered: "2025-01-01T00:00:00Z",
  trigger_count: 25,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockIntegrationLog: IntegrationLog = {
  id: "log-123",
  integration_id: "integration-123",
  level: "info",
  message: "Integration test successful",
  details: { response_time: 150 },
  timestamp: "2025-01-01T00:00:00Z",
  user_id: "user-123",
};

const mockIntegrationEvent: IntegrationEvent = {
  id: "event-123",
  integration_id: "integration-123",
  event_type: "payment.completed",
  data: { payment_id: "pay_123", amount: 1000 },
  processed: true,
  processed_at: "2025-01-01T00:00:00Z",
  error_message: null,
  created_at: "2025-01-01T00:00:00Z",
};

const mockIntegrationHealth: IntegrationHealth = {
  integration_id: "integration-123",
  status: "healthy",
  last_check: "2025-01-01T00:00:00Z",
  response_time_ms: 150,
  error_rate: 0.01,
  uptime_percentage: 99.9,
  details: { last_error: null },
};

const mockIntegrationCredentials: IntegrationCredentials = {
  id: "cred-123",
  integration_id: "integration-123",
  name: "API Key",
  type: "api_key",
  encrypted_data: { key: "sk_test_123" },
  expires_at: null,
  last_used: "2025-01-01T00:00:00Z",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockIntegrationConfig: IntegrationConfig = {
  id: "config-123",
  integration_id: "integration-123",
  key: "webhook_url",
  value: "https://example.com/webhook",
  type: "string",
  description: "Webhook endpoint URL",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockAvailableTypes = ["stripe", "twilio", "google-calendar", "slack", "zapier", "webhook"];

// Mock API client
vi.mock("~/lib/api/client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock toast
vi.mock("~/components/common/Toast", () => ({
  showToast: vi.fn(),
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "integrations.title": "Integrations",
        "integrations.description": "Manage external integrations",
        "integrations.status.active": "Active",
        "integrations.status.inactive": "Inactive",
        "integrations.status.error": "Error",
        "integrations.status.pending": "Pending",
        "integrations.type.stripe": "Stripe",
        "integrations.type.twilio": "Twilio",
        "integrations.type.slack": "Slack",
        "integrations.type.zapier": "Zapier",
        "integrations.type.webhook": "Webhook",
        "integrations.type.google-calendar": "Google Calendar",
        "integrations.test.success": "Integration test successful",
        "integrations.test.error": "Integration test failed",
        "integrations.activate.success": "Integration activated successfully",
        "integrations.deactivate.success": "Integration deactivated successfully",
        "integrations.delete.success": "Integration deleted successfully",
        "integrations.create.success": "Integration created successfully",
        "integrations.update.success": "Integration updated successfully",
        "integrations.sync.success": "Integration synced successfully",
        "common.loading": "Loading...",
        "common.error": "Error",
        "common.success": "Success",
      };
      return translations[key] || key;
    },
    setLanguage: vi.fn(),
    language: "es",
  }),
}));

const createQueryClient = () => {
  return new QueryClient({
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
};

describe("Integrations Module", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();

    // Default mock for apiClient.get
    const apiClient = mockApiClient;
    (apiClient.get as any).mockResolvedValue({
      data: {
        data: [mockIntegration],
        meta: {
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        },
        error: null,
      },
    });

    // Mock stats
    (apiClient.get as any).mockResolvedValue({
      data: {
        data: mockIntegrationStats,
        error: null,
      },
    });

    // Mock available types
    (apiClient.get as any).mockResolvedValue({
      data: {
        data: mockAvailableTypes,
        error: null,
      },
    });
  });

  describe("Integrations Hooks", () => {
    it("useIntegrations should fetch integrations", async () => {
      const TestComponent = () => {
        const { data, isLoading } = useIntegrations();
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.length} integrations</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("1 integrations")).toBeInTheDocument();
      });
    });

    it("useIntegration should fetch single integration", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: mockIntegration,
          error: null,
        },
      });

      const TestComponent = () => {
        const { data, isLoading } = useIntegration("integration-123");
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.name}</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Stripe Integration")).toBeInTheDocument();
      });
    });

    it("useIntegrationStats should fetch statistics", async () => {
      const TestComponent = () => {
        const { data, isLoading } = useIntegrationStats();
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.total_integrations} total integrations</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("10 total integrations")).toBeInTheDocument();
      });
    });

    it("useAvailableIntegrationTypes should fetch available types", async () => {
      const TestComponent = () => {
        const { data, isLoading } = useAvailableIntegrationTypes();
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.length} types available</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("6 types available")).toBeInTheDocument();
      });
    });

    it("useCreateIntegration should create integration", async () => {
      const apiClient = mockApiClient;
      (apiClient.post as any).mockResolvedValue({
        data: {
          data: mockIntegration,
          error: null,
        },
      });

      const TestComponent = () => {
        const createIntegration = useCreateIntegration();
        const [success, setSuccess] = useState(false);

        const handleCreate = async () => {
          try {
            await createIntegration.mutateAsync({
              name: "Stripe Integration",
              type: "stripe",
              config: { api_key: "sk_test_123" },
            });
            setSuccess(true);
          } catch (error) {
            console.error(error);
          }
        };

        return (
          <div>
            <button onClick={handleCreate}>Create Integration</button>
            {success && <div>Integration created successfully</div>}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByText("Create Integration"));

      await waitFor(() => {
        expect(screen.getByText("Integration created successfully")).toBeInTheDocument();
      });
    });

    it("useActivateIntegration should activate integration", async () => {
      const apiClient = mockApiClient;
      (apiClient.post as any).mockResolvedValue({
        data: {
          data: { ...mockIntegration, status: "active" as const },
          error: null,
        },
      });

      const TestComponent = () => {
        const activateIntegration = useActivateIntegration();
        const [success, setSuccess] = useState(false);

        const handleActivate = async () => {
          try {
            await activateIntegration.mutateAsync({
              integrationId: "integration-123",
              data: { config: { api_key: "sk_test_123" } },
            });
            setSuccess(true);
          } catch (error) {
            console.error(error);
          }
        };

        return (
          <div>
            <button onClick={handleActivate}>Activate Integration</button>
            {success && <div>Integration activated successfully</div>}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByText("Activate Integration"));

      await waitFor(() => {
        expect(screen.getByText("Integration activated successfully")).toBeInTheDocument();
      });
    });

    it("useTestIntegration should test integration", async () => {
      const apiClient = mockApiClient;
      (apiClient.post as any).mockResolvedValue({
        data: {
          data: { success: true, message: "Test successful" },
          error: null,
        },
      });

      const TestComponent = () => {
        const testIntegration = useTestIntegration();
        const [success, setSuccess] = useState(false);

        const handleTest = async () => {
          try {
            await testIntegration.mutateAsync("integration-123");
            setSuccess(true);
          } catch (error) {
            console.error(error);
          }
        };

        return (
          <div>
            <button onClick={handleTest}>Test Integration</button>
            {success && <div>Integration test successful</div>}
          </div>
        );
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      fireEvent.click(screen.getByText("Test Integration"));

      await waitFor(() => {
        expect(screen.getByText("Integration test successful")).toBeInTheDocument();
      });
    });

    it("useIntegrationWebhooks should fetch webhooks", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [mockIntegrationWebhook],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        },
      });

      const TestComponent = () => {
        const { data, isLoading } = useIntegrationWebhooks("integration-123");
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.length} webhooks</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("1 webhooks")).toBeInTheDocument();
      });
    });

    it("useIntegrationLogs should fetch logs", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [mockIntegrationLog],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        },
      });

      const TestComponent = () => {
        const { data, isLoading } = useIntegrationLogs("integration-123");
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.length} logs</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("1 logs")).toBeInTheDocument();
      });
    });

    it("useIntegrationEvents should fetch events", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [mockIntegrationEvent],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        },
      });

      const TestComponent = () => {
        const { data, isLoading } = useIntegrationEvents("integration-123");
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.length} events</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("1 events")).toBeInTheDocument();
      });
    });

    it("useIntegrationHealth should fetch health status", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: mockIntegrationHealth,
          error: null,
        },
      });

      const TestComponent = () => {
        const { data, isLoading } = useIntegrationHealth("integration-123");
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.status}</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("healthy")).toBeInTheDocument();
      });
    });

    it("useIntegrationCredentials should fetch credentials", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [mockIntegrationCredentials],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        },
      });

      const TestComponent = () => {
        const { data, isLoading } = useIntegrationCredentials("integration-123");
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.length} credentials</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("1 credentials")).toBeInTheDocument();
      });
    });

    it("useIntegrationConfig should fetch configuration", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [mockIntegrationConfig],
          meta: {
            total: 1,
            page: 1,
            page_size: 20,
            total_pages: 1,
          },
          error: null,
        },
      });

      const TestComponent = () => {
        const { data, isLoading } = useIntegrationConfig("integration-123");
        
        if (isLoading) return <div>Loading...</div>;
        return <div>{data?.length} config items</div>;
      };

      render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("1 config items")).toBeInTheDocument();
      });
    });
  });

  describe("Data Structure", () => {
    it("has required Integration fields", () => {
      const integration = mockIntegration;

      expect(integration).toHaveProperty("id");
      expect(integration).toHaveProperty("tenant_id");
      expect(integration).toHaveProperty("name");
      expect(integration).toHaveProperty("type");
      expect(integration).toHaveProperty("status");
      expect(integration).toHaveProperty("config");
      expect(integration).toHaveProperty("last_sync_at");
      expect(integration).toHaveProperty("error_message");
      expect(integration).toHaveProperty("created_at");
      expect(integration).toHaveProperty("updated_at");
    });

    it("has valid integration status", () => {
      expect(["active", "inactive", "error", "pending"]).toContain(mockIntegration.status);
    });

    it("has required IntegrationStats fields", () => {
      const stats = mockIntegrationStats;

      expect(stats).toHaveProperty("total_integrations");
      expect(stats).toHaveProperty("active_integrations");
      expect(stats).toHaveProperty("inactive_integrations");
      expect(stats).toHaveProperty("error_integrations");
      expect(stats).toHaveProperty("pending_integrations");
      expect(stats).toHaveProperty("most_used_types");
      expect(stats).toHaveProperty("recent_activity");
    });

    it("has correct most used types structure", () => {
      const types = mockIntegrationStats.most_used_types;

      expect(Array.isArray(types)).toBe(true);
      expect(types[0]).toHaveProperty("type");
      expect(types[0]).toHaveProperty("count");
      expect(typeof types[0].type).toBe("string");
      expect(typeof types[0].count).toBe("number");
    });

    it("has correct recent activity structure", () => {
      const activity = mockIntegrationStats.recent_activity;

      expect(Array.isArray(activity)).toBe(true);
      expect(activity[0]).toHaveProperty("integration_id");
      expect(activity[0]).toHaveProperty("integration_name");
      expect(activity[0]).toHaveProperty("action");
      expect(activity[0]).toHaveProperty("timestamp");
    });

    it("has required IntegrationWebhook fields", () => {
      const webhook = mockIntegrationWebhook;

      expect(webhook).toHaveProperty("id");
      expect(webhook).toHaveProperty("integration_id");
      expect(webhook).toHaveProperty("event_type");
      expect(webhook).toHaveProperty("url");
      expect(webhook).toHaveProperty("active");
      expect(webhook).toHaveProperty("trigger_count");
      expect(webhook).toHaveProperty("created_at");
      expect(webhook).toHaveProperty("updated_at");
    });

    it("has required IntegrationLog fields", () => {
      const log = mockIntegrationLog;

      expect(log).toHaveProperty("id");
      expect(log).toHaveProperty("integration_id");
      expect(log).toHaveProperty("level");
      expect(log).toHaveProperty("message");
      expect(log).toHaveProperty("timestamp");
    });

    it("has valid log level", () => {
      expect(["info", "warn", "error", "debug"]).toContain(mockIntegrationLog.level);
    });

    it("has required IntegrationEvent fields", () => {
      const event = mockIntegrationEvent;

      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("integration_id");
      expect(event).toHaveProperty("event_type");
      expect(event).toHaveProperty("data");
      expect(event).toHaveProperty("processed");
      expect(event).toHaveProperty("created_at");
    });

    it("has required IntegrationHealth fields", () => {
      const health = mockIntegrationHealth;

      expect(health).toHaveProperty("integration_id");
      expect(health).toHaveProperty("status");
      expect(health).toHaveProperty("last_check");
    });

    it("has valid health status", () => {
      expect(["healthy", "warning", "error", "unknown"]).toContain(mockIntegrationHealth.status);
    });

    it("has required IntegrationCredentials fields", () => {
      const credentials = mockIntegrationCredentials;

      expect(credentials).toHaveProperty("id");
      expect(credentials).toHaveProperty("integration_id");
      expect(credentials).toHaveProperty("name");
      expect(credentials).toHaveProperty("type");
      expect(credentials).toHaveProperty("encrypted_data");
      expect(credentials).toHaveProperty("created_at");
      expect(credentials).toHaveProperty("updated_at");
    });

    it("has valid credential type", () => {
      expect(["api_key", "oauth", "basic_auth", "custom"]).toContain(mockIntegrationCredentials.type);
    });

    it("has required IntegrationConfig fields", () => {
      const config = mockIntegrationConfig;

      expect(config).toHaveProperty("id");
      expect(config).toHaveProperty("integration_id");
      expect(config).toHaveProperty("key");
      expect(config).toHaveProperty("value");
      expect(config).toHaveProperty("type");
      expect(config).toHaveProperty("created_at");
      expect(config).toHaveProperty("updated_at");
    });

    it("has valid config type", () => {
      expect(["string", "number", "boolean", "json", "encrypted"]).toContain(mockIntegrationConfig.type);
    });
  });
});
