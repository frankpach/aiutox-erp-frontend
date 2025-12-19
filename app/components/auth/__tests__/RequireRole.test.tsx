/**
 * Tests for RequireRole component
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { RequireRole } from "../RequireRole";
import * as permissionsHook from "~/hooks/usePermissions";

// Mock useHasRole
vi.mock("~/hooks/usePermissions", () => ({
  useHasRole: vi.fn(),
}));

describe("RequireRole", () => {
  it("should render children when user has role", () => {
    vi.mocked(permissionsHook.useHasRole).mockReturnValue(true);

    const { getByText } = render(
      <RequireRole role="admin">
        <div>Content</div>
      </RequireRole>
    );

    expect(getByText("Content")).toBeTruthy();
  });

  it("should not render children when user does not have role", () => {
    vi.mocked(permissionsHook.useHasRole).mockReturnValue(false);

    const { queryByText } = render(
      <RequireRole role="admin">
        <div>Content</div>
      </RequireRole>
    );

    expect(queryByText("Content")).toBeNull();
  });

  it("should render fallback when user does not have role", () => {
    vi.mocked(permissionsHook.useHasRole).mockReturnValue(false);

    const { getByText, queryByText } = render(
      <RequireRole role="admin" fallback={<div>No Access</div>}>
        <div>Content</div>
      </RequireRole>
    );

    expect(queryByText("Content")).toBeNull();
    expect(getByText("No Access")).toBeTruthy();
  });
});


