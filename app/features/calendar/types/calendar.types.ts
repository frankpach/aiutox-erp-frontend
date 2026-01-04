/**
 * Calendar types for AiutoX ERP
 * Based on docs/40-modules/calendar.md
 */

// Calendar types
export interface Calendar {
  id: string;
  tenant_id: string;
  user_id: string;
  name: string;
  color: string;
  description: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

// Calendar creation payload
export interface CalendarCreate {
  name: string;
  color: string;
  description?: string;
  is_shared?: boolean;
}

// Calendar update payload
export interface CalendarUpdate {
  name?: string;
  color?: string;
  description?: string;
  is_shared?: boolean;
}

// Calendar Event types
export interface CalendarEvent {
  id: string;
  tenant_id: string;
  calendar_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  location: string;
  is_all_day: boolean;
  recurrence: EventRecurrence | null;
  reminders: EventReminder[];
  attendees: EventAttendee[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Event creation payload
export interface EventCreate {
  calendar_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_all_day?: boolean;
  recurrence?: EventRecurrence | null;
  reminders?: EventReminder[];
  attendees?: EventAttendee[];
}

// Event update payload
export interface EventUpdate {
  title?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  location?: string;
  is_all_day?: boolean;
  recurrence?: EventRecurrence | null;
  reminders?: EventReminder[];
  attendees?: EventAttendee[];
}

// Event recurrence
export interface EventRecurrence {
  type: RecurrenceType;
  interval: number;
  end_date?: string;
  count?: number;
  days_of_week?: number[];
  day_of_month?: number;
}

// Recurrence types
export type RecurrenceType = 
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

// Event reminder
export interface EventReminder {
  id?: string;
  minutes_before: number;
  type: ReminderType;
}

// Reminder types
export type ReminderType = 
  | "notification"
  | "email"
  | "sms";

// Event attendee
export interface EventAttendee {
  id?: string;
  user_id: string;
  status: AttendeeStatus;
}

// Attendee status
export type AttendeeStatus = 
  | "pending"
  | "accepted"
  | "declined"
  | "tentative";

// Calendar list parameters
export interface CalendarListParams {
  page?: number;
  page_size?: number;
  user_id?: string;
  is_shared?: boolean;
}

// Event list parameters
export interface EventListParams {
  page?: number;
  page_size?: number;
  calendar_id?: string;
  start_date?: string;
  end_date?: string;
  user_id?: string;
}

// Event reminder creation payload
export interface EventReminderCreate {
  minutes_before: number;
  type: ReminderType;
}

// Event statistics
export interface CalendarStats {
  total_calendars: number;
  shared_calendars: number;
  total_events: number;
  upcoming_events: number;
  events_by_type: Record<string, number>;
}

// Calendar view types
export type CalendarViewType = 
  | "month"
  | "week"
  | "day"
  | "agenda";

// Calendar view configuration
export interface CalendarViewConfig {
  type: CalendarViewType;
  date: string;
  calendar_ids: string[];
  show_weekends: boolean;
  start_hour: number;
  end_hour: number;
}
