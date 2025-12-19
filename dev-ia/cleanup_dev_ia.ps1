# cleanup_dev_ia.ps1
# Script para limpiar y archivar archivos en frontend/dev-ia/
# Uso: .\cleanup_dev_ia.ps1 [-Force]
#
# Logica:
# 1. Si last_ui_{datetime}.md corresponde al dia de hoy, no se mueve nada
# 2. Si no, mueve todo excepto los archivos esenciales a archive/

param(
    [switch]$Force
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "`n=== Limpieza y Archivado de frontend/dev-ia/ ===" -ForegroundColor Cyan
Write-Host ""

# Archivos que NO deben moverse
$excludedFiles = @(
    "README.md",
    "PROMPT_MAESTRO_FRONTEND.md",
    "PLAN_MAESTRO_UI_FRONTEND.md",
    "cleanup_dev_ia.ps1",
    "create_tracking_file.ps1"
)

# Obtener fecha de hoy en formato YYYYMMDD
$today = Get-Date -Format "yyyyMMdd"

# Buscar archivos last_ui_*.md
$uiFiles = @(Get-ChildItem -Path . -Filter "front_dev_process_*.md" -ErrorAction SilentlyContinue)

$shouldMove = $false
$filesFromToday = @()

if ($uiFiles.Count -gt 0) {
    Write-Host "Verificando archivos last_ui_*.md..." -ForegroundColor Yellow

    foreach ($file in $uiFiles) {
        # Extraer fecha del nombre del archivo (formato: last_ui_YYYYMMDD_HHMMSS.md)
        if ($file.Name -match "last_ui_([0-9]{8})_[0-9]{6}\.md") {
            $fileDate = $matches[1]

            if ($fileDate -eq $today) {
                $filesFromToday += $file.Name
                Write-Host "  [OK] $($file.Name) corresponde al dia de hoy - NO se movera" -ForegroundColor Green
            } else {
                $shouldMove = $true
                Write-Host "  - $($file.Name) corresponde a $fileDate (no es hoy)" -ForegroundColor Yellow
            }
        } else {
            # Si no coincide el patron, asumimos que debe moverse
            $shouldMove = $true
            Write-Host "  - $($file.Name) no coincide con el patron esperado" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "No se encontraron archivos last_ui_*.md" -ForegroundColor Yellow
    $shouldMove = $true
}

# Si hay archivos de hoy, no mover nada
if ($filesFromToday.Count -gt 0) {
    Write-Host "`n[OK] Se encontraron archivos del dia de hoy. No se movera nada." -ForegroundColor Green
    Write-Host "=== Limpieza cancelada ===" -ForegroundColor Cyan
    exit 0
}

# Si no hay archivos de hoy, proceder con la limpieza
if (-not $shouldMove) {
    Write-Host "`nNo hay archivos para mover." -ForegroundColor Yellow
    exit 0
}

# Confirmar si no se usa -Force
if (-not $Force) {
    Write-Host "`n[ADVERTENCIA] Se moveran todos los archivos excepto los esenciales a archive/" -ForegroundColor Yellow
    $confirm = Read-Host "¿Continuar? (S/N)"
    if ($confirm -ne "S" -and $confirm -ne "s") {
        Write-Host "Limpieza cancelada" -ForegroundColor Yellow
        exit 0
    }
}

# Crear carpeta archive si no existe
if (-not (Test-Path "archive")) {
    New-Item -ItemType Directory -Path "archive" | Out-Null
    Write-Host "`n[OK] Carpeta archive creada" -ForegroundColor Green
}

# Obtener todos los archivos y carpetas (excepto archive y los excluidos)
Write-Host "`nMoviendo archivos a archive/..." -ForegroundColor Yellow

$allItems = Get-ChildItem -Path . -Exclude "archive" -ErrorAction SilentlyContinue
$movedCount = 0

foreach ($item in $allItems) {
    # Saltar si esta en la lista de excluidos
    if ($item.Name -in $excludedFiles) {
        Write-Host "  [EXCLUIDO] $($item.Name)" -ForegroundColor Gray
        continue
    }

    # Saltar si es la carpeta archive
    if ($item.PSIsContainer -and $item.Name -eq "archive") {
        continue
    }

    # Mover el archivo/carpeta a archive
    $destination = Join-Path "archive" $item.Name

    try {
        Move-Item -Path $item.FullName -Destination $destination -Force -ErrorAction Stop
        Write-Host "  [OK] Movido: $($item.Name) -> archive/" -ForegroundColor Green
        $movedCount++
    } catch {
        Write-Host "  [ERROR] Error moviendo $($item.Name): $_" -ForegroundColor Red
    }
}

Write-Host "`n[OK] Archivos movidos: $movedCount" -ForegroundColor Green

# Verificar estructura final
Write-Host "`n=== Estructura final de frontend/dev-ia/ ===" -ForegroundColor Cyan
$items = Get-ChildItem -Path . | Select-Object Name, @{Name="Type";Expression={if ($_.PSIsContainer) { "Directory" } else { "File" }}}
$items | Format-Table -AutoSize

# Verificar que solo quedan archivos esenciales
$currentFiles = (Get-ChildItem -Path . -File).Name
$extraFiles = $currentFiles | Where-Object { $_ -notin $excludedFiles }

if ($extraFiles) {
    Write-Host "`n[ADVERTENCIA] Archivos adicionales encontrados:" -ForegroundColor Yellow
    foreach ($file in $extraFiles) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n[OK] Estructura correcta: Solo archivos esenciales presentes" -ForegroundColor Green
}

Write-Host "`n=== Limpieza completada ===" -ForegroundColor Green
Write-Host ""
