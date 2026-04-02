Param(
    [string]$DestinationDir = ".\.private_notes",
    [string]$CombinedFileName = "combined_notes.md"
)

$files = @(
    "REPO_OVERVIEW.md",
    "TODO.md",
    "PLAN.md",
    "SECURITY.md"
)

if (-not (Test-Path $DestinationDir)) {
    New-Item -ItemType Directory -Path $DestinationDir | Out-Null
    (Get-Item $DestinationDir).Attributes += 'Hidden'
}

$combinedPath = Join-Path $DestinationDir $CombinedFileName

if (Test-Path $combinedPath) {
    Rename-Item -Path $combinedPath -NewName "$($CombinedFileName).bak" -Force
}

Add-Content -Path $combinedPath -Value "# Private Notes Collection"
Add-Content -Path $combinedPath -Value "Collected: $(Get-Date -Format o)"
Add-Content -Path $combinedPath -Value ""

foreach ($file in $files) {
    if (-not (Test-Path $file)) { continue }
    $content = Get-Content -Path $file -Raw
    Add-Content -Path $combinedPath -Value "## Source: $file"
    Add-Content -Path $combinedPath -Value "```\n$content\n```"
    Add-Content -Path $combinedPath -Value ""
    Set-Content -Path $file -Value "# المحتوى متاح محلياً فقط. الرجاء استخدام السكربت لحفظ النسخ الخاصة." -Encoding UTF8
}

(Get-Item $combinedPath).Attributes += 'Hidden'

Write-Host "تم دمج المحتوى في $combinedPath وترك الملفات الأصلية فارغة مع رسالة توضيحية."
