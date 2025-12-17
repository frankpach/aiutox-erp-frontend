/**
 * Tests for useFilterUrlSync hook
 */

import { describe, it, expect, beforeEach } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import React from "react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { useFilterUrlSync } from "../useFilterUrlSync";

// Test component that uses the hook and exposes result
let testHookResult: ReturnType<typeof useFilterUrlSync> | null = null;
let onResultChange: ((result: ReturnType<typeof useFilterUrlSync>) => void) | null = null;

function TestComponent() {
  const result = useFilterUrlSync();
  // Update on every render
  testHookResult = result;
  if (onResultChange) {
    onResultChange(result);
  }
  return React.createElement("div", { "data-testid": "test-component" }, "Test");
}

// Helper to render component with router context
function renderWithRouter(initialEntries = ["/test"]) {
  testHookResult = null;
  const router = createMemoryRouter(
    [
      {
        path: "/test",
        element: React.createElement(TestComponent),
      },
    ],
    {
      initialEntries,
    }
  );

  render(React.createElement(RouterProvider, { router }));

  return {
    get result() {
      return testHookResult;
    },
    router,
  };
}

describe("useFilterUrlSync", () => {
  beforeEach(() => {
    // Clear URL params
    window.history.replaceState({}, "", "/test");
    testHookResult = null;
    onResultChange = null;
  });

  it("should initialize with filter ID from URL", async () => {
    const { result } = renderWithRouter(["/test?saved_filter_id=filter-123"]);

    await waitFor(
      () => {
        expect(result).not.toBeNull();
        expect(result?.filterId).toBe("filter-123");
      },
      { timeout: 2000 }
    );
  });

  it("should initialize with null when no filter ID in URL", async () => {
    const { result } = renderWithRouter(["/test"]);

    await waitFor(
      () => {
        expect(result).not.toBeNull();
        expect(result?.filterId).toBeNull();
      },
      { timeout: 2000 }
    );
  });

  it("should update filter ID in URL", async () => {
    const { result } = renderWithRouter(["/test"]);

    await waitFor(
      () => {
        expect(result).not.toBeNull();
      },
      { timeout: 2000 }
    );

    const updateFn = result?.updateFilterId;
    expect(updateFn).toBeDefined();

    let updatedResult: ReturnType<typeof useFilterUrlSync> | null = null;
    onResultChange = (r) => {
      updatedResult = r;
    };

    await act(async () => {
      updateFn?.("filter-456");
    });

    await waitFor(
      () => {
        expect(updatedResult?.filterId).toBe("filter-456");
      },
      { timeout: 2000 }
    );

    onResultChange = null;
  });

  it("should clear filter ID from URL", async () => {
    const { result } = renderWithRouter(["/test?saved_filter_id=filter-123"]);

    await waitFor(
      () => {
        expect(result).not.toBeNull();
        expect(result?.filterId).toBe("filter-123");
      },
      { timeout: 2000 }
    );

    const clearFn = result?.clearFilterId;
    expect(clearFn).toBeDefined();

    let updatedResult: ReturnType<typeof useFilterUrlSync> | null = null;
    onResultChange = (r) => {
      updatedResult = r;
    };

    await act(async () => {
      clearFn?.();
    });

    await waitFor(
      () => {
        expect(updatedResult?.filterId).toBeNull();
      },
      { timeout: 2000 }
    );

    onResultChange = null;
  });
});
