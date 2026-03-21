# Script para preparar el deploy a Hostinger
# Ejecutar desde la raiz del proyecto: .\prepare-hostinger.ps1

Write-Host "=== Preparando deploy para Hostinger ===" -ForegroundColor Cyan

# 1. Build del frontend (tienda de clientes)
Write-Host "`n[1/4] Compilando frontend..." -ForegroundColor Yellow
Set-Location frontend
npm run build
Set-Location ..

# 2. Crear carpeta de deploy
Write-Host "`n[2/4] Creando estructura de deploy..." -ForegroundColor Yellow
$deployDir = "hostinger-deploy"
if (Test-Path $deployDir) { Remove-Item $deployDir -Recurse -Force }
New-Item -ItemType Directory -Path $deployDir | Out-Null

# 3. Copiar backend
Write-Host "`n[3/4] Copiando archivos..." -ForegroundColor Yellow
Copy-Item "backend\package.json" "$deployDir\"
Copy-Item "backend\package-lock.json" "$deployDir\" -ErrorAction SilentlyContinue
Copy-Item "backend\src" "$deployDir\src" -Recurse
Copy-Item "backend\.env.example" "$deployDir\.env.example"

# Copiar frontend compilado
New-Item -ItemType Directory -Path "$deployDir\frontend" | Out-Null
Copy-Item "frontend\dist" "$deployDir\frontend\dist" -Recurse

# 4. Crear ZIP
Write-Host "`n[4/4] Creando ZIP..." -ForegroundColor Yellow
$zipName = "hostinger-deploy.zip"
if (Test-Path $zipName) { Remove-Item $zipName }
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipName

Write-Host "`n=== LISTO ===" -ForegroundColor Green
Write-Host "Archivo creado: $zipName" -ForegroundColor Green
Write-Host "`nPasos en Hostinger:" -ForegroundColor Cyan
Write-Host "1. Sube el archivo $zipName"
Write-Host "2. Crea el archivo .env con tus credenciales"
Write-Host "3. Ejecuta: npm install"
Write-Host "4. Entry point: src/index.js"
Write-Host "5. Inicia la aplicacion"

# Limpiar carpeta temporal
Remove-Item $deployDir -Recurse -Force
