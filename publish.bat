@echo off
chcp 65001 >nul
cd /d E:\lititil\lititilWeb
git pull origin main --no-edit
git add .
git commit -m "自动发布更新"
git push origin main
echo 发布完成！
pause