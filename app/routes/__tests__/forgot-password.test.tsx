/**
 * Tests for Forgot Password page
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import ForgotPasswordPage from "../forgot-password";

// Mock auth API
vi.mock("~/lib/api/auth.api", () => ({
  forgotPassword: vi.fn(),
}));

describe("ForgotPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render forgot password form", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/forgot-password",
          element: <ForgotPasswordPage />,
        },
      ],
      {
        initialEntries: ["/forgot-password"],
      }
    );

    render(<RouterProvider router={router} />);

    expect(screen.getByLabelText(/email/i)).toBeTruthy();
    expect(screen.getByRole("button", { name: /enviar enlace/i })).toBeTruthy();
  });

  it("should have link to login page", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/forgot-password",
          element: <ForgotPasswordPage />,
        },
      ],
      {
        initialEntries: ["/forgot-password"],
      }
    );

    render(<RouterProvider router={router} />);

    const loginLink = screen.getByRole("link", { name: /volver al inicio de sesión/i });
    expect(loginLink).toBeTruthy();
    expect(loginLink.getAttribute("href")).toBe("/login");
  });
});

