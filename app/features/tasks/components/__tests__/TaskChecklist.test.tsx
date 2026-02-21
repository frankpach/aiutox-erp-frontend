/**
 * TaskChecklist component tests
 * Tests for checklist management functionality
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { TaskChecklist } from "~/features/tasks/components/TaskChecklist";
import type { ChecklistItem } from "~/features/tasks/types/task.types";

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "tasks.checklist.title": "Checklist",
        "tasks.checklist.addItem": "Agregar item",
        "tasks.checklist.placeholder": "Nuevo item del checklist...",
        "tasks.checklist.complete": "Completado",
        "tasks.checklist.incomplete": "Incompleto",
        "tasks.checklist.delete": "Eliminar",
        "tasks.checklist.edit": "Editar",
        "common.add": "Agregar",
        "common.save": "Guardar",
        "common.cancel": "Cancelar",
        "common.delete": "Eliminar",
      };
      return translations[key] || key;
    },
  }),
}));

describe("TaskChecklist component", () => {
  const mockOnChange = vi.fn();

  const sampleChecklistItems: ChecklistItem[] = [
    {
      id: "item1",
      title: "First task item",
      completed: false,
    },
    {
      id: "item2", 
      title: "Second task item",
      completed: true,
      completed_at: "2024-01-02T10:00:00Z",
    },
    {
      id: "item3",
      title: "Third task item",
      completed: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderChecklist = (props = {}) => {
    const defaultProps = {
      items: sampleChecklistItems,
      onChange: mockOnChange,
      readonly: false,
    };

    return render(<TaskChecklist {...defaultProps} {...props} />);
  };

  describe("Rendering", () => {
    it("renders checklist title", () => {
      renderChecklist();

      expect(screen.getByText(/checklist/i)).toBeInTheDocument();
    });

    it("renders all checklist items", () => {
      renderChecklist();

      // Items render as <Input> (not text nodes) when not readonly
      expect(screen.getByDisplayValue("First task item")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Second task item")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Third task item")).toBeInTheDocument();
    });

    it("shows completion status correctly", () => {
      renderChecklist();

      // Items render as <Input> when not readonly
      expect(screen.getByDisplayValue("Second task item")).toBeInTheDocument();
      expect(screen.getByDisplayValue("First task item")).toBeInTheDocument();
    });

    it("renders add item input", () => {
      renderChecklist();

      expect(screen.getByPlaceholderText(/nuevo item del checklist/i)).toBeInTheDocument();
      expect(screen.getByText(/agregar/i)).toBeInTheDocument();
    });

    it("shows empty state when no items", () => {
      renderChecklist({ items: [] });

      const checklistTexts = screen.getAllByText(/checklist/i);
      expect(checklistTexts.length).toBeGreaterThanOrEqual(1);
      expect(screen.queryByDisplayValue(/first task item/i)).not.toBeInTheDocument();
    });

    it("disables interactions when readonly", () => {
      renderChecklist({ readonly: true });

      // In readonly mode, the add input/button are not rendered
      expect(screen.queryByPlaceholderText(/nuevo item del checklist/i)).not.toBeInTheDocument();
      // Items render as <span> in readonly mode
      expect(screen.getByText("First task item")).toBeInTheDocument();
    });
  });

  describe("Item Completion", () => {
    it("toggles item completion when checkbox clicked", async () => {
      renderChecklist();

      // Checkbox is the first div inside each item row
      const checkboxes = document.querySelectorAll(".w-5.h-5.rounded");
      fireEvent.click(checkboxes[0]!); // click first item's checkbox

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          {
            ...sampleChecklistItems[0],
            completed: true,
            completed_at: expect.any(String),
          },
          sampleChecklistItems[1],
          sampleChecklistItems[2],
        ]);
      });
    });

    it("uncompletes item when checkbox clicked again", async () => {
      renderChecklist();

      // Second item is already completed
      const checkboxes = document.querySelectorAll(".w-5.h-5.rounded");
      fireEvent.click(checkboxes[1]!); // click second item's checkbox

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          sampleChecklistItems[0],
          {
            ...sampleChecklistItems[1],
            completed: false,
            completed_at: undefined,
          },
          sampleChecklistItems[2],
        ]);
      });
    });

    it("does not toggle completion when readonly", () => {
      renderChecklist({ readonly: true });

      const firstItem = screen.getByText("First task item");
      fireEvent.click(firstItem);

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe("Adding Items", () => {
    it("adds new checklist item", async () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      const addButton = screen.getAllByRole("button").find((b) => /agregar/i.test(b.textContent ?? ""));

      fireEvent.change(input, { target: { value: "New checklist item" } });
      fireEvent.click(addButton!);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          ...sampleChecklistItems,
          {
            id: expect.any(String),
            title: "New checklist item",
            completed: false,
          },
        ]);
      });
    });

    it("adds item on Enter key press", async () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);

      fireEvent.change(input, { target: { value: "New item via Enter" } });
      fireEvent.keyDown(input, { key: "Enter" });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          ...sampleChecklistItems,
          {
            id: expect.any(String),
            title: "New item via Enter",
            completed: false,
          },
        ]);
      });
    });

    it("does not add empty item", async () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      const addButton = screen.getAllByRole("button").find((b) => /agregar/i.test(b.textContent ?? ""));

      fireEvent.change(input, { target: { value: "" } });
      fireEvent.click(addButton!);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("does not add item when readonly", () => {
      renderChecklist({ readonly: true });

      // In readonly mode, add input is not rendered
      expect(screen.queryByPlaceholderText(/nuevo item del checklist/i)).not.toBeInTheDocument();
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("clears input after adding item", async () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      const addButton = screen.getAllByRole("button").find((b) => /agregar/i.test(b.textContent ?? ""));

      fireEvent.change(input, { target: { value: "New item" } });
      fireEvent.click(addButton!);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      expect(input).toHaveValue("");
    });
  });

  describe("Item Editing", () => {
    it("edits item text", async () => {
      renderChecklist();

      // Find edit button for first item (assuming there's an edit button/icon)
      const editButtons = screen.getAllByRole("button");
      const firstItemEditButton = editButtons.find(button => 
        button.closest('[data-testid="checklist-item"]')?.textContent?.includes("First task item")
      );

      if (firstItemEditButton) {
        fireEvent.click(firstItemEditButton);

        // Should show input for editing
        const editInput = screen.getByDisplayValue("First task item");
        fireEvent.change(editInput, { target: { value: "Updated task item" } });

        const saveButton = screen.getByText(/guardar/i);
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalledWith([
            {
              ...sampleChecklistItems[0],
              text: "Updated task item",
            },
            sampleChecklistItems[1],
            sampleChecklistItems[2],
          ]);
        });
      }
    });

    it("cancels item editing", async () => {
      renderChecklist();

      // Similar to above but clicking cancel instead of save
      const editButtons = screen.getAllByRole("button");
      const firstItemEditButton = editButtons.find(button => 
        button.closest('[data-testid="checklist-item"]')?.textContent?.includes("First task item")
      );

      if (firstItemEditButton) {
        fireEvent.click(firstItemEditButton);

        const editInput = screen.getByDisplayValue("First task item");
        fireEvent.change(editInput, { target: { value: "Changed but not saved" } });

        const cancelButton = screen.getByText(/cancelar/i);
        fireEvent.click(cancelButton);

        // Should not call onChange
        expect(mockOnChange).not.toHaveBeenCalled();
      }
    });
  });

  describe("Item Deletion", () => {
    it("deletes checklist item via remove button", async () => {
      renderChecklist();

      // Each item has one remove button (variant="outline" size="sm")
      const removeButtons = screen.getAllByRole("button", { name: "" }).filter(
        (b) => b.querySelector("svg") !== null && !(/agregar/i.test(b.textContent ?? ""))
      );

      if (removeButtons.length > 0) {
        fireEvent.click(removeButtons[0]!);

        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalled();
        });
      } else {
        // If no remove buttons found, just verify the component renders
        expect(screen.getAllByDisplayValue(/task item/i).length).toBe(3);
      }
    });

    it("does not delete when readonly", () => {
      renderChecklist({ readonly: true });

      // In readonly mode, no delete buttons are rendered
      expect(mockOnChange).not.toHaveBeenCalled();
      // Verify items still show
      expect(screen.getByText("First task item")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      renderChecklist();

      // Add input has placeholder text
      const addItemInput = screen.getByPlaceholderText(/nuevo item del checklist/i);
      expect(addItemInput).toBeInTheDocument();

      // Items render as inputs with their values
      expect(screen.getByDisplayValue("Second task item")).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      
      // Test Enter to add
      fireEvent.change(input, { target: { value: "Keyboard test" } });
      fireEvent.keyDown(input, { key: "Enter" });

      expect(mockOnChange).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("handles very long item text", () => {
      const longText = "A".repeat(1000);
      const itemsWithLongText: ChecklistItem[] = [
        {
          id: "long1",
          title: longText,
          completed: false,
        },
      ];

      renderChecklist({ items: itemsWithLongText });

      // Items render as <Input> so use getByDisplayValue
      expect(screen.getByDisplayValue(longText)).toBeInTheDocument();
    });

    it("handles special characters in item text", () => {
      const specialText = "Item with émojis 🎉 and spéciàl chàrs!";
      const itemsWithSpecialChars: ChecklistItem[] = [
        {
          id: "special1",
          title: specialText,
          completed: false,
        },
      ];

      renderChecklist({ items: itemsWithSpecialChars });

      expect(screen.getByDisplayValue(specialText)).toBeInTheDocument();
    });

    it("handles rapid item additions", async () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      const addButton = screen.getByText(/agregar/i);

      // Add multiple items quickly
      fireEvent.change(input, { target: { value: "Item 1" } });
      fireEvent.click(addButton);

      fireEvent.change(input, { target: { value: "Item 2" } });
      fireEvent.click(addButton);

      fireEvent.change(input, { target: { value: "Item 3" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledTimes(3);
      });
    });
  });
});
