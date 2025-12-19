# Script para crear archivo de seguimiento de desarrollo frontend
# Uso: .\create_tracking_file.ps1 -FeatureName "SavedFilters" -Module "users"

param(
    [Parameter(Mandatory=$true)]
    [string]$FeatureName,

    [Parameter(Mandatory=$false)]
    [string]$Module = "",

    [Parameter(Mandatory=$false)]
    [string]$PlanPath = ""
)

# Obtener timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$filename = "front_dev_process_$timestamp.md"
$filepath = Join-Path $PSScriptRoot $filename

# Crear contenido inicial
$content = @"
# Proceso de Desarrollo Frontend - $FeatureName

**Fecha de Inicio:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Última Actualización:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Estado:** 🔄 En Progreso

---

## 📋 Información General

**Feature/Módulo:** $FeatureName
**Módulo Backend:** $Module
**Plan Asociado:** $PlanPath
**Backend Verificado:** ⏳ Pendiente
**Endpoints Backend:** {lista de endpoints}
**Permisos Necesarios:** {lista de permisos}

---

## 📊 Estado Actual

**Fase Actual:** Fase 1 de {Y}
**Fases Completadas:** 0/{Y}
**Archivos Creados:** 0
**Archivos Modificados:** 0

**Errores TypeScript:** 0 ❌
**Errores ESLint:** 0 ❌
**Tests Unitarios:** 0/0
**Tests E2E:** 0/0
**Warnings:** 0 ⚠️
  - 🔴 Críticas: 0
  - 🟡 Altas: 0
  - 🟢 Medias: 0
  - ⚪ Bajas: 0

---

## ✅ Checklist de Desarrollo

### Fase 1: Tipos y Configuración
- [ ] Tipos TypeScript creados (`types/*.ts`)
- [ ] Configuración de campos creada (`config/*.ts`)
- [ ] Validación con Zod implementada
- [ ] Typecheck pasa sin errores

### Fase 2: API Services y Hooks
- [ ] API service creado (`api/*.ts`)
- [ ] Hook principal creado (`hooks/*.ts`)
- [ ] Manejo de estados (loading, error, data)
- [ ] Integración con `apiClient` verificada

### Fase 3: Componentes Base
- [ ] Componentes base creados (`components/*.tsx`)
- [ ] Uso correcto de shadcn/ui
- [ ] Estados de carga/error manejados
- [ ] Accesibilidad verificada (ARIA, labels)

### Fase 4: Integración y Rutas
- [ ] Integración en módulo principal
- [ ] Ruta creada (`routes/*.tsx`)
- [ ] Navegación verificada
- [ ] Integración con backend verificada

### Fase 5: Tests
- [ ] Tests unitarios para hooks
- [ ] Tests unitarios para componentes
- [ ] Tests E2E para flujos completos
- [ ] Cobertura > 70%

### Fase 6: Documentación y Reglas
- [ ] Comentarios JSDoc agregados
- [ ] Documentación actualizada
- [ ] Reglas verificadas/actualizadas

---

## 🐛 Errores Encontrados y Correcciones

### Errores TypeScript

| # | Descripción | Archivo | Línea | Estado | Solución |
|---|-------------|---------|-------|--------|----------|
| | | | | | |

### Errores ESLint

| # | Descripción | Archivo | Línea | Severidad | Estado | Solución |
|---|-------------|---------|-------|-----------|--------|----------|
| | | | | | | |

### Tests Fallidos

| # | Test | Archivo | Razón | Estado | Solución |
|---|------|---------|-------|--------|----------|
| | | | | | |

---

## ⚠️ Warnings Encontrados

### Warnings Críticas (🔴)

| # | Descripción | Archivo | Estado | Acción |
|---|-------------|---------|--------|--------|
| | | | | |

### Warnings Altas (🟡)

| # | Descripción | Archivo | Estado | Acción |
|---|-------------|---------|--------|--------|
| | | | | |

### Warnings Medias/Bajas (🟢/⚪)

| # | Descripción | Archivo | Severidad | Estado | Razón Aceptación |
|---|-------------|---------|-----------|--------|------------------|
| | | | | | |

---

## 📁 Archivos Creados/Modificados

### Archivos Creados

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| | | |

### Archivos Modificados

| Archivo | Cambios | Estado |
|---------|---------|--------|
| | | |

---

## 📈 Historial de Actualizaciones

| Fecha/Hora | Acción | Detalles |
|------------|--------|----------|
| $(Get-Date -Format "yyyy-MM-dd HH:mm:ss") | Inicio de desarrollo | Feature iniciada |

---

## 🎯 Próximas Acciones

- [ ] Verificar estado del backend
- [ ] Crear/actualizar plan específico
- [ ] Ejecutar verificación inicial (typecheck, lint, tests)

---

## 📝 Notas Adicionales

{Notas, decisiones, problemas encontrados, etc.}

---

**Última actualización:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@

# Crear archivo
Set-Content -Path $filepath -Value $content -Encoding UTF8

Write-Host "[OK] Archivo de seguimiento creado: $filename" -ForegroundColor Green
Write-Host "[INFO] Ubicacion: $filepath" -ForegroundColor Cyan
Write-Host ""
Write-Host "Proximos pasos:" -ForegroundColor Yellow
Write-Host "1. Editar el archivo y completar informacion inicial" -ForegroundColor White
Write-Host "2. Ejecutar verificacion inicial:" -ForegroundColor White
Write-Host '   cd ..' -ForegroundColor Gray
Write-Host '   npm run typecheck > dev-ia/typecheck_initial.txt 2>&1' -ForegroundColor Gray
Write-Host '   npm run lint > dev-ia/lint_initial.txt 2>&1' -ForegroundColor Gray
Write-Host '   npm run test > dev-ia/test_initial.txt 2>&1' -ForegroundColor Gray
Write-Host '3. Registrar resultados en el archivo de seguimiento' -ForegroundColor White

