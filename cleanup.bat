@echo off
setlocal enabledelayedexpansion
echo ========================================
echo   Cleanup Script - Remove Sensitive Files
echo ========================================
echo.
echo This will remove files that should NOT be uploaded to GitHub
echo.

set /p CONFIRM="Are you sure you want to continue? (Y/N): "
if /i not "!CONFIRM!"=="Y" (
    echo Cancelled.
    pause
    exit /b
)

echo.
echo Starting cleanup...
echo.

REM Remove .env file
if exist .env (
    del .env
    echo Deleted: .env
) else (
    echo No .env file found
)

REM Remove .env.local files
if exist .env.local (
    del .env.local
    echo Deleted: .env.local
)

if exist apps\frontend\.env.local (
    del apps\frontend\.env.local
    echo Deleted: apps\frontend\.env.local
)

if exist apps\backend\.env.local (
    del apps\backend\.env.local
    echo Deleted: apps\backend\.env.local
)

REM Remove node_modules (optional)
echo.
set /p REMOVE_MODULES="Remove node_modules folders? (Y/N): "
if /i "!REMOVE_MODULES!"=="Y" (
    echo Removing node_modules...
    if exist node_modules rmdir /s /q node_modules
    if exist apps\backend\node_modules rmdir /s /q apps\backend\node_modules
    if exist apps\frontend\node_modules rmdir /s /q apps\frontend\node_modules
    if exist packages\db\node_modules rmdir /s /q packages\db\node_modules
    if exist packages\shared\node_modules rmdir /s /q packages\shared\node_modules
    echo node_modules removed
)

REM Remove build artifacts
echo.
echo Removing build artifacts...
if exist dist rmdir /s /q dist
if exist build rmdir /s /q build
if exist .next rmdir /s /q .next
if exist apps\backend\dist rmdir /s /q apps\backend\dist
if exist apps\frontend\.next rmdir /s /q apps\frontend\.next
echo Build artifacts removed

REM Remove logs
if exist *.log del *.log
echo Log files removed

echo.
echo ========================================
echo   Cleanup Complete!
echo ========================================
echo.
echo Your project is now clean and ready for GitHub
echo.
echo Next steps:
echo 1. Run: pre-upload-check.bat
echo 2. Run: git-setup.bat
echo.
pause
