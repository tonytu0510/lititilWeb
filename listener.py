# -*- coding: gb18030 -*-
import os
import time
import sys
import subprocess
import ctypes

TRIGGER_FILE = "E:\\lititil\\lititilWeb\\trigger.txt"
PUBLISH_BAT = "E:\\lititil\\lititilWeb\\publish.bat"
TASK_NAME = "LititilAutoPublisher"


def is_admin():
    """检查是否以管理员权限运行"""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False


def run_as_admin():
    """以管理员身份重新运行当前脚本"""
    if not is_admin():
        print("[权限] 需要管理员权限，正在尝试提权...")
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
        sys.exit(0)


def install():
    """安装开机自启任务"""
    run_as_admin()

    python_exe = sys.executable
    script_path = os.path.abspath(__file__)

    # 先删除旧任务（如果存在）
    subprocess.run(f'schtasks /Delete /TN {TASK_NAME} /F', shell=True, capture_output=True)

    # 创建新任务
    cmd = f'schtasks /Create /TN {TASK_NAME} /TR "{python_exe} {script_path}" /SC ONLOGON /DELAY 0001:00 /F'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True, encoding='gb18030',timeout=60)

    if result.returncode == 0:
        print(f"[安装] 开机自启任务 '{TASK_NAME}' 创建成功！")
        print(f"[安装] 你的监听器已设置为开机自动启动。")
    else:
        print(f"[安装] 创建任务失败: {result.stderr}")


def uninstall():
    """卸载开机自启任务"""
    run_as_admin()

    cmd = f'schtasks /Delete /TN {TASK_NAME} /F'
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True,encoding='gb18030', timeout=60)
    if result.returncode == 0:
        print(f"[卸载] 开机自启任务 '{TASK_NAME}' 已删除。")
    else:
        print(f"[卸载] 任务不存在或已删除。")


def watch_file():
    """持续监听 trigger.txt 文件的变化"""
    print("=" * 60)
    print("  🚀 李家桥全自动发布监听器 v1.0")
    print("=" * 60)
    print(f"  📁 监听文件: {TRIGGER_FILE}")
    print(f"  📜 发布脚本: {PUBLISH_BAT}")
    print(f"  🔑 触发关键词: '发布'")
    print(f"  ⏰ 启动时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print("[监听] 监听器已启动，等待发布指令...")
    print("[监听] 每2秒检查一次触发器文件...")
    print()

    last_content = ""
    heartbeat = 0

    while True:
        try:
            with open(TRIGGER_FILE, "r", encoding="utf-8") as f:
                current_content = f.read().strip()

            if current_content == "发布" and current_content != last_content:
                print(f"[监听] {time.strftime('%Y-%m-%d %H:%M:%S')} 🔔 检测到发布指令！")
                print(f"[监听] 开始执行发布脚本: {PUBLISH_BAT}")
                print("-" * 40)

                result = subprocess.run(PUBLISH_BAT, shell=True, capture_output=True, text=True, encoding='utf-8',timeout=60)
                if result.stdout:
                    print(result.stdout)
                if result.stderr:
                    print(f"[监听] 错误输出: {result.stderr}")

                print("-" * 40)
                print(f"[监听] {time.strftime('%Y-%m-%d %H:%M:%S')} ✅ 发布脚本执行完毕！")

                # 重置触发器文件
                with open(TRIGGER_FILE, "w", encoding="utf-8") as f:
                    f.write("")
                print("[监听] 触发器已重置，等待下一次发布指令...")
                print()

            last_content = current_content

            # 心跳日志（每60秒打印一次，确认监听器还在运行）
            heartbeat += 2
            if heartbeat >= 60:
                print(f"[监听] 💓 心跳: {time.strftime('%Y-%m-%d %H:%M:%S')} - 监听器运行中...")
                heartbeat = 0

            time.sleep(2)

        except KeyboardInterrupt:
            print("\n[监听] 收到关闭信号，正在退出...")
            break
        except Exception as e:
            print(f"[监听] {time.strftime('%Y-%m-%d %H:%M:%S')} ❌ 发生错误: {e}")
            time.sleep(5)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        if sys.argv[1] == "--install":
            install()
        elif sys.argv[1] == "--uninstall":
            uninstall()
        else:
            print("用法: python listener.py [--install | --uninstall]")
            print("  --install   安装开机自启任务")
            print("  --uninstall 卸载开机自启任务")
            print("  不带参数    启动监听器")
    else:
        watch_file()