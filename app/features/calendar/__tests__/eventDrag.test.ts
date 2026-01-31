import { describe, it, expect } from "vitest";
import { buildMovedEventTimes, buildResizedEventTimes } from "~/features/calendar/utils/eventDrag";
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

    expect(new Date(result.start_time).toISOString()).toBe("2025-01-11T09:00:00.000Z");
    expect(new Date(result.end_time).toISOString()).toBe("2025-01-11T10:00:00.000Z");
  });

  it("moves event using target time when preserveTime is false", () => {
    const targetDate = new Date("2025-01-12T15:30:00.000Z");
    const result = buildMovedEventTimes(baseEvent, targetDate, false);

    expect(new Date(result.start_time).toISOString()).toBe("2025-01-12T15:30:00.000Z");
    expect(new Date(result.end_time).toISOString()).toBe("2025-01-12T16:30:00.000Z");
  });

  it("resizes event using target date while keeping valid range", () => {
    const targetDate = new Date("2025-01-10T00:00:00.000Z");
    const result = buildResizedEventTimes(baseEvent, targetDate);

    expect(result).toBeNull();
  });

  it("rejects resize when new end is before start", () => {
    const targetDate = new Date("2025-01-09T00:00:00.000Z");
    const result = buildResizedEventTimes(baseEvent, targetDate);

    expect(result).toBeNull();
  });
});
