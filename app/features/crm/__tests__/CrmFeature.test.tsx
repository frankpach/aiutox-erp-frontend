import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CrmList } from "../components/CrmList";

vi.mock("../hooks/useCrm", () => ({
  usePipelines: () => ({
    data: { meta: { total: 2 } },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "crm.title": "CRM",
        "crm.description": "Gestion de clientes",
      };
      return translations[key] || key;
    },
  }),
}));

describe("CRM feature", () => {
  it("renders crm title and description", () => {
    render(<CrmList />);

    expect(screen.getByText("CRM")).toBeInTheDocument();
    expect(screen.getByText("Gestion de clientes")).toBeInTheDocument();
    expect(screen.getByText("crm.totalPipelines: 2")).toBeInTheDocument();
  });
});
