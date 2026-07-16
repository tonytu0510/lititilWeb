@echo off
cd /d E:\lititil\lititilWeb

:check_github
echo 正在检查 GitHub 连接状态...
ping -n 1 github.com >nul 2>&1
if %errorlevel% neq 0 (
    echo GitHub 暂时无法连接，等待 30 秒后重试...
    timeout /t 30 /nobreak >nul
    goto check_github
)
echo GitHub 连接正常，开始发布更新...

git pull origin main --no-edit
git add .
git commit -m "自动发布更新"
git push origin main
echo 发布完成！