/**
 * @jest-environment jsdom
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReminderManager } from "~/features/calendar/components/ReminderManager";
import type { EventReminder } from "~/features/calendar/types/calendar.types";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "calendar.reminders.title": "Recordatorios",
        "calendar.reminders.add": "Agregar Recordatorio",
        "calendar.reminders.add_first": "Agregar Primer Recordatorio",
        "calendar.reminders.no_reminders": "No hay recordatorios configurados",
        "calendar.reminders.at_start_time": "Al inicio del evento",
        "calendar.reminders.minutes_before": "minutos antes",
        "calendar.reminders.hours_before": "horas antes",
        "calendar.reminders.days_before": "días antes",
        "calendar.reminders.when": "Cuándo",
        "calendar.reminders.type": "Tipo",
        "calendar.reminders.types.email": "Correo electrónico",
        "calendar.reminders.types.in_app": "Notificación en la aplicación",
        "calendar.reminders.types.push": "Notificación push",
        "common.cancel": "Cancelar",
        "common.save": "Guardar",
      };
      return translations[key] || key;
    },
  }),
}));

describe("ReminderManager", () => {
  const mockReminders: EventReminder[] = [
    { id: "1", minutes_before: 15, reminder_type: "in_app" },
    { id: "2", minutes_before: 60, reminder_type: "email" },
  ];

  const mockOnAddReminder = vi.fn();
  const mockOnUpdateReminder = vi.fn();
  const mockOnDeleteReminder = vi.fn();

  it("renders reminder manager with existing reminders", () => {
    render(
      <ReminderManager
        eventId="test-event"
        reminders={mockReminders}
        onAddReminder={mockOnAddReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
      />
    );

    expect(screen.getByText("Recordatorios")).toBeInTheDocument();
    expect(screen.getByText("15 minutos antes")).toBeInTheDocument();
    expect(screen.getByText("60 minutos antes")).toBeInTheDocument();
    expect(screen.getByText("Notificación en la aplicación")).toBeInTheDocument();
    expect(screen.getByText("Correo electrónico")).toBeInTheDocument();
  });

  it("renders empty state when no reminders", () => {
    render(
      <ReminderManager
        eventId="test-event"
        reminders={[]}
        onAddReminder={mockOnAddReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
      />
    );

    expect(screen.getByText("Recordatorios")).toBeInTheDocument();
    expect(screen.getByText("No hay recordatorios configurados")).toBeInTheDocument();
    expect(screen.getByText("Agregar Primer Recordatorio")).toBeInTheDocument();
  });

  it("calls onAddReminder when add button is clicked", () => {
    render(
      <ReminderManager
        eventId="test-event"
        reminders={[]}
        onAddReminder={mockOnAddReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
      />
    );

    const addButton = screen.getByText("Agregar Recordatorio");
    fireEvent.click(addButton);

    expect(mockOnAddReminder).toHaveBeenCalledWith({
      minutes_before: 15,
      reminder_type: "in_app",
    });
  });

  it("calls onDeleteReminder when delete button is clicked", () => {
    render(
      <ReminderManager
        eventId="test-event"
        reminders={mockReminders}
        onAddReminder={mockOnAddReminder}
        onUpdateReminder={mockOnUpdateReminder}
        onDeleteReminder={mockOnDeleteReminder}
      />
    );

    const deleteButtons = screen.getAllByText("×");
    if (deleteButtons[0]) {
      fireEvent.click(deleteButtons[0]);
    }

    expect(mockOnDeleteReminder).toHaveBeenCalledWith("1");
  });
});
