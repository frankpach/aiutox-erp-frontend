# cleanup_dev_ia.ps1
# Script para limpiar y archivar archivos en frontend/dev-ia/
# Uso: .\cleanup_dev_ia.ps1 [-Force]

param(
    [switch]$Force  # Forzar limpieza sin confirmación
)

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "`n=== Limpieza y Archivado de frontend/dev-ia/ ===" -ForegroundColor Cyan
Write-Host ""

# Crear carpeta archive si no existe
if (-not (Test-Path "archive")) {
    New-Item -ItemType Directory -Path "archive" | Out-Null
    Write-Host "✓ Carpeta archive creada" -ForegroundColor Green
}

# Mover archivos last_ui_*.md a archive
$uiFiles = Get-ChildItem -Path . -Filter "last_ui_*.md" -ErrorAction SilentlyContinue
if ($uiFiles) {
    Write-Host "`nArchivando archivos de seguimiento:" -ForegroundColor Yellow
    foreach ($file in $uiFiles) {
        $destination = Join-Path "archive" $file.Name
        Move-Item -Path $file.FullName -Destination $destination -Force
        Write-Host "  ✓ Movido: $($file.Name) -> archive/" -ForegroundColor Green
    }
} else {
    Write-Host "`nNo se encontraron archivos last_ui_*.md para archivar" -ForegroundColor Yellow
}

# Borrar archivos temporales
$tempFiles = Get-ChildItem -Path . -Filter "*.txt" -ErrorAction SilentlyContinue
if ($tempFiles) {
    if (-not $Force) {
        Write-Host "`nArchivos temporales encontrados: $($tempFiles.Count)" -ForegroundColor Yellow
        $confirm = Read-Host "¿Borrar archivos temporales (*.txt)? (S/N)"
        if ($confirm -ne "S" -and $confirm -ne "s") {
            Write-Host "Limpieza cancelada" -ForegroundColor Yellow
            exit
        }
    }
    Remove-Item -Path "*.txt" -ErrorAction SilentlyContinue
    Write-Host "  ✓ Archivos temporales borrados: $($tempFiles.Count) archivos" -ForegroundColor Green
} else {
    Write-Host "`nNo se encontraron archivos temporales para borrar" -ForegroundColor Yellow
}

# Verificar estructura final
Write-Host "`n=== Estructura final de frontend/dev-ia/ ===" -ForegroundColor Cyan
$items = Get-ChildItem -Path . | Select-Object Name, @{Name="Type";Expression={if($_.PSIsContainer){"Directory"}else{"File"}}}
$items | Format-Table -AutoSize

# Verificar que solo quedan archivos esenciales
$essentialFiles = @("create_tracking_file.ps1", "cleanup_dev_ia.ps1", "PLAN_MAESTRO_UI_FRONTEND.md", "PROMPT_MAESTRO_FRONTEND.md", "README.md")
$currentFiles = (Get-ChildItem -Path . -File).Name
$extraFiles = $currentFiles | Where-Object { $_ -notin $essentialFiles }

if ($extraFiles) {
    Write-Host "`n⚠️  ADVERTENCIA: Archivos adicionales encontrados:" -ForegroundColor Yellow
    foreach ($file in $extraFiles) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✓ Estructura correcta: Solo archivos esenciales presentes" -ForegroundColor Green
}

Write-Host "`n=== Limpieza completada ===" -ForegroundColor Green
Write-Host ""
