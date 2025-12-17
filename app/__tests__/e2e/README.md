# Tests E2E - SavedFilters

## Prerequisitos

Antes de ejecutar los tests E2E, asegúrate de que:

1. **El servidor de desarrollo esté corriendo:**
   ```bash
   cd frontend
   npm run dev
   ```
   El servidor debe estar disponible en `http://127.0.0.1:5173`

2. **El backend esté disponible** (si los tests hacen llamadas reales a la API)

3. **Playwright esté instalado:**
   ```bash
   npx playwright install
   ```

## Ejecutar Tests

### Todos los tests
```bash
npm run test:e2e
```

### Solo Chromium (más rápido para desarrollo)
```bash
npx playwright test --project=chromium
```

### Con UI (modo interactivo)
```bash
npm run test:e2e:ui
```

### Un archivo específico
```bash
npx playwright test saved-filters.spec.ts
```

### Modo headed (ver el navegador)
```bash
npx playwright test --headed
```

## Estructura de Tests

- `saved-filters.spec.ts` - Tests principales de SavedFilters
- `helpers/auth.ts` - Helpers de autenticación
- `helpers/api-mock.ts` - Helpers de mocking de API

## Notas

- Los tests usan mocks de API por defecto para mayor velocidad y confiabilidad
- Para tests con API real, modifica `helpers/api-mock.ts` o desactiva el mocking
- Los selectores están diseñados para ser flexibles (español/inglés)

