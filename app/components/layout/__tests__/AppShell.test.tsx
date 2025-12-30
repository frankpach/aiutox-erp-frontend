/**
 * Tests for AppShell component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { AppShell } from "../AppShell";

// Mock sidebar store
vi.mock("~/stores/sidebarStore", () => ({
  useSidebarStore: () => ({
    isSidebarOpen: true,
    isSidebarCollapsed: false,
    setIsSidebarOpen: vi.fn(),
    setIsSidebarCollapsed: vi.fn(),
    toggleSidebar: vi.fn(),
    toggleCollapse: vi.fn(),
  }),
}));

// Mock child components to simplify testing
vi.mock("../Header", () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("../Sidebar", () => ({
  Sidebar: () => <aside data-testid="sidebar">Sidebar</aside>,
}));

vi.mock("../MainContent", () => ({
  MainContent: ({ children }: { children: React.ReactNode }) => (
    <main data-testid="main-content">{children}</main>
  ),
}));

vi.mock("../Footer", () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

describe("AppShell", () => {
  beforeEach(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 1280,
    });
  });

  it("should render correctly with all components", () => {
    const { getByTestId } = render(
      <AppShell>
        <div>Test Content</div>
      </AppShell>
    );

    expect(getByTestId("header")).toBeTruthy();
    expect(getByTestId("sidebar")).toBeTruthy();
    expect(getByTestId("main-content")).toBeTruthy();
    expect(getByTestId("footer")).toBeTruthy();
  });

  it("should render children in MainContent", () => {
    const { getAllByText } = render(
      <AppShell>
        <div>Test Content</div>
      </AppShell>
    );

    // In StrictMode, components render twice, so we check for at least one instance
    const elements = getAllByText("Test Content");
    expect(elements.length).toBeGreaterThan(0);
  });
});






















