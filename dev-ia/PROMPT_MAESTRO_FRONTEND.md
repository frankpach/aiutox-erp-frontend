# Prompt Maestro de Desarrollo Frontend - AiutoX ERP

**Objetivo**: Guiar el desarrollo ordenado del frontend de AiutoX ERP siguiendo el plan de implementación establecido, generando documentación progresiva de avances, pruebas y correcciones.

**Versión**: 2.0 (Mejorada con lecciones aprendidas del backend)

> **⚠️ PROCESO AUTOMÁTICO:** Al cargar este prompt, ejecutar automáticamente el proceso completo descrito en la sección "🔄 Proceso Automático de Análisis y Planificación".

---

## 🚀 Stack Tecnológico del Frontend

**Referencia completa:** `docs/11-frontend.md`

### Stack Principal
- **Librería base:** React 19+ con TypeScript
- **Empaquetador:** Vite 7+
- **Routing:** React Router v7+ (SSR)
- **Estado global:** Zustand 5+ (sencillo, minimalista)
- **Estilos:** Tailwind CSS v4
- **UI components:** shadcn/ui (accesibles y productivos)
- **HTTP client:** axios (con interceptores auth)
- **Validación:** zod + react-hook-form
- **PWA:** vite-plugin-pwa (offline, installable)
- **Linting:** ESLint v9 + Prettier
- **Tests:** Vitest + React Testing Library (unit) + Playwright (E2E)
- **Desktop App (futuro):** Tauri

### Configuración Clave
- **shadcn/ui:** `frontend/components.json` - Configuración de componentes
- **TypeScript:** `frontend/tsconfig.json` - Configuración TypeScript (verbatimModuleSyntax habilitado)
- **Vite:** `frontend/vite.config.ts` - Configuración Vite + PWA
- **ESLint:** `frontend/eslint.config.js` - Configuración ESLint v9
- **Estructura:** `app/` directory (no `src/`)

### Configuración shadcn/ui (OBLIGATORIA)

**Referencia de colores:** `docs/brand/colors.md`

La configuración de shadcn/ui debe seguir estos valores exactos:

- **Component Library:** Base UI
- **Style:** Maia
- **Base Color:** Gray
- **Theme:** Blue (usar color primario `#023E87` - AiutoX Blue de `docs/brand/colors.md`)
- **Icon Library:** Hugeicons (instalar `@hugeicons/react` y `@hugeicons/core-free-icons`)
- **Font:** Noto Sans
- **Radius:** Small
- **Menu Color:** Default
- **Menu Accent:** Subtle

**Colores de marca a usar (de `docs/brand/colors.md`):**
- **Color primario:** `#023E87` (AiutoX Blue) - Para botones CTAs, headers, elementos principales
- **Color secundario:** `#00B6BC` (AiutoX Teal) - Para elementos decorativos, botones secundarios
- **Color de enlaces:** `#2EA3F2` (AiutoX Link Blue) - Para enlaces y elementos interactivos
- **Color neutro:** `#121212` (AiutoX Dark) - Para texto principal y elementos neutros
- **Texto cuerpo:** `#3C3A47` (Body Text Gray) - Para párrafos y texto secundario
- **Headers:** `#333333` (Headers Gray) - Para headers secundarios

**Configuración en `components.json`:**
```json
{
  "style": "maia",
  "tailwind": {
    "baseColor": "gray"
  }
}
```

**Instalación de Hugeicons:**
```bash
npm install @hugeicons/react @hugeicons/core-free-icons
```

**Uso de iconos:**
```tsx
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchIcon } from '@hugeicons/core-free-icons';

<HugeiconsIcon
  icon={SearchIcon}
  size={24}
  color="currentColor"
  strokeWidth={1.5}
/>
```

**Nota:** Hugeicons ofrece más de 40,000 iconos. Para el proyecto, usar la versión gratuita (`@hugeicons/core-free-icons`) que incluye 4,000+ iconos en estilo Stroke Rounded.

---

## 📚 Contexto y Referencias Obligatorias

**Antes de comenzar, lee completamente:**

1. **Plan Maestro UI**: `frontend/dev-ia/PLAN_MAESTRO_UI_FRONTEND.md` - Plan completo de desarrollo frontend (mejorado)
2. **Frontend Doc**: `docs/11-frontend.md` - Documentación técnica frontend (stack tecnológico completo)
3. **Backend Estado**: `docs/archive/ESTADO_MODULOS_TRANSVERSALES_2025-12-10.md` - Estado real del backend (o buscar el más reciente en `docs/archive/`)
4. **API Contract**: `rules/api-contract.md` - Contrato de API
5. **UX Rules**: `rules/ux-frontend.md` - Principios UX y frontend

**Reglas y Convenciones:**
- `rules/tests.md` - Estándares de testing frontend
- `rules/ux-frontend.md` - Principios UX
- `frontend/components.json` - Configuración shadcn/ui
- `docs/50-ai-development.md` - Guía de desarrollo con IA (aplicable a frontend)

---

## 🔄 Proceso Automático de Análisis y Planificación

**⚠️ EJECUTAR AUTOMÁTICAMENTE AL CARGAR ESTE PROMPT:**

### Paso 1: Analizar Estado Actual

1. **Buscar archivo `last_ui_{datetime}.md` más reciente:**
   ```bash
   # Buscar en frontend/dev-ia/ el archivo más reciente con patrón last_ui_*.md
   # Formato esperado: last_ui_YYYYMMDD_HHMMSS.md
   ```

2. **Leer y analizar el archivo de seguimiento:**
   - Verificar estado de la feature/módulo actual
   - Revisar fases completadas vs pendientes
   - Analizar errores TypeScript/ESLint pendientes
   - Revisar tests (unitarios y E2E)
   - Verificar warnings clasificados
   - Leer lecciones aprendidas

3. **Ejecutar verificación del estado actual:**
   ```bash
   cd frontend
   npm run typecheck > dev-ia/typecheck_current.txt 2>&1
   npm run lint > dev-ia/lint_current.txt 2>&1
   npm run test > dev-ia/test_current.txt 2>&1
   ```

4. **Verificar estado del backend:**
   - Consultar `docs/archive/ESTADO_MODULOS_TRANSVERSALES_*.md` (más reciente)
   - Verificar endpoints disponibles para el módulo siguiente
   - Verificar permisos necesarios

### Paso 2: Evaluar Completitud de Fase Anterior

**Criterios para considerar fase 100% completada:**
- ✅ Todas las fases del plan están completadas
- ✅ 0 errores TypeScript (`npm run typecheck`)
- ✅ 0 errores ESLint críticos (`npm run lint`)
- ✅ Tests unitarios pasan (cobertura > 70%, objetivo: 80%)
- ✅ Tests E2E pasan (si aplica)
- ✅ Integración con backend verificada
- ✅ Componentes accesibles (ARIA, labels)
- ✅ No hay textos hardcodeados (usar i18n/config)
- ✅ TODOS los warnings están clasificados y documentados (🔴🟡🟢⚪)
- ✅ Warnings críticas y altas corregidas o tienen plan documentado
- ✅ No hay ciclos infinitos detectados
- ✅ Lecciones aprendidas documentadas
- ✅ Archivo de seguimiento completo con métricas

**Si la fase anterior NO está 100% completada:**
- ❌ **DETENER** y completar primero la fase anterior
- Documentar qué falta completar
- Generar checklist de tareas pendientes
- **NO avanzar** a nueva fase hasta completar la anterior

**Si la fase anterior ESTÁ 100% completada:**
- ✅ Proceder al Paso 3

### Paso 3: Generar Plan de Próxima Fase (2 días de trabajo)

**Objetivo:** Generar plan detallado para los próximos 2 días de desarrollo.

1. **Identificar siguiente feature/módulo según prioridad:**
   - Consultar `frontend/dev-ia/PLAN_MAESTRO_UI_FRONTEND.md` - Sección "Plan de Ejecución por Feature/Módulo"
   - Verificar que el backend del módulo esté disponible
   - Verificar permisos necesarios

2. **Crear plan estructurado (2 días = ~16 horas de trabajo):**
   ```markdown
   # Plan de Desarrollo - [Feature/Módulo] - [Fecha Inicio]

   **Duración estimada:** 2 días (16 horas)
   **Fecha inicio:** [YYYY-MM-DD]
   **Fecha fin estimada:** [YYYY-MM-DD]

   ## Día 1 (8 horas)

   ### Fase 1: [Nombre] (2-3 horas)
   - [ ] Tarea 1
   - [ ] Tarea 2
   - [ ] Verificación: typecheck, lint, tests

   ### Fase 2: [Nombre] (2-3 horas)
   - [ ] Tarea 1
   - [ ] Tarea 2
   - [ ] Verificación: typecheck, lint, tests

   ### Fase 3: [Nombre] (2-3 horas)
   - [ ] Tarea 1
   - [ ] Tarea 2
   - [ ] Verificación: typecheck, lint, tests

   ## Día 2 (8 horas)

   ### Fase 4: [Nombre] (2-3 horas)
   - [ ] Tarea 1
   - [ ] Tarea 2
   - [ ] Verificación: typecheck, lint, tests

   ### Fase 5: [Nombre] (2-3 horas)
   - [ ] Tarea 1
   - [ ] Tarea 2
   - [ ] Verificación: typecheck, lint, tests

   ### Fase 6: Tests y Verificación Final (2-3 horas)
   - [ ] Tests unitarios
   - [ ] Tests E2E
   - [ ] Verificación completa (typecheck, lint, build)
   - [ ] Documentación
   ```

3. **Incluir en el plan:**
   - **Alcance claro** por fase (tipos → API → hooks → componentes → rutas)
   - **Checklist de verificación** por fase (no avanzar sin completar)
   - **Referencias a backend** (endpoints, permisos, schemas)
   - **Tests requeridos** (unitarios y E2E)
   - **Criterios de éxito** por fase

4. **Guardar plan:**
   - Crear archivo en `.cursor/plans/[feature]_implementation_[hash].plan.md`
   - O actualizar plan existente si ya existe

### Paso 4: Crear Nuevo Archivo de Seguimiento

1. **Crear archivo `last_ui_{datetime}.md`:**
   ```bash
   cd frontend/dev-ia
   $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
   New-Item -ItemType File -Path "last_ui_$timestamp.md"
   ```

2. **Inicializar con plantilla completa:**
   - Usar plantilla de `PLAN_MAESTRO_UI_FRONTEND.md` - Sección "Plantilla de Archivo de Seguimiento"
   - Incluir información de la nueva feature/módulo
   - Referenciar el plan creado en Paso 3

3. **Ejecutar verificación inicial:**
   ```bash
   cd frontend
   npm run typecheck > dev-ia/typecheck_initial.txt 2>&1
   npm run lint > dev-ia/lint_initial.txt 2>&1
   npm run test > dev-ia/test_initial.txt 2>&1
   ```

4. **Documentar estado inicial:**
   - Capturar errores TypeScript encontrados
   - Capturar errores/warnings ESLint (clasificar por severidad)
   - Capturar tests fallidos
   - Crear tablas de seguimiento en el archivo

### Resumen del Proceso

```
AL CARGAR PROMPT
  ↓
1. Buscar last_ui_*.md más reciente
  ↓
2. Analizar estado actual (leer archivo + ejecutar verificaciones)
  ↓
3. ¿Fase anterior 100% completada?
  ├─ NO → Completar fase anterior primero
  └─ SÍ → Continuar
  ↓
4. Generar plan próxima fase (2 días)
  ↓
5. Crear nuevo last_ui_{datetime}.md
  ↓
6. Ejecutar verificación inicial
  ↓
7. Documentar estado inicial
  ↓
LISTO PARA COMENZAR DESARROLLO
  ↓
AL FINALIZAR FASE (100% completada y probada)
  ↓
1. Actualizar archivo de seguimiento final
  ↓
2. Mover last_ui_{datetime}.md a archive/
  ↓
3. Borrar archivos temporales (*.txt)
  ↓
4. Verificar estructura final (solo archivos esenciales)
  ↓
FASE COMPLETADA Y LIMPIEZA REALIZADA
```

---

## 🎯 Estado Actual del Frontend

### Features Implementadas ✅

**Infraestructura Base:**
- ✅ Auth básico (login, logout, tokens en localStorage)
- ✅ API Client configurado (`app/lib/api/client.ts`)
- ✅ AuthStore Zustand (`app/stores/authStore.ts`)
- ✅ Estructura base de rutas (`app/routes.ts`, `app/routes/*.tsx`)
- ✅ Componentes shadcn/ui base instalados

**Features en Construcción:**
- 🔄 **SavedFilters para Users** (Fase 1-4 completadas, verificaciones pendientes)
  - Tipos TypeScript ✅
  - Configuración de campos Users ✅
  - API service ✅
  - Hooks (`useSavedFilters`, `useFilterUrlSync`) ✅
  - Componentes base (`SavedFilters`, `FilterEditorModal`, `FilterManagementModal`) ✅
  - Integración en `UsersList` ✅
  - Ruta `/users` ✅
  - Editor visual y JSON ✅
  - Gestión de filtros y permisos ✅
  - Seeders backend ✅

### Features Pendientes ⏳

**Fase 0 - Ajustes Base:**
- ⏳ Refresh token automático en `apiClient`
- ⏳ Uso de `roles` y `permissions` en UI (guards, componentes condicionales)
- ⏳ Layout principal (AppShell con Header, Sidebar, Footer)
- ⏳ Dashboard personalizado por rol

**Fase 1 - Módulos Core:**
- ⏳ Files (upload, download, gestión)
- ⏳ Search (búsqueda global en header)
- ⏳ Activities (timeline)
- ⏳ Tags (etiquetado)
- ⏳ Notifications (SSE stream en header)

**Fase 2+ - Módulos de Negocio:**
- ⏳ Products (CRUD completo)
- ⏳ Inventory (CRUD completo)
- ⏳ Customers/Organizations (CRUD completo)
- ⏳ Reporting (Canvas interactivo)
- ⏳ Settings (preferencias, configuración)

---

## ✅ Checklist de Verificación Pre-Desarrollo

Antes de comenzar cualquier tarea, verifica:

### Contexto
- [ ] ¿He leído `frontend/dev-ia/PLAN_MAESTRO_UI_FRONTEND.md`?
- [ ] ¿He consultado `docs/11-frontend.md` para entender el stack?
- [ ] ¿He verificado el estado del backend en `docs/archive/ESTADO_MODULOS_TRANSVERSALES_2025-12-10.md` (o el más reciente)?
- [ ] ¿He revisado el plan específico `.plan.md` en `.cursor/plans/` si existe?

### Arquitectura Frontend
- [ ] ¿Entiendo la estructura de features (`app/features/[module]/`)?
- [ ] ¿Sé cómo integrar con APIs del backend?
- [ ] ¿He revisado `docs/ai-prompts/Master_Development_Frontend_promp.md`?
- [ ] ¿He consultado `rules/ux-frontend.md` para principios UX?

### Convenciones
- [ ] ¿He revisado `rules/api-contract.md` para formato de respuestas?
- [ ] ¿He consultado `rules/tests.md` para estándares de testing?
- [ ] ¿He verificado `frontend/components.json` para componentes shadcn/ui disponibles?

### Backend
- [ ] ¿El módulo backend está implementado y disponible?
- [ ] ¿Los endpoints están documentados en Swagger?
- [ ] ¿He verificado los permisos necesarios en `rules/auth-rbac.md`?

---

## 🚀 Proceso de Desarrollo Ordenado

### Paso 1: Inicialización y Creación de Archivo de Seguimiento (Mejorado)

**AL INICIAR UNA NUEVA FEATURE/MÓDULO:**

1. **Crear archivo de seguimiento automáticamente:**
   ```bash
   cd frontend/dev-ia
   $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
   New-Item -ItemType File -Path "last_ui_$timestamp.md"
   ```
   **Nota:** Usar formato `last_ui_` para consistencia con metodología del backend.

2. **Inicializar contenido del archivo de seguimiento:**
   - Usar la plantilla mejorada proporcionada más abajo
   - Incluir información completa de la feature/módulo
   - Establecer estado inicial con captura de errores/warnings actuales
   - **NUEVO:** Incluir sección de "Lecciones Aprendidas" desde el inicio

3. **Verificar backend (OBLIGATORIO):**
   - Consultar en `docs/modules/*.md` la lista de modulos del backend
   - Verificar endpoints en Swagger o `backend/app/api/v1/`
   - Verificar permisos necesarios en `rules/auth-rbac.md`
   - Documentar en archivo de seguimiento si backend está listo o pendiente

4. **Crear/actualizar plan específico:**
   - Si no existe `frontend\dev-ia\PLAN_MAESTRO_UI_FRONTEND.md` en `.cursor/plans/`, crearlo
   - Definir fases claras del desarrollo
   - Incluir checklist por fase (no avanzar sin completar)

### Paso 2: Ejecutar Verificación Inicial
**Comandos a ejecutar:**
```bash
cd frontend

# TypeScript
npm run typecheck > dev-ia/typecheck_initial.txt 2>&1

# ESLint
npm run lint > dev-ia/lint_initial.txt 2>&1

# Tests existentes
npm run test > dev-ia/test_initial.txt 2>&1

# Tests E2E (si aplica)
npm run test:e2e > dev-ia/e2e_initial.txt 2>&1
```

**Registrar resultados en archivo de seguimiento (OBLIGATORIO):**
- **Errores TypeScript encontrados** (contar y listar todos)
- **Errores/warnings ESLint** (clasificar por severidad: 🔴🟡🟢⚪)
- **Tests fallidos** (listar con razón del fallo)
- **Estado inicial documentado** con métricas cuantificables
- **Crear tablas de seguimiento** para cada categoría de error/warning

### Paso 3: Implementar Según Fases del Plan (Mejorado)

**Orden típico de implementación:**
1. **Tipos TypeScript** (`types/*.ts`)
2. **Configuración** (`config/*.ts`)
3. **API Services** (`api/*.ts`)
4. **Hooks** (`hooks/*.ts`)
5. **Componentes** (`components/*.tsx`)
6. **Rutas** (`routes/*.tsx`)

**Por cada fase (Proceso Mejorado):**
- Implementar código según alcance
- Ejecutar verificación (typecheck, lint)
- **Capturar TODOS los errores y warnings** (no solo los críticos)
- **Clasificar warnings** por severidad (🔴🟡🟢⚪)
- Actualizar archivo de seguimiento **después de cada bloque de trabajo**
- Si hay errores: corregir inmediatamente y **documentar la solución**
- **Registrar intentos de corrección** (para detectar ciclos)
- Re-ejecutar verificación
- **No avanzar de fase** sin completar checklist de fase actual
- **Si error persiste 3+ veces:** Marcar como 🔴 Ciclo detectado y pasar a solución de fondo

### Paso 4: Verificar Cumplimiento (Mejorado)

**Checklist de Calidad (Expandido):**
- [ ] ¿No hay errores TypeScript?
- [ ] ¿No hay errores ESLint críticos?
- [ ] ¿TODOS los warnings están clasificados y documentados?
- [ ] ¿Los componentes usan shadcn/ui correctamente?
- [ ] ¿Los hooks manejan estados de carga/error?
- [ ] ¿Los componentes son accesibles (ARIA, labels)?
- [ ] ¿No hay textos hardcodeados (usar i18n/config)?
- [ ] ¿Los tests pasan?
- [ ] ¿La integración con backend funciona?
- [ ] ¿No hay ciclos infinitos detectados?
- [ ] ¿Se documentaron las lecciones aprendidas?
- [ ] ¿Se crearon helpers reutilizables si aplica?

### Paso 5: Tests y Documentación

**Tests:**
- [ ] Tests unitarios para hooks
- [ ] Tests unitarios para componentes
- [ ] Tests E2E para flujos completos
- [ ] Cobertura > 80% (objetivo: 85%)

**Documentación:**
- [ ] Comentarios JSDoc en funciones complejas
- [ ] README del feature si aplica
- [ ] Actualizar `docs/11-frontend.md` si hay cambios arquitectónicos
- [ ] Actualizar reglas si es necesario

### Paso 6: Actualizar Archivo de Seguimiento Final (Mejorado)

**Al finalizar feature/módulo:**
- Marcar feature como completada
- Documentar todos los archivos creados/modificados
- Registrar resultados finales de tests
- Documentar errores corregidos **con soluciones aplicadas**
- Registrar warnings aceptados con razones **explícitas**
- **Generar resumen ejecutivo con métricas cuantificables:**
  - Iteraciones totales
  - Errores encontrados vs corregidos
  - Tiempo de desarrollo
  - Cobertura de tests
- **Documentar lecciones aprendidas:**
  - Qué funcionó bien
  - Qué mejoró durante el desarrollo
  - Problemas encontrados y soluciones
- **Identificar patrones reutilizables** para futuras features

### Paso 7: Limpieza y Archivado (OBLIGATORIO al finalizar cada fase)

**⚠️ REGLA CRÍTICA:** Al finalizar cada fase (cuando está 100% completada y probada), ejecutar limpieza automática:

1. **Crear carpeta `archive` si no existe:**
   ```powershell
   cd frontend/dev-ia
   if (-not (Test-Path "archive")) {
       New-Item -ItemType Directory -Path "archive"
   }
   ```

2. **Mover archivo `last_ui_{datetime}.md` a `archive/`:**
   ```powershell
   # Buscar archivo más reciente
   $latestFile = Get-ChildItem -Path . -Filter "last_ui_*.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
   if ($latestFile) {
       Move-Item -Path $latestFile.FullName -Destination "archive\$($latestFile.Name)"
   }
   ```

3. **Borrar todos los archivos temporales (excepto los esenciales):**
   ```powershell
   # Archivos a mantener (NO borrar):
   # - create_tracking_file.ps1
   # - PLAN_MAESTRO_UI_FRONTEND.md
   # - PROMPT_MAESTRO_FRONTEND.md
   # - README.md
   # - archive/ (directorio completo)

   # Borrar archivos temporales:
   Remove-Item -Path "*.txt" -ErrorAction SilentlyContinue  # typecheck_*.txt, lint_*.txt, test_*.txt, etc.
   Remove-Item -Path "last_ui_*.md" -ErrorAction SilentlyContinue  # Ya movido a archive
   ```

4. **Verificar que solo quedan los archivos esenciales:**
   ```powershell
   # Verificar estructura final
   Get-ChildItem -Path . | Select-Object Name
   # Debe mostrar solo:
   # - archive/
   # - create_tracking_file.ps1
   # - PLAN_MAESTRO_UI_FRONTEND.md
   # - PROMPT_MAESTRO_FRONTEND.md
   # - README.md
   ```

**Estructura final esperada de `frontend/dev-ia/`:**
```
frontend/dev-ia/
├── archive/                          # Archivos de seguimiento archivados
│   ├── last_ui_20251216_152020.md
│   ├── last_ui_20250117_143022.md
│   └── ...
├── create_tracking_file.ps1         # Script de creación
├── PLAN_MAESTRO_UI_FRONTEND.md      # Plan maestro
├── PROMPT_MAESTRO_FRONTEND.md        # Prompt maestro
└── README.md                         # Documentación
```

**⚠️ IMPORTANTE:**
- Este proceso debe ejecutarse **solo cuando la fase está 100% completada y probada**
- No borrar archivos si la fase aún está en progreso
- El archivo `last_ui_{datetime}.md` debe moverse a `archive/` para mantener historial
- Los archivos `.txt` temporales (typecheck, lint, test) deben borrarse siempre

---

## 📝 Plantilla de Archivo de Seguimiento

**Nombre del archivo:** `last_ui_{YYYYMMDD_HHMMSS}.md`

**Contenido inicial:** Ver plantilla completa en `docs/ai-prompts/Master_Development_Frontend_promp.md` (sección "Plantilla de Archivo de Seguimiento")

---

## 🔴 Reglas Críticas de Desarrollo Frontend (Mejoradas)

### 1. Orden de Implementación

**NUNCA implementes frontend sin verificar backend:**
- ❌ No implementar UI sin endpoints disponibles
- ❌ No implementar sin verificar permisos
- ❌ No asumir formato de respuesta sin consultar `rules/api-contract.md`

**Siempre verifica dependencias:**
- Consulta `docs/archive/ESTADO_MODULOS_TRANSVERSALES_2025-12-10.md` (o el más reciente en `docs/archive/`)
- Verifica endpoints en Swagger
- Revisa permisos en `rules/auth-rbac.md`

**NUEVO - Detección de Ciclos:**
- ❌ No continuar con correcciones iterativas después de 3 intentos fallidos
- ✅ Pasar a solución de fondo cuando se detecta ciclo
- ✅ Documentar solución de fondo para reutilización

### 2. Arquitectura Frontend

**Estructura de Features:**
```
app/features/{module}/
  ├── types/          # Tipos TypeScript
  ├── config/         # Configuración (campos, etc.)
  ├── api/            # API services
  ├── hooks/          # Custom hooks
  ├── components/     # Componentes React
  └── utils/          # Utilidades
```

**Componentes DEBEN:**
- ✅ Usar shadcn/ui cuando sea posible (configuración: Style Maia, Base Color Gray, Theme Blue #023E87)
- ✅ Usar Hugeicons para iconos (`@hugeicons/react` + `@hugeicons/core-free-icons`)
- ✅ Usar colores de marca de `docs/brand/colors.md` (AiutoX Blue #023E87, AiutoX Teal #00B6BC, etc.)
- ✅ Usar fuente Noto Sans
- ✅ Usar radius Small para bordes redondeados
- ✅ Manejar estados de carga/error
- ✅ Ser accesibles (ARIA, labels)
- ✅ No tener textos hardcodeados
- ✅ Seguir principios UX de `rules/ux-frontend.md`

### 3. Integración con Backend

**API Services DEBEN:**
- ✅ Usar `apiClient` de `app/lib/api/client.ts`
- ✅ Manejar `StandardResponse<T>` y `StandardListResponse<T>`
- ✅ Incluir manejo de errores
- ✅ Usar tipos TypeScript alineados con schemas Pydantic

**Hooks DEBEN:**
- ✅ Manejar estados (loading, error, data)
- ✅ Proporcionar funciones de mutación
- ✅ Actualizar caché cuando sea necesario

### 4. Tests

**Tests DEBEN:**
- ✅ Cubrir hooks críticos
- ✅ Cubrir componentes principales
- ✅ Incluir tests E2E para flujos completos
- ✅ Cobertura > 80% (objetivo: 85%)

### 5. Documentación Progresiva (NUEVO)

**Documentación DEBE:**
- ✅ Actualizarse después de cada fase
- ✅ Capturar TODOS los errores y warnings
- ✅ Clasificar warnings por severidad
- ✅ Documentar soluciones aplicadas
- ✅ Registrar lecciones aprendidas
- ✅ Identificar patrones reutilizables

---

## 📋 Comandos de Inicialización Automática

**Al iniciar una nueva feature, ejecutar:**

### Opción A: Script Automático (Recomendado)

```powershell
# 1. Crear archivo de seguimiento automáticamente
cd frontend/dev-ia
.\create_tracking_file.ps1 -FeatureName "SavedFilters" -Module "users" -PlanPath ".cursor/plans/savedfilters_users_implementation_*.plan.md"

# 2. Ejecutar verificación inicial
cd ..
npm run typecheck > "dev-ia/typecheck_initial.txt" 2>&1
npm run lint > "dev-ia/lint_initial.txt" 2>&1
npm run test > "dev-ia/test_initial.txt" 2>&1

# 3. Registrar resultados en archivo de seguimiento
```

### Opción B: Manual

```bash
# 1. Crear archivo de seguimiento
cd frontend/dev-ia
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "last_ui_$timestamp.md"
New-Item -ItemType File -Path $filename

# 2. Inicializar contenido (usar plantilla arriba)
# Editar $filename y completar información inicial

# 3. Ejecutar verificación inicial
cd ..
npm run typecheck > "dev-ia/typecheck_initial.txt" 2>&1
npm run lint > "dev-ia/lint_initial.txt" 2>&1
npm run test > "dev-ia/test_initial.txt" 2>&1

# 4. Registrar resultados en archivo de seguimiento
```

---

## 🎯 Criterios de Éxito por Feature

Una feature se considera completada cuando:

- ✅ Todas las fases del plan están completadas
- ✅ 0 errores TypeScript
- ✅ 0 errores ESLint críticos
- ✅ Tests unitarios pasan (cobertura > 80%, objetivo: 85%)
- ✅ Tests E2E pasan
- ✅ Integración con backend verificada
- ✅ Componentes accesibles
- ✅ No hay textos hardcodeados
- ✅ TODOS los warnings están clasificados y documentados (🔴🟡🟢⚪)
- ✅ Warnings críticas y altas corregidas o tienen plan documentado
- ✅ Si un warning no se corrige, la razón está explícitamente documentada
- ✅ No hay ciclos infinitos detectados
- ✅ Lecciones aprendidas documentadas
- ✅ Helpers reutilizables creados si aplica
- ✅ Documentación actualizada
- ✅ Archivo de seguimiento completo con métricas

## 📊 Métricas de Éxito (Inspiradas en Backend)

### Métricas Objetivo por Feature

**Tiempo de Desarrollo:**
- Objetivo: 1 día por feature
- Máximo aceptable: 2 días

**Iteraciones:**
- Objetivo: 2-4 iteraciones
- Máximo aceptable: 6 iteraciones

**Errores:**
- Objetivo: <10% tasa de errores en primera implementación
- Máximo aceptable: <20%

**Cobertura de Tests:**
- Objetivo: >85%
- Mínimo aceptable: >75%

**Warnings:**
- Objetivo: 0 warnings críticas
- Máximo aceptable: Todas clasificadas y documentadas

---

## 📌 Notas Importantes

**Lecciones aprendidas del backend aplicadas:**

1. **Actualizar archivo de seguimiento después de CADA fase completada**
2. **Documentar TODOS los errores y correcciones** con soluciones aplicadas
3. **Clasificar y documentar TODOS los warnings** por severidad (🔴🟡🟢⚪)
4. **No avanzar de fase sin completar checklist de fase actual**
5. **Verificar backend antes de implementar frontend**
6. **Seguir principios UX de `rules/ux-frontend.md`**
7. **Usar shadcn/ui para componentes base**
8. **Mantener coherencia con arquitectura establecida**
9. **Registrar intentos de corrección** para detectar ciclos temprano
10. **Detectar ciclos infinitos** (3 intentos = solución de fondo)
11. **Documentar lecciones aprendidas** al finalizar cada feature
12. **Crear helpers reutilizables** cuando se repiten soluciones
13. **Actualizar plantillas** con patrones que funcionan bien

## 🔗 Referencias Clave

### Documentación Principal
- `frontend/dev-ia/PLAN_MAESTRO_UI_FRONTEND.md` - Plan maestro mejorado
- `docs/ai-prompts/Master_Development_Frontend_promp.md` - Prompt maestro frontend (VERSIÓN OFICIAL)
- `docs/11-frontend.md` - Documentación técnica frontend
- `docs/50-ai-development.md` - Guía de desarrollo con IA (aplicable)

### Metodología Backend (Referencia)
- `backend/tests/analysis/PLAN_MEJORADO_TESTS.md` - Plan mejorado de tests (inspiración)
- `docs/archive/` - Historial de correcciones y mejoras del backend

### Reglas y Estándares
- `rules/naming.md` - Convenciones de nombres
- `rules/api-contract.md` - Contrato de API
- `rules/ux-frontend.md` - Principios UX
- `rules/tests.md` - Estándares de testing

---

## 🎓 Lecciones Aprendidas del Backend Aplicadas

### 1. Documentación Progresiva
**Del backend:** Archivos `last_test_{datetime}.md` evitan pérdida de contexto
**Aplicado a frontend:** Archivos `last_ui_{datetime}.md` con plantilla mejorada

### 2. Seguimiento de Intentos
**Del backend:** Registro de intentos de corrección detecta ciclos temprano
**Aplicado a frontend:** Tabla de intentos en errores y warnings

### 3. Clasificación Sistemática
**Del backend:** Warnings clasificados por severidad (🔴🟡🟢⚪)
**Aplicado a frontend:** Mismo sistema de clasificación obligatorio

### 4. Soluciones de Fondo
**Del backend:** Helpers reutilizables (`event_helpers.py`, `helpers.py`)
**Aplicado a frontend:** Crear helpers cuando se repiten soluciones

### 5. Métricas Cuantificables
**Del backend:** Métricas antes/después documentadas
**Aplicado a frontend:** Métricas objetivo definidas

### 6. Lecciones Aprendidas
**Del backend:** Sección de lecciones aprendidas en cada módulo
**Aplicado a frontend:** Sección obligatoria en archivo de seguimiento

---

## 📋 Checklist Maestro para Nueva Feature (Repetible y Automatizable)

### Pre-Desarrollo
- [ ] Leer documentación relevante (`docs/11-frontend.md`, `docs/archive/ESTADO_MODULOS_TRANSVERSALES_2025-12-10.md` o el más reciente)
- [ ] Verificar backend disponible y documentado
- [ ] Consultar plan de implementación si existe
- [ ] Crear archivo de seguimiento `last_ui_{datetime}.md`
- [ ] Ejecutar verificación inicial (typecheck, lint, tests)

### Desarrollo
- [ ] Definir tipos TypeScript
- [ ] Crear configuración de campos
- [ ] Implementar API services
- [ ] Implementar hooks
- [ ] Implementar componentes
- [ ] Crear rutas
- [ ] Integrar con backend
- [ ] Implementar tests

### Post-Desarrollo
- [ ] Ejecutar linters
- [ ] Ejecutar tests (cobertura >70%)
- [ ] Verificar accesibilidad
- [ ] Verificar responsive
- [ ] Clasificar y documentar TODOS los warnings
- [ ] Documentar lecciones aprendidas
- [ ] Actualizar archivo de seguimiento con métricas finales

### Automatización Futura

**Potenciales mejoras:**
1. Script de generación automática de feature completa
2. Validación automática de checklist
3. Generación automática de tests básicos
4. Verificación automática de integración con backend
5. Reporte automático de cumplimiento de estándares
6. Detección automática de ciclos infinitos

---

**Última actualización:** 2025-01-13
**Versión de metodología:** 2.0 (Mejorada con lecciones del backend)
**Nota:** Para la versión completa y actualizada, consultar `docs/ai-prompts/Master_Development_Frontend_promp.md`
