/**
 * Tests for approval hooks
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import {
  useApprovalWidget,
  useEntityApprovalStatus,
  useCanApproveRequest,
} from "~/features/approvals/hooks/useApprovals";
import * as approvalsApi from "~/features/approvals/api/approvals.api";

vi.mock("~/features/approvals/api/approvals.api");

const createMockQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = createMockQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useApprovalWidget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería obtener datos del widget correctamente", async () => {
    const mockWidgetData = {
      data: {
        request: {
          id: "req-1",
          title: "Aprobación de Orden #123",
          description: "Orden por $5,000",
          status: "pending",
          current_step: 1,
          entity_type: "order",
          entity_id: "order-1",
          requested_by: "user-1",
          requested_at: "2025-01-12T10:00:00Z",
          completed_at: null,
        },
        flow: {
          id: "flow-1",
          name: "Aprobación de Órdenes",
          flow_type: "sequential",
        },
        current_step: {
          id: "step-1",
          step_order: 1,
          name: "Aprobación Gerencial",
          description: "Aprobación inicial",
          approver_type: "role",
          rejection_required: true,
        },
        permissions: {
          can_approve: true,
        },
        timeline: [],
      },
      meta: null,
      error: null,
    };

    vi.mocked(approvalsApi.getRequestWidgetData).mockResolvedValue(mockWidgetData);

    const { result } = renderHook(() => useApprovalWidget("req-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockWidgetData);
    expect(approvalsApi.getRequestWidgetData).toHaveBeenCalledWith("req-1");
  });

  it("debería manejar errores correctamente", async () => {
    const mockError = {
      data: null,
      meta: null,
      error: {
        message: "Error al cargar datos del widget",
        code: "WIDGET_LOAD_ERROR",
      },
    };

    vi.mocked(approvalsApi.getRequestWidgetData).mockResolvedValue(mockError);

    const { result } = renderHook(() => useApprovalWidget("req-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.error).toBeDefined();
  });

  it("debería cachear datos correctamente", async () => {
    const mockWidgetData = {
      data: {
        request: {
          id: "req-1",
          title: "Aprobación de Orden #123",
          description: "Orden por $5,000",
          status: "pending",
          current_step: 1,
          entity_type: "order",
          entity_id: "order-1",
          requested_by: "user-1",
          requested_at: "2025-01-12T10:00:00Z",
          completed_at: null,
        },
        flow: {
          id: "flow-1",
          name: "Aprobación de Órdenes",
          flow_type: "sequential",
        },
        current_step: {
          id: "step-1",
          step_order: 1,
          name: "Aprobación Gerencial",
          description: "Aprobación inicial",
          approver_type: "role",
          rejection_required: true,
        },
        permissions: {
          can_approve: true,
        },
        timeline: [],
      },
      meta: null,
      error: null,
    };

    vi.mocked(approvalsApi.getRequestWidgetData).mockResolvedValue(mockWidgetData);

    const { result, rerender } = renderHook(() => useApprovalWidget("req-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    const firstCallCount = approvalsApi.getRequestWidgetData.mock.calls.length;

    rerender();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(approvalsApi.getRequestWidgetData).toHaveBeenCalledTimes(firstCallCount);
  });
});

describe("useEntityApprovalStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería obtener estado de aprobación de entidad correctamente", async () => {
    const mockStatusData = {
      data: {
        has_request: true,
        status: "pending",
        current_step: 1,
        request_id: "req-1",
        flow_name: "Aprobación de Órdenes",
      },
      meta: null,
      error: null,
    };

    vi.mocked(approvalsApi.getEntityApprovalStatus).mockResolvedValue(mockStatusData);

    const { result } = renderHook(
      () => useEntityApprovalStatus("order", "order-1"),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStatusData);
    expect(approvalsApi.getEntityApprovalStatus).toHaveBeenCalledWith({
      entity_type: "order",
      entity_id: "order-1",
    });
  });

  it("debería manejar entidades sin solicitud", async () => {
    const mockStatusData = {
      data: {
        has_request: false,
        status: null,
        current_step: null,
        request_id: null,
        flow_name: null,
      },
      meta: null,
      error: null,
    };

    vi.mocked(approvalsApi.getEntityApprovalStatus).mockResolvedValue(mockStatusData);

    const { result } = renderHook(
      () => useEntityApprovalStatus("order", "order-1"),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data?.has_request).toBe(false);
  });
});

describe("useCanApproveRequest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debería verificar si usuario puede aprobar correctamente", async () => {
    const mockCanApproveData = {
      data: {
        can_approve: true,
        current_step: {
          id: "step-1",
          step_order: 1,
          name: "Aprobación Gerencial",
          description: "Aprobación inicial",
          approver_type: "role",
          rejection_required: true,
        },
        request_status: "pending",
      },
      meta: null,
      error: null,
    };

    vi.mocked(approvalsApi.checkUserCanApprove).mockResolvedValue(mockCanApproveData);

    const { result } = renderHook(() => useCanApproveRequest("req-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCanApproveData);
    expect(approvalsApi.checkUserCanApprove).toHaveBeenCalledWith("req-1");
  });

  it("debería manejar caso donde usuario no puede aprobar", async () => {
    const mockCanApproveData = {
      data: {
        can_approve: false,
        current_step: {
          id: "step-1",
          step_order: 1,
          name: "Aprobación Gerencial",
          description: "Aprobación inicial",
          approver_type: "role",
          rejection_required: true,
        },
        request_status: "pending",
      },
      meta: null,
      error: null,
    };

    vi.mocked(approvalsApi.checkUserCanApprove).mockResolvedValue(mockCanApproveData);

    const { result } = renderHook(() => useCanApproveRequest("req-1"), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.data?.can_approve).toBe(false);
  });
});
