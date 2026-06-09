# Dural Nafis Quotation Editor - one-time setup.
# Creates Desktop and Start Menu shortcuts that launch the editor in an Edge app window.
# Run via setup.bat (double-click). No admin rights required.

$ErrorActionPreference = "Stop"
$appDir = $PSScriptRoot
$vbs = Join-Path $appDir "launch.vbs"
$icon = Join-Path $appDir "assets\app-icon.ico"
$shortcutName = "محرر عروض الدر النفيس.lnk"

foreach ($required in @($vbs, (Join-Path $appDir "server.ps1"), (Join-Path $appDir "index.html"))) {
  if (-not (Test-Path -LiteralPath $required)) {
    Write-Host "خطأ: ملف مفقود / Missing file: $required" -ForegroundColor Red
    exit 1
  }
}

$wscript = Join-Path $env:WINDIR "System32\wscript.exe"
$shell = New-Object -ComObject WScript.Shell

function New-AppShortcut([string]$folder) {
  if (-not (Test-Path -LiteralPath $folder)) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
  }
  $path = Join-Path $folder $shortcutName
  $lnk = $shell.CreateShortcut($path)
  $lnk.TargetPath = $wscript
  $lnk.Arguments = '"' + $vbs + '"'
  $lnk.WorkingDirectory = $appDir
  $lnk.Description = "محرر عروض الأسعار - شركة الدر النفيس للاستشارات الهندسية"
  if (Test-Path -LiteralPath $icon) { $lnk.IconLocation = $icon }
  $lnk.Save()
  return $path
}

$desktop = [Environment]::GetFolderPath("Desktop")
$startMenu = Join-Path ([Environment]::GetFolderPath("Programs")) "Dural Nafis"

$created = @()
$created += New-AppShortcut $desktop
$created += New-AppShortcut $startMenu

Write-Host ""
Write-Host "تم التثبيت بنجاح ✓  /  Setup complete." -ForegroundColor Green
Write-Host "تم إنشاء اختصارات / Shortcuts created:" -ForegroundColor Green
$created | ForEach-Object { Write-Host "  - $_" }
Write-Host ""
Write-Host "افتح التطبيق من اختصار سطح المكتب. لتثبيته على شريط المهام: انقر بزر الفأرة الأيمن على نافذة التطبيق ثم (تثبيت على شريط المهام)." -ForegroundColor Cyan
Write-Host "Open it from the Desktop shortcut. To pin: right-click the app window > Pin to taskbar." -ForegroundColor Cyan
Write-Host ""
