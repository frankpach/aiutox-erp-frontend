/**
 * Tests for EventQuickEdit component
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EventQuickEdit } from "~/features/calendar/components/EventQuickEdit";
import type { CalendarEvent } from "~/features/calendar/types/calendar.types";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "calendar.quickEdit.title": "Quick Edit",
        "calendar.quickEdit.openFull": "Edit full",
        "calendar.events.title": "Title",
        "calendar.events.start": "Start",
        "calendar.events.end": "End",
        "calendar.events.description": "Description",
        "common.cancel": "Cancel",
        "common.save": "Save",
      };
      return translations[key] || key;
    },
    language: "en",
  }),
}));

const baseEvent: CalendarEvent = {
  id: "event-1",
  tenant_id: "tenant-1",
  calendar_id: "calendar-1",
  title: "Test Event",
  description: "Test description",
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

describe("EventQuickEdit", () => {
  const mockOnSave = vi.fn();
  const mockOnOpenFull = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders popover content when open", () => {
    render(
      <EventQuickEdit
        event={baseEvent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
        onOpenFull={mockOnOpenFull}
      >
        <button>Trigger</button>
      </EventQuickEdit>
    );

    expect(screen.getByText("Quick Edit")).toBeInTheDocument();
    expect(screen.getByText("Edit full")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test Event")).toBeInTheDocument();
  });

  it("calls onOpenFull when 'Edit full' button is clicked", () => {
    render(
      <EventQuickEdit
        event={baseEvent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
        onOpenFull={mockOnOpenFull}
      >
        <button>Trigger</button>
      </EventQuickEdit>
    );

    fireEvent.click(screen.getByText("Edit full"));
    expect(mockOnOpenFull).toHaveBeenCalledTimes(1);
  });

  it("calls onOpenChange(false) when Cancel is clicked", () => {
    render(
      <EventQuickEdit
        event={baseEvent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
        onOpenFull={mockOnOpenFull}
      >
        <button>Trigger</button>
      </EventQuickEdit>
    );

    fireEvent.click(screen.getByText("Cancel"));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onSave with form data on submit", () => {
    render(
      <EventQuickEdit
        event={baseEvent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
        onOpenFull={mockOnOpenFull}
      >
        <button>Trigger</button>
      </EventQuickEdit>
    );

    // Change title
    const titleInput = screen.getByDisplayValue("Test Event");
    fireEvent.change(titleInput, { target: { value: "Updated Event" } });

    // Submit
    fireEvent.click(screen.getByText("Save"));
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Updated Event",
      })
    );
  });

  it("disables save button when title is empty", () => {
    render(
      <EventQuickEdit
        event={baseEvent}
        open={true}
        onOpenChange={mockOnOpenChange}
        onSave={mockOnSave}
        onOpenFull={mockOnOpenFull}
      >
        <button>Trigger</button>
      </EventQuickEdit>
    );

    const titleInput = screen.getByDisplayValue("Test Event");
    fireEvent.change(titleInput, { target: { value: "" } });

    const saveButton = screen.getByText("Save");
    expect(saveButton).toBeDisabled();
  });
});
