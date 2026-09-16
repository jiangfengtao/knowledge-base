@echo off
chcp 65001 >nul
title 晓桃自学英语 - 桌面版

cd /d "%~dp0"

echo ============================================
echo    晓桃自学英语 - 桌面版
echo ============================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js！
    echo 请先运行「启动晓桃.bat」完成初始化
    pause
    exit /b 1
)

:: 设置国内镜像源（加速 Electron 下载）
echo [准备] 设置国内镜像源加速下载...
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
set ELECTRON_BUILDER_BINARIES_MIRROR=https://npmmirror.com/mirrors/electron-builder-binaries/

:: 检查依赖
if not exist "node_modules" (
    echo [错误] 请先运行「启动晓桃.bat」完成基础安装
    pause
    exit /b 1
)

:: 检查 electron 是否安装
if not exist "node_modules\electron" (
    echo.
    echo [1/2] 正在安装桌面版运行环境...
    echo （第一次需要下载，大约 1-3 分钟，请耐心等待）
    echo.
    call npm install electron --save-dev
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 桌面版环境安装失败
        echo 可能是网络问题，请重试或检查网络
        pause
        exit /b 1
    )
    echo 桌面版环境安装完成！
) else (
    echo [1/2] 桌面版环境已就绪
)

:: 启动
echo.
echo [2/2] 正在启动晓桃桌面版...
echo （稍等几秒，窗口马上弹出来）
echo.

call npx concurrently -k "npm run dev" "npx wait-on tcp:3000 && npx electron ."

pause
