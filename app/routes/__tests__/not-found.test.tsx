/**
 * Tests for Not Found page
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import NotFoundPage from "../not-found";

// Mock useAuthStore
interface AuthState {
  isAuthenticated: boolean;
  user: unknown;
}

const mockUseAuthStore = vi.fn();
vi.mock("~/stores/authStore", () => ({
  useAuthStore: (selector: (state: AuthState) => unknown) => mockUseAuthStore(selector),
}));

describe("NotFoundPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuthStore.mockImplementation((selector: (state: AuthState) => unknown) =>
      selector({
        isAuthenticated: false,
        user: null,
      })
    );
  });

  it("should render 404 error page", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/404",
          element: <NotFoundPage />,
        },
      ],
      {
        initialEntries: ["/404"],
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByText(/404/i)).toBeTruthy();
    expect(screen.getByText(/página no encontrada/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /volver al inicio/i })).toBeTruthy();
  });
});

