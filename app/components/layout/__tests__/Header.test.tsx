/**
 * Tests for Header component
 */

import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { Header } from "../Header";

// Mock useUsers hook para TaskQuickAdd
vi.mock("~/features/users/hooks/useUsers", () => ({
  useUsers: () => ({
    users: [
      { id: "1", first_name: "John", last_name: "Doe", email: "john@example.com" },
      { id: "2", first_name: "Jane", last_name: "Smith", email: "jane@example.com" },
    ],
    isLoading: false,
    error: null,
  }),
}));

// Mock useTags hook para TaskQuickAdd
vi.mock("~/features/tags/hooks/useTags", () => ({
  useTags: () => ({
    data: [
      { id: "1", name: "urgent", color: "#ff0000" },
      { id: "2", name: "important", color: "#00ff00" },
    ],
    isLoading: false,
    error: null,
  }),
}));

// Mock useTheme
vi.mock("~/providers", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
  }),
}));

// Mock useTranslation
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "common.appName": "AiutoX ERP",
        "header.search.placeholder": "Search...",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock child components
vi.mock("../UserMenu", () => ({
  UserMenu: () => <div data-testid="user-menu">UserMenu</div>,
}));

vi.mock("../SidebarToggle", () => ({
  SidebarToggle: ({
    onClick,
    isOpen,
  }: {
    onClick?: () => void;
    isOpen?: boolean;
  }) => (
    <button
      data-testid="sidebar-toggle"
      onClick={onClick}
      aria-expanded={isOpen}
    >
      Toggle
    </button>
  ),
}));

// Mock NotificationBell
vi.mock("~/components/notifications/NotificationBell", () => ({
  NotificationBell: () => (
    <div data-testid="notification-bell">Notifications</div>
  ),
}));

// Mock useQuickActions para evitar error de useLocation
vi.mock("~/hooks/useQuickActions", () => ({
  useQuickActions: () => [],
}));

// Mock useLocation
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({
      pathname: "/",
      search: "",
      hash: "",
      state: null,
      key: "test",
    }),
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

// Wrapper con RouterProvider y QueryClientProvider para tests
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const routeWithChildren = createMemoryRouter([
    {
      path: "/",
      element: children,
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={routeWithChildren} />
    </QueryClientProvider>
  );
};

describe("Header", () => {
  it("should render correctly", () => {
    const { getByText, getByTestId } = render(<Header />, {
      wrapper: Wrapper,
    });

    expect(getByText("AiutoX ERP")).toBeTruthy();
    expect(getByTestId("user-menu")).toBeTruthy();
  });

  it("should render SidebarToggle", () => {
    const { getByTestId } = render(
      <Header onSidebarToggle={() => {}} isSidebarOpen={false} />,
      { wrapper: Wrapper }
    );

    expect(getByTestId("sidebar-toggle")).toBeTruthy();
  });

  it("should call onSidebarToggle when toggle is clicked", () => {
    const handleToggle = vi.fn();
    const { getByTestId } = render(
      <Header onSidebarToggle={handleToggle} isSidebarOpen={false} />,
      { wrapper: Wrapper }
    );

    const toggle = getByTestId("sidebar-toggle");
    toggle.click();

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("should have correct ARIA attributes", () => {
    const { container } = render(<Header />, { wrapper: Wrapper });
    const header = container.querySelector("header");

    expect(header?.getAttribute("role")).toBe("banner");
  });
});

