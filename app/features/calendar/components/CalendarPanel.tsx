/**
 * CalendarPanel component
 * Shared calendar content for page and modal rendering
 */

import { useState } from "react";
import { useNavigate } from "react-router";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent } from "~/components/ui/dialog";
import { EmptyState } from "~/components/common/EmptyState";
import { CalendarView } from "~/features/calendar/components/CalendarView";
import { EventForm } from "~/features/calendar/components/EventForm";
import { EventDetails } from "~/features/calendar/components/EventDetails";
import {
  useCalendars,
  useEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useCreateReminder,
} from "~/features/calendar/hooks/useCalendar";
import {
  buildMovedEventTimes,
  buildResizedEventTimes,
} from "~/features/calendar/utils/eventDrag";
import type {
  CalendarEvent,
  CalendarViewType,
  EventCreate,
  EventReminderCreate,
  EventUpdate,
} from "~/features/calendar/types/calendar.types";

interface CalendarPanelProps {
  showClose?: boolean;
  onClose?: () => void;
}

export function CalendarPanel({ showClose, onClose }: CalendarPanelProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [initialDate, setInitialDate] = useState<Date | null>(null);

  const { data: calendarsData, isLoading: calendarsLoading } = useCalendars();
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const eventParams = {
    start_date: format(startDate, "yyyy-MM-dd"),
    end_date: format(endDate, "yyyy-MM-dd"),
  };

  const {
    data: eventsData,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useEvents({
    start_date: eventParams.start_date,
    end_date: eventParams.end_date,
  });

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();
  const createReminderMutation = useCreateReminder();

  const calendars = calendarsData?.data || [];
  const hasCalendars = calendars.length > 0;
  const events = eventsData?.data || [];

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleRefresh = () => {
    void refetchEvents();
  };

  const handleEventCreate = (date: Date) => {
    setInitialDate(date);
    setSelectedEvent(null);
    setShowEventForm(true);
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setInitialDate(null);
    setShowEventForm(true);
  };

  const handleEventDelete = (event: CalendarEvent) => {
    if (confirm(t("calendar.events.confirmDelete"))) {
      void deleteEventMutation.mutate(event.id, {
        onSuccess: () => {
          void refetchEvents();
          setShowEventDetails(false);
        },
      });
    }
  };

  const handleEventMove = (
    event: CalendarEvent,
    targetDate: Date,
    options?: { preserveTime: boolean }
  ) => {
    const payload = buildMovedEventTimes(
      event,
      targetDate,
      options?.preserveTime ?? true
    );

    void updateEventMutation.mutate({
      id: event.id,
      payload,
    });
  };

  const handleEventResize = (
    event: CalendarEvent,
    targetDate: Date,
    options?: { preserveTime: boolean }
  ) => {
    const payload = buildResizedEventTimes(
      event,
      targetDate,
      options?.preserveTime ?? true
    );
    if (!payload) {
      return;
    }

    void updateEventMutation.mutate({
      id: event.id,
      payload,
    });
  };

  const handleEventSubmit = async (payload: {
    event: EventCreate;
    reminders: EventReminderCreate[];
  }) => {
    const { event, reminders } = payload;
    if (selectedEvent) {
      void updateEventMutation.mutate(
        { id: selectedEvent.id, payload: event as EventUpdate },
        {
          onSuccess: () => {
            setShowEventForm(false);
            setSelectedEvent(null);
            setInitialDate(null);
            void refetchEvents();
          },
        }
      );
    } else {
      try {
        const response = await createEventMutation.mutateAsync(event);
        const createdEvent = response.data;

        if (createdEvent && reminders.length > 0) {
          await Promise.all(
            reminders.map((reminder) =>
              createReminderMutation.mutateAsync({
                eventId: createdEvent.id,
                payload: reminder,
              })
            )
          );
        }

        setShowEventForm(false);
        setInitialDate(null);
        void refetchEvents();
      } catch (error) {
        console.error("Failed to create event reminders:", error);
      }
    }
  };

  const handleEventFormCancel = () => {
    setShowEventForm(false);
    setSelectedEvent(null);
    setInitialDate(null);
  };

  const handleEventDetailsClose = () => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("calendar.title")}</h2>
        <div className="flex space-x-2">
          {showClose && (
            <Button variant="outline" onClick={onClose}>
              {t("common.close")}
            </Button>
          )}
          <Button onClick={handleRefresh}>{t("common.refresh")}</Button>
          <Button
            onClick={() => void handleEventCreate(new Date())}
            disabled={!hasCalendars}
          >
            {t("calendar.events.create")}
          </Button>
        </div>
      </div>

      {!hasCalendars && !calendarsLoading ? (
        <EmptyState
          title={t("calendar.emptyTitle")}
          description={t("calendar.emptyDescription")}
          action={
            <Button
              onClick={() => {
                void navigate("/tasks/settings");
              }}
            >
              {t("calendar.emptyAction")}
            </Button>
          }
        />
      ) : (
        <CalendarView
          events={events}
          calendars={calendars}
          viewType={viewType}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onViewTypeChange={setViewType}
          onEventClick={handleEventClick}
          onEventCreate={handleEventCreate}
          onEventMove={handleEventMove}
          onEventResize={handleEventResize}
          loading={eventsLoading}
        />
      )}

      <Dialog
        open={showEventForm}
        onOpenChange={(open) => setShowEventForm(open)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <EventForm
            event={selectedEvent || undefined}
            calendars={calendars}
            initialDate={initialDate || undefined}
            onSubmit={(payload) => void handleEventSubmit(payload)}
            onCancel={handleEventFormCancel}
            loading={
              createEventMutation.isPending || updateEventMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEventDetails}
        onOpenChange={(open) => setShowEventDetails(open)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <EventDetails
              event={selectedEvent}
              calendars={calendars}
              onEdit={handleEventEdit}
              onDelete={handleEventDelete}
              onClose={handleEventDetailsClose}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
