@echo off
chcp 65001 >nul
cd /d E:\lititil\lititilWeb

:check_github
echo [检查] 正在测试 GitHub 连接...
ping -n 1 github.com >nul 2>&1
if %errorlevel% neq 0 (
    echo [失败] GitHub 网络不通，30 秒后重试...
    timeout /t 30 /nobreak >nul
    goto check_github
)
echo [成功] GitHub 连接正常。

:retry_push
echo [拉取] 正在拉取最新代码...
git pull origin main --no-edit
if %errorlevel% neq 0 (
    echo [失败] Git 拉取失败，可能是仓库地址错误或权限不足。
    timeout /t 10 /nobreak >nul
    goto retry_push
)

echo [提交] 正在提交本地更改...
git add .
git commit -m "自动发布更新"
if %errorlevel% neq 0 (
    echo [提示] 没有需要提交的更改，跳过提交步骤。
)

echo [推送] 正在推送到 GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo [失败] Git 推送失败，可能是网络问题或权限不足。10 秒后重试...
    timeout /t 10 /nobreak >nul
    goto retry_push
)

echo [成功] 发布完成！网站即将更新。