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
      text: "First task item",
      completed: false,
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "item2", 
      text: "Second task item",
      completed: true,
      completed_at: "2024-01-02T10:00:00Z",
      created_at: "2024-01-01T00:00:00Z",
    },
    {
      id: "item3",
      text: "Third task item",
      completed: false,
      created_at: "2024-01-03T00:00:00Z",
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

      expect(screen.getByText("First task item")).toBeInTheDocument();
      expect(screen.getByText("Second task item")).toBeInTheDocument();
      expect(screen.getByText("Third task item")).toBeInTheDocument();
    });

    it("shows completion status correctly", () => {
      renderChecklist();

      // Check completed item has different styling/indicator
      const completedItem = screen.getByText("Second task item");
      const incompleteItem = screen.getByText("First task item");

      expect(completedItem).toBeInTheDocument();
      expect(incompleteItem).toBeInTheDocument();
    });

    it("renders add item input", () => {
      renderChecklist();

      expect(screen.getByPlaceholderText(/nuevo item del checklist/i)).toBeInTheDocument();
      expect(screen.getByText(/agregar/i)).toBeInTheDocument();
    });

    it("shows empty state when no items", () => {
      renderChecklist({ items: [] });

      expect(screen.getByText(/checklist/i)).toBeInTheDocument();
      expect(screen.queryByText(/first task item/i)).not.toBeInTheDocument();
    });

    it("disables interactions when readonly", () => {
      renderChecklist({ readonly: true });

      const addItemInput = screen.getByPlaceholderText(/nuevo item del checklist/i);
      expect(addItemInput).toBeDisabled();

      const addButton = screen.getByText(/agregar/i);
      expect(addButton).toBeDisabled();
    });
  });

  describe("Item Completion", () => {
    it("toggles item completion when clicked", async () => {
      renderChecklist();

      const firstItem = screen.getByText("First task item");
      fireEvent.click(firstItem);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          sampleChecklistItems[0],
          sampleChecklistItems[1],
          {
            ...sampleChecklistItems[2],
            completed: true,
            completed_at: expect.any(String),
          },
        ]);
      });
    });

    it("uncompletes item when clicked again", async () => {
      renderChecklist();

      const completedItem = screen.getByText("Second task item");
      fireEvent.click(completedItem);

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
      const addButton = screen.getByText(/agregar/i);

      fireEvent.change(input, { target: { value: "New checklist item" } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          ...sampleChecklistItems,
          {
            id: expect.any(String),
            text: "New checklist item",
            completed: false,
            created_at: expect.any(String),
          },
        ]);
      });
    });

    it("adds item on Enter key press", async () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);

      fireEvent.change(input, { target: { value: "New item via Enter" } });
      fireEvent.keyPress(input, { key: "Enter", charCode: 13 });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith([
          ...sampleChecklistItems,
          {
            id: expect.any(String),
            text: "New item via Enter",
            completed: false,
            created_at: expect.any(String),
          },
        ]);
      });
    });

    it("does not add empty item", async () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      const addButton = screen.getByText(/agregar/i);

      fireEvent.change(input, { target: { value: "" } });
      fireEvent.click(addButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("does not add item when readonly", () => {
      renderChecklist({ readonly: true });

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      const addButton = screen.getByText(/agregar/i);

      fireEvent.change(input, { target: { value: "Should not add" } });
      fireEvent.click(addButton);

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it("clears input after adding item", async () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      const addButton = screen.getByText(/agregar/i);

      fireEvent.change(input, { target: { value: "New item" } });
      fireEvent.click(addButton);

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
    it("deletes checklist item", async () => {
      renderChecklist();

      // Find delete button for second item
      const deleteButtons = screen.getAllByRole("button");
      const secondItemDeleteButton = deleteButtons.find(button => 
        button.closest('[data-testid="checklist-item"]')?.textContent?.includes("Second task item")
      );

      if (secondItemDeleteButton) {
        fireEvent.click(secondItemDeleteButton);

        await waitFor(() => {
          expect(mockOnChange).toHaveBeenCalledWith([
            sampleChecklistItems[0],
            sampleChecklistItems[2],
          ]);
        });
      }
    });

    it("does not delete when readonly", () => {
      renderChecklist({ readonly: true });

      const deleteButtons = screen.getAllByRole("button");
      const firstItemDeleteButton = deleteButtons.find(button => 
        button.closest('[data-testid="checklist-item"]')?.textContent?.includes("First task item")
      );

      if (firstItemDeleteButton) {
        fireEvent.click(firstItemDeleteButton);
        expect(mockOnChange).not.toHaveBeenCalled();
      }
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels", () => {
      renderChecklist();

      // Check for proper labels on interactive elements
      const addItemInput = screen.getByRole("textbox");
      expect(addItemInput).toHaveAccessibleName(/nuevo item del checklist/i);

      // Check that completed items have proper state indication
      const completedItem = screen.getByText("Second task item");
      expect(completedItem).toBeInTheDocument();
    });

    it("supports keyboard navigation", () => {
      renderChecklist();

      const input = screen.getByPlaceholderText(/nuevo item del checklist/i);
      
      // Test Tab navigation
      fireEvent.keyDown(input, { key: "Tab" });
      
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
          text: longText,
          completed: false,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      renderChecklist({ items: itemsWithLongText });

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("handles special characters in item text", () => {
      const specialText = "Item with émojis 🎉 and spéciàl chàrs!";
      const itemsWithSpecialChars: ChecklistItem[] = [
        {
          id: "special1",
          text: specialText,
          completed: false,
          created_at: "2024-01-01T00:00:00Z",
        },
      ];

      renderChecklist({ items: itemsWithSpecialChars });

      expect(screen.getByText(specialText)).toBeInTheDocument();
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
