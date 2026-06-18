@echo off
chcp 65001 >nul

call npx repomix
if %errorlevel% neq 0 exit /b %errorlevel%

> repomix-temp.xml echo ================================================================================
>> repomix-temp.xml echo COMPLETE REPOSITORY FILE LIST (FILTERED)
>> repomix-temp.xml echo ================================================================================
git ls-files -co --exclude-standard | findstr /V /I /E ".import .uid" >> repomix-temp.xml
>> repomix-temp.xml echo ================================================================================
>> repomix-temp.xml echo REPOMIX OUTPUT BEGINS BELOW:
>> repomix-temp.xml echo ================================================================================
>> repomix-temp.xml echo.
type repomix-output.txt >> repomix-temp.xml

move /y repomix-temp.xml repomix-output.txt >nul

antigravity-ide .\repomix-output.txt