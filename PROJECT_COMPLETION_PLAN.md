# Plan Estratégico de Completación - AiutoX ERP

**Fecha**: 2026-01-04  
**Objetivo**: Completar el proyecto AiutoX ERP siguiendo arquitectura, reglas y documentación  
**Enfoque**: Pragmático - Calidad en módulos críticos + Avance en funcionalidad

---

## 🎯 Visión del Proyecto

**AiutoX ERP** es un sistema modular, multi-tenant construido con:
- **Backend**: Python + FastAPI (Layered + Vertical Slice)
- **Frontend**: React + TypeScript + TanStack Query
- **Arquitectura**: Modular, autodiscoverable, multi-tenant
- **Principios**: SOLID, DRY, KISS, YAGNI, Clean Code

---

## 📊 Estado Actual del Proyecto

### Backend ✅ (Mayormente Completo)
- ✅ Core (Auth, Users, Permissions, Audit)
- ✅ Módulos implementados: Approvals, Automation, Files, Tasks, Templates, Workflows, Import/Export
- ⚠️ Módulos faltantes: Inventory, CRM
- ✅ PubSub implementado

### Frontend 🔄 (En Progreso)
- ✅ Core (Auth, Layout, Routing, i18n, PWA)
- ✅ Files module (100% tests pasando)
- ✅ Config pages (Users, Roles, Permissions)
- ⚠️ Tests: 116/365 pasando (32%)
- ⚠️ Bugs de producción identificados en componentes
- ⚠️ Módulos con UI incompleta o con bugs

### Deuda Técnica Identificada
1. **Bugs de producción** en componentes (ActivityForm, ActivityFilters, etc.)
2. **Tests mal diseñados** que no reflejan comportamiento correcto
3. **Módulos frontend incompletos** (Workflows UI, Filtros Avanzados)
4. **Sincronización docs vs código** pendiente

---

## 🎯 Estrategia de Completación

### Fase 1: Estabilizar Core Frontend (Prioridad Alta) ⭐
**Objetivo**: Asegurar que módulos críticos funcionen al 100%

**Tiempo estimado**: 6-8 horas

#### 1.1 Corregir Bugs de Producción (2-3 horas)
**Componentes a corregir**:

1. **ActivityForm** (`app/features/activities/components/ActivityForm.tsx`)
   - Problema: Renderiza objetos como React children
   - Solución: Crear componente `MetadataDisplay` o usar `JSON.stringify`
   - Tests afectados: ~7

2. **ActivityFilters** (`app/features/activities/types/activity.types.ts`)
   - Problema: Interface no incluye prop `search`
   - Solución: Añadir `search?: string` a interface
   - Tests afectados: ~3

3. **ApprovalRequestList** (`app/features/approvals/components/ApprovalRequestList.tsx`)
   - Problema: Event handlers con elementos undefined
   - Solución: Añadir verificaciones `element?.` antes de `fireEvent.click`
   - Tests afectados: ~8

4. **AutomationPage** (`app/routes/automation.tsx`)
   - Problema: Errores de tipos TypeScript
   - Solución: Revisar y corregir tipos, eliminar duplicados
   - Tests afectados: ~10

5. **ProductsPage** (`app/routes/products.tsx`)
   - Problema: Variables undefined (`setCurrentTab`, `setDetailProductId`)
   - Solución: Añadir estados faltantes con `useState`
   - Tests afectados: ~8

**Resultado esperado**: +36 tests pasando → 152/365 (42%)

#### 1.2 Completar Tests de Módulos Críticos (2-3 horas)
**Módulos prioritarios**:

1. **Users hooks** (`app/features/users/hooks/`)
   - Implementar tests para useUsers, useUser, useCreateUser, etc.
   - Estimado: 15 tests
   - Patrón: Seguir estructura de Files hooks

2. **Auth hooks** (`app/hooks/useAuth*.ts`)
   - Implementar tests para useAuth, useLogin, useLogout
   - Estimado: 10 tests
   - Patrón: Mock de authStore y API

3. **Permissions hooks** (`app/hooks/usePermissions.ts`, `app/hooks/useHasPermission.ts`)
   - Implementar tests para verificación de permisos
   - Estimado: 10 tests
   - Patrón: Mock de authStore con roles

**Resultado esperado**: +35 tests pasando → 187/365 (51%)

#### 1.3 Refactorizar Tests Mal Diseñados (1-2 horas)
**Criterios de refactorización**:
- Tests que asumen comportamiento incorrecto
- Tests con verificaciones de elementos undefined
- Tests con props que no existen en interfaces

**Módulos a revisar**:
- Calendar (25 tests, 32% pasando)
- Templates (20 tests, 0% pasando)
- Comments (tests con problemas de lógica)

**Resultado esperado**: +20 tests pasando → 207/365 (57%)

---

### Fase 2: Completar Funcionalidad Frontend (Prioridad Alta) ⭐
**Objetivo**: Implementar módulos faltantes y mejorar UX

**Tiempo estimado**: 8-10 horas

#### 2.1 Workflows UI (3-4 horas)
**Backend**: ✅ Completo (gestión de workflows, ejecuciones, advance)  
**Frontend**: ❌ Faltante

**Implementación**:
1. Crear `app/features/workflows/` siguiendo arquitectura modular
2. Componentes:
   - `WorkflowList.tsx` - Lista de workflows
   - `WorkflowForm.tsx` - Crear/editar workflow
   - `WorkflowExecutions.tsx` - Ver ejecuciones
   - `WorkflowSteps.tsx` - Gestión de pasos
3. Hooks con TanStack Query:
   - `useWorkflows`, `useWorkflow`, `useCreateWorkflow`, etc.
   - `useWorkflowExecutions`, `useAdvanceWorkflow`
4. Ruta: `app/routes/workflows.tsx`
5. Tests: Mínimo 20 tests (siguiendo patrón de Files)

**Referencia**: Seguir `docs/40-modules/workflows.md`

#### 2.2 Filtros Avanzados UI (2-3 horas)
**Backend**: ✅ Completo (saved_filters soportado)  
**Frontend**: ❌ Faltante

**Implementación**:
1. Crear `app/features/views/components/SavedFilters.tsx`
2. Componentes:
   - `FilterBuilder.tsx` - Constructor visual de filtros
   - `SavedFiltersList.tsx` - Lista de filtros guardados
   - `FilterPresets.tsx` - Filtros predefinidos
3. Hooks:
   - `useSavedFilters`, `useCreateFilter`, `useApplyFilter`
4. Integrar en módulos existentes (Activities, Products, etc.)
5. Tests: Mínimo 15 tests

#### 2.3 Mejorar UX de Módulos Existentes (2-3 horas)
**Módulos a mejorar**:

1. **Activities**
   - Corregir renderizado de metadata
   - Mejorar filtros y búsqueda
   - Añadir paginación

2. **Approvals**
   - Mejorar flujo de aprobación
   - Añadir notificaciones visuales
   - Delegación de aprobaciones

3. **Automation**
   - Mejorar editor de reglas
   - Añadir preview de ejecución
   - Logs de ejecución más claros

4. **Products**
   - Mejorar gestión de categorías
   - Añadir búsqueda avanzada
   - Bulk operations

**Resultado esperado**: UX mejorada, +30 tests pasando → 237/365 (65%)

---

### Fase 3: Módulos Backend Faltantes (Prioridad Media) 🟡
**Objetivo**: Completar módulos de negocio faltantes

**Tiempo estimado**: 12-16 horas

#### 3.1 Inventory Module (6-8 horas)
**Implementación completa**:

**Backend** (`backend/app/modules/inventory/`):
1. Models: `Product`, `Stock`, `Movement`, `Location`
2. Schemas: Pydantic v2 con ConfigDict
3. Services: CRUD + lógica de negocio (stock tracking, movements)
4. API: Endpoints RESTful siguiendo `api-contract.md`
5. Tests: Cobertura >80%

**Frontend** (`frontend/app/features/inventory/`):
1. Types: TypeScript interfaces
2. API: TanStack Query hooks
3. Components: List, Form, Detail, StockView
4. Routes: `/inventory`, `/inventory/:id`
5. Tests: Mínimo 25 tests

**Referencia**: Crear `docs/40-modules/inventory.md`

#### 3.2 CRM Module (6-8 horas)
**Implementación completa**:

**Backend** (`backend/app/modules/crm/`):
1. Models: `Contact`, `Company`, `Deal`, `Activity`
2. Schemas: Pydantic v2
3. Services: CRUD + pipeline management
4. API: Endpoints RESTful
5. Tests: Cobertura >80%

**Frontend** (`frontend/app/features/crm/`):
1. Types: TypeScript interfaces
2. API: TanStack Query hooks
3. Components: ContactList, DealPipeline, CompanyView
4. Routes: `/crm`, `/crm/contacts`, `/crm/deals`
5. Tests: Mínimo 25 tests

**Referencia**: Crear `docs/40-modules/crm.md`

**Resultado esperado**: +50 tests pasando → 287/365 (79%)

---

### Fase 4: Calidad y Documentación (Prioridad Media) 🟡
**Objetivo**: Asegurar calidad y mantener docs sincronizados

**Tiempo estimado**: 4-6 horas

#### 4.1 Aumentar Cobertura de Tests (2-3 horas)
**Objetivo**: Llegar a 90% de tests pasando

**Acciones**:
1. Revisar tests fallando restantes (~78 tests)
2. Categorizar por tipo de problema
3. Corregir tests con quick wins
4. Documentar tests que requieren refactorización mayor

**Resultado esperado**: +50 tests pasando → 337/365 (92%)

#### 4.2 Sincronizar Documentación (2-3 horas)
**Acciones**:

1. **Actualizar docs de módulos implementados**:
   - `docs/40-modules/activities.md`
   - `docs/40-modules/approvals.md`
   - `docs/40-modules/automation.md`
   - `docs/40-modules/products.md`
   - `docs/40-modules/files.md`

2. **Crear docs de módulos nuevos**:
   - `docs/40-modules/inventory.md`
   - `docs/40-modules/crm.md`
   - `docs/40-modules/workflows-ui.md`

3. **Actualizar status**:
   - `docs/20-frontend/status/` - Estado de implementación
   - `docs/80-incomplete/PENDIENTES-DESARROLLO.md` - Actualizar pendientes

4. **Diagramas**:
   - Actualizar `docs/50-diagrams/` con nuevos módulos
   - Crear diagramas de flujo para Workflows y CRM

---

### Fase 5: Optimización y Deploy (Prioridad Baja) 🟢
**Objetivo**: Preparar para producción

**Tiempo estimado**: 6-8 horas

#### 5.1 Performance Optimization (2-3 horas)
**Frontend**:
- Code splitting por rutas
- Lazy loading de componentes pesados
- Optimización de bundle size
- Memoización de componentes costosos

**Backend**:
- Optimizar queries N+1
- Añadir índices en DB
- Implementar caching con Redis
- Optimizar endpoints lentos

#### 5.2 Security Audit (2-3 horas)
**Acciones**:
- Revisar OWASP Top 10
- Verificar permisos en todos los endpoints
- Auditar manejo de errores
- Verificar sanitización de inputs
- Revisar configuración de CORS

#### 5.3 CI/CD y Deploy (2-3 horas)
**Acciones**:
- Configurar pipelines de CI/CD
- Setup de Coolify para deploy
- Configurar entornos (dev, staging, prod)
- Documentar proceso de deploy

---

## 📈 Métricas de Progreso

### Estado Actual
| Categoría | Completado | Pendiente | Total | % |
|-----------|------------|-----------|-------|---|
| Backend Core | 100% | 0% | 100% | 100% |
| Backend Modules | 70% | 30% | 100% | 70% |
| Frontend Core | 90% | 10% | 100% | 90% |
| Frontend Modules | 40% | 60% | 100% | 40% |
| Tests Frontend | 32% | 68% | 365 | 32% |
| Documentación | 80% | 20% | 100% | 80% |

### Proyección con Plan Completo
| Fase | Tiempo | Tests | Módulos | Docs |
|------|--------|-------|---------|------|
| Actual | - | 116 (32%) | 60% | 80% |
| Fase 1 | 6-8h | 207 (57%) | 65% | 80% |
| Fase 2 | 8-10h | 237 (65%) | 80% | 85% |
| Fase 3 | 12-16h | 287 (79%) | 100% | 90% |
| Fase 4 | 4-6h | 337 (92%) | 100% | 100% |
| Fase 5 | 6-8h | 337 (92%) | 100% | 100% |

**Tiempo total estimado**: 36-48 horas (4.5-6 días de trabajo)

---

## 🎯 Criterios de Completación

### Mínimo Viable (MVP)
- ✅ Backend core funcional
- ✅ Frontend core funcional
- ✅ Módulos críticos al 100% (Files, Users, Auth)
- 🔄 Tests >60% pasando en módulos críticos
- 🔄 Bugs de producción corregidos
- ❌ Inventory y CRM implementados

### Producción Ready
- ✅ Todos los módulos implementados
- ✅ Tests >90% pasando
- ✅ Documentación 100% sincronizada
- ✅ Security audit completo
- ✅ Performance optimizado
- ✅ CI/CD configurado

---

## 🚀 Plan de Ejecución Inmediato

### Hoy (4-6 horas)
1. ✅ Crear este plan estratégico
2. 🔄 **Fase 1.1**: Corregir bugs de producción
   - ActivityForm
   - ActivityFilters
   - ApprovalRequestList
3. 🔄 **Fase 1.2**: Iniciar tests de Users hooks

### Mañana (6-8 horas)
1. **Fase 1.2**: Completar tests de módulos críticos
   - Users hooks
   - Auth hooks
   - Permissions hooks
2. **Fase 1.3**: Refactorizar tests mal diseñados

### Próximos 3 días (24-30 horas)
1. **Fase 2**: Completar funcionalidad frontend
   - Workflows UI
   - Filtros Avanzados
   - Mejorar UX
2. **Fase 3**: Iniciar Inventory module

### Próxima semana (12-18 horas)
1. **Fase 3**: Completar CRM module
2. **Fase 4**: Calidad y documentación
3. **Fase 5**: Optimización y deploy

---

## 📝 Notas Importantes

### Principios a Seguir
1. **Documentación primero**: Leer docs antes de implementar
2. **SOLID + Clean Code**: Aplicar en todo momento
3. **Tests como ciudadanos de primera clase**: No skip tests
4. **Multi-tenancy**: Siempre verificar tenant_id
5. **i18n**: Todo texto visible debe usar useTranslation

### Reglas No Negociables
- Seguir arquitectura documentada
- Usar TanStack Query para estado del servidor
- Pydantic v2 con ConfigDict en backend
- TypeScript strict mode en frontend
- APIException (nunca HTTPException) en backend
- Permisos RBAC en todos los endpoints

### Herramientas
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Frontend**: React + TypeScript + TanStack Query + ShadCN UI
- **Testing**: Vitest + React Testing Library + Playwright
- **Deploy**: Coolify + Docker

---

**Última actualización**: 2026-01-04 16:45  
**Próxima revisión**: Después de completar Fase 1  
**Responsable**: Equipo de desarrollo + IA Assistant
