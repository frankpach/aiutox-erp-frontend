# Configuración de Pruebas E2E

## Requisitos Previos

1. **Backend y Frontend corriendo**:
   - Backend: `http://localhost:8000`
   - Frontend: `http://127.0.0.1:3000`

2. **Servicios Docker**:
   - PostgreSQL en puerto 15432
   - Redis en puerto 6379 (opcional)

## Iniciar Todo el Entorno

### Opción 1: Script PowerShell (Recomendado)

```powershell
.\start-dev-full.ps1
```

Este script:
- ✅ Inicia servicios Docker (PostgreSQL, Redis)
- ✅ Inicia Backend FastAPI en puerto 8000
- ✅ Inicia Frontend React en puerto 3000
- ✅ Verifica que todos los servicios estén corriendo
- ✅ Ejecuta tests E2E si se usa `-RunTests`

### Opción 2: Manual

```powershell
# Terminal 1: Docker
cd backend
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2: Backend
cd backend
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 3: Frontend
cd frontend
npm run dev
```

## Ejecutar Tests E2E

### Modo No Headless (Desarrollo)

```bash
cd frontend
npm run test:e2e
```

O directamente con Playwright:

```bash
cd frontend
npx playwright test --headed
```

### Modo Headless (CI)

```bash
cd frontend
CI=true npx playwright test
```

### Ejecutar Test Específico

```bash
cd frontend
npx playwright test users-management.spec.ts --headed
```

## Configuración de Playwright

- **Modo**: No headless por defecto en desarrollo
- **Base URL**: `http://127.0.0.1:3000`
- **Browsers**: Chromium, Firefox, WebKit
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos

Ver `frontend/playwright.config.ts` para más detalles.

## Tests Disponibles

1. **login-layout.spec.ts** - Login y layout básico
2. **users-management.spec.ts** - Gestión de usuarios
3. **module-discovery.spec.ts** - Descubrimiento de módulos
4. **saved-filters.spec.ts** - Filtros guardados
5. **public-pages.spec.ts** - Páginas públicas

## Ver Resultados

Después de ejecutar tests:

```bash
npx playwright show-report
```

## Troubleshooting

### Backend no responde
- Verificar que esté corriendo: `http://localhost:8000/docs`
- Revisar logs en la ventana del backend

### Frontend no responde
- Verificar que esté corriendo: `http://127.0.0.1:3000`
- Revisar logs en la ventana del frontend

### Tests fallan
- Verificar que backend y frontend estén corriendo
- Verificar que la base de datos esté inicializada
- Revisar screenshots y videos en `frontend/test-results/`
