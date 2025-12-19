# Plan Maestro para Desarrollo y Verificación de UI Frontend - AiutoX ERP

**Fecha de Inicio:** [Se completará al iniciar]
**Última Actualización:** [Se actualizará después de cada feature/módulo]
**Estado:** 🔄 En Progreso
**Versión de Metodología:** 2.0 (Mejorada con lecciones del backend)

> **Nota**: Esta metodología ha sido perfeccionada aplicando las lecciones aprendidas del desarrollo del backend con IA. Incluye documentación progresiva, seguimiento sistemático de errores, detección de ciclos infinitos y procedimientos repetibles.

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

### Referencias de Documentación
- **Tech Stack completo:** `docs/11-frontend.md` - Documentación técnica frontend
- **UX Rules:** `rules/ux-frontend.md` - Principios UX y frontend
- **API Contract:** `rules/api-contract.md` - Contrato de API
- **Naming:** `rules/naming.md` - Convenciones de nombres
- **Tests:** `rules/tests.md` - Estándares de testing

---

## 📋 Índice

1. [Flujo de Trabajo Completo](#flujo-de-trabajo-completo)
2. [Inicialización](#inicialización)
3. [Estado Actual](#estado-actual)
4. [Plan de Ejecución por Feature/Módulo](#plan-de-ejecución-por-featuremódulo)
5. [Seguimiento de Progreso](#seguimiento-de-progreso)
6. [Lista de Errores y Correcciones](#lista-de-errores-y-correcciones)
7. [Manejo de Warnings Frontend](#manejo-de-warnings-frontend)
8. [Manejo de Tests Fallidos](#manejo-de-tests-fallidos)
9. [Procedimiento para Retomar](#procedimiento-para-retomar)
10. [Verificación Final](#verificación-final)
11. [Detección de Ciclos Infinitos](#detección-de-ciclos-infinitos)
12. [Procedimiento de Actualización del Documento](#procedimiento-de-actualización-del-documento)
13. [Comandos Útiles](#comandos-útiles)
14. [Archivos Clave](#archivos-clave)
15. [Criterios de Éxito Final](#criterios-de-éxito-final)
16. [Notas Importantes](#notas-importantes)
17. [Inicio Rápido](#inicio-rápido)

---

## 🔄 Flujo de Trabajo Completo

### Resumen del Procedimiento (Mejorado)

**Inspirado en la metodología perfeccionada del backend** (`backend/tests/analysis/PLAN_MEJORADO_TESTS.md`):

1. **Inicialización:**
   - Crear archivo `front_dev_process_{datetime}.md` en `frontend/dev-ia/` con plantilla completa
   - Verificar estado del backend del módulo a implementar (`docs/ESTADO_MODULOS_TRANSVERSALES.md`)
   - Crear/actualizar plan específico `.plan.md` en `.cursor/plans/` si no existe
   - Ejecutar verificación inicial completa (lint, typecheck, tests existentes)
   - **Capturar y documentar estado inicial** (errores, warnings, tests)

2. **Por Cada Feature/Módulo:**
   - Ejecutar verificación de alcance (TypeScript, linting, tests)
   - Implementar según fases del plan (tipos → API → hooks → componentes → rutas)
   - **Capturar TODOS los errores** de TypeScript, ESLint, tests
   - **Clasificar TODOS los warnings** por severidad (🔴 Crítica, 🟡 Alta, 🟢 Media, ⚪ Baja)
   - Actualizar documento de seguimiento **después de cada bloque de trabajo**
   - Si hay errores: corregirlos inmediatamente y **documentar la solución**
   - Re-ejecutar verificación para confirmar corrección
   - **Detectar ciclos infinitos** (3 intentos fallidos = solución de fondo)
   - **No avanzar de fase** sin completar checklist de fase actual

3. **Después de Cada Corrección:**
   - Actualizar documento marcando error como corregido ✅
   - **Documentar solución aplicada** (qué se cambió y por qué)
   - **Registrar intentos de corrección** (para detectar ciclos)
   - Verificar que no se crearon nuevos errores
   - Ejecutar tests relevantes
   - **Si la corrección se repite 3+ veces**: Marcar como 🔴 Ciclo detectado y pasar a solución de fondo

4. **Al Finalizar Feature/Módulo:**
   - Ejecutar suite completa de tests (unitarios + E2E)
   - Verificar cobertura (>70%, objetivo: 80%)
   - Verificar integración con backend (cuando sea posible)
   - **Generar reporte final** con métricas cuantificables
   - **Documentar lecciones aprendidas** (qué funcionó bien, qué mejoró)
   - Actualizar documentación si es necesario
   - Actualizar reglas si es necesario
   - **Actualizar archivo de seguimiento** con resumen ejecutivo final

### Flujo Visual

```
INICIO
  ↓
Crear front_dev_process_{datetime}.md
  ↓
Verificar backend del módulo
  ↓
Crear/actualizar .plan.md específico
  ↓
Ejecutar verificación inicial (lint, typecheck)
  ↓
┌─────────────────────────────────┐
│ Por cada fase del plan:         │
│ 1. Implementar según alcance    │
│ 2. Ejecutar verificación        │
│ 3. Actualizar documento          │
│ 4. ¿Hay errores?                 │
│    SÍ → Corregir inmediatamente  │
│    NO → Siguiente fase           │
│ 5. ¿Ciclo detectado?            │
│    SÍ → Solución de fondo       │
│    NO → Continuar               │
└─────────────────────────────────┘
  ↓
Ejecutar suite completa (verificación final)
  ↓
Generar reporte final
  ↓
¿Fase 100% completada y probada?
  ├─ NO → Continuar desarrollo
  └─ SÍ → Limpieza y Archivado
      ↓
  1. Mover front_dev_process_{datetime}.md a archive/
  2. Borrar archivos temporales (*.txt)
  3. Verificar estructura final
  ↓
FIN
```

---

## 🚀 Inicialización

### Paso 1: Crear Archivo de Seguimiento

**Al iniciar el desarrollo de una feature/módulo frontend, crear archivo:**
```
frontend/dev-ia/front_dev_process_{datetime}.md
```

**Formato del nombre:** `front_dev_process_YYYYMMDD_HHMMSS.md` (ejemplo: `front_dev_process_20250113_143022.md`)

**Comando para crear archivo:**
```bash
cd frontend/dev-ia
# Crear archivo con timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
New-Item -ItemType File -Path "front_dev_process_$timestamp.md"
```

**Contenido inicial del archivo (Plantilla Mejorada):**

```markdown
# Seguimiento de Desarrollo Frontend - {Feature/Módulo}

**Fecha de Inicio:** {YYYY-MM-DD HH:MM:SS}
**Última Actualización:** {YYYY-MM-DD HH:MM:SS}
**Estado:** 🔄 En Progreso | ✅ Completado | ❌ Error

---

## 📋 Información General

**Feature/Módulo:** {nombre}
**Plan Asociado:** `.cursor/plans/{plan_name}.plan.md`
**Backend Verificado:** ✅ Sí | ⏳ Pendiente | ❌ No disponible
**Endpoints Backend:** {lista de endpoints}
**Permisos Necesarios:** {lista de permisos}

---

## 📊 Estado Actual

**Fase Actual:** Fase {X} de {Y}
**Fases Completadas:** {X}/{Y}
**Archivos Creados:** {N}
**Archivos Modificados:** {N}

**Errores TypeScript:** {N} ❌
**Errores ESLint:** {N} ❌
**Tests Unitarios:** {N pasando}/{N total}
**Tests E2E:** {N pasando}/{N total}
**Warnings:** {N} ⚠️
  - 🔴 Críticas: {N}
  - 🟡 Altas: {N}
  - 🟢 Medias: {N}
  - ⚪ Bajas: {N}

---

## 🐛 Errores Encontrados y Correcciones

### Errores TypeScript

| # | Descripción | Archivo | Línea | Intentos | Estado | Solución |
|---|-------------|---------|-------|----------|--------|----------|
| 1 | {descripción} | {archivo} | {línea} | 0 | ⏳ Pendiente | {solución} |

**Regla de Ciclos Infinitos:** Si un error tiene 3+ intentos fallidos, marcar como 🔴 Ciclo detectado y pasar a solución de fondo.

### Errores ESLint

| # | Descripción | Archivo | Línea | Severidad | Intentos | Estado | Solución |
|---|-------------|---------|-------|-----------|----------|--------|----------|
| 1 | {descripción} | {archivo} | {línea} | 🔴 Crítica | 0 | ⏳ Pendiente | {solución} |

### Tests Fallidos

| # | Test | Archivo | Razón | Intentos | Estado | Solución |
|---|------|---------|-------|----------|--------|----------|
| 1 | {nombre} | {archivo} | {razón} | 0 | ⏳ Pendiente | {solución} |

---

## ⚠️ Warnings Encontrados (OBLIGATORIO: Clasificar TODOS)

### Warnings Críticas (🔴) - Deben corregirse inmediatamente

| # | Descripción | Archivo | Estado | Acción | Razón si Aceptado |
|---|-------------|---------|--------|--------|-------------------|
| 1 | {descripción} | {archivo} | ⏳ Pendiente | {acción} | - |

### Warnings Altas (🟡) - Deben corregirse pronto

| # | Descripción | Archivo | Estado | Acción | Razón si Aceptado |
|---|-------------|---------|--------|--------|-------------------|
| 1 | {descripción} | {archivo} | ⏳ Pendiente | {acción} | - |

### Warnings Medias/Bajas (🟢/⚪) - Pueden esperar / Opcionales

| # | Descripción | Archivo | Severidad | Estado | Razón Aceptación |
|---|-------------|---------|-----------|--------|------------------|
| 1 | {descripción} | {archivo} | 🟢 Media | 📝 Aceptado | {razón explícita} |

**⚠️ REGLA CRÍTICA:** Si no se hace nada con un warning, **DEBE documentarse explícitamente la razón**.

---

## 📁 Archivos Creados/Modificados

### Archivos Creados

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `app/features/{module}/types/*.ts` | Tipos TypeScript | ✅ Completado |

### Archivos Modificados

| Archivo | Cambios | Estado |
|---------|---------|--------|
| `app/routes.ts` | Agregada ruta | ✅ Completado |

---

## 📈 Historial de Actualizaciones

| Fecha/Hora | Acción | Detalles | Resultado |
|------------|--------|----------|-----------|
| {YYYY-MM-DD HH:MM:SS} | Inicio de desarrollo | Feature iniciada | - |
| {YYYY-MM-DD HH:MM:SS} | Fase X completada | {detalles} | ✅ |
| {YYYY-MM-DD HH:MM:SS} | Error corregido | {descripción} | ✅ |
| {YYYY-MM-DD HH:MM:SS} | Ciclo detectado | {descripción} | 🔴 Solución de fondo |

---

## 🎯 Próximas Acciones

- [ ] {acción pendiente}
- [ ] {acción pendiente}

---

## 📝 Lecciones Aprendidas

**Qué funcionó bien:**
- {lección positiva}

**Qué mejoró durante el desarrollo:**
- {mejora identificada}

**Problemas encontrados y soluciones:**
- {problema}: {solución aplicada}

---

**Última actualización:** {YYYY-MM-DD HH:MM:SS}
```

**Mejoras aplicadas de la metodología del backend:**
- ✅ Plantilla más estructurada y completa
- ✅ Seguimiento de intentos de corrección (para detectar ciclos)
- ✅ Clasificación obligatoria de warnings
- ✅ Sección de lecciones aprendidas
- ✅ Historial detallado de actualizaciones

### Paso 2: Verificar Estado del Backend

**Antes de implementar cualquier feature frontend:**

1. Verificar en `docs/ESTADO_MODULOS_TRANSVERSALES.md` que el módulo backend esté implementado
2. Revisar endpoints disponibles en Swagger/OpenAPI o en `backend/app/api/v1/`
3. Verificar permisos necesarios en `rules/auth-rbac.md`
4. Si el backend no está listo, **documentar** en el plan que se está trabajando con mocks/tipos

### Paso 3: Crear/Actualizar Plan Específico

**Si no existe un `.plan.md` para la feature:**

1. Crear plan en `.cursor/plans/` siguiendo el formato de `savedfilters_users_implementation_*.plan.md`
2. Definir fases claras (Fase 1: tipos, Fase 2: UI base, etc.)
3. Incluir checklists de alcance, tests, documentación y reglas por fase

---

## 📊 Estado Actual

### Resumen Ejecutivo

- **Features completadas:** [N] - [Se actualizará después de cada feature]
- **Features en progreso:** [N] - [Se actualizará después de cada feature]
- **Features pendientes:** [N] - [Se actualizará después de cada feature]
- **Errores TypeScript:** [N] - [Se capturarán todos]
- **Errores ESLint:** [N] - [Se capturarán todos]
- **Tests unitarios pasando:** [N]/[Total] - [Se actualizará después de cada ejecución]
- **Tests E2E pasando:** [N]/[Total] - [Se actualizará después de cada ejecución]
- **Warnings:** [N] - [Se capturarán y clasificarán todos]
  - 🔴 Críticas: [N] (TypeScript errors, linting crítico)
  - 🟡 Altas: [N] (TypeScript warnings, ESLint warnings importantes)
  - 🟢 Medias: [N] (ESLint warnings menores, console.warn)
  - ⚪ Bajas: [N] (sugerencias de optimización)

### Features Implementadas ✅

**Infraestructura Base:**
- ✅ Auth básico (login, logout, tokens en localStorage)
- ✅ API Client configurado (`app/lib/api/client.ts`)
- ✅ AuthStore Zustand (`app/stores/authStore.ts`)
- ✅ Estructura base de rutas (`app/routes.ts`, `app/routes/*.tsx`)
- ✅ Componentes shadcn/ui base instalados

**Features en Construcción:**
- 🔄 **SavedFilters para Users** (Fase 1-2 completadas, Fase 3-4 en progreso)
  - Tipos TypeScript ✅
  - Configuración de campos Users ✅
  - API service ✅
  - Hook `useSavedFilters` ✅
  - Hook `useFilterUrlSync` ✅
  - Componente base `SavedFilters` ✅
  - Integración en `UsersList` ✅
  - Ruta `/users` ✅
  - Editor visual 🔄 (en progreso)
  - Editor JSON ⏳ (pendiente)
  - Gestión de filtros ⏳ (pendiente)

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

## 📦 Plan de Ejecución por Feature/Módulo

### Orden de Ejecución (Prioridad)

**Fase 0: Ajustes Base (Objetivo: Infraestructura sólida)**
1. ⏳ **Auth Refresh Token** - Implementar renovación automática en `apiClient`
2. ⏳ **Permisos en UI** - Guards y componentes condicionales basados en `permissions[]`
3. ⏳ **Layout Principal** - AppShell con Header, Sidebar, MainContent, Footer
4. ⏳ **Dashboard** - Dashboard personalizado por rol

**Fase 1: Módulos Core Frontend (Objetivo: Infraestructura transversal)**
5. 🔄 **SavedFilters** - Sistema completo (Fase 3-4 pendientes)
6. ⏳ **Files** - Upload, download, gestión de archivos
7. ⏳ **Search** - Búsqueda global en header
8. ⏳ **Activities** - Timeline de actividades
9. ⏳ **Tags** - Sistema de etiquetado
10. ⏳ **Notifications** - SSE stream y componente de notificaciones

**Fase 2: Módulos de Negocio Críticos (Objetivo: CRUD completo + SavedFilters)**
11. ⏳ **Users** - CRUD completo (actualmente solo lista básica)
12. ⏳ **Products** - CRUD completo con SavedFilters
13. ⏳ **Inventory** - CRUD completo con SavedFilters
14. ⏳ **Customers/Organizations** - CRUD completo con SavedFilters

**Fase 3: Funcionalidades Avanzadas**
15. ⏳ **Reporting** - Canvas interactivo
16. ⏳ **Settings** - Preferencias y configuración
17. ⏳ **Import/Export** - Funcionalidades de importación/exportación
18. ⏳ **Calendar** - Calendario y eventos
19. ⏳ **Tasks** - Gestión de tareas
20. ⏳ **Comments** - Sistema de comentarios
21. ⏳ **Approvals** - Flujos de aprobación
22. ⏳ **Templates** - Plantillas

---

## 📈 Seguimiento de Progreso

### Estructura de Seguimiento por Feature

Para cada feature/módulo, registrar:

```markdown
### Feature: [nombre]

**Plan asociado:** `.cursor/plans/[nombre]_implementation_*.plan.md`
**Estado:** ⏳ Pendiente | 🔄 En Progreso | ✅ Completado | ❌ Error
**Última actualización:** [timestamp]
**Fase actual:** [Fase X de Y]

**Resultado:**
- Fases completadas: [X]/[Y]
- Archivos creados: [N]
- Archivos modificados: [N]
- **Errores TypeScript:** [N] ❌
- **Errores ESLint:** [N] ❌
- **Tests unitarios:** [N pasando]/[N total]
- **Tests E2E:** [N pasando]/[N total]
- **Warnings:** [N] ⚠️
  - 🔴 Críticas: [N]
  - 🟡 Altas: [N]
  - 🟢 Medias: [N]
  - ⚪ Bajas: [N]

**Errores encontrados:**
1. [Descripción del error] - Estado: ⏳ Pendiente | ✅ Corregido
2. [Descripción del error] - Estado: ⏳ Pendiente | ✅ Corregido

**Warnings encontrados:**
1. [Warning crítico] - Severidad: 🔴 - Estado: ⏳ Pendiente | ✅ Corregido | 📝 Aceptado (razón: [razón])
2. [Warning alta] - Severidad: 🟡 - Estado: ⏳ Pendiente | ✅ Corregido | 📝 Aceptado (razón: [razón])

**Archivos creados/modificados:**
- `app/features/[feature]/types/*.ts` - ✅ Completado
- `app/features/[feature]/api/*.ts` - ✅ Completado
- `app/features/[feature]/hooks/*.ts` - ✅ Completado
- `app/features/[feature]/components/*.tsx` - 🔄 En progreso
- `app/routes/[feature].tsx` - ⏳ Pendiente

**Integración con Backend:**
- Endpoints verificados: [Lista de endpoints]
- Permisos verificados: [Lista de permisos]
- Tests de integración: [Estado]

**Acciones realizadas:**
- [Timestamp] - [Acción realizada]
- [Timestamp] - [Acción realizada]
- [Timestamp] - Clasificado warning: [descripción]

**Próximas acciones:**
- [ ] [Acción pendiente]
- [ ] [Acción pendiente]
```

### Ejemplo Real: SavedFilters - Users

```markdown
### Feature: SavedFilters - Users

**Plan asociado:** `.cursor/plans/savedfilters_users_implementation_9226d3a6.plan.md`
**Estado:** 🔄 En Progreso
**Última actualización:** 2025-12-13 13:15:00
**Fase actual:** Fase 3 de 4

**Resultado:**
- Fases completadas: 2/4
- Archivos creados: 8
- Archivos modificados: 2
- **Errores TypeScript:** 0 ❌
- **Errores ESLint:** 0 ❌
- **Tests unitarios:** 0/15 (pendientes)
- **Tests E2E:** 0/5 (pendientes)
- **Warnings:** 0 ⚠️

**Archivos creados/modificados:**
- `app/features/views/types/savedFilter.types.ts` - ✅ Completado
- `app/features/views/config/userFields.ts` - ✅ Completado
- `app/features/views/api/savedFilters.api.ts` - ✅ Completado
- `app/features/views/hooks/useSavedFilters.ts` - ✅ Completado
- `app/features/views/hooks/useFilterUrlSync.ts` - ✅ Completado
- `app/features/views/components/SavedFilters.tsx` - ✅ Completado
- `app/features/views/components/VisualFilterEditor.tsx` - 🔄 En progreso
- `app/features/views/utils/filterUtils.ts` - ✅ Completado
- `app/features/users/api/users.api.ts` - ✅ Completado
- `app/features/users/components/UsersList.tsx` - ✅ Completado
- `app/routes/users.tsx` - ✅ Completado
- `app/routes.ts` - ✅ Completado (agregada ruta /users)

**Integración con Backend:**
- Endpoints verificados: `/api/v1/views/filters` (CRUD completo)
- Permisos verificados: `views.view`, `views.manage`, `views.share`
- Tests de integración: ⏳ Pendiente (Fase 2 verify)

**Próximas acciones:**
- [ ] Completar Fase 3: Editor JSON, FilterPreview, FilterEditorModal
- [ ] Implementar tests unitarios para componentes
- [ ] Implementar tests E2E para flujo completo
- [ ] Verificar integración real con backend
```

---

## 🐛 Lista de Errores y Correcciones

### Categorías de Errores Frontend

#### 1. Errores de TypeScript

**Patrón:** `Type 'X' is not assignable to type 'Y'`, `Property 'X' does not exist on type 'Y'`, etc.

**Solución estándar:**
- Verificar tipos en `types/*.ts` coinciden con schemas Pydantic del backend
- Usar `as` o type guards cuando sea necesario (con cuidado)
- Asegurar que tipos de respuesta API usen `StandardResponse<T>` o `StandardListResponse<T>`

**Lista de errores:**
- [ ] [Ejemplo] `SavedFilters.tsx` - Type error en props - ⏳ Pendiente

#### 2. Errores de ESLint

**Patrón:** Warnings/errores de ESLint (unused vars, missing dependencies, etc.)

**Solución estándar:**
- Corregir warnings críticos inmediatamente
- Documentar warnings aceptados con razón explícita

**Lista de errores:**
- [ ] [Ejemplo] `useSavedFilters.ts` - Missing dependency in useEffect - ⏳ Pendiente

#### 3. Errores de Integración con Backend

**Patrón:** 401 Unauthorized, 403 Forbidden, 404 Not Found, formato de respuesta incorrecto

**Solución estándar:**
- Verificar que `apiClient` incluye token Bearer
- Verificar permisos del usuario en `/auth/me`
- Verificar formato de request/response según `rules/api-contract.md`
- Verificar que endpoints existen en backend

**Lista de errores:**
- [ ] [Ejemplo] `SavedFilters` - 401 al listar filtros - ⏳ Pendiente

#### 4. Errores de Tests

**Patrón:** Tests fallando (unitarios o E2E)

**Solución estándar:**
- Revisar mocks y fixtures
- Verificar que componentes se renderizan correctamente
- Verificar que hooks retornan valores esperados
- Verificar que E2E espera elementos correctos

**Lista de errores:**
- [ ] [Ejemplo] `SavedFilters.test.tsx` - Test de renderizado falla - ⏳ Pendiente

#### 5. Errores de Build/Compilación

**Patrón:** Errores al ejecutar `npm run build` o `npm run typecheck`

**Solución estándar:**
- Corregir errores TypeScript primero
- Verificar imports y dependencias
- Verificar configuración de Vite/TypeScript

**Lista de errores:**
- [ ] [Ejemplo] Build falla por import circular - ⏳ Pendiente

---

## ⚠️ Manejo de Warnings Frontend

### Clasificación de Warnings

#### 🔴 Críticas (Deben corregirse inmediatamente)

- **TypeScript errors** (no warnings, errores reales)
- **ESLint errors** (no warnings, errores de linting críticos)
- **Console errors** en runtime
- **Errores de accesibilidad** (ARIA, labels faltantes)

#### 🟡 Altas (Deben corregirse pronto)

- **TypeScript warnings** (any, unused, etc.)
- **ESLint warnings importantes** (missing dependencies, unused vars críticos)
- **Console warnings** en runtime (deprecations, etc.)

#### 🟢 Medias (Pueden esperar)

- **ESLint warnings menores** (prefer const, etc.)
- **Console.warn** no críticos
- **Sugerencias de optimización** (performance menores)

#### ⚪ Bajas (Opcionales)

- **Sugerencias de estilo** (formato, orden de imports)
- **Sugerencias de optimización** (bundle size, etc.)

### Procedimiento de Clasificación

1. **Capturar todos los warnings** durante desarrollo y tests
2. **Clasificar por severidad** según criterios arriba
3. **Documentar en el archivo de seguimiento** con estado (Pendiente | Corregido | Aceptado con razón)
4. **Corregir críticas y altas** antes de considerar feature completa
5. **Documentar razón explícita** si se acepta un warning sin corregir

---

## 🧪 Manejo de Tests Fallidos

### Tests Unitarios (Vitest + React Testing Library)

**Comando para ejecutar:**
```bash
cd frontend
npm run test
```

**Comando para ejecutar con UI:**
```bash
npm run test:ui
```

**Comando para ejecutar un archivo específico:**
```bash
npm run test app/features/views/components/SavedFilters.test.tsx
```

**Procedimiento cuando falla un test:**
1. Leer mensaje de error completo
2. Verificar que el componente/hook funciona manualmente
3. Revisar mocks y fixtures
4. Corregir test o código según corresponda
5. Re-ejecutar test
6. Documentar corrección en archivo de seguimiento

### Tests E2E (Playwright)

**Comando para ejecutar:**
```bash
cd frontend
npm run test:e2e
```

**Comando para ejecutar con UI:**
```bash
npm run test:e2e:ui
```

**Comando para ejecutar un archivo específico:**
```bash
npx playwright test app/__tests__/e2e/users-filters.spec.ts
```

**Procedimiento cuando falla un test E2E:**
1. Verificar que el backend está corriendo
2. Verificar que la aplicación frontend está corriendo (`npm run dev`)
3. Revisar selectores y esperas (timeouts)
4. Verificar que los datos de test existen en backend
5. Corregir test o código según corresponda
6. Re-ejecutar test
7. Documentar corrección en archivo de seguimiento

---

## 🔁 Procedimiento para Retomar

Cuando un nuevo agente/persona retome el trabajo frontend:

### Paso 1: Leer Documentación Base

1. Leer `docs/ai-prompts/Master_Development_Frontend_promp.md`
2. Leer `docs/11-frontend.md`
3. Leer `docs/ESTADO_MODULOS_TRANSVERSALES.md` (para verificar backend)

### Paso 2: Identificar Trabajo en Curso

1. Ver último archivo de seguimiento: `frontend/dev-ia/front_dev_process_*.md` (más reciente)
2. Identificar feature/módulo en progreso
3. Leer plan asociado: `.cursor/plans/[feature]_implementation_*.plan.md`
4. Identificar fase actual y TODOs pendientes

### Paso 3: Verificar Estado Actual

1. Ejecutar verificación rápida:
   ```bash
   cd frontend
   npm run typecheck
   npm run lint
   npm run test
   ```
2. Revisar errores y warnings en el archivo de seguimiento
3. Verificar que el backend del módulo está disponible

### Paso 4: Continuar desde Donde se Quedó

1. **NO reescribir** código ya implementado (a menos que haya errores)
2. Continuar desde el siguiente TODO pendiente
3. Seguir el plan fase por fase
4. Actualizar archivo de seguimiento después de cada bloque de trabajo

---

## ✅ Verificación Final

### Checklist por Feature Completada

Antes de marcar una feature como completada:

- [ ] Todos los archivos del plan están creados/modificados
- [ ] No hay errores TypeScript (`npm run typecheck`)
- [ ] No hay errores ESLint críticos (`npm run lint`)
- [ ] Tests unitarios pasan (`npm run test`)
- [ ] Tests E2E pasan (`npm run test:e2e`)
- [ ] Integración con backend verificada (cuando sea posible)
- [ ] Componentes son accesibles (ARIA, labels, navegación por teclado)
- [ ] Diseño responsive (mobile, tablet, desktop)
- [ ] No hay textos hardcodeados (usar i18n keys o config)
- [ ] Documentación actualizada (si aplica)
- [ ] Reglas verificadas/actualizadas (si aplica)

### Suite Completa de Verificación

Al finalizar todas las features planificadas:

```bash
cd frontend

# 1. TypeScript
npm run typecheck

# 2. Linting
npm run lint

# 3. Tests unitarios
npm run test

# 4. Tests E2E
npm run test:e2e

# 5. Build de producción
npm run build
```

---

## 🧹 Limpieza y Archivado (OBLIGATORIO al finalizar cada fase)

**⚠️ REGLA CRÍTICA:** Al finalizar cada fase (cuando está 100% completada y probada), ejecutar limpieza automática para mantener `frontend/dev-ia/` organizado.

### Procedimiento de Limpieza

**Solo ejecutar cuando la fase está 100% completada y probada:**

1. **Crear carpeta `archive` si no existe:**
   ```powershell
   cd frontend/dev-ia
   if (-not (Test-Path "archive")) {
       New-Item -ItemType Directory -Path "archive"
   }
   ```

2. **Mover archivo `front_dev_process_{datetime}.md` a `archive/`:**
   ```powershell
   # Buscar archivo más reciente
   $latestFile = Get-ChildItem -Path . -Filter "front_dev_process_*.md" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
   if ($latestFile) {
       Move-Item -Path $latestFile.FullName -Destination "archive\$($latestFile.Name)"
       Write-Host "Archivo movido a archive: $($latestFile.Name)" -ForegroundColor Green
   }
   ```

3. **Borrar todos los archivos temporales:**
   ```powershell
   # Archivos a mantener (NO borrar):
   # - create_tracking_file.ps1
   # - PLAN_MAESTRO_UI_FRONTEND.md
   # - PROMPT_MAESTRO_FRONTEND.md
   # - README.md
   # - archive/ (directorio completo)

   # Borrar archivos temporales:
   Remove-Item -Path "*.txt" -ErrorAction SilentlyContinue  # typecheck_*.txt, lint_*.txt, test_*.txt, etc.
   Remove-Item -Path "front_dev_process_*.md" -ErrorAction SilentlyContinue  # Ya movido a archive
   Write-Host "Archivos temporales borrados" -ForegroundColor Green
   ```

4. **Verificar estructura final:**
   ```powershell
   # Verificar estructura final
   Write-Host "`nEstructura final de frontend/dev-ia/:" -ForegroundColor Cyan
   Get-ChildItem -Path . | Select-Object Name, @{Name="Type";Expression={if($_.PSIsContainer){"Directory"}else{"File"}}}
   ```

### Estructura Final Esperada

**Después de la limpieza, `frontend/dev-ia/` debe contener SOLO:**

```
frontend/dev-ia/
├── archive/                          # Archivos de seguimiento archivados
│   ├── front_dev_process_20251216_152020.md
│   ├── front_dev_process_20250117_143022.md
│   └── ...
├── create_tracking_file.ps1         # Script de creación
├── PLAN_MAESTRO_UI_FRONTEND.md      # Plan maestro
├── PROMPT_MAESTRO_FRONTEND.md        # Prompt maestro
└── README.md                         # Documentación
```

### Script de Limpieza Automática (Opcional)

**Crear script `cleanup_dev_ia.ps1` para automatizar:**

```powershell
# cleanup_dev_ia.ps1
# Script para limpiar y archivar archivos en frontend/dev-ia/

param(
    [switch]$Force  # Forzar limpieza sin confirmación
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Crear carpeta archive si no existe
if (-not (Test-Path "archive")) {
    New-Item -ItemType Directory -Path "archive"
    Write-Host "Carpeta archive creada" -ForegroundColor Green
}

# Mover archivos front_dev_process_*.md a archive
$uiFiles = Get-ChildItem -Path . -Filter "front_dev_process_*.md" -ErrorAction SilentlyContinue
if ($uiFiles) {
    foreach ($file in $uiFiles) {
        Move-Item -Path $file.FullName -Destination "archive\$($file.Name)" -Force
        Write-Host "Archivo movido a archive: $($file.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "No se encontraron archivos front_dev_process_*.md para archivar" -ForegroundColor Yellow
}

# Borrar archivos temporales
$tempFiles = Get-ChildItem -Path . -Filter "*.txt" -ErrorAction SilentlyContinue
if ($tempFiles) {
    if (-not $Force) {
        $confirm = Read-Host "¿Borrar $($tempFiles.Count) archivos temporales? (S/N)"
        if ($confirm -ne "S") {
            Write-Host "Limpieza cancelada" -ForegroundColor Yellow
            exit
        }
    }
    Remove-Item -Path "*.txt" -ErrorAction SilentlyContinue
    Write-Host "Archivos temporales borrados: $($tempFiles.Count) archivos" -ForegroundColor Green
}

# Verificar estructura final
Write-Host "`nEstructura final:" -ForegroundColor Cyan
Get-ChildItem -Path . | Select-Object Name, @{Name="Type";Expression={if($_.PSIsContainer){"Directory"}else{"File"}}}

Write-Host "`nLimpieza completada" -ForegroundColor Green
```

**Uso del script:**
```powershell
cd frontend/dev-ia
.\cleanup_dev_ia.ps1          # Con confirmación
.\cleanup_dev_ia.ps1 -Force   # Sin confirmación
```

### ⚠️ Reglas Importantes

1. **Solo ejecutar cuando la fase está 100% completada y probada**
2. **No borrar archivos si la fase aún está en progreso**
3. **El archivo `front_dev_process_{datetime}.md` debe moverse a `archive/` para mantener historial**
4. **Los archivos `.txt` temporales (typecheck, lint, test) deben borrarse siempre**
5. **Mantener siempre los 4 archivos esenciales:**
   - `create_tracking_file.ps1`
   - `PLAN_MAESTRO_UI_FRONTEND.md`
   - `PROMPT_MAESTRO_FRONTEND.md`
   - `README.md`

---

## 🔄 Detección de Ciclos Infinitos (Mejorado)

**Inspirado en la metodología perfeccionada del backend** que redujo errores repetitivos en 75%.

### Indicadores de Ciclo Infinito

- Mismo error aparece 3+ veces después de intentos de corrección
- Corrección aplicada pero error persiste o cambia a otro error relacionado
- Múltiples correcciones en el mismo archivo sin resolver el problema
- Mismo patrón de error-cambio-error se repite
- **Nuevo:** Mismo warning clasificado múltiples veces sin resolución

### Procedimiento de Detección (Mejorado)

1. **Registrar intentos de corrección en el documento:**
   ```markdown
   ### Error: [Descripción]
   - Intento 1: [Timestamp] - [Acción] - ❌ Falló - {razón del fallo}
   - Intento 2: [Timestamp] - [Acción] - ❌ Falló - {razón del fallo}
   - Intento 3: [Timestamp] - [Acción] - ❌ Falló - {razón del fallo}
   - **DECISIÓN:** 🔴 Ciclo detectado - Pasar a solución de fondo
   - **Análisis de causa raíz:** {análisis detallado}
   - **Solución de fondo diseñada:** {solución}
   ```

2. **Cuando se detecta un ciclo (después de 3 intentos):**
   - **DETENER** correcciones iterativas inmediatamente
   - **MARCAR** error como 🔴 Ciclo detectado en el documento
   - **ANALIZAR** la causa raíz del problema (no solo síntomas)
   - **DISEÑAR** solución de fondo (no parches)
   - **DOCUMENTAR** análisis y solución de fondo
   - **IMPLEMENTAR** solución de fondo
   - **VERIFICAR** que la solución resuelve el problema completamente
   - **ACTUALIZAR** documento marcando ciclo como resuelto
   - **REGISTRAR** en sección "Lecciones Aprendidas" para futuras referencias

**Regla de Oro:**
> Si después de 3 intentos el error persiste, **DETENER** y pasar a solución de fondo.
> No continuar con correcciones iterativas que no resuelven el problema raíz.
> **Documentar la solución de fondo** para que se convierta en patrón reutilizable.

### Ejemplos de Soluciones de Fondo (Del Backend)

**Ejemplo 1: Event Loop en PubSub**
- **Problema:** Event loop bloqueado en `EventConsumer.stop()`
- **Solución de fondo:** Creación de `event_helpers.py` con `safe_publish_event()`
- **Impacto:** Eliminados ~20-25 fallos relacionados
- **Aplicable a Frontend:** Helpers para manejo asíncrono seguro

**Ejemplo 2: Permisos Faltantes**
- **Problema:** Módulos sin permisos en `MODULE_ROLES`
- **Solución de fondo:** Helper `create_user_with_permission()` y verificación sistemática
- **Impacto:** Eliminados ~15-20 fallos (403 Forbidden)
- **Aplicable a Frontend:** Helpers para verificación de permisos en UI

---

## 📝 Procedimiento de Actualización del Documento

### Después de Cada Feature/Fase

**Paso 1: Ejecutar Verificaciones**
```bash
cd frontend

# TypeScript
npm run typecheck > typecheck_output.txt 2>&1

# ESLint
npm run lint > lint_output.txt 2>&1

# Tests unitarios
npm run test > test_output.txt 2>&1

# Tests E2E (si aplica)
npm run test:e2e > e2e_output.txt 2>&1
```

**Paso 2: Capturar Resultados**
- Extraer errores TypeScript
- Extraer errores/warnings ESLint
- Extraer resultados de tests (passed, failed, skipped)
- Identificar warnings y clasificarlos
- Identificar archivos creados/modificados

**Paso 3: Actualizar Archivo de Seguimiento**

**Ubicación:** `frontend/dev-ia/front_dev_process_{datetime}.md`

**Actualizar secciones:**
1. **Actualizar "Seguimiento de Progreso por Feature":**
   - Estado de la feature
   - Fase actual
   - Archivos creados/modificados
   - Errores y warnings encontrados
   - Resultados de tests

2. **Actualizar "Lista de Errores y Correcciones":**
   - Agregar nuevos errores encontrados
   - Marcar errores corregidos como ✅
   - Documentar soluciones aplicadas

3. **Actualizar "Estado Actual":**
   - Actualizar contadores de features completadas/en progreso
   - Actualizar contadores de errores y warnings

4. **Agregar entrada en "Acciones realizadas":**
   - Timestamp
   - Acción realizada
   - Resultado

---

## 🛠️ Comandos Útiles

### Desarrollo

```bash
# Iniciar servidor de desarrollo
cd frontend
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format
npm run format:check
```

### Testing

```bash
# Tests unitarios
npm run test
npm run test:ui

# Tests E2E
npm run test:e2e
npm run test:e2e:ui

# Tests E2E específico
npx playwright test app/__tests__/e2e/[feature].spec.ts
```

### Build y Producción

```bash
# Build
npm run build

# Verificar build
npm run start
```

### shadcn/ui

```bash
# Instalar componente
npx shadcn@latest add [component-name]

# Listar componentes disponibles
npx shadcn@latest add
```

### Utilidades

```bash
# Ver progreso actual
cat frontend/dev-ia/front_dev_process_*.md | grep -A 5 "Seguimiento de Progreso"

# Ver errores pendientes
cat frontend/dev-ia/front_dev_process_*.md | grep -A 10 "Errores Pendientes"

# Ver última feature procesada
cat frontend/dev-ia/front_dev_process_*.md | grep "### Feature:" | tail -1

# Contar archivos TypeScript
find app -name "*.ts" -o -name "*.tsx" | wc -l

# Buscar textos hardcodeados (antes de i18n completo)
grep -r "texto en español" app/features --include="*.tsx" --include="*.ts"
```

---

## 📚 Archivos Clave

### Frontend

- **API Client:** `frontend/app/lib/api/client.ts` - Cliente axios configurado
- **Auth Store:** `frontend/app/stores/authStore.ts` - Store de autenticación
- **Utils:** `frontend/app/lib/utils.ts` - Utilidades (cn, etc.)
- **Rutas:** `frontend/app/routes.ts` - Configuración de rutas
- **Config shadcn:** `frontend/components.json` - Configuración shadcn/ui

### Backend (Referencia)

- **API Contract:** `rules/api-contract.md` - Contrato de API
- **Estado Módulos:** `docs/ESTADO_MODULOS_TRANSVERSALES.md` - Estado real backend
- **Endpoints:** `backend/app/api/v1/*.py` - Endpoints disponibles

### Documentación

- **Frontend Doc:** `docs/11-frontend.md` - Documentación frontend
- **Master Prompt:** `docs/ai-prompts/Master_Development_Frontend_promp.md` - Prompt maestro
- **Reglas:** `rules/*.md` - Reglas del proyecto

---

## 🎯 Criterios de Éxito Final

- ✅ Todas las features planificadas completadas
- ✅ 0 errores TypeScript
- ✅ 0 errores ESLint críticos
- ✅ Cobertura de tests >70% (objetivo: 80%)
- ✅ Todos los tests unitarios pasan
- ✅ Todos los tests E2E pasan
- ✅ Integración con backend verificada para todas las features
- ✅ Componentes accesibles (WCAG compliance)
- ✅ Diseño responsive en todas las resoluciones principales
- ✅ No hay textos hardcodeados (usar i18n/config)
- ✅ **Todos los warnings están capturados y clasificados por severidad**
- ✅ **Warnings críticas han sido corregidas o tienen plan de corrección documentado**
- ✅ **Si no se hizo nada con un warning, la razón está explícitamente documentada**
- ✅ No hay ciclos infinitos de error-cambio-error
- ✅ Documentación actualizada
- ✅ Reglas actualizadas si es necesario
- ✅ Build de producción exitoso

---

## 📌 Notas Importantes (Mejoradas)

**Lecciones aprendidas del backend aplicadas:**

1. **Actualizar el documento después de CADA feature/fase completada**
2. **Marcar errores como corregidos cuando se solucionen** y documentar la solución
3. **Detectar ciclos infinitos y pasar a soluciones de fondo** (3 intentos = límite)
4. **Ejecutar suite completa antes de dar por terminado**
5. **Documentar todas las decisiones y cambios realizados**
6. **⚠️ OBLIGATORIO: Capturar, clasificar y documentar TODOS los warnings**
7. **⚠️ OBLIGATORIO: Si no se hace nada con un warning, explicar explícitamente la razón**
8. **⚠️ OBLIGATORIO: Verificar backend antes de implementar frontend**
9. **⚠️ OBLIGATORIO: Trabajar por fases según plan `.plan.md`**
10. **⚠️ OBLIGATORIO: No avanzar de fase sin completar checklist de fase actual**
11. **⚠️ NUEVO: Registrar intentos de corrección** para detectar ciclos temprano
12. **⚠️ NUEVO: Documentar lecciones aprendidas** al finalizar cada feature
13. **⚠️ NUEVO: Crear helpers reutilizables** cuando se repiten soluciones
14. **⚠️ NUEVO: Actualizar plantillas** con patrones que funcionan bien

## 📊 Métricas de Éxito (Inspiradas en Backend)

### Antes de la Metodología Mejorada
- Iteraciones promedio por feature: 6-10
- Tasa de errores en primera implementación: ~35%
- Tiempo promedio de desarrollo: 2-3 días
- Pérdida de contexto entre sesiones: Alta

### Después de la Metodología Mejorada (Objetivo)
- Iteraciones promedio por feature: 2-4 (reducción 60%)
- Tasa de errores en primera implementación: ~10% (reducción 71%)
- Tiempo promedio de desarrollo: 1 día (reducción 50%)
- Pérdida de contexto entre sesiones: Mínima (gracias a documentación progresiva)

### Mejoras Cuantificables Esperadas
- ✅ Reducción de 60% en iteraciones
- ✅ Reducción de 71% en errores
- ✅ Reducción de 50% en tiempo de desarrollo
- ✅ 100% de features siguen misma estructura
- ✅ 100% de warnings clasificados y documentados

---

## 🚀 Inicio Rápido

### Comandos para Empezar

```bash
# 1. Crear archivo de seguimiento
cd frontend/dev-ia
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
New-Item -ItemType File -Path "front_dev_process_$timestamp.md"

# 2. Verificar estado inicial
cd ..
npm run typecheck
npm run lint
npm run test

# 3. Ver último archivo de seguimiento creado
ls -lt dev-ia/front_dev_process_*.md | Select-Object -First 1

# 4. Continuar con la primera feature del plan
```

### Ejemplo de Flujo por Feature

```bash
# Ejemplo: Feature "SavedFilters - Users"

# 1. Verificar backend
# (Revisar docs/ESTADO_MODULOS_TRANSVERSALES.md y Swagger)

# 2. Crear/actualizar plan
# (Usar .cursor/plans/savedfilters_users_implementation_*.plan.md)

# 3. Implementar Fase 1 (tipos, config)
# [Implementar código]

# 4. Verificar Fase 1
npm run typecheck
npm run lint
npm run test app/features/views/types/

# 5. Actualizar documento de seguimiento
# (Editar front_dev_process_*.md)

# 6. Continuar con Fase 2
# [Implementar código]

# 7. Repetir hasta completar todas las fases
```

### Comandos de Utilidad

```bash
# Ver progreso actual
cat frontend/dev-ia/front_dev_process_*.md | grep -A 5 "Seguimiento de Progreso"

# Ver errores pendientes
cat frontend/dev-ia/front_dev_process_*.md | grep -A 10 "Errores Pendientes"

# Ver última feature procesada
cat frontend/dev-ia/front_dev_process_*.md | grep "### Feature:" | tail -1

# Contar componentes creados
find app/features -name "*.tsx" | wc -l

# Verificar integración con backend (requiere backend corriendo)
# Ejecutar tests E2E que hagan llamadas reales
```

---

---

## 🔗 Referencias Clave

### Documentación Principal
- `docs/50-ai-development.md` - Guía completa de desarrollo con IA (backend, aplicable a frontend)
- `docs/ai-prompts/Master_Development_Frontend_promp.md` - Prompt maestro frontend
- `docs/11-frontend.md` - Documentación técnica frontend
- `frontend/dev-ia/PROMPT_MAESTRO_FRONTEND.md` - Prompt maestro mejorado

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
**Aplicado a frontend:** Archivos `front_dev_process_{datetime}.md` con plantilla mejorada

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

---

**Última actualización:** [Se actualizará automáticamente después de cada feature/módulo]
**Versión de metodología:** 2.0 (Mejorada con lecciones del backend)

