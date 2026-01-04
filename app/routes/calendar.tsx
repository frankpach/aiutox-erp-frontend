/**
 * Calendar page
 * Main page for calendar management
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { PageLayout } from "~/components/layout/PageLayout";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog";
import { CalendarView } from "~/features/calendar/components/CalendarView";
import { EventForm } from "~/features/calendar/components/EventForm";
import { EventDetails } from "~/features/calendar/components/EventDetails";
import { 
  useCalendars, 
  useEvents, 
  useCreateEvent, 
  useUpdateEvent, 
  useDeleteEvent,
} from "~/features/calendar/hooks/useCalendar";
import { CalendarEvent, CalendarViewType, EventCreate, EventUpdate } from "~/features/calendar/types/calendar.types";

export default function CalendarPage() {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<CalendarViewType>("month");
  const [showEventForm, setShowEventForm] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [initialDate, setInitialDate] = useState<Date | null>(null);

  // Query hooks
  const { data: calendarsData, isLoading: calendarsLoading, refetch: refetchCalendars } = useCalendars();
  const { data: eventsData, isLoading: eventsLoading, refetch: refetchEvents } = useEvents({
    start_date: format(currentDate, "yyyy-MM-01"),
    end_date: format(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), "yyyy-MM-dd"),
  });

  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const calendars = calendarsData?.data || [];
  const events = eventsData?.data || [];

  const format = (date: Date, formatStr: string) => {
    // Simple date formatting function
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return formatStr
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
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
      deleteEventMutation.mutate(event.id, {
        onSuccess: () => {
          refetchEvents();
          setShowEventDetails(false);
        },
      });
    }
  };

  const handleEventSubmit = (data: EventCreate) => {
    if (selectedEvent) {
      // Update existing event
      updateEventMutation.mutate(
        { id: selectedEvent.id, payload: data as EventUpdate },
        {
          onSuccess: () => {
            setShowEventForm(false);
            setSelectedEvent(null);
            setInitialDate(null);
            refetchEvents();
          },
        }
      );
    } else {
      // Create new event
      createEventMutation.mutate(data, {
        onSuccess: () => {
          setShowEventForm(false);
          setInitialDate(null);
          refetchEvents();
        },
      });
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
    <PageLayout
      title={t("calendar.title")}
      description={t("calendar.description")}
      loading={calendarsLoading || eventsLoading}
    >
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {t("calendar.title")}
          </h2>
          <div className="flex space-x-2">
            <Button onClick={refetchEvents}>
              {t("common.refresh")}
            </Button>
            <Button onClick={() => handleEventCreate(new Date())}>
              {t("calendar.events.create")}
            </Button>
          </div>
        </div>

        {/* Calendar View */}
        <CalendarView
          events={events}
          calendars={calendars}
          viewType={viewType}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onViewTypeChange={setViewType}
          onEventClick={handleEventClick}
          onEventCreate={handleEventCreate}
          loading={eventsLoading}
        />

        {/* Event Form Dialog */}
        <Dialog open={showEventForm} onOpenChange={setShowEventForm}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <EventForm
              event={selectedEvent || undefined}
              calendars={calendars}
              initialDate={initialDate || undefined}
              onSubmit={handleEventSubmit}
              onCancel={handleEventFormCancel}
              loading={createEventMutation.isPending || updateEventMutation.isPending}
            />
          </DialogContent>
        </Dialog>

        {/* Event Details Dialog */}
        <Dialog open={showEventDetails} onOpenChange={setShowEventDetails}>
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
    </PageLayout>
  );
}
