/**
 * Tests for Unauthorized page
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import UnauthorizedPage from "../unauthorized";

// Mock useAuthStore
interface AuthState {
  isAuthenticated: boolean;
  user: unknown;
}

const mockUseAuthStore = vi.fn();
vi.mock("~/stores/authStore", () => ({
  useAuthStore: (selector: (state: AuthState) => unknown) => mockUseAuthStore(selector),
}));

describe("UnauthorizedPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: (state: AuthState) => unknown) =>
      selector({
        isAuthenticated: false,
        user: null,
      })
    );
  });

  it("should render 403 error page", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/unauthorized",
          element: <UnauthorizedPage />,
        },
      ],
      {
        initialEntries: ["/unauthorized"],
      }
    );

    const { container } = render(<RouterProvider router={router} />);

    // Use container queries instead of screen queries to avoid hanging
    expect(container.textContent).toContain("403");
    expect(container.textContent).toContain("Acceso Denegado");
  });
});


