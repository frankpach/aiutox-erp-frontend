/**
 * Tests for Login page
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  getState: () => AuthState;
}

const mockAuthStoreState = {
  isAuthenticated: false,
  user: null,
  getState: () => mockAuthStoreState,
};

vi.mock("~/stores/authStore", () => ({
  useAuthStore: Object.assign(
    vi.fn((selector: (state: AuthState) => unknown) =>
      selector(mockAuthStoreState as AuthState)
    ),
    {
      getState: () => mockAuthStoreState,
    }
  ),
}));

// Mock sanitizeEmail
vi.mock("~/lib/security/sanitize", () => ({
  sanitizeEmail: (email: string) => email, // Return email as-is for tests
}));

// Mock checkRateLimit
vi.mock("~/lib/security/rateLimit", () => ({
  checkRateLimit: vi.fn(() => ({ allowed: true, remaining: 5 })),
}));

// Mock checkRoutePermission
vi.mock("~/lib/utils/routePermissions", () => ({
  checkRoutePermission: vi.fn(() => true),
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

  it("should render remember me checkbox", () => {
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

    // Radix UI Checkbox uses role="checkbox" instead of type="checkbox"
    const rememberMeCheckbox = screen.getByRole("checkbox", { name: /recordarme/i });
    expect(rememberMeCheckbox).toBeTruthy();
    expect(rememberMeCheckbox).toHaveAttribute("role", "checkbox");
  });

  it("should have remember_me=false by default in form", () => {
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

    // Verify checkbox exists and is unchecked by default
    const rememberMeCheckbox = screen.getByRole("checkbox", { name: /recordarme/i });
    expect(rememberMeCheckbox).toBeTruthy();
    expect(rememberMeCheckbox).toHaveAttribute("aria-checked", "false");
  });

  it("should have remember_me field in form schema", () => {
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

    // Verify checkbox exists and is part of the form
    const rememberMeCheckbox = screen.getByRole("checkbox", { name: /recordarme/i });
    expect(rememberMeCheckbox).toBeTruthy();

    // Verify it's associated with a label (use getAllByText and take first)
    const labels = screen.getAllByText(/recordarme/i);
    expect(labels.length).toBeGreaterThan(0);

    // Verify checkbox is in the form
    const form = rememberMeCheckbox.closest("form");
    expect(form).toBeTruthy();
  });

  it("should work with form validation when remember_me is checked", async () => {
    const mockLogin = vi.fn().mockResolvedValue({ success: true });
    vi.mocked(useAuthHook.useAuth).mockReturnValue({
      login: mockLogin,
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

    const user = userEvent.setup();
    render(<RouterProvider router={router} />);

    const rememberMeCheckbox = screen.getByRole("checkbox", { name: /recordarme/i });

    // Checkbox should be unchecked by default
    expect(rememberMeCheckbox).toHaveAttribute("aria-checked", "false");

    // Click to check
    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toHaveAttribute("aria-checked", "true");

    // Click again to uncheck
    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toHaveAttribute("aria-checked", "false");
  });
});


