/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { DndContext } from "@dnd-kit/core";
import { ResizeHandle } from "~/features/calendar/components/ResizeHandle";
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

describe("ResizeHandle", () => {
  const renderWithDndContext = (component: React.ReactElement) => {
    return render(
      <DndContext>
        {component}
      </DndContext>
    );
  };

  it("renders left resize handle", () => {
    renderWithDndContext(
      <ResizeHandle 
        event={mockEvent} 
        direction="left" 
        textColor="#FFFFFF" 
      />
    );

    const handle = screen.getByRole("button", { name: "Redimensionar inicio del evento" });
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute("aria-label", "Redimensionar inicio del evento");
    
    // Check for the left arrow
    const arrow = screen.getByText("◀");
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveStyle({ color: "#FFFFFF" });
  });

  it("renders right resize handle", () => {
    renderWithDndContext(
      <ResizeHandle 
        event={mockEvent} 
        direction="right" 
        textColor="#FFFFFF" 
      />
    );

    const handle = screen.getByRole("button", { name: "Redimensionar fin del evento" });
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute("aria-label", "Redimensionar fin del evento");
    
    // Check for the right arrow
    const arrow = screen.getByText("▶");
    expect(arrow).toBeInTheDocument();
    expect(arrow).toHaveStyle({ color: "#FFFFFF" });
  });

  it("has correct CSS classes for opacity transitions", () => {
    renderWithDndContext(
      <ResizeHandle 
        event={mockEvent} 
        direction="left" 
        textColor="#FFFFFF" 
      />
    );

    const handle = screen.getByRole("button");
    expect(handle).toHaveClass(
      "resize-handle",
      "absolute",
      "top-1/2",
      "-translate-y-1/2",
      "z-10",
      "flex",
      "items-center",
      "justify-center",
      "w-4",
      "h-4",
      "cursor-ew-resize",
      "opacity-0",
      "transition-opacity",
      "duration-150",
      "select-none"
    );
  });

  it("has correct draggable data attributes", () => {
    renderWithDndContext(
      <ResizeHandle 
        event={mockEvent} 
        direction="left" 
        textColor="#FFFFFF" 
      />
    );

    // Component uses useDraggable which spreads attributes/listeners
    // Verify the handle has the aria-label and role attributes
    const handle = screen.getByRole("button");
    expect(handle).toHaveAttribute("aria-label", "Redimensionar inicio del evento");
  });

  it("is accessible with keyboard", () => {
    renderWithDndContext(
      <ResizeHandle 
        event={mockEvent} 
        direction="left" 
        textColor="#FFFFFF" 
      />
    );

    const handle = screen.getByRole("button");
    // tabIndex is set as number 0 on the element
    expect(handle.tabIndex).toBe(0);
  });
});
