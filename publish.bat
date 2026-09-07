@echo off
chcp 65001 >nul
cd /d E:\lititil\lititilWeb

set retry=0

:check_github
echo [检查] 正在测试 GitHub 连接...
ping -n 1 github.com >nul 2>&1
if %errorlevel% neq 0 (
    set /a retry+=1
    echo [失败] GitHub 网络不通，第 %retry% 次重试...
    if %retry% LSS 3 (
        timeout /t 10 /nobreak >nul
        goto check_github
    ) else (
        echo [提示] GitHub 连续 3 次不通，改用 Gitee 备份。
        goto push_gitee_only
    )
)
echo [成功] GitHub 连接正常。

echo [拉取] 正在从 GitHub 拉取最新代码...
git pull origin main --no-edit
if %errorlevel% neq 0 (
    echo [失败] GitHub 拉取失败。
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
    echo [失败] GitHub 推送失败，尝试推送到 Gitee...
    goto push_gitee_only
)

echo [推送] 正在推送到 Gitee...
git push gitee main
if %errorlevel% neq 0 (
    echo [提示] Gitee 推送失败，请检查配置。
)

echo [成功] 发布完成！
goto end

:push_gitee_only
echo [推送] 正在推送到 Gitee 作为备份...
git add .
git commit -m "自动发布更新-Gitee备份"
if %errorlevel% neq 0 (
    echo [提示] 没有需要提交的更改。
)
git push gitee main
if %errorlevel% neq 0 (
    echo [失败] Gitee 推送也失败，请检查网络或 SSH。
) else (
    echo [成功] GitHub 不通，已推送至 Gitee。
)

:end
echo.
echo [结束] 脚本执行完毕。
pause
echo [结束] 脚本执行完毕。