/**
 * RecurrenceEditor tests
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { RecurrenceEditor, type RecurrenceConfig } from "~/features/calendar/components/RecurrenceEditor";
import { calculateNextOccurrences, formatRecurrence } from "~/features/calendar/utils/recurrence";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "calendar.recurrence.title": "Recurrence",
        "calendar.recurrence.type": "Recurrence type",
        "calendar.recurrence.none": "Does not repeat",
        "calendar.recurrence.daily": "Daily",
        "calendar.recurrence.weekly": "Weekly",
        "calendar.recurrence.monthly": "Monthly",
        "calendar.recurrence.yearly": "Yearly",
        "calendar.recurrence.interval": "Repeat every",
        "calendar.recurrence.days": "days",
        "calendar.recurrence.weeks": "weeks",
        "calendar.recurrence.months": "months",
        "calendar.recurrence.years": "years",
        "calendar.recurrence.endsOn": "Ends on",
        "calendar.recurrence.noEndDate": "No end date",
        "calendar.recurrence.preview": "Next occurrences",
        "calendar.recurrence.andMore": "... and more",
        "calendar.recurrence.on": "on",
        "calendar.recurrence.and": "and",
        "calendar.recurrence.until": "until",
        "calendar.weekdays.sun": "Sun",
        "calendar.weekdays.mon": "Mon",
        "calendar.weekdays.tue": "Tue",
        "calendar.weekdays.wed": "Wed",
        "calendar.weekdays.thu": "Thu",
        "calendar.weekdays.fri": "Fri",
        "calendar.weekdays.sat": "Sat",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock date-fns
vi.mock("date-fns", () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr === "PPP") {
      return date.toLocaleDateString();
    }
    return date.toString();
  },
  addDays: (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },
  addWeeks: (date: Date, weeks: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
  },
  addMonths: (date: Date, months: number) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  },
  addYears: (date: Date, years: number) => {
    const result = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  },
  startOfDay: (date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  },
  isSameDay: (date1: Date, date2: Date) => {
    return date1.toDateString() === date2.toDateString();
  },
  isBefore: (date1: Date, date2: Date) => {
    return date1 < date2;
  },
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const testQueryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={testQueryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe("RecurrenceEditor", () => {
  let onChange: (config: RecurrenceConfig | null) => void;

  beforeEach(() => {
    onChange = vi.fn() as unknown as (config: RecurrenceConfig | null) => void;
  });

  it("renders correctly with no recurrence", () => {
    renderWithQueryClient(
      <RecurrenceEditor value={null} onChange={onChange} />
    );

    expect(screen.getByText("Recurrence")).toBeInTheDocument();
    expect(screen.getByText("Does not repeat")).toBeInTheDocument();
  });

  it("renders correctly with daily recurrence", () => {
    const config: RecurrenceConfig = {
      type: "daily",
      interval: 1,
    };

    renderWithQueryClient(
      <RecurrenceEditor value={config} onChange={onChange} />
    );

    expect(screen.getAllByText("Daily")).toHaveLength(2);
    expect(screen.getByDisplayValue("1")).toBeInTheDocument();
    expect(screen.getByText("days")).toBeInTheDocument();
  });

  it("renders correctly with weekly recurrence and selected days", () => {
    const config: RecurrenceConfig = {
      type: "weekly",
      interval: 2,
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    };

    renderWithQueryClient(
      <RecurrenceEditor value={config} onChange={onChange} />
    );

    expect(screen.getByText("Weekly")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2")).toBeInTheDocument();
    expect(screen.getByText("weeks")).toBeInTheDocument();
    
    // Check that checkboxes are checked for selected days
    expect(screen.getByLabelText("Mon")).toBeChecked();
    expect(screen.getByLabelText("Wed")).toBeChecked();
    expect(screen.getByLabelText("Fri")).toBeChecked();
    expect(screen.getByLabelText("Tue")).not.toBeChecked();
  });

  it("calls onChange when type is changed", async () => {
    renderWithQueryClient(
      <RecurrenceEditor value={null} onChange={onChange} />
    );

    const typeSelect = screen.getByRole("combobox");
    fireEvent.click(typeSelect);
    
    const dailyOption = screen.getByText("Daily");
    fireEvent.click(dailyOption);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "daily",
          interval: 1,
        })
      );
    });
  });

  it("calls onChange when interval is changed", async () => {
    const config: RecurrenceConfig = {
      type: "daily",
      interval: 1,
    };

    renderWithQueryClient(
      <RecurrenceEditor value={config} onChange={onChange} />
    );

    const intervalInput = screen.getByDisplayValue("1");
    fireEvent.change(intervalInput, { target: { value: "3" } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "daily",
          interval: 3,
        })
      );
    });
  });

  it("calls onChange when day is toggled for weekly recurrence", async () => {
    const config: RecurrenceConfig = {
      type: "weekly",
      interval: 1,
      daysOfWeek: [1], // Mon only
    };

    renderWithQueryClient(
      <RecurrenceEditor value={config} onChange={onChange} />
    );

    const wedCheckbox = screen.getByLabelText("Wed");
    fireEvent.click(wedCheckbox);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "weekly",
          interval: 1,
          daysOfWeek: [1, 3], // Mon, Wed
        })
      );
    });
  });

  it("calls onChange when type is set to none", async () => {
    const config: RecurrenceConfig = {
      type: "daily",
      interval: 1,
    };

    renderWithQueryClient(
      <RecurrenceEditor value={config} onChange={onChange} />
    );

    const typeSelect = screen.getByRole("combobox");
    fireEvent.click(typeSelect);
    
    const noneOption = screen.getByText("Does not repeat");
    fireEvent.click(noneOption);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  it("shows preview for daily recurrence", () => {
    const startDate = new Date("2024-01-01");
    const config: RecurrenceConfig = {
      type: "daily",
      interval: 1,
    };

    renderWithQueryClient(
      <RecurrenceEditor value={config} onChange={onChange} startDate={startDate} />
    );

    expect(screen.getByText("Next occurrences")).toBeInTheDocument();
    // Should show 5 occurrences
    expect(screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/)).toHaveLength(5);
  });

  it("shows human-readable description", () => {
    const config: RecurrenceConfig = {
      type: "weekly",
      interval: 1,
      daysOfWeek: [1, 3, 5],
    };

    renderWithQueryClient(
      <RecurrenceEditor value={config} onChange={onChange} />
    );

    // The description should be visible
    expect(screen.getByText(/Weekly on Mon, Wed and Fri/)).toBeInTheDocument();
  });
});

describe("recurrence utils", () => {
  it("calculates daily occurrences correctly", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const config: RecurrenceConfig = {
      type: "daily",
      interval: 1,
    };

    const occurrences = calculateNextOccurrences(startDate, config, 3);

    expect(occurrences).toHaveLength(3);
    // Each occurrence is exactly 1 day apart (timezone-independent check)
    expect(occurrences[1]!.getTime() - occurrences[0]!.getTime()).toBe(24 * 60 * 60 * 1000);
    expect(occurrences[2]!.getTime() - occurrences[1]!.getTime()).toBe(24 * 60 * 60 * 1000);
  });

  it("calculates weekly occurrences correctly", () => {
    const startDate = new Date("2024-01-01T00:00:00Z"); // Monday
    const config: RecurrenceConfig = {
      type: "weekly",
      interval: 1,
    };

    const occurrences = calculateNextOccurrences(startDate, config, 2);

    expect(occurrences).toHaveLength(2);
    // Second occurrence is exactly 7 days after the first
    expect(occurrences[1]!.getTime() - occurrences[0]!.getTime()).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it("respects end date", () => {
    const startDate = new Date("2024-01-01T00:00:00Z");
    const endDate = new Date("2024-01-05T00:00:00Z");
    const config: RecurrenceConfig = {
      type: "daily",
      interval: 1,
      endDate,
    };

    const occurrences = calculateNextOccurrences(startDate, config, 10);

    expect(occurrences).toHaveLength(5);
    // Each occurrence is 1 day apart
    for (let i = 1; i < occurrences.length; i++) {
      expect(occurrences[i]!.getTime() - occurrences[i - 1]!.getTime()).toBe(24 * 60 * 60 * 1000);
    }
    // Last occurrence is 4 days after the first
    expect(occurrences[4]!.getTime() - occurrences[0]!.getTime()).toBe(4 * 24 * 60 * 60 * 1000);
  });

  it("formats recurrence correctly", () => {
    const mockT = (key: string) => key;
    
    const dailyConfig: RecurrenceConfig = {
      type: "daily",
      interval: 1,
    };
    
    const weeklyConfig: RecurrenceConfig = {
      type: "weekly",
      interval: 2,
      daysOfWeek: [1, 3],
    };

    expect(formatRecurrence(dailyConfig, mockT)).toBe("calendar.recurrence.daily");
    expect(formatRecurrence(weeklyConfig, mockT)).toContain("calendar.recurrence.interval 2 calendar.recurrence.weeks");
  });
});
