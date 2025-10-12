// API Configuration for AiutoX ERP
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:2000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
}

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  auth: {
    login: '/v1/auth/login',
    logout: '/v1/auth/logout',
    refresh: '/v1/auth/refresh',
    me: '/v1/auth/me',
  },

  // Users
  users: {
    list: '/v1/users',
    create: '/v1/users',
    show: (id: number) => `/v1/users/${id}`,
    update: (id: number) => `/v1/users/${id}`,
    delete: (id: number) => `/v1/users/${id}`,
  },

  // Inventory
  inventory: {
    list: '/v1/inventory',
    create: '/v1/inventory',
    show: (id: number) => `/v1/inventory/${id}`,
    update: (id: number) => `/v1/inventory/${id}`,
    delete: (id: number) => `/v1/inventory/${id}`,
  },

  // Sales
  sales: {
    list: '/v1/sales',
    create: '/v1/sales',
    show: (id: number) => `/v1/sales/${id}`,
    update: (id: number) => `/v1/sales/${id}`,
    delete: (id: number) => `/v1/sales/${id}`,
  },
}

// App Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'AiutoX ERP',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  description: import.meta.env.VITE_APP_DESCRIPTION || 'ERP modular web & mobile app',
  locale: 'en-US',
  fallbackLocale: 'en-US',
  supportedLocales: ['en-US', 'es-CO'],
}
