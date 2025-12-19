/**
 * Tests for Login page
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import LoginPage from "../login";
import * as useAuthHook from "~/hooks/useAuth";

// Mock useAuth
vi.mock("~/hooks/useAuth", () => ({
  useAuth: vi.fn(),
}));

// Mock useAuthStore
interface AuthState {
  isAuthenticated: boolean;
  user: unknown;
}

vi.mock("~/stores/authStore", () => ({
  useAuthStore: vi.fn((selector: (state: AuthState) => unknown) =>
    selector({
      isAuthenticated: false,
      user: null,
    })
  ),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render login form", () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
      user: null,
    });

    const router = createMemoryRouter(
      [
        {
          path: "/login",
          element: <LoginPage />,
        },
      ],
      {
        initialEntries: ["/login"],
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByLabelText(/contraseña/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeTruthy();
  });

  it("should show form fields", () => {
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
      user: null,
    });

    const router = createMemoryRouter(
      [
        {
          path: "/login",
          element: <LoginPage />,
        },
      ],
      {
        initialEntries: ["/login"],
      }
    );

    render(<RouterProvider router={router} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
    expect(emailInput.getAttribute("type")).toBe("email");
    expect(passwordInput.getAttribute("type")).toBe("password");
  });
});


