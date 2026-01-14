/**
 * TaskCalendar component
 * Calendar view for tasks with due dates
 */

import { useState } from "react";
import { useTranslation } from "~/lib/i18n/useTranslation";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";
import { TaskQuickAdd } from "./TaskQuickAdd";
import type { Task } from "../types/task.types";

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskCreate?: () => void;
  loading?: boolean;
}

export function TaskCalendar({
  tasks,
  onTaskClick,
  onTaskCreate,
  loading,
}: TaskCalendarProps) {
  const { t } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const priorityColors: Record<string, string> = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const calendarDays = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    );
  }

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Calendario de Tareas</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoy
          </Button>
          <Button onClick={() => setIsQuickAddOpen(true)}>
            <HugeiconsIcon icon={Add01Icon} size={16} className="mr-2" />
            Crear Tarea
          </Button>
        </div>
      </div>

      {/* TaskQuickAdd Modal */}
      <TaskQuickAdd
        open={isQuickAddOpen}
        onOpenChange={setIsQuickAddOpen}
        onTaskCreated={() => {
          setIsQuickAddOpen(false);
          onTaskCreate?.();
        }}
      />

      <div className="flex-1 bg-background rounded-lg border p-4">
        {/* Month navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={20} />
          </Button>
          <h3 className="text-lg font-semibold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <Button variant="ghost" size="icon" onClick={goToNextMonth}>
            <HugeiconsIcon icon={ArrowRight01Icon} size={20} />
          </Button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {loading ? (
            <div className="col-span-7 space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-24 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : (
            calendarDays.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-24" />;
              }

              const dayTasks = getTasksForDate(date);
              const isCurrentDay = isToday(date);

              return (
                <div
                  key={index}
                  className={`h-24 border rounded-lg p-2 cursor-pointer hover:bg-muted/50 transition-colors ${
                    isCurrentDay
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                  onClick={() => {
                    if (dayTasks.length === 1 && dayTasks[0]) {
                      onTaskClick?.(dayTasks[0]);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isCurrentDay ? "text-primary" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {dayTasks.length}
                    </span>
                  </div>
                  <div className="space-y-1 overflow-y-auto">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className="text-xs p-1 rounded bg-muted hover:bg-muted/80 truncate cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className={priorityColors[task.priority]}
                            style={{ padding: "0 4px", fontSize: "8px" }}
                          >
                            {t(`tasks.priorities.${task.priority}`)}
                          </Badge>
                          <span className="truncate">{task.title}</span>
                        </div>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayTasks.length - 3} más
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
