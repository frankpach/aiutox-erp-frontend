/**
 * Utilities for calendar event drag and resize behavior.
 */

import type { CalendarEvent } from "~/features/calendar/types/calendar.types";

export function buildMovedEventTimes(
  event: CalendarEvent,
  targetDate: Date,
  preserveTime: boolean = true
): { start_time: string; end_time: string } {
  const originalStart = new Date(event.start_time);
  const originalEnd = new Date(event.end_time);
  const duration = originalEnd.getTime() - originalStart.getTime();

  const newStart = new Date(targetDate);
  if (!event.all_day && preserveTime) {
    newStart.setHours(
      originalStart.getHours(),
      originalStart.getMinutes(),
      originalStart.getSeconds(),
      originalStart.getMilliseconds()
    );
  } else if (event.all_day) {
    newStart.setHours(0, 0, 0, 0);
  }

  const newEnd = new Date(newStart.getTime() + duration);

  return {
    start_time: newStart.toISOString(),
    end_time: newEnd.toISOString(),
  };
}

export function buildResizedEventTimes(
  event: CalendarEvent,
  targetDate: Date,
  preserveTime: boolean = true
): { end_time: string } | null {
  const newEnd = new Date(targetDate);
  const originalEnd = new Date(event.end_time);

  if (!event.all_day && preserveTime) {
    newEnd.setHours(
      originalEnd.getHours(),
      originalEnd.getMinutes(),
      originalEnd.getSeconds(),
      originalEnd.getMilliseconds()
    );
  }

  if (newEnd.getTime() <= new Date(event.start_time).getTime()) {
    return null;
  }

  return { end_time: newEnd.toISOString() };
}
