# Dev-IA Frontend - Gestión de Desarrollo

Este directorio contiene herramientas y documentación para gestionar el desarrollo frontend de AiutoX ERP de forma ordenada y documentada.

---

## 📁 Archivos en este Directorio

### Documentación Principal

- **`PLAN_MAESTRO_UI_FRONTEND.md`** - Plan maestro completo para desarrollo y verificación de UI frontend
- **`PROMPT_MAESTRO_FRONTEND.md`** - Prompt maestro que guía el desarrollo y genera archivos de seguimiento
- **`README.md`** - Este archivo

### Scripts

- **`create_tracking_file.ps1`** - Script PowerShell para crear automáticamente archivos de seguimiento
- **`cleanup_dev_ia.ps1`** - Script PowerShell para limpiar y archivar archivos temporales

### Archivos de Seguimiento (Generados)

- **`last_ui_{YYYYMMDD_HHMMSS}.md`** - Archivos de seguimiento generados durante el desarrollo
- **`archive/`** - Carpeta donde se archivan los archivos de seguimiento completados

---

## 🚀 Inicio Rápido

### 1. Iniciar Nueva Feature/Módulo

**Usando el script automático (Recomendado):**

```powershell
cd frontend/dev-ia
.\create_tracking_file.ps1 -FeatureName "NombreFeature" -Module "nombre_modulo" -PlanPath ".cursor/plans/plan_name.plan.md"
```

**Ejemplo:**
```powershell
.\create_tracking_file.ps1 -FeatureName "SavedFilters" -Module "users" -PlanPath ".cursor/plans/savedfilters_users_implementation_9226d3a6.plan.md"
```

**Manualmente:**

1. Leer `PROMPT_MAESTRO_FRONTEND.md` completamente
2. Crear archivo `front_dev_process_{timestamp}.md` usando la plantilla del prompt
3. Completar información inicial
4. Ejecutar verificación inicial

### 2. Seguir el Proceso de Desarrollo

1. **Consultar el plan específico** en `.cursor/plans/{plan_name}.plan.md`
2. **Seguir las fases** del plan una por una
3. **Actualizar el archivo de seguimiento** después de cada fase
4. **Ejecutar verificaciones** (typecheck, lint, tests) después de cada fase
5. **Documentar errores y correcciones** en el archivo de seguimiento

### 3. Finalizar Feature/Módulo

1. Completar todas las fases del plan
2. Ejecutar suite completa de tests
3. Verificar integración con backend
4. Actualizar documentación y reglas si es necesario
5. Marcar feature como completada en el archivo de seguimiento
6. **Ejecutar limpieza y archivado** (ver sección siguiente)

### 4. Limpieza y Archivado (OBLIGATORIO)

**⚠️ IMPORTANTE:** Al finalizar cada fase (100% completada y probada), ejecutar limpieza:

**Usando el script automático (Recomendado):**
```powershell
cd frontend/dev-ia
.\cleanup_dev_ia.ps1          # Con confirmación
.\cleanup_dev_ia.ps1 -Force   # Sin confirmación
```

**Manual:**
1. Mover `last_ui_{datetime}.md` a `archive/`
2. Borrar todos los archivos temporales (`*.txt`)
3. Verificar que solo quedan los archivos esenciales

**Estructura final esperada:**
```
frontend/dev-ia/
├── archive/                          # Archivos archivados
│   ├── last_ui_20251216_152020.md
│   └── ...
├── create_tracking_file.ps1
├── cleanup_dev_ia.ps1
├── PLAN_MAESTRO_UI_FRONTEND.md
├── PROMPT_MAESTRO_FRONTEND.md
└── README.md
```

**Archivos esenciales (NO borrar):**
- `create_tracking_file.ps1`
- `cleanup_dev_ia.ps1`
- `PLAN_MAESTRO_UI_FRONTEND.md`
- `PROMPT_MAESTRO_FRONTEND.md`
- `README.md`
- `archive/` (directorio completo)

---

## 📋 Estructura del Archivo de Seguimiento

Cada archivo `front_dev_process_{timestamp}.md` contiene:

1. **Información General** - Feature, módulo, plan asociado, backend
2. **Estado Actual** - Fase actual, archivos creados, errores, tests
3. **Checklist de Desarrollo** - Por fases (Tipos, API, Hooks, Componentes, etc.)
4. **Errores y Correcciones** - TypeScript, ESLint, Tests
5. **Warnings** - Clasificados por severidad
6. **Archivos Creados/Modificados** - Lista completa
7. **Historial de Actualizaciones** - Timeline de acciones
8. **Próximas Acciones** - TODOs pendientes
9. **Notas Adicionales** - Decisiones, problemas, etc.

---

## 🔄 Flujo de Trabajo Recomendado

```
INICIO
  ↓
Leer PROMPT_MAESTRO_FRONTEND.md
  ↓
Crear archivo de seguimiento (script o manual)
  ↓
Verificar backend del módulo
  ↓
Crear/actualizar plan específico .plan.md
  ↓
Ejecutar verificación inicial
  ↓
┌─────────────────────────────────┐
│ Por cada fase del plan:         │
│ 1. Implementar código           │
│ 2. Ejecutar verificación        │
│ 3. Actualizar archivo seguimiento│
│ 4. ¿Hay errores?                │
│    SÍ → Corregir y documentar   │
│    NO → Siguiente fase          │
└─────────────────────────────────┘
  ↓
Ejecutar suite completa
  ↓
Actualizar documentación/reglas
  ↓
Marcar feature como completada
  ↓
¿Fase 100% completada y probada?
  ├─ NO → Continuar desarrollo
  └─ SÍ → Limpieza y Archivado
      ↓
  1. Mover last_ui_{datetime}.md a archive/
  2. Borrar archivos temporales (*.txt)
  3. Verificar estructura final
  ↓
FIN
```

---

## 📝 Comandos Útiles

### Verificación Inicial

```bash
cd frontend

# TypeScript
npm run typecheck > dev-ia/typecheck_initial.txt 2>&1

# ESLint
npm run lint > dev-ia/lint_initial.txt 2>&1

# Tests
npm run test > dev-ia/test_initial.txt 2>&1
```

### Verificación Durante Desarrollo

```bash
# TypeScript
npm run typecheck

# ESLint
npm run lint

# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e
```

### Ver Último Archivo de Seguimiento

```powershell
Get-ChildItem frontend/dev-ia/front_dev_process_*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 1
```

---

## 🎯 Criterios de Éxito

Una feature se considera completada cuando:

- ✅ Todas las fases del plan están completadas
- ✅ 0 errores TypeScript
- ✅ 0 errores ESLint críticos
- ✅ Tests unitarios pasan (cobertura > 70%)
- ✅ Tests E2E pasan
- ✅ Integración con backend verificada
- ✅ Componentes accesibles
- ✅ No hay textos hardcodeados
- ✅ Todos los warnings documentados
- ✅ Documentación actualizada
- ✅ Archivo de seguimiento completo

---

## 📚 Referencias

- **Plan Maestro**: `PLAN_MAESTRO_UI_FRONTEND.md`
- **Prompt Maestro**: `PROMPT_MAESTRO_FRONTEND.md`
- **Master Prompt Frontend**: `docs/ai-prompts/Master_Development_Frontend_promp.md`
- **Frontend Doc**: `docs/11-frontend.md`
- **Backend Estado**: `docs/ESTADO_MODULOS_TRANSVERSALES.md`

---

## ⚠️ Notas Importantes

1. **Siempre actualizar el archivo de seguimiento** después de cada fase
2. **Documentar TODOS los errores y correcciones**
3. **Clasificar y documentar TODOS los warnings**
4. **No avanzar de fase sin completar checklist de fase actual**
5. **Verificar backend antes de implementar frontend**
6. **Seguir principios UX de `rules/ux-frontend.md`**
7. **⚠️ OBLIGATORIO: Ejecutar limpieza y archivado al finalizar cada fase completada**
8. **Mantener `frontend/dev-ia/` limpio: solo archivos esenciales + archive/**

---

**Última actualización:** 2025-12-16

