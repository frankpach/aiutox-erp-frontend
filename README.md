# Frontend - AiutoX ERP

Frontend React con React Router v7 para el sistema AiutoX ERP.

## Requisitos

- Node.js 20+
- npm o pnpm

## Setup

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Configurar variables de entorno (opcional):
   ```bash
   # Crear .env.local si es necesario
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. Iniciar servidor de desarrollo:
   ```bash
   npm run dev
   ```

   Abre `http://localhost:5173`

## Estructura

- `app/components/`: Componentes UI reutilizables (shadcn/ui)
- `app/features/`: Módulos funcionales (auth, inventory, etc.)
- `app/routes/`: Rutas y páginas (React Router)
- `app/stores/`: Stores Zustand (estado global)
- `app/lib/`: Utilidades y cliente API
  - `app/lib/api/client.ts`: Cliente HTTP con axios e interceptores
  - `app/lib/utils.ts`: Utilidades (cn, etc.)
- `app/hooks/`: Custom hooks (useAuth, useApi, etc.)
- `app/i18n/`: Soporte multilenguaje (fase 2)
- `app/__tests__/`: Tests unitarios y E2E

## Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build            # Build para producción
npm run start            # Servidor de producción

# Calidad de código
npm run lint             # Ejecutar ESLint
npm run lint:fix          # Corregir errores de ESLint
npm run format            # Formatear con Prettier
npm run format:check      # Verificar formato
npm run typecheck         # Verificar tipos TypeScript

# Tests
npm run test             # Tests unitarios (Vitest)
npm run test:ui          # Tests con UI interactiva
npm run test:e2e         # Tests E2E (Playwright)
npm run test:e2e:ui      # Tests E2E con UI
```

### Instalar Componentes shadcn/ui

```bash
npx shadcn@latest add button
npx shadcn@latest add input
npx shadcn@latest add card
# etc.
```

## Stack Tecnológico

- **React 19** + **TypeScript**
- **React Router v7** (SSR)
- **Vite 7** (build tool)
- **Tailwind CSS v4** (estilos)
- **shadcn/ui** (componentes UI)
- **Zustand** (estado global)
- **axios** (cliente HTTP)
- **zod** + **react-hook-form** (validación de formularios)
- **Vitest** + **React Testing Library** (tests unitarios)
- **Playwright** (tests E2E)
- **vite-plugin-pwa** (PWA)

## Reglas y Estándares

Ver documentación en `rules/`:
- `naming.md`: Convenciones de nombres
- `dev-style.md`: Estilo de desarrollo
- `ux-frontend.md`: Reglas UX y frontend
- `tests.md`: Estándares de testing

## API Integration

El cliente API está configurado en `app/lib/api/client.ts`:
- Base URL: `VITE_API_BASE_URL` o `http://localhost:8000`
- Prefijo: `/api/v1`
- Interceptores automáticos para:
  - Agregar token de autenticación
  - Manejo de errores 401 (redirect a login)

## Estado Global (Zustand)

Stores disponibles:
- `authStore`: Autenticación y usuario actual

Ejemplo de uso:
```typescript
import { useAuthStore } from "~/stores/authStore";

const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();
```

## Tests

### Tests Unitarios

Ubicación: `app/**/__tests__/**/*.{test,spec}.{ts,tsx}`

```bash
npm run test
```

### Tests E2E

Ubicación: `app/__tests__/e2e/`

```bash
npm run test:e2e
```

## PWA

La aplicación está configurada como PWA con `vite-plugin-pwa`:
- Service Worker automático
- Caché de assets
- Instalable en dispositivos

## Build para Producción

```bash
npm run build
```

El build genera:
- `build/client/`: Assets estáticos
- `build/server/`: Código del servidor (SSR)
