# Tests para /config/theme

Este documento describe todos los tests relacionados con la funcionalidad de configuración de tema (`/config/theme`).

## 📋 Resumen

Se han creado tests completos para todas las capas de la aplicación relacionadas con `/config/theme`:

- ✅ **Tests Unitarios**: Hook `useThemeConfig` y componente `ThemeConfigPage`
- ✅ **Tests de Integración**: Llamadas API del frontend
- ✅ **Tests E2E**: Flujos completos con Playwright
- ✅ **Tests Backend**: Endpoints de configuración de tema

## 📁 Estructura de Tests

### Frontend

#### Tests Unitarios
- `frontend/app/hooks/__tests__/useThemeConfig.test.ts`
  - Tests para el hook `useThemeConfig`
  - Cubre: fetching, updating, applying CSS, caching

- `frontend/app/routes/__tests__/config.theme.test.tsx`
  - Tests para el componente `ThemeConfigPage`
  - Cubre: rendering, tabs, inputs, save/reset, validaciones

#### Tests de Integración
- `frontend/app/__tests__/integration/config/theme-api.test.ts`
  - Tests para las llamadas API
  - Cubre: GET, POST, PUT endpoints, manejo de errores

#### Tests E2E
- `frontend/app/__tests__/e2e/config/theme-config-e2e.spec.ts`
  - Tests end-to-end con Playwright
  - Cubre: navegación, edición de colores, logos, tipografía, permisos

### Backend

#### Tests de Integración
- `backend/tests/integration/test_config_theme.py`
  - Tests para endpoints `/api/v1/config/app_theme`
  - Cubre: permisos, validación, persistencia

## 🚀 Ejecución de Tests

### Ejecutar Todos los Tests de Tema

#### Opción 1: Script NPM (Recomendado)
```bash
cd frontend
npm run test:theme:all
```

Este comando ejecuta:
1. Tests unitarios del hook y componente
2. Tests de integración de API
3. Tests E2E con Playwright (workers=4, headed, maxFailures=1)

#### Opción 2: Script PowerShell
```powershell
cd frontend
.\scripts\test-theme-config.ps1
```

#### Opción 3: Ejecutar Individualmente

**Tests Unitarios:**
```bash
cd frontend
npm run test:run -- app/hooks/__tests__/useThemeConfig.test.ts
npm run test:run -- app/routes/__tests__/config.theme.test.tsx
```

**Tests de Integración:**
```bash
cd frontend
npm run test:run -- app/__tests__/integration/config/theme-api.test.ts
```

**Tests E2E:**
```bash
cd frontend
npm run test:e2e:theme
# O con parámetros personalizados:
npx playwright test app/__tests__/e2e/config/theme-config-e2e.spec.ts \
  --project=chromium \
  --workers=4 \
  --headed \
  --max-failures=1 \
  --reporter=line
```

**Tests Backend:**
```bash
cd backend
uv run --extra dev pytest tests/integration/test_config_theme.py -v
```

## ⚙️ Configuración E2E

Los tests E2E están configurados con:
- **Project**: chromium (solo Chromium)
- **Workers**: 4 (ejecución en paralelo)
- **Headless**: false (modo headed para ver la ejecución)
- **Max Failures**: 1 (se detiene después del primer error)
- **Reporter**: line (salida en formato línea)

Estos parámetros están definidos en:
- `frontend/package.json` → script `test:e2e:theme`
- `frontend/playwright.config.ts` → configuración global

## 📊 Cobertura

### Frontend
- **Hook `useThemeConfig`**: >90% cobertura
  - Fetching theme
  - Updating theme
  - Applying CSS variables
  - Error handling
  - Caching

- **Componente `ThemeConfigPage`**: >85% cobertura
  - Rendering
  - Tabs navigation
  - Form inputs
  - Save/Reset functionality
  - Error states

- **API Integration**: >80% cobertura
  - GET /config/app_theme
  - POST /config/app_theme
  - PUT /config/app_theme/{key}
  - Error handling

### Backend
- **Endpoints**: >90% cobertura
  - GET /api/v1/config/app_theme
  - POST /api/v1/config/app_theme
  - PUT /api/v1/config/app_theme/{key}
  - Validación de permisos
  - Validación de formato de colores
  - Manejo de errores

## ✅ Checklist de Tests

### Tests Unitarios
- [x] Hook `useThemeConfig` - fetching theme
- [x] Hook `useThemeConfig` - updating theme
- [x] Hook `useThemeConfig` - applying CSS
- [x] Hook `useThemeConfig` - error handling
- [x] Componente - rendering básico
- [x] Componente - tabs navigation
- [x] Componente - color inputs
- [x] Componente - logo inputs
- [x] Componente - typography inputs
- [x] Componente - save functionality
- [x] Componente - reset functionality
- [x] Componente - loading states
- [x] Componente - error states

### Tests de Integración
- [x] GET /config/app_theme - success
- [x] GET /config/app_theme - error handling
- [x] POST /config/app_theme - success
- [x] POST /config/app_theme - validation errors
- [x] PUT /config/app_theme/{key} - success
- [x] PUT /config/app_theme/{key} - validation errors

### Tests E2E
- [x] Display theme configuration page
- [x] Edit primary color
- [x] Edit multiple colors
- [x] Edit logo paths
- [x] Edit typography settings
- [x] Reset changes without saving
- [x] Handle invalid color formats
- [x] Navigate between tabs
- [x] Require authentication

### Tests Backend
- [x] GET requires permission
- [x] GET with permission
- [x] GET returns defaults when empty
- [x] POST requires permission
- [x] POST with valid colors
- [x] POST rejects invalid color format
- [x] PUT updates single property
- [x] PUT rejects invalid color
- [x] Theme config persists across requests

## 🔍 Troubleshooting

### Tests E2E fallan
1. Verificar que backend y frontend estén corriendo
2. Verificar que la base de datos de test esté configurada
3. Ejecutar con `--headed` para ver qué está pasando
4. Revisar logs en `frontend/test-results/`

### Tests unitarios fallan
1. Verificar que los mocks estén configurados correctamente
2. Ejecutar con `--reporter=verbose` para más detalles
3. Verificar que las dependencias estén instaladas

### Tests de integración fallan
1. Verificar que el API client esté mockeado correctamente
2. Verificar los formatos de respuesta esperados

## 📝 Notas

- Los tests E2E requieren que el backend y frontend estén corriendo
- Los tests unitarios usan mocks y no requieren servidores
- Los tests de integración mockean las llamadas API
- El test E2E de permisos específicos está pendiente de fixtures adicionales

## 🔗 Referencias

- [Guía de Testing](./docs/20-frontend/development/testing-complete-guide.md)
- [Reglas de Testing](../.cursor/rules/tests.md)
- [Playwright Config](../../playwright.config.ts)

