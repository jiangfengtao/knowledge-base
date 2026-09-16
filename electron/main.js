// Electron 主进程
const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");

// 生产模式下启动 Next.js 服务
let nextServer = null;

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: "#f5f6f7",
    title: "晓桃自学英语",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // 设置应用菜单（简化版，Mac 上需要）
  const template = [
    {
      label: app.name,
      submenu: [
        { role: "about", label: "关于晓桃" },
        { type: "separator" },
        { role: "hide", label: "隐藏晓桃" },
        { role: "hideOthers", label: "隐藏其他" },
        { role: "unhide", label: "显示全部" },
        { type: "separator" },
        { role: "quit", label: "退出晓桃" },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo", label: "撤销" },
        { role: "redo", label: "重做" },
        { type: "separator" },
        { role: "cut", label: "剪切" },
        { role: "copy", label: "复制" },
        { role: "paste", label: "粘贴" },
        { role: "selectAll", label: "全选" },
      ],
    },
    {
      label: "视图",
      submenu: [
        { role: "reload", label: "重新加载" },
        { role: "forceReload", label: "强制重新加载" },
        { role: "toggleDevTools", label: "开发者工具" },
        { type: "separator" },
        { role: "resetZoom", label: "实际大小" },
        { role: "zoomIn", label: "放大" },
        { role: "zoomOut", label: "缩小" },
        { type: "separator" },
        { role: "togglefullscreen", label: "进入全屏" },
      ],
    },
    {
      label: "窗口",
      submenu: [
        { role: "minimize", label: "最小化" },
        { role: "close", label: "关闭" },
      ],
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "学习更多",
          click: async () => {
            await shell.openExternal("https://www.yuque.com");
          },
        },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));

  // 加载页面
  if (isDev) {
    // 开发模式 - 加载本地开发服务器
    mainWindow.loadURL("http://localhost:3000");
  } else {
    // 生产模式 - 加载本地服务
    mainWindow.loadURL("http://localhost:3000");
  }

  // 外链在浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// 启动 Next.js 服务（生产模式）
function startNextServer() {
  if (isDev) return; // 开发模式由 npm script 启动

  const { execFile } = require("child_process");
  const serverPath = path.join(process.resourcesPath, "server");

  nextServer = execFile(
    "node",
    [path.join(serverPath, "server.js")],
    {
      env: {
        ...process.env,
        PORT: "3000",
        NODE_ENV: "production",
      },
    },
    (error) => {
      if (error) {
        console.error("Next server error:", error);
      }
    }
  );

  nextServer.stdout.on("data", (data) => {
    console.log("[Next]", data.toString());
  });

  nextServer.stderr.on("data", (data) => {
    console.error("[Next Error]", data.toString());
  });
}

app.whenReady().then(() => {
  startNextServer();

  // 等待 Next.js 服务启动
  const waitForServer = () => {
    const http = require("http");
    http
      .get("http://localhost:3000", () => {
        createWindow();
      })
      .on("error", () => {
        setTimeout(waitForServer, 500);
      });
  };

  if (isDev) {
    createWindow();
  } else {
    setTimeout(waitForServer, 1000);
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (nextServer) {
    nextServer.kill();
  }
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (nextServer) {
    nextServer.kill();
  }
});
