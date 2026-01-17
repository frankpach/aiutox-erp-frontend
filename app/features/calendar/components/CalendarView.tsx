/**
 * CalendarView component
 * Main calendar component with month/week/day views
 */

import { useState, type ReactNode, type CSSProperties } from "react";
import { cn } from "~/lib/utils";

import { Card, CardContent } from "~/components/ui/card";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  addDays,
  addMonths,
  addWeeks,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import type {
  CalendarViewType,
  CalendarEvent,
  Calendar,
} from "~/features/calendar/types/calendar.types";

interface CalendarViewProps {
  events: CalendarEvent[];
  calendars: Calendar[];
  viewType: CalendarViewType;
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onViewTypeChange: (type: CalendarViewType) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventCreate?: (date: Date) => void;
  getEventColor?: (event: CalendarEvent) => string;
  onEventMove?: (
    event: CalendarEvent,
    targetDate: Date,
    options?: { preserveTime: boolean }
  ) => void;
  onEventResize?: (
    event: CalendarEvent,
    targetDate: Date,
    options?: { preserveTime: boolean }
  ) => void;
  loading?: boolean;
  showHeader?: boolean;
}

type DragAction = "move" | "resize";

interface DragPayload {
  type: DragAction;
  eventId: string;
}

const HEX_COLOR_PATTERN = /^#([0-9A-F]{3}|[0-9A-F]{6})$/i;
const DEFAULT_EVENT_COLOR = "#023E87";
const BRAND_PRIMARY_COLOR = "hsl(var(--brand-primary, var(--primary)))";
const BRAND_ACCENT_COLOR = "hsl(var(--brand-accent, var(--secondary)))";
const SURFACE_GRADIENT =
  "linear-gradient(180deg, hsl(var(--color-surface, var(--surface))) 0%, hsl(var(--color-background, var(--background))) 100%)";
const SURFACE_MUTED_BG = "hsl(var(--color-surface, var(--surface)))";
const MUTED_BORDER_COLOR = "hsl(var(--border))";
const EVENT_SHADOW = "0 8px 20px rgba(2, 62, 135, 0.14)";

// Constantes para barras multi-día
const MULTI_DAY_BAR_HEIGHT = 28;
const MULTI_DAY_BAR_GAP = 4;
const MAX_VISIBLE_BARS = 3;

const EVENT_STATUS_VISUALS: Record<
  string,
  { icon: string; className: string }
> = {
  todo: { icon: "•", className: "text-white/70" },
  pending: { icon: "•", className: "text-white/70" },
  in_progress: { icon: "↻", className: "text-white" },
  done: { icon: "✓", className: "text-white" },
  completed: { icon: "✓", className: "text-white" },
  canceled: { icon: "✕", className: "text-white" },
  blocked: { icon: "!", className: "text-white" },
};

const getStatusIconProps = (status?: string) => {
  if (!status) {
    return { icon: "•", className: "text-white/70" };
  }
  return (
    EVENT_STATUS_VISUALS[status] ?? { icon: "•", className: "text-white/70" }
  );
};

const normalizeHexColor = (color?: string | null): string | null => {
  if (!color) {
    return null;
  }
  const trimmed = color.trim();
  if (!HEX_COLOR_PATTERN.test(trimmed)) {
    return null;
  }
  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed;
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return trimmed;
};

const parseHexColor = (hex: string) => {
  const normalized = hex.replace("#", "");
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const srgbChannelToLinear = (value: number) => {
  const channel = value / 255;
  return channel <= 0.04045
    ? channel / 12.92
    : Math.pow((channel + 0.055) / 1.055, 2.4);
};

const getEventTextColor = (color: string) => {
  const normalized = normalizeHexColor(color);
  if (!normalized) {
    return "hsl(var(--color-text-primary))";
  }
  const { r, g, b } = parseHexColor(normalized);
  const luminance =
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b);
  return luminance > 0.55 ? "hsl(var(--color-text-primary))" : "#FFFFFF";
};

const getEventStyles = (
  color: string,
  options?: {
    variant?: "solid" | "soft";
    borderColor?: string;
    enableShadow?: boolean;
  }
): CSSProperties => {
  const variant = options?.variant ?? "solid";
  const fallbackColor = color?.trim() || DEFAULT_EVENT_COLOR;
  const backgroundColor = fallbackColor;

  return {
    backgroundColor,
    color: getEventTextColor(fallbackColor),
    borderLeft: `3px solid ${options?.borderColor ?? BRAND_PRIMARY_COLOR}`,
    boxShadow:
      (options?.enableShadow ?? variant === "solid") ? EVENT_SHADOW : "none",
    backdropFilter: variant === "soft" ? "blur(8px)" : undefined,
    transition: "box-shadow 150ms ease, transform 150ms ease",
  };
};

interface MonthDayCellProps {
  day: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  onEventCreate?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  renderEvent: (event: CalendarEvent) => ReactNode;
}

function MonthDayCell({
  day,
  isCurrentMonth,
  isToday,
  events,
  onEventCreate,
  onEventClick: _onEventClick,
  renderEvent,
}: MonthDayCellProps) {
  const { t } = useTranslation();
  const visibleEvents = events.slice(0, 3);
  const hiddenEvents = Math.max(events.length - visibleEvents.length, 0);
  const { setNodeRef, isOver } = useDroppable({
    id: `month-cell-${day.toISOString()}`,
    data: { date: day, preserveTime: false },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group border-border/60 bg-[hsl(var(--surface))] border-r last:border-r-0 relative",
        !isCurrentMonth
          ? "bg-muted/30 text-muted-foreground"
          : "bg-[hsl(var(--surface))]",
        isOver && "ring-2 ring-primary/40"
      )}
      data-outside-cell={!isCurrentMonth}
      data-today={isToday || undefined}
      onClick={(event) => {
        if (
          (event.target as HTMLElement)?.closest(
            '[role="button"][data-calendar-event="true"]'
          )
        ) {
          return;
        }
        onEventCreate?.(day);
      }}
    >
      <div className="data-dragging:bg-accent flex h-full flex-col overflow-hidden px-1.5 py-2 gap-1 min-h-[80px]">
        <div
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center self-start rounded-full text-[11px] font-medium",
            isToday
              ? "bg-foreground text-background font-semibold"
              : "text-muted-foreground/60"
          )}
        >
          {format(day, "d")}
        </div>
        <div className="flex-1 space-y-1">
          {visibleEvents.map((event, index) => (
            <div key={`${event.id}-${index}`}>{renderEvent(event)}</div>
          ))}
          {hiddenEvents > 0 && (
            <button
              type="button"
              className="text-[10px] text-muted-foreground hover:underline"
              onClick={(event) => event.stopPropagation()}
            >
              +{hiddenEvents} {t("calendar.labels.more")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface DraggableEventProps {
  event: CalendarEvent;
  children: ReactNode;
  action: DragAction;
}

function DraggableEvent({ event, children, action }: DraggableEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `${action}-${event.id}`,
      data: { type: action, eventId: event.id } satisfies DragPayload,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

interface TimeSlotProps {
  slotDate: Date;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  children?: ReactNode;
}

function TimeSlot({
  slotDate,
  className,
  style,
  onClick,
  children,
}: TimeSlotProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `slot-${slotDate.toISOString()}`,
    data: { date: slotDate, preserveTime: false },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${className ?? ""} ${isOver ? "ring-2 ring-primary/40" : ""}`}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
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
  getEventColor,
  onEventMove,
  onEventResize,
  loading: _loading,
  showHeader = true,
}: CalendarViewProps) {
  const { t, language } = useTranslation();
  const dateLocale = language === "en" ? enUS : es;
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor)
  );
  const [activeEventId, setActiveEventId] = useState<string | null>(null);

  const getCalendarColor = (calendarId: string) => {
    const calendar = calendars.find((c) => c.id === calendarId);
    return calendar?.color || "#023E87";
  };

  const resolveEventColor = (event: CalendarEvent) => {
    return getEventColor?.(event) ?? getCalendarColor(event.calendar_id);
  };

  const getEventTimeLabel = (
    event: CalendarEvent,
    mode: "month" | "day" | "agenda"
  ) => {
    if (event.all_day) {
      return "";
    }
    const displayTime = event.metadata?.display_time as
      | string
      | undefined
      | null;
    const isDueOnly = Boolean(event.metadata?.due_only);
    if (isDueOnly) {
      return displayTime ?? "";
    }
    if (displayTime) {
      return displayTime;
    }

    const start = new Date(event.start_time);
    const end = new Date(event.end_time);
    if (mode === "month") {
      return format(start, "HH:mm");
    }
    return `${format(start, "HH:mm")} - ${format(end, "HH:mm")}`;
  };

  const activeEvent = activeEventId
    ? events.find((event) => event.id === activeEventId) || null
    : null;

  const navigateDate = (direction: "prev" | "next") => {
    let newDate: Date;

    switch (viewType) {
      case "month":
        newDate =
          direction === "prev"
            ? subMonths(currentDate, 1)
            : addMonths(currentDate, 1);
        break;
      case "week":
        newDate =
          direction === "prev"
            ? subWeeks(currentDate, 1)
            : addWeeks(currentDate, 1);
        break;
      case "day":
        newDate =
          direction === "prev"
            ? subDays(currentDate, 1)
            : addDays(currentDate, 1);
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

    // Separar eventos single-day vs multi-day
    const isMultiDayEvent = (event: CalendarEvent) => {
      const start = startOfDay(new Date(event.start_time));
      const end = startOfDay(new Date(event.end_time ?? event.start_time));
      return event.all_day || differenceInCalendarDays(end, start) >= 1;
    };

    const multiDayEvents = events.filter(isMultiDayEvent);
    const singleDayEvents = events.filter((e) => !isMultiDayEvent(e));

    // Calcular placements de barras multi-día por semana
    type BarPlacement = {
      event: CalendarEvent;
      startCol: number;
      spanDays: number;
      laneIndex: number;
    };

    const calculateWeekBars = (
      weekStart: Date,
      weekEnd: Date
    ): BarPlacement[] => {
      const weekMultiDayEvents = multiDayEvents.filter((event) => {
        const eventStart = new Date(event.start_time);
        const eventEnd = new Date(event.end_time ?? event.start_time);
        return eventStart <= weekEnd && eventEnd >= weekStart;
      });

      const placements: BarPlacement[] = [];
      const lanes: number[] = []; // Track end column of each lane

      weekMultiDayEvents.forEach((event) => {
        const eventStart = startOfDay(new Date(event.start_time));
        const eventEnd = startOfDay(
          new Date(event.end_time ?? event.start_time)
        );

        const clampedStart = eventStart < weekStart ? weekStart : eventStart;
        const clampedEnd = eventEnd > weekEnd ? weekEnd : eventEnd;

        const startCol = differenceInCalendarDays(clampedStart, weekStart) + 1;
        const spanDays = differenceInCalendarDays(clampedEnd, clampedStart) + 1;

        // Find available lane
        let laneIndex = lanes.findIndex((endCol) => endCol < startCol);
        if (laneIndex === -1) {
          laneIndex = lanes.length;
          lanes.push(startCol + spanDays - 1);
        } else {
          lanes[laneIndex] = startCol + spanDays - 1;
        }

        placements.push({ event, startCol, spanDays, laneIndex });
      });

      return placements;
    };

    return (
      <div data-slot="month-view" className="contents">
        <div
          className="border-border/60 grid grid-cols-7 border-b"
          style={{ background: SURFACE_GRADIENT }}
        >
          {[
            t("calendar.weekdays.mon"),
            t("calendar.weekdays.tue"),
            t("calendar.weekdays.wed"),
            t("calendar.weekdays.thu"),
            t("calendar.weekdays.fri"),
            t("calendar.weekdays.sat"),
            t("calendar.weekdays.sun"),
          ].map((dayLabel) => (
            <div
              key={dayLabel}
              className="text-muted-foreground/70 py-3 text-center text-[11px] font-semibold uppercase tracking-wide"
            >
              {dayLabel}
            </div>
          ))}
        </div>
        <div className="flex flex-col bg-[hsl(var(--surface))]">
          {Array.from(
            { length: Math.ceil(days.length / 7) },
            (_, weekIndex) => {
              const weekDays = days.slice(weekIndex * 7, weekIndex * 7 + 7);
              const weekStart = startOfDay(weekDays[0]!);
              const weekEnd = endOfDay(weekDays[weekDays.length - 1]!);
              const weekBars = calculateWeekBars(weekStart, weekEnd);

              // Agrupar barras por lane
              const lanes: BarPlacement[][] = [];
              weekBars.forEach((bar) => {
                if (!lanes[bar.laneIndex]) {
                  lanes[bar.laneIndex] = [];
                }
                lanes[bar.laneIndex]!.push(bar);
              });

              const visibleLanes = lanes.slice(0, MAX_VISIBLE_BARS);
              const hiddenCount = Math.max(0, lanes.length - MAX_VISIBLE_BARS);

              return (
                <div
                  key={`week-${weekIndex}`}
                  className="flex flex-col border-b border-border/60 last:border-b-0"
                >
                  {/* Fila de celdas de días */}
                  <div className="grid grid-cols-7">
                    {weekDays.map((day) => {
                      const dayStart = startOfDay(day);
                      const dayEnd = endOfDay(day);
                      const dayEvents = singleDayEvents.filter((event) => {
                        const eventStart = new Date(event.start_time);
                        const eventEnd = new Date(
                          event.end_time ?? event.start_time
                        );
                        return eventStart <= dayEnd && eventEnd >= dayStart;
                      });
                      return (
                        <MonthDayCell
                          key={day.toISOString()}
                          day={day}
                          isCurrentMonth={isSameMonth(day, currentDate)}
                          isToday={isSameDay(day, new Date())}
                          events={dayEvents}
                          onEventCreate={onEventCreate}
                          onEventClick={onEventClick}
                          renderEvent={(event) => {
                            const statusIcon = getStatusIconProps(event.status);
                            return (
                              <div className="group/event flex w-full min-w-0 items-center gap-1 pr-2">
                                <DraggableEvent event={event} action="move">
                                  <button
                                    type="button"
                                    data-calendar-event="true"
                                    title={event.title}
                                    className="box-border flex w-full min-w-0 max-w-full items-center overflow-hidden rounded-full px-3 py-1.5 text-left text-xs font-medium shadow-sm transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[dragging=true]:cursor-grabbing"
                                    style={{
                                      backgroundColor: resolveEventColor(event),
                                      color: getEventTextColor(
                                        resolveEventColor(event)
                                      ),
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEventClick?.(event);
                                    }}
                                  >
                                    <span
                                      className={cn(
                                        "mr-1.5 text-[10px]",
                                        statusIcon.className
                                      )}
                                    >
                                      {statusIcon.icon}
                                    </span>
                                    <span className="truncate min-w-0">
                                      {(() => {
                                        const timeLabel = getEventTimeLabel(
                                          event,
                                          "month"
                                        );
                                        return timeLabel ? `${timeLabel} ` : "";
                                      })()}
                                      {event.title}
                                    </span>
                                  </button>
                                </DraggableEvent>
                                <DraggableEvent event={event} action="resize">
                                  <span className="cursor-ew-resize text-[10px] opacity-0 transition group-hover/event:opacity-60">
                                    ↔
                                  </span>
                                </DraggableEvent>
                              </div>
                            );
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Barras multi-día */}
                  {visibleLanes.length > 0 && (
                    <div
                      className="relative px-1 pb-1"
                      style={{ paddingTop: MULTI_DAY_BAR_GAP }}
                    >
                      {/* Líneas de separación verticales */}
                      <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                        {Array.from({ length: 7 }).map((_, i) => (
                          <div
                            key={i}
                            className="border-r border-border/20 last:border-r-0"
                          />
                        ))}
                      </div>

                      {visibleLanes.map((laneBars, laneIndex) => (
                        <div
                          key={`lane-${laneIndex}`}
                          className="relative grid grid-cols-7 gap-0"
                          style={{
                            height: MULTI_DAY_BAR_HEIGHT,
                            marginTop: laneIndex > 0 ? MULTI_DAY_BAR_GAP : 0,
                          }}
                        >
                          {laneBars.map((bar) => {
                            const statusIcon = getStatusIconProps(
                              bar.event.status
                            );
                            return (
                              <div
                                key={bar.event.id}
                                className="relative z-10 px-0.5"
                                style={{
                                  gridColumn: `${bar.startCol} / span ${bar.spanDays}`,
                                }}
                              >
                                <DraggableEvent event={bar.event} action="move">
                                  <button
                                    type="button"
                                    data-calendar-event="true"
                                    title={bar.event.title}
                                    className="box-border flex h-full w-full min-w-0 max-w-full items-center overflow-hidden rounded-full px-3 py-1.5 text-left text-xs font-medium shadow-sm transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40"
                                    style={{
                                      backgroundColor: resolveEventColor(
                                        bar.event
                                      ),
                                      color: getEventTextColor(
                                        resolveEventColor(bar.event)
                                      ),
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onEventClick?.(bar.event);
                                    }}
                                  >
                                    <span
                                      className={cn(
                                        "mr-1.5 text-[10px]",
                                        statusIcon.className
                                      )}
                                    >
                                      {statusIcon.icon}
                                    </span>
                                    <span className="truncate min-w-0">
                                      {bar.event.title}
                                    </span>
                                  </button>
                                </DraggableEvent>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Indicador de eventos ocultos */}
                  {hiddenCount > 0 && (
                    <div className="px-2 pb-1 text-right">
                      <span className="text-[10px] text-muted-foreground">
                        +{hiddenCount}{" "}
                        {hiddenCount === 1 ? "evento" : "eventos"}
                      </span>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const allDayEvents = days.map((day) =>
      events.filter(
        (event) => event.all_day && isSameDay(new Date(event.start_time), day)
      )
    );

    return (
      <div className="space-y-4">
        <div
          className="grid grid-cols-8 gap-0 border border-transparent"
          style={{ background: SURFACE_GRADIENT }}
        >
          <div className="text-center font-medium text-sm text-muted-foreground p-2">
            {t("calendar.labels.time")}
          </div>

          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="text-center font-medium text-sm p-2"
            >
              <div>{format(day, "EEE", { locale: dateLocale })}</div>
              <div
                className={
                  isSameDay(day, currentDate)
                    ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto"
                    : ""
                }
              >
                {format(day, "d", { locale: dateLocale })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 gap-0 border-y border-border/60">
          <div
            className="text-xs text-muted-foreground p-2 text-right"
            style={{ background: SURFACE_MUTED_BG }}
          >
            {t("calendar.events.allDay")}
          </div>
          {days.map((day, index) => (
            <div
              key={`allday-${day.toISOString()}`}
              className="min-h-[40px] border-l p-1"
              style={{
                background: SURFACE_MUTED_BG,
                borderColor: MUTED_BORDER_COLOR,
              }}
            >
              {allDayEvents[index]?.map((event) => (
                <div
                  key={event.id}
                  className="mt-(--event-gap)"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                >
                  <DraggableEvent event={event} action="move">
                    <button
                      type="button"
                      className="flex h-(--event-height) w-full items-center overflow-hidden rounded px-1 text-left text-[10px] sm:text-xs backdrop-blur-md transition hover:opacity-90"
                      style={getEventStyles(resolveEventColor(event), {
                        variant: "soft",
                        borderColor: BRAND_ACCENT_COLOR,
                        enableShadow: false,
                      })}
                    >
                      <span className="truncate">{event.title}</span>
                    </button>
                  </DraggableEvent>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="divide-y divide-border/60">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="grid grid-cols-8 gap-0">
              <div
                className="text-xs text-muted-foreground px-2 py-3 text-right"
                style={{ background: SURFACE_MUTED_BG }}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
              {days.map((day) => {
                const hourEvents = events.filter((event) => {
                  if (event.all_day) {
                    return false;
                  }
                  const eventStart = new Date(event.start_time);
                  const eventEnd = new Date(event.end_time);
                  const slotStart = new Date(day);
                  slotStart.setHours(hour, 0, 0, 0);
                  const slotEnd = new Date(day);
                  slotEnd.setHours(hour + 1, 0, 0, 0);
                  return eventStart < slotEnd && eventEnd > slotStart;
                });

                const slotDate = new Date(day);
                slotDate.setHours(hour, 0, 0, 0);

                return (
                  <TimeSlot
                    key={`${day.toISOString()}-${hour}`}
                    slotDate={slotDate}
                    className="min-h-[44px] cursor-pointer"
                    style={{
                      background: SURFACE_MUTED_BG,
                      borderLeft: `1px solid ${MUTED_BORDER_COLOR}`,
                    }}
                    onClick={() => {
                      if (!hourEvents.length) {
                        onEventCreate?.(slotDate);
                      }
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 flex items-center justify-between gap-2"
                        style={getEventStyles(resolveEventColor(event), {
                          borderColor: BRAND_PRIMARY_COLOR,
                        })}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <DraggableEvent event={event} action="move">
                          <span>{event.title}</span>
                        </DraggableEvent>
                        <DraggableEvent event={event} action="resize">
                          <span className="cursor-ew-resize text-[10px] opacity-70">
                            ↔
                          </span>
                        </DraggableEvent>
                      </div>
                    ))}
                  </TimeSlot>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = events.filter((event) =>
      isSameDay(new Date(event.start_time), currentDate)
    );
    const allDayEvents = dayEvents.filter((event) => event.all_day);

    return (
      <div className="space-y-4">
        <div
          className="border rounded p-2"
          style={{ background: SURFACE_MUTED_BG }}
        >
          <div className="text-xs text-muted-foreground mb-2">
            {t("calendar.events.allDay")}
          </div>
          <div className="space-y-1">
            {allDayEvents.length === 0 && (
              <div className="text-xs text-muted-foreground">
                {t("calendar.labels.more")} 0
              </div>
            )}
            {allDayEvents.map((event) => (
              <DraggableEvent key={event.id} event={event} action="move">
                <button
                  type="button"
                  className="flex h-(--event-height) w-full items-center overflow-hidden rounded px-1 text-left text-[10px] sm:text-xs backdrop-blur-md transition hover:opacity-90"
                  style={getEventStyles(resolveEventColor(event), {
                    variant: "soft",
                    borderColor: BRAND_ACCENT_COLOR,
                    enableShadow: false,
                  })}
                  onClick={() => onEventClick?.(event)}
                >
                  <span className="truncate">{event.title}</span>
                </button>
              </DraggableEvent>
            ))}
          </div>
        </div>

        <div className="divide-y divide-border/60">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="flex gap-2">
              <div
                className="text-xs text-muted-foreground w-16 py-3 text-right"
                style={{ background: SURFACE_MUTED_BG }}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>

              {(() => {
                const slotDate = new Date(currentDate);
                slotDate.setHours(hour, 0, 0, 0);

                return (
                  <TimeSlot
                    slotDate={slotDate}
                    className="flex-1 min-h-[44px] cursor-pointer"
                    style={{
                      background: SURFACE_MUTED_BG,
                      borderLeft: `1px solid ${MUTED_BORDER_COLOR}`,
                    }}
                    onClick={() => {
                      const hourEvents = events.filter((event) => {
                        if (event.all_day) {
                          return false;
                        }
                        const eventStart = new Date(event.start_time);
                        const eventEnd = new Date(event.end_time);
                        const slotStart = new Date(currentDate);
                        slotStart.setHours(hour, 0, 0, 0);
                        const slotEnd = new Date(currentDate);
                        slotEnd.setHours(hour + 1, 0, 0, 0);

                        return eventStart < slotEnd && eventEnd > slotStart;
                      });
                      if (!hourEvents.length) {
                        onEventCreate?.(slotDate);
                      }
                    }}
                  >
                    {dayEvents
                      .filter((event) => {
                        if (event.all_day) {
                          return false;
                        }
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
                          className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 mb-1 flex items-center justify-between gap-2"
                          style={getEventStyles(resolveEventColor(event), {
                            borderColor: BRAND_PRIMARY_COLOR,
                          })}
                          onClick={(eventClick) => {
                            eventClick.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <DraggableEvent event={event} action="move">
                            <span>
                              {(() => {
                                const timeLabel = getEventTimeLabel(
                                  event,
                                  "day"
                                );
                                return timeLabel ? `${timeLabel} ` : "";
                              })()}
                              {event.title}
                            </span>
                          </DraggableEvent>
                          <DraggableEvent event={event} action="resize">
                            <span className="cursor-ew-resize text-[10px] opacity-70">
                              ↔
                            </span>
                          </DraggableEvent>
                        </div>
                      ))}
                  </TimeSlot>
                );
              })()}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAgendaView = () => {
    const sortedEvents = [...events].sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    const groupedEvents = sortedEvents.reduce<Record<string, CalendarEvent[]>>(
      (acc, event) => {
        const dateKey = format(new Date(event.start_time), "yyyy-MM-dd");
        (acc[dateKey] ??= []).push(event);
        return acc;
      },
      {}
    );

    return (
      <div className="space-y-6">
        {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => (
          <div key={dateKey} className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {format(new Date(dateKey), "PPP", { locale: dateLocale })}
            </div>
            <div className="space-y-3">
              {dayEvents.map((event) => (
                <Card
                  key={event.id}
                  className="cursor-pointer border transition hover:opacity-90"
                  style={{
                    backgroundColor: resolveEventColor(event) + "1A",
                    borderColor: resolveEventColor(event) + "33",
                  }}
                  onClick={() => onEventClick?.(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor: resolveEventColor(event),
                          }}
                        />
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {(() => {
                              const timeLabel = getEventTimeLabel(
                                event,
                                "agenda"
                              );
                              const dateLabel = format(
                                new Date(event.start_time),
                                "PPP",
                                { locale: dateLocale }
                              );
                              return timeLabel
                                ? `${dateLabel} ${timeLabel}`
                                : dateLabel;
                            })()}
                          </div>
                          {event.location && (
                            <div className="text-sm text-muted-foreground">
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      {!event.metadata?.due_only && (
                        <div className="text-sm text-muted-foreground">
                          {getEventTimeLabel(event, "agenda")}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(event) => {
        const payload = event.active.data.current as DragPayload | undefined;
        if (payload?.eventId) {
          setActiveEventId(payload.eventId);
        }
      }}
      onDragCancel={() => setActiveEventId(null)}
      onDragEnd={(event) => {
        const payload = event.active.data.current as DragPayload | undefined;
        const targetDate = event.over?.data.current?.date as Date | undefined;
        const preserveTime =
          (event.over?.data.current?.preserveTime as boolean | undefined) ??
          true;
        if (!payload?.eventId || !targetDate) {
          setActiveEventId(null);
          return;
        }

        const draggedEvent = events.find((item) => item.id === payload.eventId);
        if (!draggedEvent) {
          setActiveEventId(null);
          return;
        }

        if (payload.type === "resize") {
          onEventResize?.(draggedEvent, targetDate, { preserveTime });
        } else {
          onEventMove?.(draggedEvent, targetDate, { preserveTime });
        }

        setActiveEventId(null);
      }}
    >
      <div className="space-y-6">
        {showHeader && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => navigateDate("prev")}>
                ←
              </Button>
              <h2 className="text-xl font-bold">
                {format(currentDate, viewType === "day" ? "PPP" : "MMMM yyyy", {
                  locale: dateLocale,
                })}
              </h2>
              <Button variant="outline" onClick={() => navigateDate("next")}>
                →
              </Button>
              <Button
                variant="outline"
                onClick={() => onDateChange(new Date())}
              >
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
        )}

        {viewType === "month" && renderMonthView()}
        {viewType === "week" && renderWeekView()}
        {viewType === "day" && renderDayView()}
        {viewType === "agenda" && renderAgendaView()}
      </div>
      <DragOverlay>
        {activeEvent ? (
          <div className="text-xs px-2 py-1 rounded bg-background border shadow-sm">
            {activeEvent.title}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
