/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import {
  validateEventDates,
  buildResizedEventTimesWithValidation,
  canResizeEvent,
  getMinimumEventDuration,
  validateEventDuration,
} from "~/features/calendar/utils/eventValidation";
import type { CalendarEvent } from "~/features/calendar/types/calendar.types";

// Mock event data
const mockEvent: CalendarEvent = {
  id: "test-event-id",
  tenant_id: "test-tenant-id",
  calendar_id: "test-calendar-id",
  title: "Test Event",
  start_time: "2024-01-01T10:00:00Z",
  end_time: "2024-01-01T11:00:00Z",
  all_day: false,
  status: "todo",
  recurrence_type: "none",
  recurrence_interval: 1,
  source_type: "event",
  read_only: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const mockTask: CalendarEvent = {
  ...mockEvent,
  source_type: "task",
  metadata: { activity_type: "task" },
};

const mockReadOnlyEvent: CalendarEvent = {
  ...mockEvent,
  read_only: true,
};

describe("eventValidation utils", () => {
  describe("validateEventDates", () => {
    it("returns null for valid dates", () => {
      const result = validateEventDates(mockEvent);
      expect(result).toBeNull();
    });

    it("returns error message when start_time equals end_time", () => {
      const invalidEvent = {
        ...mockEvent,
        start_time: "2024-01-01T10:00:00Z",
        end_time: "2024-01-01T10:00:00Z",
      };
      const result = validateEventDates(invalidEvent);
      expect(result).toBe("La fecha de inicio debe ser menor o igual a la fecha de fin");
    });

    it("returns error message when start_time is after end_time", () => {
      const invalidEvent = {
        ...mockEvent,
        start_time: "2024-01-01T11:00:00Z",
        end_time: "2024-01-01T10:00:00Z",
      };
      const result = validateEventDates(invalidEvent);
      expect(result).toBe("La fecha de inicio debe ser menor o igual a la fecha de fin");
    });
  });

  describe("buildResizedEventTimesWithValidation", () => {
    it("updates start_time for left resize", () => {
      const targetDate = new Date("2024-01-01T10:00:00Z");
      const result = buildResizedEventTimesWithValidation(
        mockEvent,
        targetDate,
        "left",
        true
      );
      
      expect(result).toEqual({
        start_time: "2024-01-01T10:00:00.000Z",
      });
    });

    it("updates end_time for right resize", () => {
      const targetDate = new Date("2024-01-01T11:00:00Z");
      const result = buildResizedEventTimesWithValidation(
        mockEvent,
        targetDate,
        "right",
        true
      );
      
      expect(result).toEqual({
        end_time: "2024-01-01T11:00:00.000Z",
      });
    });

    it("preserves time when preserveTime is true", () => {
      const targetDate = new Date("2024-01-01T10:00:00Z");
      const result = buildResizedEventTimesWithValidation(
        mockEvent,
        targetDate,
        "left",
        true
      );
      
      expect(result?.start_time).toBe("2024-01-01T10:00:00.000Z");
    });

    it("does not preserve time when preserveTime is false", () => {
      const targetDate = new Date("2024-01-01T09:30:00Z");
      const result = buildResizedEventTimesWithValidation(
        mockEvent,
        targetDate,
        "left",
        false
      );
      
      expect(result?.start_time).toBe("2024-01-01T09:30:00.000Z");
    });

    it("returns null when validation fails", () => {
      // Create a scenario where validation would fail
      const targetDate = new Date("2024-01-01T12:00:00Z"); // After end time
      const result = buildResizedEventTimesWithValidation(
        mockEvent,
        targetDate,
        "left",
        true
      );
      
      expect(result).toBeNull();
    });

    it("handles all-day events correctly", () => {
      const allDayEvent = {
        ...mockEvent,
        all_day: true,
        start_time: "2024-01-01T00:00:00Z",
        end_time: "2024-01-01T23:59:59Z",
      };
      const targetDate = new Date("2024-01-01T00:00:00Z");
      const result = buildResizedEventTimesWithValidation(
        allDayEvent,
        targetDate,
        "left",
        true
      );
      
      expect(result?.start_time).toBe("2024-01-01T00:00:00.000Z");
    });
  });

  describe("canResizeEvent", () => {
    it("returns true for regular events", () => {
      expect(canResizeEvent(mockEvent)).toBe(true);
    });

    it("returns false for tasks", () => {
      expect(canResizeEvent(mockTask)).toBe(false);
    });

    it("returns false for read-only events", () => {
      expect(canResizeEvent(mockReadOnlyEvent)).toBe(false);
    });

    it("returns true for all-day events", () => {
      const allDayEvent = { ...mockEvent, all_day: true };
      expect(canResizeEvent(allDayEvent)).toBe(true);
    });

    it("returns true for events with activity_type 'event'", () => {
      const eventWithMetadata = {
        ...mockEvent,
        metadata: { activity_type: "event" },
      };
      expect(canResizeEvent(eventWithMetadata)).toBe(true);
    });
  });

  describe("getMinimumEventDuration", () => {
    it("returns 15 minutes in milliseconds", () => {
      const result = getMinimumEventDuration(mockEvent);
      expect(result).toBe(15 * 60 * 1000); // 15 minutes
    });
  });

  describe("validateEventDuration", () => {
    it("returns null for valid duration", () => {
      const result = validateEventDuration(mockEvent);
      expect(result).toBeNull();
    });

    it("returns null for exactly 15 minutes", () => {
      const event = {
        ...mockEvent,
        start_time: "2024-01-01T10:00:00Z",
        end_time: "2024-01-01T10:15:00Z",
      };
      const result = validateEventDuration(event);
      expect(result).toBeNull();
    });

    it("returns error for less than 15 minutes", () => {
      const event = {
        ...mockEvent,
        start_time: "2024-01-01T10:00:00Z",
        end_time: "2024-01-01T10:10:00Z",
      };
      const result = validateEventDuration(event);
      expect(result).toBe("La duración mínima del evento es de 15 minutos");
    });

    it("validates with custom times", () => {
      const result = validateEventDuration(
        mockEvent,
        "2024-01-01T10:00:00Z",
        "2024-01-01T10:05:00Z"
      );
      expect(result).toBe("La duración mínima del evento es de 15 minutos");
    });
  });
});
