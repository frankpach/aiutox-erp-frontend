/**
 * Activities tests
 * Basic unit tests for Activities module
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ActivityTimeline } from "~/features/activities/components/ActivityTimeline";
import { ActivityForm } from "~/features/activities/components/ActivityForm";
import { ActivityFilters } from "~/features/activities/components/ActivityFilters";
import { Activity, ActivityType } from "~/features/activities/types/activity.types";

// Mock data
const mockActivities: Activity[] = [
  {
    id: "1",
    tenant_id: "tenant-1",
    entity_type: "product",
    entity_id: "product-1",
    activity_type: "comment",
    title: "Test Activity 1",
    description: "Test description",
    user_id: "user-1",
    metadata: { priority: "high" },
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "2",
    tenant_id: "tenant-1",
    entity_type: "order",
    entity_id: "order-1",
    activity_type: "status_change",
    title: "Test Activity 2",
    description: "Status changed to active",
    user_id: "user-2",
    metadata: { old_status: "pending", new_status: "active" },
    created_at: "2025-01-02T00:00:00Z",
    updated_at: "2025-01-02T00:00:00Z",
  },
];

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

describe("Activities Module", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();
  });

  describe("ActivityTimeline", () => {
    it("renders loading state", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityTimeline activities={[]} loading={true} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Loading activities...")).toBeInTheDocument();
    });

    it("renders empty state", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityTimeline activities={[]} loading={false} />
        </QueryClientProvider>
      );

      expect(screen.getByText("No hay actividades")).toBeInTheDocument();
    });

    it("renders activities list", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityTimeline activities={mockActivities} loading={false} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Test Activity 1")).toBeInTheDocument();
      expect(screen.getByText("Test Activity 2")).toBeInTheDocument();
    });

    it("calls onRefresh when refresh button is clicked", async () => {
      const onRefresh = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityTimeline activities={mockActivities} onRefresh={onRefresh} />
        </QueryClientProvider>
      );

      const refreshButton = screen.getByText("Actualizar");
      fireEvent.click(refreshButton);

      await waitFor(() => {
        expect(onRefresh).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("ActivityForm", () => {
    it("renders create form", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityForm onSubmit={vi.fn()} onCancel={vi.fn()} />
        </QueryClientProvider>
      );

      expect(screen.getByText("Crear Actividad")).toBeInTheDocument();
      expect(screen.getByLabelText("activities.types.title")).toBeInTheDocument();
      expect(screen.getByLabelText("activities.title")).toBeInTheDocument();
    });

    it("renders edit form", () => {
      const mockActivity = mockActivities[0];
      
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityForm 
            activity={mockActivity} 
            onSubmit={vi.fn()} 
            onCancel={vi.fn()} 
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("Editar Actividad")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Test Activity 1")).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted", async () => {
      const onSubmit = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityForm onSubmit={onSubmit} onCancel={vi.fn()} />
        </QueryClientProvider>
      );

      const titleInput = screen.getByLabelText("activities.title");
      fireEvent.change(titleInput, { target: { value: "New Activity" } });

      const submitButton = screen.getByText("Guardar");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "New Activity",
          })
        );
      });
    });
  });

  describe("ActivityFilters", () => {
    it("renders filter options", () => {
      const onFiltersChange = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityFilters 
            filters={{
              activity_types: [],
              date_from: "",
              date_to: "",
              search: "",
            }}
            onFiltersChange={onFiltersChange}
            onApply={vi.fn()}
            onReset={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("activities.filters.title")).toBeInTheDocument();
      expect(screen.getByLabelText("activities.filters.search")).toBeInTheDocument();
    });

    it("calls onFiltersChange when filter is applied", async () => {
      const onFiltersChange = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <ActivityFilters 
            filters={{
              activity_types: [],
              date_from: "",
              date_to: "",
              search: "",
            }}
            onFiltersChange={onFiltersChange}
            onApply={vi.fn()}
            onReset={vi.fn()}
          />
        </QueryClientProvider>
      );

      const commentBadge = screen.getByText("Comentario");
      fireEvent.click(commentBadge);

      await waitFor(() => {
        expect(onFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            activity_types: ["comment"],
          })
        );
      });
    });
  });

  describe("Activity Types", () => {
    it("has correct activity types", () => {
      const types: ActivityType[] = [
        "comment", "call", "email", "meeting", 
        "task", "status_change", "note", "file_upload", "custom"
      ];

      expect(types).toHaveLength(10);
      expect(types).toContain("comment");
      expect(types).toContain("custom");
    });
  });
});
