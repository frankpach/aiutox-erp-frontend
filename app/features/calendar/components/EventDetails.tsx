/**
 * EventDetails component
 * Displays detailed information about a calendar event
 */

import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { CalendarEvent, Calendar } from "~/features/calendar/types/calendar.types";

interface EventDetailsProps {
  event: CalendarEvent;
  calendars: Calendar[];
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  onClose?: () => void;
}

export function EventDetails({ 
  event, 
  calendars, 
  onEdit, 
  onDelete, 
  onClose 
}: EventDetailsProps) {
  const { t } = useTranslation();
  const dateLocale = es;

  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find(c => c.id === calendarId);
    return calendar?.color || "#023E87";
  };

  const getCalendarName = (calendarId: string) => {
    const calendar = calendars.find(c => c.id === calendarId);
    return calendar?.name || "Unknown";
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP", { locale: dateLocale });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "PPP p", { locale: dateLocale });
  };

  const getReminderText = (minutesBefore: number) => {
    if (minutesBefore < 60) {
      return `${minutesBefore} min before`;
    } else if (minutesBefore < 1440) {
      const hours = Math.floor(minutesBefore / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} before`;
    } else {
      const days = Math.floor(minutesBefore / 1440);
      return `${days} day${days > 1 ? 's' : ''} before`;
    }
  };

  const getAttendeeStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "declined":
        return "bg-red-100 text-red-800 border-red-200";
      case "tentative":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: getCalendarColor(event.calendar_id) }}
          />
          <h2 className="text-xl font-bold">{event.title}</h2>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(event)}>
              {t("common.edit")}
            </Button>
          )}
          {onDelete && (
            <Button variant="outline" onClick={() => onDelete(event)} className="text-red-600 hover:text-red-700">
              {t("common.delete")}
            </Button>
          )}
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              {t("common.close")}
            </Button>
          )}
        </div>
      </div>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("calendar.events.details")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Calendar */}
          <div className="flex items-center space-x-2">
            <span className="font-medium">{t("calendar.events.calendar")}:</span>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCalendarColor(event.calendar_id) }}
              />
              <span>{getCalendarName(event.calendar_id)}</span>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="font-medium">{t("calendar.events.date")}:</span>
              <span>
                {event.is_all_day 
                  ? formatDate(event.start_time)
                  : formatDateTime(event.start_time)
                }
              </span>
            </div>
            {!event.is_all_day && (
              <div className="flex items-center space-x-2">
                <span className="font-medium">{t("calendar.events.time")}:</span>
                <span>
                  {formatTime(event.start_time)} - {formatTime(event.end_time)}
                </span>
              </div>
            )}
            {event.is_all_day && (
              <Badge variant="outline">
                {t("calendar.events.allDay")}
              </Badge>
            )}
          </div>

          {/* Location */}
          {event.location && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">{t("calendar.events.location")}:</span>
              <span>{event.location}</span>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-2">
              <span className="font-medium">{t("calendar.events.description")}:</span>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.description}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reminders */}
      {event.reminders && event.reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("calendar.events.reminders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.reminders.map((reminder, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge variant="outline">
                    {reminder.type}
                  </Badge>
                  <span>{getReminderText(reminder.minutes_before)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attendees */}
      {event.attendees && event.attendees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("calendar.events.attendees")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {event.attendees.map((attendee, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{attendee.user_id}</span>
                  <Badge 
                    variant="outline" 
                    className={getAttendeeStatusColor(attendee.status)}
                  >
                    {attendee.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recurrence */}
      {event.recurrence && (
        <Card>
          <CardHeader>
            <CardTitle>{t("calendar.events.recurrence")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Type:</span>
                <span className="capitalize">{event.recurrence.type}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Interval:</span>
                <span>Every {event.recurrence.interval} {event.recurrence.type}</span>
              </div>
              {event.recurrence.end_date && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">End Date:</span>
                  <span>{formatDate(event.recurrence.end_date)}</span>
                </div>
              )}
              {event.recurrence.count && (
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Count:</span>
                  <span>{event.recurrence.count} occurrences</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
