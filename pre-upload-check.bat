@echo off
setlocal enabledelayedexpansion
echo ========================================
echo   Pre-Upload Checklist for GitHub
echo ========================================
echo.

set ERROR_COUNT=0

REM Check 1: .env file
echo [1/6] Checking for .env file...
if exist .env (
    echo FAIL: .env file exists!
    echo    This file contains secrets and should NOT be uploaded
    echo    Solution: Delete it or ensure it is in .gitignore
    set /a ERROR_COUNT+=1
) else (
    echo PASS: No .env file found
)
echo.

REM Check 2: .gitignore exists
echo [2/6] Checking .gitignore...
if exist .gitignore (
    echo PASS: .gitignore exists
) else (
    echo FAIL: .gitignore not found!
    set /a ERROR_COUNT+=1
)
echo.

REM Check 3: node_modules in .gitignore
echo [3/6] Checking if node_modules is ignored...
findstr /C:"node_modules" .gitignore >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo PASS: node_modules is in .gitignore
) else (
    echo FAIL: node_modules not in .gitignore!
    set /a ERROR_COUNT+=1
)
echo.

REM Check 4: .env in .gitignore
echo [4/6] Checking if .env is ignored...
findstr /C:".env" .gitignore >nul 2>&1
if !ERRORLEVEL! EQU 0 (
    echo PASS: .env is in .gitignore
) else (
    echo FAIL: .env not in .gitignore!
    set /a ERROR_COUNT+=1
)
echo.

REM Check 5: README exists
echo [5/6] Checking README.md...
if exist README.md (
    echo PASS: README.md exists
) else (
    echo FAIL: README.md not found!
    set /a ERROR_COUNT+=1
)
echo.

REM Check 6: LICENSE exists
echo [6/6] Checking LICENSE...
if exist LICENSE (
    echo PASS: LICENSE exists
) else (
    echo WARNING: LICENSE not found
    echo    Consider adding a license file
)
echo.

echo ========================================
echo   Summary
echo ========================================
echo.

if !ERROR_COUNT! EQU 0 (
    echo All checks passed! Ready to upload to GitHub
    echo.
    echo Next steps:
    echo 1. Run: git-setup.bat
    echo 2. Create repo on GitHub
    echo 3. Push your code
) else (
    echo !ERROR_COUNT! check^(s^) failed!
    echo.
    echo Please fix the issues above before uploading to GitHub
)
echo.

echo ========================================
echo.
pause
