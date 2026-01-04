# Frontend Tests - Resumen de Correcciones

## 📊 Estado Actual

### ✅ Tests Completados (26/320 = 8%)
- **Files Hooks**: 13/13 ✅
  - useFiles.test.tsx
  - useFilePermissions.test.tsx
  - useFolderPermissions.test.tsx
- **Files Components**: 13/13 ✅
  - FileDetail.test.tsx
  - FileList.test.tsx
  - FileUpload.test.tsx

### ⚠️ Tests con Errores de Sintaxis Corregidos
- **CalendarView.test.tsx**: Tags JSX corregidos (17 tests aún fallan por lógica)

### ❌ Tests Pendientes (217/320 = 68%)
- 22 archivos de tests con errores
- Errores principales: sintaxis, mocks incorrectos, traducciones

---

## 🔧 Correcciones Aplicadas

### 1. Mock de useAuthStore
**Problema**: El hook usa selector `useAuthStore((state) => state.user)` pero el mock devolvía objeto completo.

**Solución**:
```typescript
// ❌ Incorrecto
vi.mocked(useAuthStore).mockReturnValue({ user: mockUser } as any);

// ✅ Correcto
vi.mocked(useAuthStore).mockImplementation((_selector) => {
  return mockUser;
});
```

**Archivos corregidos**:
- useFilePermissions.test.tsx
- useFolderPermissions.test.tsx

### 2. Mock de fileKeys
**Problema**: Tests fallan porque `fileKeys` no está exportado en el mock de useFiles.

**Solución**:
```typescript
vi.mock("../../hooks/useFiles", () => ({
  useFile: vi.fn(),
  useFileVersions: vi.fn(),
  fileKeys: {
    all: ["files"] as const,
    lists: () => ["files", "list"] as const,
    list: (params?: any) => ["files", "list", params] as const,
    detail: (id: string) => ["files", "detail", id] as const,
    versions: (id: string) => ["files", "versions", id] as const,
    content: (id: string) => ["files", "content", id] as const,
    preview: (id: string) => ["files", "preview", id] as const,
  },
}));
```

**Archivos corregidos**:
- FileDetail.test.tsx

### 3. Estado faltante en componentes
**Problema**: Componente usa `setFilteredFiles` pero no está definido.

**Solución**:
```typescript
// Añadir estado faltante
const [filteredFiles, setFilteredFiles] = useState<File[]>([]);

// Inicializar cuando files cambia
useEffect(() => {
  setFilteredFiles(files);
}, [files]);
```

**Archivos corregidos**:
- FileList.tsx

### 4. Tags JSX incorrectos
**Problema**: Tags de cierre no coinciden con tags de apertura.

**Solución**:
```typescript
// ❌ Incorrecto
<QueryClientProvider client={QueryClient}>
  ...
</QueryProvider>

// ✅ Correcto
<QueryClientProvider client={queryClient}>
  ...
</QueryClientProvider>
```

**Archivos corregidos**:
- CalendarView.test.tsx (13 instancias corregidas)

### 5. Mock de setThemeConfig
**Problema**: Test de useThemeConfig falla porque mock de API no funciona.

**Solución**:
```typescript
// Mockear la función directamente
vi.mock("~/features/config/api/config.api", () => ({
  getThemeConfig: vi.fn(),
  setThemeConfig: vi.fn(),
  updateThemeConfigProperty: vi.fn(),
}));

// En el test
const { setThemeConfig } = await import("~/features/config/api/config.api");
vi.mocked(setThemeConfig).mockResolvedValue({
  module: "app_theme",
  config: { primary_color: "#FF5733" },
} as any);
```

**Archivos corregidos**:
- useThemeConfig.test.ts

---

## 🎯 Patrones de Errores Comunes Identificados

### A. Errores de Sintaxis (4 archivos)
1. **CalendarView.test.tsx**: ✅ Corregido
2. **TemplateList.test.tsx**: String literal sin terminar (línea 237)
3. **useWorkflows.test.ts**: Sintaxis JSX incorrecta (línea 34)
4. **SearchHeader.test.tsx**: Error no especificado

### B. Errores de Traducciones (múltiples archivos)
**Problema**: Tests esperan texto traducido pero reciben keys de traducción.

**Ejemplo**:
```typescript
// El test busca: "Comentario"
// Pero encuentra: "activities.filters.types.comment"
```

**Solución**: Configurar mock de useTranslation correctamente en cada test.

### C. Errores de Mocks (múltiples archivos)
**Problema**: Mocks de hooks no configurados correctamente.

**Patrones comunes**:
- useAuthStore sin selector
- fileKeys no exportado
- QueryClient (clase) en lugar de queryClient (instancia)

---

## 📋 Plan de Corrección Sistemática

### Fase 1: Corregir Errores de Sintaxis (4 archivos)
1. TemplateList.test.tsx - String sin terminar
2. useWorkflows.test.ts - Sintaxis JSX
3. SearchHeader.test.tsx - Error por identificar

### Fase 2: Corregir Mocks de useAuthStore (estimado: 10-15 archivos)
Buscar patrón:
```typescript
vi.mocked(useAuthStore).mockReturnValue({ user: ... })
```
Reemplazar por:
```typescript
vi.mocked(useAuthStore).mockImplementation((_selector) => mockUser)
```

### Fase 3: Corregir Traducciones (estimado: 15-20 archivos)
Añadir mock completo de useTranslation en cada archivo de test.

### Fase 4: Validación Final
Ejecutar todos los tests y verificar resultados.

---

## 🚀 Comandos Útiles

### Ejecutar tests por módulo
```bash
# Files (completo)
npx vitest run --no-coverage app/features/files

# Calendar
npx vitest run --no-coverage app/features/calendar

# Activities
npx vitest run --no-coverage app/features/activities

# Todos los features
npx vitest run --no-coverage app/features
```

### Ver resumen de tests
```bash
npx vitest run --no-coverage app/features 2>&1 | Select-String -Pattern "Test Files|Tests "
```

---

## 📈 Progreso Esperado

| Fase | Tests a Corregir | Tiempo Estimado | Estado |
|------|------------------|-----------------|--------|
| Files | 26 tests | - | ✅ Completado |
| Sintaxis | 4 archivos | 10 min | ⚠️ 1/4 |
| Mocks | ~50 tests | 20 min | 🔄 Pendiente |
| Traducciones | ~100 tests | 30 min | 🔄 Pendiente |
| Lógica | ~40 tests | 20 min | 🔄 Pendiente |

**Total estimado**: 80 minutos para completar las 217 correcciones restantes.

---

## 💡 Notas Importantes

1. **Prioridad**: Corregir errores de sintaxis primero (bloquean compilación)
2. **Estrategia**: Aplicar correcciones por lotes usando patrones
3. **Validación**: Ejecutar tests después de cada lote de correcciones
4. **Documentación**: Mantener este archivo actualizado con progreso

---

Última actualización: 2026-01-04 15:52
