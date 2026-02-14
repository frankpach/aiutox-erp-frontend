import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { InventoryList } from "../components/InventoryList";

vi.mock("../hooks/useInventory", () => ({
  useWarehouses: () => ({
    data: { meta: { total: 3 } },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "inventory.title": "Inventario",
        "inventory.description": "Gestion de inventario",
      };
      return translations[key] || key;
    },
  }),
}));

describe("Inventory feature", () => {
  it("renders inventory title and description", () => {
    render(<InventoryList />);

    expect(screen.getByText("Inventario")).toBeInTheDocument();
    expect(screen.getByText("Gestion de inventario")).toBeInTheDocument();
    expect(screen.getByText("inventory.totalWarehouses: 3")).toBeInTheDocument();
  });
});
