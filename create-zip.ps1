$src = "C:\Users\Jonis\ASESOR~1\saas-tienda-ropa"
$zip = "C:\Users\Jonis\Desktop\saas-tienda-ropa.zip"

if (Test-Path $zip) { Remove-Item $zip -Force }

# Create temp folder
$tmp = "C:\Users\Jonis\Desktop\_deploy_tmp"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
New-Item -ItemType Directory -Path $tmp | Out-Null

# Copy only what we need
$folders = @("backend\src", "backend\Dockerfile", "db-schemas", "frontend\src", "frontend\dist", "frontend\index.html")

# Copy backend
Copy-Item "$src\backend" "$tmp\backend" -Recurse -Force
Remove-Item "$tmp\backend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$tmp\backend\.env" -Force -ErrorAction SilentlyContinue

# Copy frontend
Copy-Item "$src\frontend" "$tmp\frontend" -Recurse -Force
Remove-Item "$tmp\frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item "$tmp\frontend\.env" -Force -ErrorAction SilentlyContinue

# Copy root files
Copy-Item "$src\package.json" "$tmp\package.json" -Force
Copy-Item "$src\package-lock.json" "$tmp\package-lock.json" -Force -ErrorAction SilentlyContinue
Copy-Item "$src\.gitignore" "$tmp\.gitignore" -Force -ErrorAction SilentlyContinue
Copy-Item "$src\README.md" "$tmp\README.md" -Force -ErrorAction SilentlyContinue

# Copy db-schemas if exists
if (Test-Path "$src\db-schemas") {
    Copy-Item "$src\db-schemas" "$tmp\db-schemas" -Recurse -Force
}

# Create ZIP
Compress-Archive -Path "$tmp\*" -DestinationPath $zip -Force

# Cleanup temp
Remove-Item $tmp -Recurse -Force

$size = [math]::Round((Get-Item $zip).Length / 1KB, 1)
Write-Host "ZIP creado: $zip ($size KB)"
