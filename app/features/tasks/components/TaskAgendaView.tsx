/**
 * TaskAgendaView component
 * Wrapper que convierte tareas a eventos para mostrarlos en AgendaView
 */

import { useMemo } from "react";
import { startOfDay, parseISO, isToday, isPast } from "date-fns";
import { AgendaView } from "~/features/calendar/components/AgendaView";
import { Badge } from "~/components/ui/badge";
import type { Task } from "../types/task.types";
import type { CalendarEvent } from "~/features/calendar/types/calendar.types";

interface TaskAgendaViewProps {
  tasks: Task[];
  loading?: boolean;
  onTaskClick?: (task: Task) => void;
  _onTaskCreate?: () => void;
}

// Colores para prioridades
const priorityColors: Record<string, string> = {
  low: "#22c55e", // verde
  medium: "#3b82f6", // azul
  high: "#f59e0b", // amarillo
  urgent: "#ef4444", // rojo
};

// Colores para estados
const statusColors: Record<string, string> = {
  todo: "#6b7280", // gris
  in_progress: "#3b82f6", // azul
  on_hold: "#f59e0b", // amarillo
  blocked: "#ef4444", // rojo
  review: "#8b5cf6", // púrpura
  done: "#22c55e", // verde
  cancelled: "#6b7280", // gris
};

export function TaskAgendaView({
  tasks,
  loading = false,
  onTaskClick,
  _onTaskCreate,
}: TaskAgendaViewProps) {
  // Convertir tareas a eventos para AgendaView
  const events = useMemo(() => {
    return tasks
      .filter((task) => {
        // Solo incluir tareas con fecha de inicio o vencimiento
        return task.start_at || task.due_date;
      })
      .map((task) => {
        // Usar start_at si existe, sino due_date
        const startDate = task.start_at
          ? parseISO(task.start_at)
          : parseISO(task.due_date!);
        const endDate = task.end_at
          ? parseISO(task.end_at)
          : task.due_date
            ? parseISO(task.due_date)
            : new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hora por defecto

        // Determinar color: prioridad > estado > por defecto
        const color =
          priorityColors[task.priority] ||
          statusColors[task.status] ||
          "#3b82f6";

        return {
          id: task.id,
          tenant_id: task.tenant_id || "",
          calendar_id: "tasks-calendar", // ID virtual para tareas
          title: task.title,
          description: task.description || null,
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          location: null,
          all_day: task.all_day || false,
          status: task.status,
          // Recurrence (none para tareas básicas)
          recurrence_type: "none",
          recurrence_interval: 0,
          recurrence_end_date: null,
          recurrence_count: null,
          recurrence_days_of_week: null,
          recurrence_day_of_month: null,
          recurrence_month_of_year: null,
          recurrence_rule: null,
          recurrence_exdates: null,
          // Source
          source_type: "tasks",
          source_id: task.id,
          // External integration
          provider: null,
          external_id: null,
          read_only: false,
          organizer_id: task.assigned_to_id,
          metadata: {
            task_id: task.id,
            assigned_to_id: task.assigned_to_id,
            checklist_items: task.checklist_items || task.checklist || [],
            template_id: task.template_id,
            board_order: task.board_order,
            priority: task.priority,
            color: color,
          },
          created_at: task.created_at,
          updated_at: task.updated_at,
        } as CalendarEvent;
      })
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
  }, [tasks]);

  // Calcular estadísticas de tareas
  const stats = useMemo(() => {
    const now = new Date();

    return {
      today: tasks.filter((task) => {
        const taskDate = task.start_at
          ? parseISO(task.start_at)
          : task.due_date
            ? parseISO(task.due_date)
            : null;
        return taskDate && isToday(taskDate);
      }).length,
      overdue: tasks.filter((task) => {
        if (task.status === "done" || task.status === "cancelled") return false;
        const dueDate = task.due_date ? parseISO(task.due_date) : null;
        return dueDate && isPast(dueDate) && !isToday(dueDate);
      }).length,
      done: tasks.filter((task) => task.status === "done").length,
      total: tasks.length,
      thisWeek: tasks.filter((task) => {
        const taskDate = task.start_at
          ? parseISO(task.start_at)
          : task.due_date
            ? parseISO(task.due_date)
            : null;
        if (!taskDate) return false;
        const weekStart = startOfDay(new Date());
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return taskDate >= weekStart && taskDate <= weekEnd;
      }).length,
      thisMonth: tasks.filter((task) => {
        const taskDate = task.start_at
          ? parseISO(task.start_at)
          : task.due_date
            ? parseISO(task.due_date)
            : null;
        if (!taskDate) return false;
        return (
          taskDate.getMonth() === now.getMonth() &&
          taskDate.getFullYear() === now.getFullYear()
        );
      }).length,
    };
  }, [tasks]);

  // Handler para clic en evento (convertir de vuelta a Task)
  const handleEventClick = (event: CalendarEvent) => {
    if (onTaskClick && event.metadata?.task_id) {
      // Encontrar la tarea original
      const task = tasks.find((t) => t.id === event.metadata?.task_id);
      if (task) {
        onTaskClick(task);
      }
    }
  };

  // Función para obtener color de evento
  const getEventColor = (event: CalendarEvent) => {
    return (event.metadata?.color as string) || "#3b82f6";
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando agenda de tareas...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Contenido principal con scroll */}
      <div className="flex-1 overflow-y-auto pb-20">
        <AgendaView
          events={events}
          currentDate={startOfDay(new Date())}
          onEventClick={handleEventClick}
          getEventColor={getEventColor}
          daysToShow={30} // Mostrar próximos 30 días
        />
      </div>

      {/* Resumen de tareas - sticky al final */}
      <div className="sticky bottom-0 border-t border-border/50 dark:border-border/40 bg-[hsl(var(--surface))]/70 dark:bg-[hsl(var(--background))]/70 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-[0_-2px_8px_rgba(0,0,0,0.03)]">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Resumen de tareas
          </p>
          <p className="text-xs text-muted-foreground">Actividad reciente</p>
        </div>
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Hoy
            </p>
            <p className="font-semibold text-base">{stats.today}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Esta semana
            </p>
            <p className="font-semibold text-base">{stats.thisWeek}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Este mes
            </p>
            <p className="font-semibold text-base">{stats.thisMonth}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Atrasadas
            </p>
            <p className="font-semibold text-base text-red-500">
              {stats.overdue}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Completadas
            </p>
            <p className="font-semibold text-base text-emerald-600">
              {stats.done}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Total
            </p>
            <Badge variant="secondary">{stats.total}</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
