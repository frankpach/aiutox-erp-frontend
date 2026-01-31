/**
 * Setup file for Vitest tests
 * Configures global mocks and environment for testing
 */

import { vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock apiClient to prevent real API calls
vi.mock("~/lib/api/client", () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: {
        data: {},
        meta: null,
        error: null,
      },
    }),
    post: vi.fn().mockResolvedValue({
      data: {
        data: {},
        meta: null,
        error: null,
      },
    }),
    put: vi.fn().mockResolvedValue({
      data: {
        data: {},
        meta: null,
        error: null,
      },
    }),
    delete: vi.fn().mockResolvedValue({
      data: {
        data: {},
        meta: null,
        error: null,
      },
    }),
  },
}));

// Mock useTranslation hook
vi.mock("~/lib/i18n/useTranslation", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      // Return English translations for common keys
      const translations: Record<string, string> = {
        "calendar.views.month": "Month",
        "calendar.views.week": "Week",
        "calendar.views.day": "Day",
        "calendar.views.agenda": "Agenda",
        "calendar.today": "Today",
        "calendar.loading": "Loading calendar...",
        "calendar.events.create": "Create Event",
        "calendar.events.edit": "Edit Event",
        "calendar.events.calendar": "Calendar",
        "calendar.events.calendar.placeholder": "Select calendar",
        "calendar.events.title": "Event Title",
        "calendar.events.title.placeholder": "Event Title",
        "calendar.events.description": "Description",
        "calendar.events.description.placeholder": "Event description",
        "calendar.events.start": "Start Time",
        "calendar.events.startTime": "Start Time",
        "calendar.events.end": "End Time",
        "calendar.events.endTime": "End Time",
        "calendar.events.location": "Location",
        "calendar.events.location.placeholder": "Location",
        "calendar.events.allDay": "All Day",
        "calendar.events.reminders": "Reminders",
        "calendar.events.save": "Save",
        "calendar.events.cancel": "Cancel",
        "calendar.details.edit": "Edit",
        "calendar.details.delete": "Delete",
        "calendar.details.close": "Close",
        "calendar.details.allDay": "All Day",
        "calendar.details.recurrence": "Recurrence",
        "templates.title": "Templates",
        "templates.create": "Create",
        "templates.type.email": "Email",
        "templates.render": "Render",
        "templates.preview": "Preview",
        "templates.loading": "Loading templates...",
        "templates.noTemplates": "No templates",
        "templates.createTemplate": "Create Template",
        "templates.edit": "Edit",
        "templates.delete": "Delete",
        "templates.view": "View",
        "templates.subject": "Subject",
        "templates.content": "Content",
        "templates.variables": "Variables",
        "templates.addVariable": "Add variable",
        "common.refresh": "Refresh",
        "common.view": "View",
        "common.edit": "Edit",
        "common.delete": "Delete",
        "common.search": "Search",
        "common.actions": "Actions",
        "common.add": "Add",
        "common.cancel": "Cancel",
        "common.save": "Save",
        "common.saving": "Saving...",
        "common.locale": "en",
        "common.title": "Title",
        "common.filters": "Filters",
        "tasks.title": "Tasks",
        "tasks.loading": "Loading tasks...",
        "tasks.noTasks": "No tasks",
        "tasks.create": "Create Task",
        "tasks.edit": "Edit",
        "tasks.delete": "Delete",
        "tasks.complete": "Complete",
        "tasks.refresh": "Refresh",
        "tasks.status.todo": "To Do",
        "tasks.status.in_progress": "In Progress",
        "tasks.status.done": "Done",
        "tasks.priority.high": "High",
        "tasks.priority.medium": "Medium",
        "tasks.priority.low": "Low",
        "reporting.title": "Reports",
        "reporting.loading": "Loading reports...",
        "reporting.noReports": "No reports found",
        "reporting.create": "Create Report",
        "reporting.active": "Active",
        "reporting.status.active": "Active",
        "reporting.status.inactive": "Inactive",
        "reporting.view": "View",
        "reporting.execute": "Execute",
        "reporting.download": "Download",
        "reporting.edit": "Edit",
        "reporting.delete": "Delete",
        "reporting.searchPlaceholder": "Search reports...",
        "reporting.search.title": "Search Reports",
        "reporting.filters.all": "All",
        "reporting.filters.module": "Module",
        "reporting.filters.status": "Status",
        "reporting.modules.sales": "Sales",
        "reporting.modules.products": "Products",
        "reporting.modules.customers": "Customers",
        "reporting.modules.inventory": "Inventory",
        "reporting.list.title": "Reports List",
        "reporting.list.empty": "No reports found",
        "reporting.fields.name": "Name",
        "reporting.fields.module": "Module",
        "reporting.fields.dataSource": "Data Source",
        "reporting.fields.visualizations": "Visualizations",
        "reporting.fields.status": "Status",
        "reporting.fields.updatedAt": "Updated",
        "activities.createActivity": "Create Activity",
        "activities.editActivity": "Edit Activity",
        "activities.loading": "Loading activities...",
        "activities.noActivities": "No activities",
        "activities.refresh": "Refresh",
        "activities.timeline.activity": "Activity",
        "activities.types.comment": "Comment",
        "activities.types.call": "Call",
        "activities.types.email": "Email",
        "activities.types.meeting": "Meeting",
        "activities.types.task": "Task",
        "activities.types.status_change": "Status Change",
        "activities.types.note": "Note",
        "activities.types.file_upload": "File Upload",
        "activities.types.custom": "Custom",
      };
      return translations[key] || key; // Return translation or key itself
    },
    language: "en",
    setLanguage: vi.fn(),
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: () => null,
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    length: 0,
    key: () => null,
  };
})();

Object.defineProperty(global, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock crypto.getRandomValues for tests
Object.defineProperty(global, "crypto", {
  value: {
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
});

// Mock window.location.href to prevent navigation errors
Object.defineProperty(window, "location", {
  value: {
    href: "http://localhost:3000",
    protocol: "http:",
    host: "localhost:3000",
    hostname: "localhost",
    port: "3000",
    pathname: "/",
    search: "",
    hash: "",
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  localStorageMock.clear();
  sessionStorageMock.clear();
});
