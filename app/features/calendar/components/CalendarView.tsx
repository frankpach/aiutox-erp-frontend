/**
 * CalendarView component
 * Main calendar component with month/week/day views
 */

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CalendarViewType, CalendarEvent, Calendar } from "~/features/calendar/types/calendar.types";

interface CalendarViewProps {
  events: CalendarEvent[];
  calendars: Calendar[];
  viewType: CalendarViewType;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewTypeChange: (type: CalendarViewType) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
  loading?: boolean;
}

export function CalendarView({ 
  events, 
  calendars, 
  viewType, 
  currentDate, 
  onDateChange, 
  onViewTypeChange, 
  onEventClick, 
  onEventCreate,
  loading 
}: CalendarViewProps) {
  const { t } = useTranslation();
  const dateLocale = es;

  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find(c => c.id === calendarId);
    return calendar?.color || "#023E87";
  };

  const navigateDate = (direction: "prev" | "next") => {
    let newDate: Date;
    
    switch (viewType) {
      case "month":
        newDate = direction === "prev" ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
        break;
      case "week":
        newDate = direction === "prev" ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1);
        break;
      case "day":
        newDate = direction === "prev" ? subDays(currentDate, 1) : addDays(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }
    
    onDateChange(newDate);
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div className="space-y-4">
        {/* Week headers */}
        <div className="grid grid-cols-7 gap-2">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
            <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayEvents = events.filter(event => 
              isSameDay(new Date(event.start_time), day)
            );
            
            return (
              <div
                key={day.toISOString()}
                className={`border rounded-md p-2 min-h-[80px] cursor-pointer hover:bg-muted/50 ${
                  !isSameMonth(day, currentDate) ? "bg-muted/30 text-muted-foreground" : ""
                }`}
                onClick={() => onEventCreate?.(day)}
              >
                <div className="text-sm font-medium mb-1">
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: getCalendarColor(event.calendar_id) + "20", color: getCalendarColor(event.calendar_id) }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      {format(new Date(event.start_time), "HH:mm")} {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-8 gap-2">
          {/* Time column */}
          <div className="text-center font-medium text-sm text-muted-foreground p-2">
            Time
          </div>
          
          {/* Day headers */}
          {days.map((day) => (
            <div key={day.toISOString()} className="text-center font-medium text-sm p-2">
              <div>{format(day, "EEE")}</div>
              <div className={isSameDay(day, currentDate) ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto" : ""}>
                {format(day, "d")}
              </div>
            </div>
          ))}
        </div>
        
        {/* Time slots */}
        <div className="space-y-1">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="grid grid-cols-8 gap-2">
              <div className="text-xs text-muted-foreground p-2 text-right">
                {hour.toString().padStart(2, "0")}:00
              </div>
              {days.map((day) => {
                const hourEvents = events.filter(event => {
                  const eventStart = new Date(event.start_time);
                  const eventEnd = new Date(event.end_time);
                  const slotStart = new Date(day);
                  slotStart.setHours(hour, 0, 0, 0);
                  const slotEnd = new Date(day);
                  slotEnd.setHours(hour + 1, 0, 0, 0);
                  
                  return eventStart < slotEnd && eventEnd > slotStart;
                });
                
                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className="border rounded p-1 min-h-[40px] cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      const slotDate = new Date(day);
                      slotDate.setHours(hour, 0, 0, 0);
                      onEventCreate?.(slotDate);
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                        style={{ backgroundColor: getCalendarColor(event.calendar_id) + "20", color: getCalendarColor(event.calendar_id) }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter(event => 
      isSameDay(new Date(event.start_time), currentDate)
    );

    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="flex gap-4">
              <div className="text-xs text-muted-foreground w-16 text-right">
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div className="flex-1 border rounded p-2 min-h-[40px] cursor-pointer hover:bg-muted/50">
                {dayEvents
                  .filter(event => {
                    const eventStart = new Date(event.start_time);
                    const eventEnd = new Date(event.end_time);
                    const slotStart = new Date(currentDate);
                    slotStart.setHours(hour, 0, 0, 0);
                    const slotEnd = new Date(currentDate);
                    slotEnd.setHours(hour + 1, 0, 0, 0);
                    
                    return eventStart < slotEnd && eventEnd > slotStart;
                  })
                  .map((event) => (
                    <div
                      key={event.id}
                      className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 mb-1"
                      style={{ backgroundColor: getCalendarColor(event.calendar_id) + "20", color: getCalendarColor(event.calendar_id) }}
                      onClick={() => onEventClick?.(event)}
                    >
                      {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")} {event.title}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const sortedEvents = [...events].sort((a, b) => 
      new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );

    return (
      <div className="space-y-4">
        {sortedEvents.map((event) => (
          <Card key={event.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEventClick?.(event)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getCalendarColor(event.calendar_id) }}
                  />
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.start_time), "PPP p", { locale: dateLocale })}
                    </div>
                    {event.location && (
                      <div className="text-sm text-muted-foreground">{event.location}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {format(new Date(event.start_time), "HH:mm")} - {format(new Date(event.end_time), "HH:mm")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary" />
            <span>{t("calendar.loading")}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigateDate("prev")}>
            ←
          </Button>
          <h2 className="text-xl font-bold">
            {format(currentDate, viewType === "day" ? "PPP" : "MMMM yyyy", { locale: dateLocale })}
          </h2>
          <Button variant="outline" onClick={() => navigateDate("next")}>
            →
          </Button>
          <Button variant="outline" onClick={() => onDateChange(new Date())}>
            {t("calendar.today")}
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewType === "month" ? "default" : "outline"}
            onClick={() => onViewTypeChange("month")}
          >
            {t("calendar.views.month")}
          </Button>
          <Button
            variant={viewType === "week" ? "default" : "outline"}
            onClick={() => onViewTypeChange("week")}
          >
            {t("calendar.views.week")}
          </Button>
          <Button
            variant={viewType === "day" ? "default" : "outline"}
            onClick={() => onViewTypeChange("day")}
          >
            {t("calendar.views.day")}
          </Button>
          <Button
            variant={viewType === "agenda" ? "default" : "outline"}
            onClick={() => onViewTypeChange("agenda")}
          >
            {t("calendar.views.agenda")}
          </Button>
        </div>
      </div>

      {/* Calendar content */}
      {viewType === "month" && renderMonthView()}
      {viewType === "week" && renderWeekView()}
      {viewType === "day" && renderDayView()}
      {viewType === "agenda" && renderAgendaView()}
    </div>
  );
}
