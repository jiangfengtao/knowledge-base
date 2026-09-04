@echo off
chcp 65001 >nul
title 晓桃终生成长 - 启动器

cd /d "%~dp0"

echo ============================================
echo    晓桃终生成长 - 个人知识管理系统
echo ============================================
echo.

:: 检查 Node.js 是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js！
    echo.
    echo 请先安装 Node.js：
    echo 1. 打开 https://nodejs.org/zh-cn
    echo 2. 下载 LTS 版本（左边那个）
    echo 3. 双击安装，一路下一步
    echo 4. 安装完重新打开本程序
    echo.
    pause
    exit /b 1
)

echo [1/4] 检测到 Node.js 已安装
node -v
echo.

:: 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [2/4] 正在安装依赖，第一次会慢一点，请耐心等待...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [错误] 依赖安装失败，请检查网络连接
        echo 试试切换国内镜像：npm config set registry https://registry.npmmirror.com
        pause
        exit /b 1
    )
    echo.
    echo 依赖安装完成！
) else (
    echo [2/4] 依赖已安装，跳过
)

:: 检查数据库
if not exist "prisma\dev.db" (
    echo.
    echo [3/4] 正在初始化数据库...
    call npx prisma generate >nul 2>&1
    call npx prisma db push
    echo 数据库初始化完成！
) else (
    echo [3/4] 数据库已就绪，跳过
)

:: 启动服务
echo.
echo [4/4] 正在启动晓桃知识库...
echo.
echo ============================================
echo   启动成功后，请打开浏览器访问：
echo   http://localhost:3000
echo.
echo   关闭本窗口即可退出程序
echo ============================================
echo.

call npm run dev

pause
