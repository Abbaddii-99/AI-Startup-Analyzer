@echo off
echo ========================================
echo   Clean Project Before Upload
echo ========================================
echo.
echo This will delete .env file and build folders
echo.
pause

echo.
echo Cleaning...
echo.

if exist .env (
    del .env
    echo Deleted .env
)

if exist .env.local (
    del .env.local
    echo Deleted .env.local
)

if exist apps\frontend\.env.local (
    del apps\frontend\.env.local
    echo Deleted frontend .env.local
)

if exist apps\backend\.env.local (
    del apps\backend\.env.local
    echo Deleted backend .env.local
)

echo.
echo Cleanup done!
echo.
echo Now run: check-before-upload.bat
echo.
pause
