# Estrategia de Tests para Windows

## Problema Identificado

Los tests fallan en Windows debido a:
1. **EMFILE: too many open files** - Límite de descriptores de archivo
2. **Act warnings** - Configuración de React Testing Library

## Solución Implementada

### 1. Configuración de Vitest (vitest.config.ts)

```typescript
test: {
  maxConcurrency: 1,        // Single concurrent test
  testTimeout: 10000,       // Increased timeout
  hookTimeout: 10000,       // Increased timeout
  isolate: true,            // Reduce memory pressure
  fileParallelism: false,   // Disable file parallelism
}
```

### 2. Scripts de Ejecución por Lotes

Para evitar EMFILE, ejecutamos tests en lotes pequeños:

```bash
# Ejecutar todos los tests (lote único)
npm run test:windows

# Ejecutar tests por módulos
npm run test:windows:hooks
npm run test:windows:features
npm run test:windows:routes
npm run test:windows:components
```

### 3. Scripts Disponibles

- `test:windows` - Ejecuta todos los tests secuencialmente
- `test:windows:hooks` - Tests de hooks
- `test:windows:features` - Tests de features
- `test:windows:routes` - Tests de rutas
- `test:windows:components` - Tests de componentes

## Estrategia de Ejecución

### Opción A: Ejecución Completa (Recomendada para CI)

```bash
npm run test:windows
```

### Opción B: Ejecución por Módulos (Para desarrollo local)

```bash
# 1. Hooks
npm run test:windows:hooks

# 2. Features
npm run test:windows:features

# 3. Routes
npm run test:windows:routes

# 4. Components
npm run test:windows:components
```

### Opción C: Ejecución de Tests Específicos

```bash
# Ejecutar un solo archivo de tests
npm run test:windows -- --run app/features/views/hooks/__tests__/useSavedFilters.test.ts

# Ejecutar tests por patrón
npm run test:windows -- --run --testPathPattern="useSavedFilters"
```

## Resultados Esperados

### Backend Tests (8/8)
- ✅ Inventory: 4/4 tests pasan
- ✅ CRM: 4/4 tests pasan

### Frontend Tests
Con la nueva configuración:
- ✅ useSavedFilters: 6/6 tests pasan
- ✅ Resto de tests: Deberían pasar sin EMFILE

## Notas Importantes

1. **Tiempo de ejecución**: La ejecución secuencial será más lenta pero más estable
2. **Uso de memoria**: Menor consumo de memoria al ejecutar un solo worker
3. **Estabilidad**: Evita errores de EMFILE y problemas de concurrencia

## Solución de Problemas

### Si aún ocurre EMFILE

```bash
# Aumentar límite de archivos en PowerShell (requiere permisos de admin)
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# O ejecutar tests con menos archivos a la vez
npm run test:windows:hooks
# Luego
npm run test:windows:features
```

### Si hay timeouts

Aumentar los timeouts en `vitest.config.ts`:
```typescript
testTimeout: 20000,
hookTimeout: 20000,
```
