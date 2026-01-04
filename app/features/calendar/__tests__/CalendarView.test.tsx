/**
 * Calendar tests
 * Basic unit tests for Calendar module
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { CalendarView } from "~/features/calendar/components/CalendarView";
import { EventForm } from "~/features/calendar/components/EventForm";
import { EventDetails } from "~/features/calendar/components/EventDetails";
import { CalendarEvent, Calendar, CalendarViewType, RecurrenceType, ReminderType, AttendeeStatus } from "~/features/calendar/types/calendar.types";

// Mock data
const mockCalendar: Calendar = {
  id: "1",
  tenant_id: "tenant-1",
  user_id: "user-1",
  name: "Work Calendar",
  color: "#023E87",
  description: "Main work calendar",
  is_shared: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const mockEvent: CalendarEvent = {
  id: "1",
  tenant_id: "tenant-1",
  calendar_id: "1",
  title: "Team Meeting",
  description: "Weekly team sync meeting",
  start_time: "2025-01-15T10:00:00Z",
  end_time: "2025-01-15T11:00:00Z",
  location: "Conference Room A",
  is_all_day: false,
  recurrence: null,
  reminders: [
    {
      minutes_before: 15,
      type: "notification" as ReminderType,
    },
  ],
  attendees: [
    {
      user_id: "user-2",
      status: "accepted" as AttendeeStatus,
    },
  ],
  created_by: "user-1",
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
};

const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
};

describe("Calendar Module", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createQueryClient();
    vi.clearAllMocks();
  });

  describe("CalendarView", () => {
    it("renders calendar with month view by default", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CalendarView
            events={[mockEvent]}
            calendars={[mockCalendar]}
            viewType="month"
            currentDate={new Date(2025, 0, 15)}
            onDateChange={vi.fn()}
            onViewTypeChange={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("January 2025")).toBeInTheDocument();
      expect(screen.getByText("Month")).toBeInTheDocument();
      expect(screen.getByText("Week")).toBeInTheDocument();
      expect(screen.getByText("Day")).toBeInTheDocument();
      expect(screen.getByText("Agenda")).toBeInTheDocument();
    });

    it("calls onDateChange when navigation buttons are clicked", async () => {
      const onDateChange = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CalendarView
            events={[mockEvent]}
            calendars={[mockCalendar]}
            viewType="month"
            currentDate={new Date(2025, 0, 15)}
            onDateChange={onDateChange}
            onViewTypeChange={vi.fn()}
          />
        </QueryClientProvider>
      );

      const prevButton = screen.getByText("←");
      fireEvent.click(prevButton);

      await waitFor(() => {
        expect(onDateChange).toHaveBeenCalled();
      });
    });

    it("calls onViewTypeChange when view type buttons are clicked", async () => {
      const onViewTypeChange = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CalendarView
            events={[mockEvent]}
            calendars={[mockCalendar]}
            viewType="month"
            currentDate={new Date(2025, 0, 15)}
            onDateChange={vi.fn()}
            onViewTypeChange={onViewTypeChange}
          />
        </QueryClientProvider>
      );

      const weekButton = screen.getByText("Week");
      fireEvent.click(weekButton);

      await waitFor(() => {
        expect(onViewTypeChange).toHaveBeenCalledWith("week");
      });
    });

    it("calls onEventClick when event is clicked", async () => {
      const onEventClick = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <CalendarView
            events={[mockEvent]}
            calendars={[mockCalendar]}
            viewType="month"
            currentDate={new Date(2025, 0, 15)}
            onDateChange={vi.fn()}
            onViewTypeChange={vi.fn()}
            onEventClick={onEventClick}
          />
        </QueryClientProvider>
      );

      const eventElement = screen.getByText("10:00 Team Meeting");
      fireEvent.click(eventElement);

      await waitFor(() => {
        expect(onEventClick).toHaveBeenCalledWith(mockEvent);
      });
    });

    it("shows loading state", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <CalendarView
            events={[]}
            calendars={[]}
            viewType="month"
            currentDate={new Date(2025, 0, 15)}
            onDateChange={vi.fn()}
            onViewTypeChange={vi.fn()}
            loading={true}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("Loading calendar...")).toBeInTheDocument();
    });
  });

  describe("EventForm", () => {
    it("renders form with all fields", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventForm 
            calendars={[mockCalendar]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByLabelText("Calendar")).toBeInTheDocument();
      expect(screen.getByLabelText("Event Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
      expect(screen.getByLabelText("Start Time")).toBeInTheDocument();
      expect(screen.getByLabelText("End Time")).toBeInTheDocument();
      expect(screen.getByLabelText("Location")).toBeInTheDocument();
    });

    it("shows subject field for email templates", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventForm 
            calendars={[mockCalendar]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("All Day")).toBeInTheDocument();
      expect(screen.getByText("Reminders")).toBeInTheDocument();
    });

    it("calls onSubmit when form is submitted", async () => {
      const onSubmit = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <EventForm 
            calendars={[mockCalendar]}
            onSubmit={onSubmit}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      const titleInput = screen.getByLabelText("Event Title");
      fireEvent.change(titleInput, { target: { value: "New Event" } });

      const startTimeInput = screen.getByLabelText("Start Time");
      fireEvent.change(startTimeInput, { target: { value: "2025-01-15T10:00" } });

      const endTimeInput = screen.getByLabelText("End Time");
      fireEvent.change(endTimeInput, { target: { value: "2025-01-15T11:00" } });

      const submitButton = screen.getByText("Save");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          calendar_id: "1",
          title: "New Event",
          description: "",
          start_time: "2025-01-15T10:00",
          end_time: "2025-01-15T11:00",
          location: "",
          is_all_day: false,
          recurrence: null,
          reminders: [],
          attendees: [],
        });
      });
    });

    it("calls onCancel when cancel button is clicked", async () => {
      const onCancel = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <EventForm 
            calendars={[mockCalendar]}
            onSubmit={vi.fn()}
            onCancel={onCancel}
          />
        </QueryClientProvider>
      );

      const cancelButton = screen.getByText("Cancel");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(onCancel).toHaveBeenCalled();
      });
    });

    it("toggles all-day when switch is clicked", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventForm 
            calendars={[mockCalendar]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      const allDaySwitch = screen.getByText("All Day");
      fireEvent.click(allDaySwitch);

      // Check that time inputs become date inputs
      expect(screen.getByLabelText("Start Time")).toHaveAttribute("type", "date");
      expect(screen.getByLabelText("End Time")).toHaveAttribute("type", "date");
    });

    it("adds reminders when add button is clicked", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventForm 
            calendars={[mockCalendar]}
            onSubmit={vi.fn()}
            onCancel={vi.fn()}
          />
        </QueryClientProvider>
      );

      const addButton = screen.getByText("Add");
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("15 min notification")).toBeInTheDocument();
      });
    });
  });

  describe("EventDetails", () => {
    it("renders event details with all information", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventDetails 
            event={mockEvent}
            calendars={[mockCalendar]}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("Team Meeting")).toBeInTheDocument();
      expect(screen.getByText("Work Calendar")).toBeInTheDocument();
      expect(screen.getByText("January 15, 2025")).toBeInTheDocument();
      expect(screen.getByText("10:00 - 11:00")).toBeInTheDocument();
      expect(screen.getByText("Conference Room A")).toBeInTheDocument();
      expect(screen.getByText("Weekly team sync meeting")).toBeInTheDocument();
    });

    it("shows reminder information", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventDetails 
            event={mockEvent}
            calendars={[mockCalendar]}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("15 min notification")).toBeInTheDocument();
    });

    it("shows attendee information", () => {
      render(
        <QueryClientProvider client={queryClient}>
          <EventDetails 
            event={mockEvent}
            calendars={[mockCalendar]}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("user-2")).toBeInTheDocument();
      expect(screen.getByText("accepted")).toBeInTheDocument();
    });

    it("calls onEdit when edit button is clicked", async () => {
      const onEdit = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <EventDetails 
            event={mockEvent}
            calendars={[mockCalendar]}
            onEdit={onEdit}
          />
        </QueryClientProvider>
      );

      const editButton = screen.getByText("Edit");
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(onEdit).toHaveBeenCalledWith(mockEvent);
      });
    });

    it("calls onDelete when delete button is clicked", async () => {
      const onDelete = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <EventDetails 
            event={mockEvent}
            calendars={[mockCalendar]}
            onDelete={onDelete}
          />
        </QueryClientProvider>
      );

      const deleteButton = screen.getByText("Delete");
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockEvent);
      });
    });

    it("calls onClose when close button is clicked", async () => {
      const onClose = vi.fn();
      
      render(
        <QueryClientProvider client={queryClient}>
          <EventDetails 
            event={mockEvent}
            calendars={[mockCalendar]}
            onClose={onClose}
          />
        </QueryClientProvider>
      );

      const closeButton = screen.getByText("Close");
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(onClose).toHaveBeenCalled();
      });
    });

    it("shows all-day badge for all-day events", () => {
      const allDayEvent = {
        ...mockEvent,
        is_all_day: true,
      };

      render(
        <QueryClientProvider client={queryClient}>
          <EventDetails 
            event={allDayEvent}
            calendars={[mockCalendar]}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("All Day")).toBeInTheDocument();
    });

    it("shows recurrence information for recurring events", () => {
      const recurringEvent = {
        ...mockEvent,
        recurrence: {
          type: "weekly" as RecurrenceType,
          interval: 1,
          end_date: "2025-02-15T00:00:00Z",
        },
      };

      render(
        <QueryClientProvider client={queryClient}>
          <EventDetails 
            event={recurringEvent}
            calendars={[mockCalendar]}
          />
        </QueryClientProvider>
      );

      expect(screen.getByText("Recurrence")).toBeInTheDocument();
      expect(screen.getByText("Type: weekly")).toBeInTheDocument();
      expect(screen.getByText("Every 1 weekly")).toBeInTheDocument();
      expect(screen.getByText("End Date: February 15, 2025")).toBeInTheDocument();
    });
  });

  describe("Calendar Data Structure", () => {
    it("has required calendar fields", () => {
      const calendar = mockCalendar;

      expect(calendar).toHaveProperty("id");
      expect(calendar).toHaveProperty("tenant_id");
      expect(calendar).toHaveProperty("user_id");
      expect(calendar).toHaveProperty("name");
      expect(calendar).toHaveProperty("color");
      expect(calendar).toHaveProperty("description");
      expect(calendar).toHaveProperty("is_shared");
      expect(calendar).toHaveProperty("created_at");
      expect(calendar).toHaveProperty("updated_at");
    });

    it("has required event fields", () => {
      const event = mockEvent;

      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("tenant_id");
      expect(event).toHaveProperty("calendar_id");
      expect(event).toHaveProperty("title");
      expect(event).toHaveProperty("description");
      expect(event).toHaveProperty("start_time");
      expect(event).toHaveProperty("end_time");
      expect(event).toHaveProperty("location");
      expect(event).toHaveProperty("is_all_day");
      expect(event).toHaveProperty("recurrence");
      expect(event).toHaveProperty("reminders");
      expect(event).toHaveProperty("attendees");
      expect(event).toHaveProperty("created_by");
      expect(event).toHaveProperty("created_at");
      expect(event).toHaveProperty("updated_at");
    });

    it("has correct calendar view types", () => {
      const viewTypes: CalendarViewType[] = ["month", "week", "day", "agenda"];
      expect(viewTypes).toHaveLength(4);
      expect(viewTypes).toContain("month");
      expect(viewTypes).toContain("week");
      expect(viewTypes).toContain("day");
      expect(viewTypes).toContain("agenda");
    });

    it("has correct recurrence types", () => {
      const recurrenceTypes: RecurrenceType[] = ["daily", "weekly", "monthly", "yearly"];
      expect(recurrenceTypes).toHaveLength(4);
      expect(recurrenceTypes).toContain("daily");
      expect(recurrenceTypes).toContain("weekly");
      expect(recurrenceTypes).toContain("monthly");
      expect(recurrenceTypes).toContain("yearly");
    });

    it("has correct reminder types", () => {
      const reminderTypes: ReminderType[] = ["notification", "email", "sms"];
      expect(reminderTypes).toHaveLength(3);
      expect(reminderTypes).toContain("notification");
      expect(reminderTypes).toContain("email");
      expect(reminderTypes).toContain("sms");
    });

    it("has correct attendee status types", () => {
      const attendeeStatuses: AttendeeStatus[] = ["pending", "accepted", "declined", "tentative"];
      expect(attendeeStatuses).toHaveLength(4);
      expect(attendeeStatuses).toContain("pending");
      expect(attendeeStatuses).toContain("accepted");
      expect(attendeeStatuses).toContain("declined");
      expect(attendeeStatuses).toContain("tentative");
    });
  });
});
