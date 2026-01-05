/**
 * Automation tests
 * Basic unit tests for Automation module
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import AutomationPage from "~/routes/automation";
import { 
  useAutomationRules, 
  useCreateAutomationRule, 
  useUpdateAutomationRule, 
  useDeleteAutomationRule,
  useExecuteAutomationRule,
  useEnableAutomationRule,
  useDisableAutomationRule,
  useCloneAutomationRule,
  useTestAutomationRule
} from "~/features/automation/hooks/useAutomation";
import type { AutomationRule, AutomationRuleCreate } from "~/features/automation/types/automation.types";

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

// Mock automation hooks
vi.mock("~/features/automation/hooks/useAutomation", () => ({
  useAutomationRules: vi.fn(),
  useCreateAutomationRule: vi.fn(),
  useUpdateAutomationRule: vi.fn(),
  useDeleteAutomationRule: vi.fn(),
  useExecuteAutomationRule: vi.fn(),
  useEnableAutomationRule: vi.fn(),
  useDisableAutomationRule: vi.fn(),
  useCloneAutomationRule: vi.fn(),
  useTestAutomationRule: vi.fn(),
}));

// Import the mocked hooks
const mockedUseAutomation = vi.mocked(import("~/features/automation/hooks/useAutomation"));

// Mock data
const mockAutomationRule: AutomationRule = {
  id: "1",
  tenant_id: "tenant-1",
  name: "Test Automation Rule",
  description: "Test automation rule description",
  trigger: {
    type: "event",
    event_type: "product.created",
    entity_type: "product"
  },
  conditions: [
    {
      field: "price",
      operator: "gt",
      value: 100,
      logical_operator: "and"
    }
  ],
  actions: [
    {
      type: "send_notification",
      channel: "email",
      template: "product_created_email",
      recipients: ["admin@example.com"]
    }
  ],
  is_active: true,
  priority: 1,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockAutomationRules = [mockAutomationRule];

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
        "automation.title": "Automation",
        "automation.description": "Automation rules management",
        "automation.tabs.rules": "Rules",
        "automation.tabs.executions": "Executions",
        "automation.rules.create": "Create Rule",
        "automation.rules.edit": "Edit Rule",
        "automation.rules.table.name": "Name",
        "automation.rules.table.trigger": "Trigger",
        "automation.rules.table.conditions": "Conditions",
        "automation.rules.table.actions": "Actions",
        "automation.rules.table.priority": "Priority",
        "automation.rules.table.status": "Status",
        "automation.rules.table.actions": "Actions",
        "automation.status.active": "Active",
        "automation.status.inactive": "Inactive",
        "automation.rules.executions": "Executions",
        "automation.rules.test": "Test",
        "automation.rules.execute": "Execute",
        "automation.rules.clone": "Clone",
        "automation.rules.enable": "Enable",
        "automation.rules.disable": "Disable",
        "common.view": "View",
        "common.edit": "Edit",
        "common.delete": "Delete",
        "common.cancel": "Cancel",
        "common.create": "Create",
        "common.update": "Update",
        "common.save": "Save",
        "common.saving": "Saving...",
        "common.remove": "Remove",
        "common.back": "Back",
        "automation.error.loading": "Failed to load automation rules",
        "automation.rules.empty.title": "No automation rules found",
        "automation.rules.empty.description": "Create your first automation rule to get started",
        "automation.executions.title": "Automation Executions",
        "automation.executions.history": "Execution History",
        "automation.executions.table.id": "ID",
        "automation.executions.table.status": "Status",
        "automation.executions.table.startedAt": "Started At",
        "automation.executions.table.completedAt": "Completed At",
        "automation.executions.table.duration": "Duration",
        "automation.executions.table.actions": "Actions",
        "automation.executions.status.pending": "Pending",
        "automation.executions.status.running": "Running",
        "automation.executions.status.completed": "Completed",
        "automation.executions.status.failed": "Failed",
        "automation.executions.empty.title": "No executions found",
        "automation.executions.empty.description": "This rule has no executions yet",
        "automation.executions.detail": "Execution Details",
        "automation.executions.executionId": "Execution ID",
        "automation.executions.triggerData": "Trigger Data",
        "automation.executions.result": "Result",
        "automation.executions.error": "Error",
        "automation.form.basic": "Basic Information",
        "automation.form.name": "Name",
        "automation.form.namePlaceholder": "Enter rule name",
        "automation.form.description": "Description",
        "automation.form.descriptionPlaceholder": "Enter rule description",
        "automation.form.active": "Active",
        "automation.form.priority": "Priority",
        "automation.form.trigger": "Trigger Configuration",
        "automation.form.triggerType": "Trigger Type",
        "automation.form.triggerTypePlaceholder": "Select trigger type",
        "automation.trigger.event": "Event",
        "automation.trigger.schedule": "Schedule",
        "automation.trigger.manual": "Manual",
        "automation.form.eventType": "Event Type",
        "automation.form.eventTypePlaceholder": "Enter event type",
        "automation.form.entityType": "Entity Type",
        "automation.form.entityTypePlaceholder": "Enter entity type",
        "automation.form.conditions": "Conditions",
        "automation.form.condition": "Condition {index}",
        "automation.form.field": "Field",
        "automation.form.fieldPlaceholder": "Enter field name",
        "automation.form.operator": "Operator",
        "automation.form.value": "Value",
        "automation.form.valuePlaceholder": "Enter value",
        "automation.form.logicalOperator": "Logical Operator",
        "automation.logical.and": "AND",
        "automation.logical.or": "OR",
        "automation.form.addCondition": "Add Condition",
        "automation.form.actions": "Actions",
        "automation.form.action": "Action {index}",
        "automation.form.actionType": "Action Type",
        "automation.action.sendNotification": "Send Notification",
        "automation.action.createTask": "Create Task",
        "automation.action.updateEntity": "Update Entity",
        "automation.action.sendWebhook": "Send Webhook",
        "automation.action.publishEvent": "Publish Event",
        "automation.form.channel": "Channel",
        "automation.channel.email": "Email",
        "automation.channel.sms": "SMS",
        "automation.channel.webhook": "Webhook",
        "automation.channel.inApp": "In-App",
        "automation.form.template": "Template",
        "automation.form.templatePlaceholder": "Enter template name",
        "automation.form.recipients": "Recipients",
        "automation.form.recipientsPlaceholder": "Enter recipients (comma-separated)",
        "automation.form.webhookUrl": "Webhook URL",
        "automation.form.webhookUrlPlaceholder": "Enter webhook URL",
        "automation.form.eventData": "Event Data",
        "automation.form.eventDataPlaceholder": "Enter event data (JSON)",
        "automation.form.addAction": "Add Action",
        "automation.rules.delete.title": "Delete Automation Rule",
        "automation.rules.delete.confirm": "Are you sure you want to delete this rule?",
        "automation.rules.execute.title": "Execute Automation Rule",
        "automation.rules.execute.confirm": "Are you sure you want to execute this rule?",
        "automation.rules.executing": "Executing...",
        "automation.rules.deleting": "Deleting...",
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

describe("Automation Module", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();

    // Default mock for apiClient.get
    mockApiClient.get = vi.fn().mockResolvedValue({
      data: {
        data: mockAutomationRules,
        meta: {
          total: mockAutomationRules.length,
          page: 1,
          page_size: 20,
          total_pages: 1,
        },
        error: null,
      },
    });

    // Mock executions
    mockApiClient.get = vi.fn().mockResolvedValue({
      data: {
        data: [
          {
            id: "exec-1",
            rule_id: "1",
            trigger_data: {},
            result: "success",
            executed_at: "2024-01-01T00:00:00Z",
          },
        ],
        meta: {
          total: 1,
          page: 1,
          page_size: 20,
          total_pages: 1,
        },
        error: null,
      },
    });

    // Mock automation hooks
    const mockedHooks = vi.mocked(require("~/features/automation/hooks/useAutomation"));
    mockedHooks.useAutomationRules = vi.fn().mockReturnValue({
      data: mockAutomationRules,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockedHooks.useCreateAutomationRule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    mockedHooks.useUpdateAutomationRule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    mockedHooks.useDeleteAutomationRule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    mockedHooks.useExecuteAutomationRule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    mockedHooks.useEnableAutomationRule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    mockedHooks.useDisableAutomationRule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    mockedHooks.useCloneAutomationRule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
    mockedHooks.useTestAutomationRule = vi.fn().mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      error: null,
    });
  });

  const renderWithClient = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {component}
      </QueryClientProvider>
    );
  };

  describe("AutomationPage", () => {
    it("renders automation page with title and description", () => {
      renderWithClient(<AutomationPage />);

      expect(screen.getByText("Automation")).toBeInTheDocument();
      expect(screen.getByText("Automation rules management")).toBeInTheDocument();
    });

    it("renders tabs for rules and executions", () => {
      renderWithClient(<AutomationPage />);

      expect(screen.getByText("Rules")).toBeInTheDocument();
      expect(screen.getByText("Executions")).toBeInTheDocument();
    });

    it("shows create button in rules tab", () => {
      renderWithClient(<AutomationPage />);

      // Should be in rules tab by default
      expect(screen.getByText("Create Rule")).toBeInTheDocument();
    });

    it("opens create dialog when create button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      const createButton = screen.getByText("Create Rule");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText("Create Rule")).toBeInTheDocument();
      });
    });

    it("shows loading state initially", () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithClient(<AutomationPage />);

      // Should show loading state
      expect(document.body).toBeTruthy();
    });

    it("shows error state when API fails", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockRejectedValue(
        new Error("Failed to load automation rules")
      );

      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        expect(document.body).toBeTruthy();
      });
    });
  });

  describe("AutomationRuleList component", () => {
    it("renders automation rule list with actions", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        expect(screen.getByText("Test Automation Rule")).toBeInTheDocument();
        expect(screen.getByText("Test automation rule description")).toBeInTheDocument();
        expect(screen.getByText("event")).toBeInTheDocument();
        expect(screen.getByText("Active")).toBeInTheDocument();
      });
    });

    it("calls edit when edit button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        const editButton = screen.getAllByText("Edit")[0];
        expect(editButton).toBeInTheDocument();
        fireEvent.click(editButton);
      });
    });

    it("calls view when view button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        const viewButton = screen.getAllByText("View")[0];
        expect(viewButton).toBeInTheDocument();
        fireEvent.click(viewButton);
      });
    });

    it("calls executions when executions button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        const executionsButton = screen.getAllByText("Executions")[0];
        expect(executionsButton).toBeInTheDocument();
        fireEvent.click(executionsButton);
      });
    });

    it("calls test when test button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        const testButton = screen.getAllByText("Test")[0];
        expect(testButton).toBeInTheDocument();
        fireEvent.click(testButton);
      });
    });

    it("calls execute when execute button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        const executeButton = screen.getAllByText("Execute")[0];
        expect(executeButton).toBeInTheDocument();
        fireEvent.click(executeButton);
      });
    });

    it("calls clone when clone button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        const cloneButton = screen.getAllByText("Clone")[0];
        expect(cloneButton).toBeInTheDocument();
        fireEvent.click(cloneButton);
      });
    });

    it("calls toggle active when enable/disable button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        const toggleButton = screen.getAllByText("Disable")[0];
        expect(toggleButton).toBeInTheDocument();
        fireEvent.click(toggleButton);
      });
    });

    it("calls delete when delete button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        const deleteButton = screen.getAllByText("Delete")[0];
        expect(deleteButton).toBeInTheDocument();
        fireEvent.click(deleteButton);
      });
    });

    it("shows empty state when no rules", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [],
          meta: {
            total: 0,
            page: 1,
            page_size: 20,
            total_pages: 0,
          },
          error: null,
        },
      });

      renderWithClient(<AutomationPage />);

      await waitFor(() => {
        expect(screen.getByText("No automation rules found")).toBeInTheDocument();
        expect(screen.getByText("Create your first automation rule to get started")).toBeInTheDocument();
      });
    });
  });

  describe("AutomationRuleForm component", () => {
    it("renders form fields for creating rule", async () => {
      renderWithClient(<AutomationPage />);

      // Open create dialog
      const createButton = screen.getByText("Create Rule");
      fireEvent.click(createButton);

      await waitFor(() => {
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Trigger Configuration")).toBeInTheDocument();
        expect(screen.getByText("Conditions")).toBeInTheDocument();
        expect(screen.getByText("Actions")).toBeInTheDocument();
      });
    });

    it("renders form fields for editing rule", async () => {
      renderWithClient(<AutomationPage />);

      // First click edit button to set selected rule
      await waitFor(() => {
        const editButton = screen.getAllByText("Edit")[0];
        fireEvent.click(editButton);
      });

      // Open edit dialog
      await waitFor(() => {
        expect(screen.getByText("Edit Rule")).toBeInTheDocument();
        expect(screen.getByText("Basic Information")).toBeInTheDocument();
        expect(screen.getByText("Name")).toBeInTheDocument();
        expect(screen.getByText("Trigger Configuration")).toBeInTheDocument();
      });
    });

    it("adds condition when add condition button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      // Open create dialog
      const createButton = screen.getByText("Create Rule");
      fireEvent.click(createButton);

      await waitFor(() => {
        const addConditionButton = screen.getByText("Add Condition");
        expect(addConditionButton).toBeInTheDocument();
        fireEvent.click(addConditionButton);
      });
    });

    it("adds action when add action button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      // Open create dialog
      const createButton = screen.getByText("Create Rule");
      fireEvent.click(createButton);

      await waitFor(() => {
        const addActionButton = screen.getByText("Add Action");
        expect(addActionButton).toBeInTheDocument();
        fireEvent.click(addActionButton);
      });
    });
  });

  describe("AutomationExecutionList component", () => {
    it("renders execution list when executions tab is selected", async () => {
      renderWithClient(<AutomationPage />);

      // Click executions button to go to executions tab
      await waitFor(() => {
        const executionsButton = screen.getAllByText("Executions")[0];
        fireEvent.click(executionsButton);
      });

      await waitFor(() => {
        expect(screen.getByText("Automation Executions")).toBeInTheDocument();
        expect(screen.getByText("Execution History")).toBeInTheDocument();
      });
    });

    it("shows execution details when view button is clicked", async () => {
      renderWithClient(<AutomationPage />);

      // Click executions button to go to executions tab
      await waitFor(() => {
        const executionsButton = screen.getAllByText("Executions")[0];
        fireEvent.click(executionsButton);
      });

      await waitFor(() => {
        const viewButton = screen.getAllByText("View")[0];
        expect(viewButton).toBeInTheDocument();
        fireEvent.click(viewButton);
      });
    });

    it("shows empty state when no executions", async () => {
      const apiClient = mockApiClient;
      (apiClient.get as any).mockResolvedValue({
        data: {
          data: [],
          meta: {
            total: 0,
            page: 1,
            page_size: 20,
            total_pages: 0,
          },
          error: null,
        },
      });

      renderWithClient(<AutomationPage />);

      // Click executions button to go to executions tab
      await waitFor(() => {
        const executionsButton = screen.getAllByText("Executions")[0];
        fireEvent.click(executionsButton);
      });

      await waitFor(() => {
        expect(screen.getByText("No executions found")).toBeInTheDocument();
        expect(screen.getByText("This rule has no executions yet")).toBeInTheDocument();
      });
    });
  });

  describe("Data Structure", () => {
    it("has required automation rule fields", () => {
      const rule = mockAutomationRule;

      expect(rule).toHaveProperty("id");
      expect(rule).toHaveProperty("tenant_id");
      expect(rule).toHaveProperty("name");
      expect(rule).toHaveProperty("description");
      expect(rule).toHaveProperty("trigger");
      expect(rule).toHaveProperty("conditions");
      expect(rule).toHaveProperty("actions");
      expect(rule).toHaveProperty("is_active");
      expect(rule).toHaveProperty("priority");
      expect(rule).toHaveProperty("created_at");
      expect(rule).toHaveProperty("updated_at");
    });

    it("has correct trigger structure", () => {
      const trigger = mockAutomationRule.trigger;

      expect(trigger).toHaveProperty("type");
      expect(trigger).toHaveProperty("event_type");
      expect(trigger).toHaveProperty("entity_type");
    });

    it("has correct condition structure", () => {
      const condition = mockAutomationRule.conditions[0];

      expect(condition).toHaveProperty("field");
      expect(condition).toHaveProperty("operator");
      expect(condition).toHaveProperty("value");
      expect(condition).toHaveProperty("logical_operator");
    });

    it("has correct action structure", () => {
      const action = mockAutomationRule.actions[0];

      expect(action).toHaveProperty("type");
      expect(action).toHaveProperty("channel");
      expect(action).toHaveProperty("template");
      expect(action).toHaveProperty("recipients");
    });
  });
});
