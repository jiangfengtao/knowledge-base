// 生产模式下启动 Next.js 服务
const { startServer } = require("next/dist/server/lib/start-server");
const path = require("path");

const port = process.env.PORT || 3000;
const dir = path.join(__dirname);
const hostname = "localhost";

async function main() {
  try {
    const { httpServer } = await startServer({
      dir,
      port,
      hostname,
      isDev: false,
    });

    console.log(`晓桃知识库服务已启动: http://${hostname}:${port}`);

    httpServer.on("error", (err) => {
      console.error("Server error:", err);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

main();
