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
      // Return Spanish translations for common keys
      const translations: Record<string, string> = {
        "calendar.views.month": "Mes",
        "calendar.views.week": "Semana",
        "calendar.views.day": "Día",
        "calendar.views.agenda": "Agenda",
        "calendar.today": "Hoy",
        "calendar.loading": "Cargando calendario...",
        "calendar.events.create": "Crear Evento",
        "calendar.events.edit": "Editar Evento",
        "calendar.events.calendar": "Calendario",
        "calendar.events.calendar.placeholder": "Seleccionar calendario",
        "calendar.events.title": "Título del Evento",
        "calendar.events.title.placeholder": "Título del Evento",
        "calendar.events.description": "Descripción",
        "calendar.events.description.placeholder": "Descripción del evento",
        "calendar.events.start": "Hora de Inicio",
        "calendar.events.startTime": "Hora de Inicio",
        "calendar.events.end": "Hora de Fin",
        "calendar.events.endTime": "Hora de Fin",
        "calendar.events.location": "Ubicación",
        "calendar.events.location.placeholder": "Ubicación",
        "calendar.events.allDay": "Todo el Día",
        "calendar.events.reminders": "Recordatorios",
        "calendar.events.save": "Guardar",
        "calendar.events.cancel": "Cancelar",
        "calendar.details.edit": "Editar",
        "calendar.details.delete": "Eliminar",
        "calendar.details.close": "Cerrar",
        "calendar.details.allDay": "Todo el Día",
        "calendar.details.recurrence": "Recurrencia",
        "templates.title": "Plantillas",
        "templates.create": "Crear",
        "templates.type.email": "Correo",
        "templates.render": "Renderizar",
        "templates.preview": "Vista previa",
        "templates.loading": "Cargando plantillas...",
        "templates.noTemplates": "No hay plantillas",
        "templates.createTemplate": "Crear Plantilla",
        "templates.edit": "Editar",
        "templates.delete": "Eliminar",
        "templates.view": "Ver",
        "templates.subject": "Asunto",
        "templates.content": "Contenido",
        "templates.variables": "Variables",
        "templates.addVariable": "Agregar variable",
        "common.refresh": "Actualizar",
        "common.view": "Ver",
        "common.edit": "Editar",
        "common.delete": "Eliminar",
        "common.search": "Buscar",
        "common.actions": "Acciones",
        "common.add": "Agregar",
        "common.cancel": "Cancelar",
        "common.save": "Guardar",
        "common.saving": "Guardando...",
        "common.locale": "es",
        "common.title": "Título",
        "common.filters": "Filtros",
        "tasks.title": "Tareas",
        "tasks.loading": "Cargando tareas...",
        "tasks.noTasks": "No hay tareas",
        "tasks.create": "Crear Tarea",
        "tasks.edit": "Editar",
        "tasks.delete": "Eliminar",
        "tasks.complete": "Completar",
        "tasks.refresh": "Actualizar",
        "tasks.status.todo": "Por hacer",
        "tasks.status.in_progress": "En progreso",
        "tasks.status.done": "Completado",
        "tasks.priority.high": "Alta",
        "tasks.priority.medium": "Media",
        "tasks.priority.low": "Baja",
        "reporting.title": "Reportes",
        "reporting.loading": "Cargando reportes...",
        "reporting.noReports": "No se encontraron reportes",
        "reporting.create": "Crear Reporte",
        "reporting.active": "Activo",
        "reporting.status.active": "Activo",
        "reporting.status.inactive": "Inactivo",
        "reporting.view": "Ver",
        "reporting.execute": "Ejecutar",
        "reporting.download": "Descargar",
        "reporting.edit": "Editar",
        "reporting.delete": "Eliminar",
        "reporting.searchPlaceholder": "Buscar reportes...",
        "reporting.search.title": "Buscar Reportes",
        "reporting.filters.all": "Todos",
        "reporting.filters.module": "Módulo",
        "reporting.filters.status": "Estado",
        "reporting.modules.sales": "Ventas",
        "reporting.modules.products": "Productos",
        "reporting.modules.customers": "Clientes",
        "reporting.modules.inventory": "Inventario",
        "reporting.list.title": "Lista de Reportes",
        "reporting.list.empty": "No se encontraron reportes",
        "reporting.fields.name": "Nombre",
        "reporting.fields.module": "Módulo",
        "reporting.fields.dataSource": "Fuente de Datos",
        "reporting.fields.visualizations": "Visualizaciones",
        "reporting.fields.status": "Estado",
        "reporting.fields.updatedAt": "Actualizado",
        "activities.createActivity": "Crear Actividad",
        "activities.editActivity": "Editar Actividad",
        "activities.loading": "Cargando actividades...",
        "activities.noActivities": "No hay actividades",
        "activities.refresh": "Actualizar",
        "activities.timeline.activity": "Actividad",
        "activities.types.comment": "Comentario",
        "activities.types.call": "Llamada",
        "activities.types.email": "Correo",
        "activities.types.meeting": "Reunión",
        "activities.types.task": "Tarea",
        "activities.types.status_change": "Cambio de estado",
        "activities.types.note": "Nota",
        "activities.types.file_upload": "Subida de archivo",
        "activities.types.custom": "Personalizado",
      };
      return translations[key] || key; // Return translation or key itself
    },
    language: "es",
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
