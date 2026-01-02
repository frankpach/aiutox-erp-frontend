/**
 * Tests for Header component
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Header } from "../Header";

// Mock child components
vi.mock("../UserMenu", () => ({
  UserMenu: () => <div data-testid="user-menu">UserMenu</div>,
}));

vi.mock("../SidebarToggle", () => ({
  SidebarToggle: ({ onClick, isOpen }: { onClick?: () => void; isOpen?: boolean }) => (
    <button data-testid="sidebar-toggle" onClick={onClick} aria-expanded={isOpen}>
      Toggle
    </button>
  ),
}));

// Mock useNavigate
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe("Header", () => {
  it("should render correctly", () => {
    const { getByText, getByTestId } = render(<Header />);

    expect(getByText("AiutoX ERP")).toBeTruthy();
    expect(getByTestId("user-menu")).toBeTruthy();
  });

  it("should render SidebarToggle", () => {
    const { getByTestId } = render(<Header onSidebarToggle={() => {}} isSidebarOpen={false} />);

    expect(getByTestId("sidebar-toggle")).toBeTruthy();
  });

  it("should call onSidebarToggle when toggle is clicked", () => {
    const handleToggle = vi.fn();
    const { getByTestId } = render(
      <Header onSidebarToggle={handleToggle} isSidebarOpen={false} />
    );

    const toggle = getByTestId("sidebar-toggle");
    toggle.click();

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("should have correct ARIA attributes", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");

    expect(header?.getAttribute("role")).toBe("banner");
  });
});






















