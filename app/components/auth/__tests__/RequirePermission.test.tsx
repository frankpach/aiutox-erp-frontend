/**
 * Tests for RequirePermission component
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { RequirePermission } from "../RequirePermission";
import * as permissionsHook from "~/hooks/usePermissions";

// Mock useHasPermission
vi.mock("~/hooks/usePermissions", () => ({
  useHasPermission: vi.fn(),
}));

describe("RequirePermission", () => {
  it("should render children when user has permission", () => {
    vi.mocked(permissionsHook.useHasPermission).mockReturnValue(true);

    const { getByText } = render(
      <RequirePermission permission="test.permission">
        <div>Content</div>
      </RequirePermission>
    );

    expect(getByText("Content")).toBeTruthy();
  });

  it("should not render children when user does not have permission", () => {
    vi.mocked(permissionsHook.useHasPermission).mockReturnValue(false);

    const { queryByText } = render(
      <RequirePermission permission="test.permission">
        <div>Content</div>
      </RequirePermission>
    );

    expect(queryByText("Content")).toBeNull();
  });

  it("should render fallback when user does not have permission", () => {
    vi.mocked(permissionsHook.useHasPermission).mockReturnValue(false);

    const { getByText, queryByText } = render(
      <RequirePermission
        permission="test.permission"
        fallback={<div>No Access</div>}
      >
        <div>Content</div>
      </RequirePermission>
    );

    expect(queryByText("Content")).toBeNull();
    expect(getByText("No Access")).toBeTruthy();
  });
});


