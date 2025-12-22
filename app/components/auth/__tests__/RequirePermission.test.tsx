/**
 * Tests for RequirePermission component
 *
 * Note: These are integration tests that mock useAuthStore directly,
 * allowing the real hooks (useHasPermission, usePermissions) to execute
 * with mocked state.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RequirePermission } from "../RequirePermission";
import { useAuthStore } from "~/stores/authStore";

// Mock useAuthStore to control user state
vi.mock("~/stores/authStore", () => ({
  useAuthStore: vi.fn(),
}));

describe("RequirePermission", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation to ensure clean state
    vi.mocked(useAuthStore).mockReset();
  });

  it("should render children when user has permission", () => {
    // Mock user with test.permission - must be set before render
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      const mockState = {
        user: {
          id: "1",
          email: "test@example.com",
          roles: [],
          permissions: ["test.permission"],
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
      <RequirePermission permission="test.permission">
        <div>Content</div>
      </RequirePermission>
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("should not render children when user does not have permission", async () => {
    // Mock user without test.permission - must be set before render
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      const mockState = {
        user: {
          id: "1",
          email: "test@example.com",
          roles: [],
          permissions: ["other.permission"], // No test.permission
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
      <RequirePermission permission="test.permission">
        <div>Content</div>
      </RequirePermission>
    );

    // Wait for React to finish rendering with the mocked state
    await waitFor(() => {
      const contentElement = screen.queryByText("Content");
      expect(contentElement).toBeNull();
    });

    // When hasPermission is false and no fallback, component should return null
    // Check that Content is not in the document
    const contentElement = screen.queryByText("Content");
    expect(contentElement).toBeNull();

    // Container should be empty (firstChild is null when component returns null)
    expect(container.firstChild).toBeNull();
  });

  it("should render fallback when user does not have permission", async () => {
    // Mock user without test.permission - must be set before render
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      const mockState = {
        user: {
          id: "1",
          email: "test@example.com",
          roles: [],
          permissions: ["other.permission"], // No test.permission
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
      <RequirePermission
        permission="test.permission"
        fallback={<div>No Access</div>}
      >
        <div>Content</div>
      </RequirePermission>
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
