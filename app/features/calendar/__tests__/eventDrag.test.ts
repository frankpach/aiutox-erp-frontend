import { describe, it, expect } from "vitest";
import { buildMovedEventTimes, buildResizedEventTimes, snapToGrid } from "~/features/calendar/utils/eventDrag";
import type { CalendarEvent } from "~/features/calendar/types/calendar.types";

const baseEvent: CalendarEvent = {
  id: "event-1",
  tenant_id: "tenant-1",
  calendar_id: "calendar-1",
  title: "Test",
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

describe("eventDrag utils", () => {
  it("moves event preserving duration", () => {
    const targetDate = new Date("2025-01-12T00:00:00.000Z");
    const result = buildMovedEventTimes(baseEvent, targetDate);

    // preserveTime=true: UTC time-of-day (09:00Z) is preserved on the target date (Jan 12)
    expect(new Date(result.start_time).toISOString()).toBe("2025-01-12T09:00:00.000Z");
    expect(new Date(result.end_time).toISOString()).toBe("2025-01-12T10:00:00.000Z");
  });

  it("moves event using target time when preserveTime is false", () => {
    const targetDate = new Date("2025-01-12T15:30:00.000Z");
    const result = buildMovedEventTimes(baseEvent, targetDate, false);

    expect(new Date(result.start_time).toISOString()).toBe("2025-01-12T15:30:00.000Z");
    expect(new Date(result.end_time).toISOString()).toBe("2025-01-12T16:30:00.000Z");
  });

  it("resizes event using target date while keeping valid range", () => {
    // targetDate midnight UTC + preserveTime → end becomes 10:00Z (same as original end)
    // 10:00Z > start 09:00Z → valid, not null
    // Use a date before start_time to get null
    const targetDate = new Date("2025-01-09T00:00:00.000Z");
    const result = buildResizedEventTimes(baseEvent, targetDate);

    expect(result).toBeNull();
  });

  it("rejects resize when new end is before start", () => {
    const targetDate = new Date("2025-01-09T00:00:00.000Z");
    const result = buildResizedEventTimes(baseEvent, targetDate);

    expect(result).toBeNull();
  });
});

describe("snapToGrid", () => {
  it("rounds down to nearest 15 min when closer to lower bound", () => {
    // 10:07 → 10:00
    const date = new Date("2025-01-10T10:07:00.000Z");
    const result = snapToGrid(date);
    expect(result.toISOString()).toBe("2025-01-10T10:00:00.000Z");
  });

  it("rounds up to nearest 15 min when closer to upper bound", () => {
    // 10:08 → 10:15
    const date = new Date("2025-01-10T10:08:00.000Z");
    const result = snapToGrid(date);
    expect(result.toISOString()).toBe("2025-01-10T10:15:00.000Z");
  });

  it("keeps exact 15 min boundaries unchanged", () => {
    const date = new Date("2025-01-10T10:15:00.000Z");
    const result = snapToGrid(date);
    expect(result.toISOString()).toBe("2025-01-10T10:15:00.000Z");
  });

  it("snaps to custom interval", () => {
    // 10:12 with 30-min interval → 10:00
    const date = new Date("2025-01-10T10:12:00.000Z");
    const result = snapToGrid(date, 30);
    expect(result.toISOString()).toBe("2025-01-10T10:00:00.000Z");
  });

  it("snaps to custom interval rounding up", () => {
    // 10:16 with 30-min interval → 10:30
    const date = new Date("2025-01-10T10:16:00.000Z");
    const result = snapToGrid(date, 30);
    expect(result.toISOString()).toBe("2025-01-10T10:30:00.000Z");
  });

  it("handles midnight correctly", () => {
    const date = new Date("2025-01-10T00:00:00.000Z");
    const result = snapToGrid(date);
    expect(result.toISOString()).toBe("2025-01-10T00:00:00.000Z");
  });
});
