/**
 * MSW handlers for API mocking in tests
 *
 * MSW intercepts requests at the network level, so it works with axios, fetch, etc.
 * We use full URLs to match what axios sends (baseURL + path).
 */

import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:8000/api/v1";

export const handlers = [
  // General config endpoint - MSW matches full URLs
  // Component expects response.data.data, so we return { data: { data: {...} } }
  // Note: MSW intercepts at network level, works with axios in jsdom
  http.get(`${API_BASE_URL}/config/general`, () => {
    return HttpResponse.json({
      data: {
        data: {
          timezone: "America/Mexico_City",
          date_format: "DD/MM/YYYY",
          time_format: "24h",
          currency: "MXN",
          language: "es",
        },
        meta: null,
        error: null,
      },
    });
  }),

  // General config update endpoint
  // Component expects response.data.data
  http.put(`${API_BASE_URL}/config/general`, async ({ request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      data: {
        data: body,
        meta: null,
        error: null,
      },
    });
  }),

  // Roles endpoints
  http.get(`${API_BASE_URL}/auth/roles`, () => {
    return HttpResponse.json({
      data: [
        {
          role: "owner",
          permissions: ["*"],
        },
        {
          role: "admin",
          permissions: ["users.view", "users.edit", "config.view", "config.edit"],
        },
      ],
      meta: {
        total: 2,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      error: null,
    });
  }),

  http.get(`${API_BASE_URL}/users`, ({ request }) => {
    const url = new URL(request.url);
    if (url.searchParams.get("page_size") === "100") {
      return HttpResponse.json({
        data: [
          {
            id: "user1",
            email: "user1@example.com",
            full_name: "User 1",
            is_active: true,
          },
          {
            id: "user2",
            email: "user2@example.com",
            full_name: "User 2",
            is_active: true,
          },
        ],
        meta: {
          total: 2,
          page: 1,
          page_size: 100,
          total_pages: 1,
        },
        error: null,
      });
    }
    return HttpResponse.json({
      data: [],
      meta: { total: 0, page: 1, page_size: 10, total_pages: 0 },
      error: null,
    });
  }),

  http.get(`${API_BASE_URL}/auth/roles/:userId`, () => {
    return HttpResponse.json({
      roles: [],
      total: 0,
    });
  }),

  // Modules endpoints
  http.get(`${API_BASE_URL}/config/modules`, () => {
    return HttpResponse.json({
      data: [
        {
          id: "auth",
          name: "Autenticación y RBAC",
          type: "core",
          enabled: true,
          dependencies: [],
        },
        {
          id: "users",
          name: "Usuarios y Organizaciones",
          type: "core",
          enabled: true,
          dependencies: ["auth"],
        },
        {
          id: "products",
          name: "Catálogo de Productos",
          type: "business",
          enabled: true,
          dependencies: ["users"],
        },
      ],
      meta: {
        total: 3,
        page: 1,
        page_size: 100,
        total_pages: 1,
      },
      error: null,
    });
  }),

  // Notifications endpoints
  http.get(`${API_BASE_URL}/config/notifications/channels`, () => {
    return HttpResponse.json({
      data: {
        smtp: {
          enabled: false,
          host: "",
          port: 587,
          username: "",
          password: "",
          use_tls: true,
        },
        sms: {
          enabled: false,
          provider: "",
          api_key: "",
        },
        webhook: {
          enabled: false,
          url: "",
          secret: "",
        },
      },
      meta: null,
      error: null,
    });
  }),
];

