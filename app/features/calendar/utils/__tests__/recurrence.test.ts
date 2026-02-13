/**
 * Recurrence utils tests
 */

import { describe, it, expect } from "vitest";
import {
  calculateNextOccurrences,
  formatRecurrence,
  configToBackend,
  backendToConfig,
  validateRecurrence,
} from "~/features/calendar/utils/recurrence";
import type { RecurrenceConfig } from "~/features/calendar/components/RecurrenceEditor";

describe("recurrence utils", () => {
  describe("calculateNextOccurrences", () => {
    it("returns empty array for none type", () => {
      const startDate = new Date("2024-01-01");
      const config: RecurrenceConfig = {
        type: "none",
        interval: 1,
      };

      const result = calculateNextOccurrences(startDate, config);

      expect(result).toEqual([]);
    });

    it("calculates daily occurrences correctly", () => {
      const startDate = new Date("2024-01-01");
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 1,
      };

      const result = calculateNextOccurrences(startDate, config, 3);

      expect(result).toHaveLength(3);
      // Check that dates are consecutive days
      expect(result[1]!.getTime() - result[0]!.getTime()).toBe(24 * 60 * 60 * 1000);
      expect(result[2]!.getTime() - result[1]!.getTime()).toBe(24 * 60 * 60 * 1000);
    });

    it("calculates daily occurrences with interval", () => {
      const startDate = new Date("2024-01-01");
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 2,
      };

      const result = calculateNextOccurrences(startDate, config, 3);

      expect(result).toHaveLength(3);
      // Check 2-day intervals
      expect(result[1]!.getTime() - result[0]!.getTime()).toBe(2 * 24 * 60 * 60 * 1000);
      expect(result[2]!.getTime() - result[1]!.getTime()).toBe(2 * 24 * 60 * 60 * 1000);
    });

    it("calculates weekly occurrences correctly", () => {
      const startDate = new Date("2024-01-01"); // Monday
      const config: RecurrenceConfig = {
        type: "weekly",
        interval: 1,
      };

      const result = calculateNextOccurrences(startDate, config, 2);

      expect(result).toHaveLength(2);
      // Check 7-day interval
      expect(result[1]!.getTime() - result[0]!.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it("calculates monthly occurrences correctly", () => {
      const startDate = new Date("2024-01-15T00:00:00");
      const config: RecurrenceConfig = {
        type: "monthly",
        interval: 1,
      };

      const result = calculateNextOccurrences(startDate, config, 2);

      expect(result).toHaveLength(2);
      // Check that both are the 15th day (accounting for timezone)
      expect(result[0]!.getUTCDate()).toBe(15);
      expect(result[1]!.getUTCDate()).toBe(15);
      // Check that months are different
      expect(result[1]!.getUTCMonth()).toBe(result[0]!.getUTCMonth() + 1);
    });

    it("calculates yearly occurrences correctly", () => {
      const startDate = new Date("2024-01-15T00:00:00");
      const config: RecurrenceConfig = {
        type: "yearly",
        interval: 1,
      };

      const result = calculateNextOccurrences(startDate, config, 2);

      expect(result).toHaveLength(2);
      // Check that both are January 15th (accounting for timezone)
      expect(result[0]!.getUTCDate()).toBe(15);
      expect(result[0]!.getUTCMonth()).toBe(0); // January
      expect(result[1]!.getUTCDate()).toBe(15);
      expect(result[1]!.getUTCMonth()).toBe(0); // January
      // Check that years are different
      expect(result[1]!.getUTCFullYear()).toBe(result[0]!.getUTCFullYear() + 1);
    });

    it("respects end date", () => {
      const startDate = new Date("2024-01-01T00:00:00");
      const endDate = new Date("2024-01-05T00:00:00");
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 1,
        endDate,
      };

      const result = calculateNextOccurrences(startDate, config, 10);

      expect(result).toHaveLength(5);
      // Check that all dates are within range (accounting for timezone)
      expect(result[0]!.getTime()).toBeGreaterThanOrEqual(startDate.getTime() - 24 * 60 * 60 * 1000);
      expect(result[4]!.getTime()).toBeLessThanOrEqual(endDate.getTime() + 24 * 60 * 60 * 1000);
    });

    it("limits to specified number of occurrences", () => {
      const startDate = new Date("2024-01-01");
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 1,
      };

      const result = calculateNextOccurrences(startDate, config, 5);

      expect(result).toHaveLength(5);
    });
  });

  describe("formatRecurrence", () => {
    const mockT = (key: string) => key;

    it("formats none type correctly", () => {
      const config: RecurrenceConfig = {
        type: "none",
        interval: 1,
      };

      const result = formatRecurrence(config, mockT);

      expect(result).toBe("calendar.recurrence.none");
    });

    it("formats daily recurrence with interval 1", () => {
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 1,
      };

      const result = formatRecurrence(config, mockT);

      expect(result).toBe("calendar.recurrence.daily");
    });

    it("formats daily recurrence with interval > 1", () => {
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 3,
      };

      const result = formatRecurrence(config, mockT);

      expect(result).toBe("calendar.recurrence.interval 3 calendar.recurrence.days");
    });

    it("formats weekly recurrence with days", () => {
      const config: RecurrenceConfig = {
        type: "weekly",
        interval: 1,
        daysOfWeek: [1, 3, 5],
      };

      const result = formatRecurrence(config, mockT);

      expect(result).toContain("calendar.recurrence.weekly");
      expect(result).toContain("calendar.recurrence.on");
      expect(result).toContain("calendar.weekdays.mon");
      expect(result).toContain("calendar.weekdays.wed");
      expect(result).toContain("calendar.weekdays.fri");
    });

    it("formats recurrence with end date", () => {
      const mockT = (key: string) => key;
      
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 1,
        endDate: new Date("2024-12-31"),
      };

      const result = formatRecurrence(config, mockT);

      expect(result).toContain("calendar.recurrence.daily");
      expect(result).toContain("calendar.recurrence.until");
      // Check that it contains the date (format may vary)
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe("configToBackend", () => {
    it("converts none config correctly", () => {
      const config: RecurrenceConfig = {
        type: "none",
        interval: 1,
      };

      const result = configToBackend(config);

      expect(result).toEqual({
        recurrence_type: "none",
        recurrence_interval: 1,
      });
    });

    it("converts null config correctly", () => {
      const result = configToBackend(null);

      expect(result).toEqual({
        recurrence_type: "none",
        recurrence_interval: 1,
      });
    });

    it("converts daily config correctly", () => {
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 2,
        endDate: new Date("2024-12-31"),
      };

      const result = configToBackend(config);

      expect(result).toEqual({
        recurrence_type: "daily",
        recurrence_interval: 2,
        recurrence_end_date: "2024-12-31",
      });
    });

    it("converts weekly config with days correctly", () => {
      const config: RecurrenceConfig = {
        type: "weekly",
        interval: 1,
        daysOfWeek: [1, 3, 5],
      };

      const result = configToBackend(config);

      expect(result).toEqual({
        recurrence_type: "weekly",
        recurrence_interval: 1,
        recurrence_days_of_week: "1,3,5",
      });
    });
  });

  describe("backendToConfig", () => {
    it("converts none backend correctly", () => {
      const backend = {
        recurrence_type: "none",
        recurrence_interval: 1,
      };

      const result = backendToConfig(backend);

      expect(result).toBeNull();
    });

    it("converts daily backend correctly", () => {
      const backend = {
        recurrence_type: "daily",
        recurrence_interval: 2,
        recurrence_end_date: "2024-12-31",
      };

      const result = backendToConfig(backend);

      expect(result).toEqual({
        type: "daily",
        interval: 2,
        endDate: new Date("2024-12-31"),
      });
    });

    it("converts weekly backend with days correctly", () => {
      const backend = {
        recurrence_type: "weekly",
        recurrence_interval: 1,
        recurrence_days_of_week: "1,3,5",
      };

      const result = backendToConfig(backend);

      expect(result).toEqual({
        type: "weekly",
        interval: 1,
        daysOfWeek: [1, 3, 5],
      });
    });

    it("handles missing optional fields", () => {
      const backend = {
        recurrence_type: "daily",
        recurrence_interval: 1,
      };

      const result = backendToConfig(backend);

      expect(result).toEqual({
        type: "daily",
        interval: 1,
      });
    });
  });

  describe("validateRecurrence", () => {
    it("validates none type", () => {
      const config: RecurrenceConfig = {
        type: "none",
        interval: 1,
      };

      const result = validateRecurrence(config);

      expect(result).toBeNull();
    });

    it("validates valid daily config", () => {
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 1,
      };

      const result = validateRecurrence(config);

      expect(result).toBeNull();
    });

    it("rejects invalid interval", () => {
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 0,
      };

      const result = validateRecurrence(config);

      expect(result).toBe("Interval must be between 1 and 999");
    });

    it("rejects interval too large", () => {
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 1000,
      };

      const result = validateRecurrence(config);

      expect(result).toBe("Interval must be between 1 and 999");
    });

    it("rejects weekly without days", () => {
      const config: RecurrenceConfig = {
        type: "weekly",
        interval: 1,
        daysOfWeek: [],
      };

      const result = validateRecurrence(config);

      expect(result).toBe("Weekly recurrence must have at least one day selected");
    });

    it("rejects weekly with invalid day", () => {
      const config: RecurrenceConfig = {
        type: "weekly",
        interval: 1,
        daysOfWeek: [7], // Invalid day (should be 0-6)
      };

      const result = validateRecurrence(config);

      expect(result).toBe("Days of week must be between 0 and 6");
    });

    it("rejects past end date", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      
      const config: RecurrenceConfig = {
        type: "daily",
        interval: 1,
        endDate: pastDate,
      };

      const result = validateRecurrence(config);

      expect(result).toBe("End date must be in the future");
    });

    it("accepts valid weekly config", () => {
      const config: RecurrenceConfig = {
        type: "weekly",
        interval: 1,
        daysOfWeek: [1, 3, 5],
      };

      const result = validateRecurrence(config);

      expect(result).toBeNull();
    });
  });
});
