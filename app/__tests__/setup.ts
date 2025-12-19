import { expect, afterEach } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// CRITICAL: Configure React.act BEFORE importing @testing-library/react
// @testing-library/react checks for React.act when it loads, so we must set it up first
import * as React from "react";
import { act } from "react";

// Configure React 19 act environment
// This tells React that we're in a testing environment and act should be used
(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

// Make React available globally FIRST
// We're making React available globally for testing-library compatibility
(globalThis as typeof globalThis & { React: typeof React }).React = React;

// CRITICAL: Attach act to React object BEFORE @testing-library/react loads
// @testing-library/react checks for React.act first, then falls back to react-dom/test-utils
// React 19 doesn't expose act on React object by default, so we must add it
// Try to attach act to React object - if it fails, we'll handle it gracefully
try {
  // React.act is needed by testing-library, we provide it from react package
  if (!(React as typeof React & { act: typeof act }).act) {
    // Adding act to React object
    (React as typeof React & { act: typeof act }).act = act;
  }
} catch (e) {
  // If we can't modify React directly, create a wrapper
  // This shouldn't happen, but just in case
  console.warn("Could not attach act to React object:", e);
}

// Also attach to global React object (this should always work)
(globalThis as typeof globalThis & { React: typeof React & { act: typeof act } }).React.act = act;

// NOW we can safely import @testing-library/react
// It will find React.act when it checks
import { cleanup } from "@testing-library/react";

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
});

