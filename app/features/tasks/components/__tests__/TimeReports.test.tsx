/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TimeReports } from "~/features/tasks/components/TimeReports";
import type { Task } from "~/features/tasks/types/task.types";
import type { TimeEntry } from "~/features/tasks/hooks/useTimeTracking";

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "tasks.timeReports.title": "Reportes de Tiempo",
        "tasks.timeReports.noEntries": "Sin entradas de tiempo",
        "tasks.timeReports.noEntriesDescription": "Registra tiempo para ver reportes",
        "tasks.timeReports.allTime": "Todo el tiempo",
        "tasks.timeReports.thisWeek": "Esta semana",
        "tasks.timeReports.thisMonth": "Este mes",
        "tasks.timeReports.last30Days": "Últimos 30 días",
        "tasks.timeReports.totalTracked": "Total registrado",
        "tasks.timeReports.totalEstimated": "Total estimado",
        "tasks.timeReports.efficiency": "Eficiencia",
        "tasks.timeReports.byTask": "Por tarea",
        "tasks.timeReports.tracked": "Registrado",
        "tasks.timeReports.estimated": "Estimado",
        "tasks.timeReports.difference": "Diferencia",
        "tasks.timeReports.exportCsv": "Exportar CSV",
        "tasks.timeReports.taskName": "Tarea",
        "tasks.timeReports.onTrack": "En tiempo",
      };
      return map[key] ?? key;
    },
    language: "es",
  }),
}));

const mockTask: Task = {
  id: "task-1",
  title: "Tarea de prueba",
  status: "in_progress",
  priority: "medium",
} as Task;

const mockEntries: TimeEntry[] = [
  {
    id: "entry-1",
    task_id: "task-1",
    user_id: "user-1",
    start_time: "2026-02-01T10:00:00Z",
    end_time: "2026-02-01T12:00:00Z",
    duration_seconds: 7200, // 2h
    notes: null,
    entry_type: "timer",
    created_at: "2026-02-01T10:00:00Z",
    updated_at: "2026-02-01T12:00:00Z",
  },
  {
    id: "entry-2",
    task_id: "task-1",
    user_id: "user-1",
    start_time: "2026-02-02T09:00:00Z",
    end_time: "2026-02-02T10:30:00Z",
    duration_seconds: 5400, // 1.5h
    notes: null,
    entry_type: "manual",
    created_at: "2026-02-02T09:00:00Z",
    updated_at: "2026-02-02T10:30:00Z",
  },
];

describe("TimeReports", () => {
  it("muestra mensaje vacío cuando no hay entradas", () => {
    render(
      <TimeReports tasks={[mockTask]} timeEntriesByTask={{}} />,
    );
    expect(screen.getByText("Sin entradas de tiempo")).toBeInTheDocument();
  });

  it("muestra resumen con total registrado", () => {
    render(
      <TimeReports
        tasks={[mockTask]}
        timeEntriesByTask={{ "task-1": mockEntries }}
      />,
    );

    expect(screen.getByText("Reportes de Tiempo")).toBeInTheDocument();
    expect(screen.getByText("Total registrado")).toBeInTheDocument();
    // 2h + 1.5h = 3h 30m
    expect(screen.getByText("3h 30m")).toBeInTheDocument();
  });

  it("muestra eficiencia cuando hay estimación", () => {
    render(
      <TimeReports
        tasks={[mockTask]}
        timeEntriesByTask={{ "task-1": mockEntries }}
        estimatedHoursByTask={{ "task-1": 4 }}
      />,
    );

    expect(screen.getByText("Total estimado")).toBeInTheDocument();
    expect(screen.getByText("Eficiencia")).toBeInTheDocument();
  });

  it("muestra desglose por tarea", () => {
    render(
      <TimeReports
        tasks={[mockTask]}
        timeEntriesByTask={{ "task-1": mockEntries }}
      />,
    );

    expect(screen.getByText("Por tarea")).toBeInTheDocument();
    expect(screen.getByText("Tarea de prueba")).toBeInTheDocument();
  });

  it("muestra botón de exportar CSV", () => {
    render(
      <TimeReports
        tasks={[mockTask]}
        timeEntriesByTask={{ "task-1": mockEntries }}
      />,
    );

    expect(screen.getByText("Exportar CSV")).toBeInTheDocument();
  });

  it("muestra guión cuando no hay estimación", () => {
    render(
      <TimeReports
        tasks={[mockTask]}
        timeEntriesByTask={{ "task-1": mockEntries }}
      />,
    );

    // Total estimado muestra "-"
    const estimatedCard = screen.getByText("Total estimado").closest("div");
    expect(estimatedCard?.textContent).toContain("-");
  });
});
