/**
 * Tests for RequireRole component
 *
 * Note: These are integration tests that mock useAuthStore directly,
 * allowing the real hooks (useHasRole, usePermissions) to execute
 * with mocked state.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RequireRole } from "../RequireRole";
import { useAuthStore } from "~/stores/authStore";

// Mock useAuthStore to control user state
vi.mock("~/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("RequireRole", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation to ensure clean state
    vi.mocked(useAuthStore).mockReset();
  });

  it("should render children when user has role", () => {
    // Mock user with admin role - must be set before render
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      const mockState = {
        user: {
          id: "1",
          email: "test@example.com",
          roles: ["admin"],
          permissions: [],
        },
        isAuthenticated: true,
      };
      // usePermissions calls useAuthStore with (state) => state.user
      if (selector && typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    });

    render(
      <RequireRole role="admin">
        <div>Content</div>
      </RequireRole>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should not render children when user does not have role", async () => {
    // Mock user without admin role - MUST be set BEFORE render
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      const mockState = {
        user: {
          id: "1",
          email: "test@example.com",
          roles: ["user"], // No admin role - user does NOT have "admin"
          permissions: [],
        },
        isAuthenticated: true,
      };
      // usePermissions calls useAuthStore with (state) => state.user
      if (selector && typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    });

    const { container } = render(
      <RequireRole role="admin">
        <div>Content</div>
      </RequireRole>
    );

    // Wait for React to finish rendering with the mocked state
    await waitFor(() => {
      const contentElement = screen.queryByText("Content");
      expect(contentElement).toBeNull();
    });

    // When hasRole is false and no fallback, component should return null
    // Check that Content is not in the document
    const contentElement = screen.queryByText("Content");
    expect(contentElement).toBeNull();

    // Container should be empty (firstChild is null when component returns null)
    expect(container.firstChild).toBeNull();
  });

  it("should render fallback when user does not have role", async () => {
    // Mock user without admin role - MUST be set BEFORE render
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      const mockState = {
        user: {
          id: "1",
          email: "test@example.com",
          roles: ["user"], // No admin role - user does NOT have "admin"
          permissions: [],
        },
        isAuthenticated: true,
      };
      // usePermissions calls useAuthStore with (state) => state.user
      if (selector && typeof selector === 'function') {
        return selector(mockState);
      }
      return mockState;
    });

    render(
      <RequireRole role="admin" fallback={<div>No Access</div>}>
        <div>Content</div>
      </RequireRole>
    );

    // Wait for React to finish rendering with the mocked state
    await waitFor(() => {
      // Fallback should be rendered
      expect(screen.getByText("No Access")).toBeInTheDocument();
    });

    // Content should not be rendered
    expect(screen.queryByText("Content")).toBeNull();
  });
});
