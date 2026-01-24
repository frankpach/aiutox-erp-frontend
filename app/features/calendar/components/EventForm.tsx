/**
 * EventForm component
 * Form for creating and editing calendar events
 */

import { useState } from "react";
import { format } from "date-fns";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import type {
  CalendarEvent,
  EventCreate,
  Calendar,
  ReminderType,
  EventReminderCreate,
} from "~/features/calendar/types/calendar.types";

interface EventFormProps {
  event?: CalendarEvent;
  calendars: Calendar[];
  initialDate?: Date;
  onSubmit: (payload: {
    event: EventCreate;
    reminders: EventReminderCreate[];
  }) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export function EventForm({
  event,
  calendars,
  initialDate,
  onSubmit,
  onCancel,
  loading = false,
}: EventFormProps) {
  const { t } = useTranslation();

  const initialStartTime = event
    ? event.all_day
      ? format(new Date(event.start_time), "yyyy-MM-dd")
      : event.start_time
    : format(initialDate || new Date(), "yyyy-MM-dd'T'HH:mm");
  const initialEndTime = event
    ? event.all_day
      ? format(new Date(event.end_time), "yyyy-MM-dd")
      : event.end_time
    : format(initialDate || new Date(), "yyyy-MM-dd'T'HH:mm");

  const [formData, setFormData] = useState<EventCreate>({
    calendar_id: event?.calendar_id || calendars[0]?.id || "",
    title: event?.title || "",
    description: event?.description || "",
    start_time: initialStartTime,
    end_time: initialEndTime,
    location: event?.location || "",
    all_day: event?.all_day || false,
    recurrence_type: event?.recurrence_type || "none",
    recurrence_interval: event?.recurrence_interval || 1,
  });

  const [reminders, setReminders] = useState<EventReminderCreate[]>([]);
  const [newReminder, setNewReminder] = useState<EventReminderCreate>({
    minutes_before: 15,
    reminder_type: "in_app" as ReminderType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizeAllDayTimestamp = (value: string, isEnd: boolean) => {
      if (!value) {
        return value;
      }

      const dateOnly = value.split("T")[0];
      return `${dateOnly}T${isEnd ? "23:59:59" : "00:00:00"}`;
    };

    const payload = formData.all_day
      ? {
          ...formData,
          start_time: normalizeAllDayTimestamp(formData.start_time, false),
          end_time: normalizeAllDayTimestamp(formData.end_time, true),
        }
      : formData;

    onSubmit({ event: payload, reminders });
  };

  const handleFieldChange = (
    field: keyof EventCreate,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addReminder = () => {
    setReminders((prev) => [...prev, newReminder]);
    setNewReminder({ minutes_before: 15, reminder_type: "in_app" });
  };

  const removeReminder = (index: number) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAllDayToggle = (isAllDay: boolean) => {
    setFormData((prev) => {
      if (isAllDay) {
        // Set to all day (remove time component)
        const startDate = new Date(prev.start_time);
        const endDate = new Date(prev.end_time);
        return {
          ...prev,
          all_day: true,
          start_time: format(startDate, "yyyy-MM-dd"),
          end_time: format(endDate, "yyyy-MM-dd"),
        };
      } else {
        // Set to specific time (add current time)
        const now = new Date();
        const startDate = new Date(prev.start_time);
        const endDate = new Date(prev.end_time);
        startDate.setHours(now.getHours(), now.getMinutes(), 0, 0);
        endDate.setHours(now.getHours() + 1, now.getMinutes(), 0, 0);
        return {
          ...prev,
          all_day: false,
          start_time: format(startDate, "yyyy-MM-dd'T'HH:mm"),
          end_time: format(endDate, "yyyy-MM-dd'T'HH:mm"),
        };
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {event ? `${t("calendar.events.edit")}: Evento` : t("calendar.events.create")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Calendar */}
            <div className="space-y-2">
              <Label htmlFor="calendar">{t("calendar.events.calendar")}</Label>
              <Select
                value={formData.calendar_id}
                onValueChange={(value) =>
                  handleFieldChange("calendar_id", value)
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("calendar.events.calendarPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: calendar.color || undefined,
                          }}
                        />
                        <span>{calendar.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">{t("calendar.events.title")}</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                placeholder={t("calendar.events.titlePlaceholder")}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                {t("calendar.events.description")}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder={t("calendar.events.descriptionPlaceholder")}
                rows={3}
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_time">
                  {t("calendar.events.startTime")}
                </Label>
                <Input
                  id="start_time"
                  type={formData.all_day ? "date" : "datetime-local"}
                  value={formData.start_time}
                  onChange={(e) =>
                    handleFieldChange("start_time", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">{t("calendar.events.endTime")}</Label>
                <Input
                  id="end_time"
                  type={formData.all_day ? "date" : "datetime-local"}
                  value={formData.end_time}
                  onChange={(e) =>
                    handleFieldChange("end_time", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            {/* All Day */}
            <div className="flex items-center space-x-2">
              <Switch
                id="all_day"
                checked={formData.all_day}
                onCheckedChange={handleAllDayToggle}
              />
              <Label htmlFor="all_day">{t("calendar.events.allDay")}</Label>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">{t("calendar.events.location")}</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleFieldChange("location", e.target.value)}
                placeholder={t("calendar.events.locationPlaceholder")}
              />
            </div>

            {/* Reminders */}
            <div className="space-y-2">
              <Label>{t("calendar.events.reminders")}</Label>
              <div className="flex space-x-2">
                <Select
                  value={newReminder.minutes_before.toString()}
                  onValueChange={(value) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      minutes_before: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">
                      {t("calendar.reminders.fiveMinutes")}
                    </SelectItem>
                    <SelectItem value="15">
                      {t("calendar.reminders.fifteenMinutes")}
                    </SelectItem>
                    <SelectItem value="30">
                      {t("calendar.reminders.thirtyMinutes")}
                    </SelectItem>
                    <SelectItem value="60">
                      {t("calendar.reminders.oneHour")}
                    </SelectItem>
                    <SelectItem value="1440">
                      {t("calendar.reminders.oneDay")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={newReminder.reminder_type}
                  onValueChange={(value: ReminderType) =>
                    setNewReminder((prev) => ({
                      ...prev,
                      reminder_type: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_app">
                      {t("calendar.reminders.inApp")}
                    </SelectItem>
                    <SelectItem value="email">
                      {t("calendar.reminders.email")}
                    </SelectItem>
                    <SelectItem value="push">
                      {t("calendar.reminders.push")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addReminder}>
                  {t("common.add")}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {reminders.map((reminder, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-foreground"
                  >
                    {reminder.minutes_before} {t("calendar.reminders.minutes")}{" "}
                    {reminder.reminder_type === "in_app"
                      ? t("calendar.reminders.inApp")
                      : reminder.reminder_type === "email"
                        ? t("calendar.reminders.email")
                        : t("calendar.reminders.push")}
                    <button
                      type="button"
                      onClick={() => removeReminder(index)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  {t("common.cancel")}
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
