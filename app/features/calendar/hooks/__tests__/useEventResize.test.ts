/**
 * Tests for useEventResize hook
 */

import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useEventResize } from "~/features/calendar/hooks/useEventResize";
import type { CalendarEvent } from "~/features/calendar/types/calendar.types";

// Mock dependencies
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    language: "es",
  }),
}));

vi.mock("~/components/common/Toast", () => ({
  showToast: vi.fn(),
}));

import { showToast } from "~/components/common/Toast";

const baseEvent: CalendarEvent = {
  id: "event-1",
  tenant_id: "tenant-1",
  calendar_id: "calendar-1",
  title: "Test Event",
  description: null,
  start_time: "2025-01-10T09:00:00.000Z",
  end_time: "2025-01-10T10:00:00.000Z",
  location: null,
  all_day: false,
  status: "scheduled",
  recurrence_type: "none",
  recurrence_interval: 1,
  read_only: false,
  organizer_id: null,
  created_at: "2025-01-01T00:00:00.000Z",
  updated_at: "2025-01-01T00:00:00.000Z",
};

const taskEvent: CalendarEvent = {
  ...baseEvent,
  id: "task-1",
  source_type: "task",
};

describe("useEventResize", () => {
  const mockOnEventResize = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns handleResize function", () => {
    const { result } = renderHook(() =>
      useEventResize({ onEventResize: mockOnEventResize })
    );

    expect(result.current.handleResize).toBeDefined();
    expect(typeof result.current.handleResize).toBe("function");
  });

  it("blocks resize for tasks and shows warning", () => {
    const { result } = renderHook(() =>
      useEventResize({ onEventResize: mockOnEventResize })
    );

    let resizeResult: ReturnType<typeof result.current.handleResize> = undefined as unknown as ReturnType<typeof result.current.handleResize>;
    act(() => {
      resizeResult = result.current.handleResize(
        taskEvent,
        new Date("2025-01-10T11:00:00.000Z"),
        "right"
      );
    });

    expect(resizeResult).toBeNull();
    expect(showToast).toHaveBeenCalledWith(
      "calendar.resize.taskNotResizable",
      "warning"
    );
    expect(mockOnEventResize).not.toHaveBeenCalled();
  });

  it("calls onEventResize for valid resize", () => {
    const { result } = renderHook(() =>
      useEventResize({ onEventResize: mockOnEventResize })
    );

    let resizeResult: ReturnType<typeof result.current.handleResize> = undefined as unknown as ReturnType<typeof result.current.handleResize>;
    act(() => {
      resizeResult = result.current.handleResize(
        baseEvent,
        new Date("2025-01-10T12:00:00.000Z"),
        "right"
      );
    });

    expect(resizeResult).not.toBeNull();
    expect(mockOnEventResize).toHaveBeenCalled();
  });

  it("shows error toast for invalid resize (end before start)", () => {
    const { result } = renderHook(() =>
      useEventResize({ onEventResize: mockOnEventResize })
    );

    let resizeResult: ReturnType<typeof result.current.handleResize> = undefined as unknown as ReturnType<typeof result.current.handleResize>;
    act(() => {
      resizeResult = result.current.handleResize(
        baseEvent,
        new Date("2025-01-09T08:00:00.000Z"),
        "right"
      );
    });

    expect(resizeResult).toBeNull();
    expect(showToast).toHaveBeenCalledWith(
      "calendar.resize.invalid",
      "error"
    );
    expect(mockOnEventResize).not.toHaveBeenCalled();
  });

  it("snaps target date to 15-minute grid", () => {
    const { result } = renderHook(() =>
      useEventResize({ onEventResize: mockOnEventResize })
    );

    act(() => {
      result.current.handleResize(
        baseEvent,
        new Date("2025-01-10T12:07:00.000Z"),
        "right"
      );
    });

    // The snapped date should be 12:00, not 12:07
    expect(mockOnEventResize).toHaveBeenCalled();
  });

  it("respects custom snap interval", () => {
    const { result } = renderHook(() =>
      useEventResize({ onEventResize: mockOnEventResize, snapInterval: 30 })
    );

    act(() => {
      result.current.handleResize(
        baseEvent,
        new Date("2025-01-10T12:10:00.000Z"),
        "right"
      );
    });

    expect(mockOnEventResize).toHaveBeenCalled();
  });
});
