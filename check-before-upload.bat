@echo off
echo ========================================
echo   GitHub Upload Checker
echo ========================================
echo.

echo Checking your project...
echo.

REM Check .env
if exist .env (
    echo [X] PROBLEM: .env file exists - DELETE IT!
    echo.
) else (
    echo [OK] No .env file
)

REM Check .gitignore
if exist .gitignore (
    echo [OK] .gitignore exists
) else (
    echo [X] PROBLEM: .gitignore missing
)

REM Check README
if exist README.md (
    echo [OK] README.md exists
) else (
    echo [X] PROBLEM: README.md missing
)

REM Check LICENSE
if exist LICENSE (
    echo [OK] LICENSE exists
) else (
    echo [!] WARNING: LICENSE missing
)

echo.
echo ========================================
echo.
echo If you see [X] above, fix them first!
echo If all [OK], you are ready to upload!
echo.
echo Next: Run git-setup.bat
echo.
pause
