@echo off
echo [自动同步] 正在监听 GitHub 仓库更新...

:loop
git fetch origin main >nul 2>&1

for /f "tokens=1" %%i in ('git rev-list HEAD...origin/main --count') do set DIFF_COUNT=%%i

if %DIFF_COUNT% gtr 0 (
    echo [自动同步] 检测到新版本，正在更新...
    git pull origin main
    echo [自动同步] 更新完成！
)

timeout /t 5 >nul
goto loop