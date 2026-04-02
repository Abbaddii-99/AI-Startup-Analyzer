Param(
    [string]$Action = "backup",
    [string]$TargetDir = "$env:USERPROFILE\PrivateProjectNotes"
)

<#
  يساعد السكربت في حفظ أي ملفات شخصية خارج الريبو العام أو استعادتها.
  Examples:
    .\scripts\private-notes.ps1 -Action backup
    .\scripts\private-notes.ps1 -Action restore
#>

if (-not (Test-Path $TargetDir)) {
    New-Item -ItemType Directory -Path $TargetDir | Out-Null
}

$files = @(
    "REPO_OVERVIEW.md",
    "TODO.md",
    "PLAN.md",
    "SECURITY.md"
)

switch ($Action.ToLower()) {
    "backup" {
        foreach ($file in $files) {
            if (Test-Path $file) {
                Copy-Item -Path $file -Destination (Join-Path $TargetDir $file) -Force
            }
        }
        Write-Host "تم حفظ النسخ في $TargetDir"
        break
    }
    "restore" {
        foreach ($file in $files) {
            $source = Join-Path $TargetDir $file
            if (Test-Path $source) {
                Copy-Item -Path $source -Destination $file -Force
            }
        }
        Write-Host "تم استعادة الملفات من $TargetDir"
        break
    }
    default {
        Write-Host "Action غير معروف. استعمل backup أو restore."
    }
}
