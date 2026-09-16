# 晓桃自学英语 - Windows 安装使用指南

## 第一步：安装 Node.js

1. 打开 Node.js 官网：https://nodejs.org/zh-cn
2. 下载 **LTS 版本**（长期支持版，比如 20.x 或 22.x）
3. 双击下载的安装包，一路「下一步」安装即可
4. 安装完成后，验证一下：
   - 按 `Win + R`，输入 `cmd`，回车
   - 在黑色窗口里输入：`node -v`
   - 如果显示版本号（比如 `v20.xx.x`），说明安装成功 ✅

## 第二步：下载项目文件

1. 把 `xiaotao-knowledge-base.zip` 解压到你想放的位置
   - 比如：`D:\xiaotao\` 或者 `C:\Users\你的名字\Documents\xiaotao\`
2. 解压后，你会看到一个 `knowledge-base` 文件夹

## 第三步：安装依赖

1. 打开 `knowledge-base` 文件夹
2. 在文件夹空白处，**按住 Shift 键 + 鼠标右键**，选择「在此处打开 PowerShell 窗口」或「在终端中打开」
3. 在打开的黑色窗口里，输入：

```bash
npm install
```

4. 等几分钟，安装完成后（没有红色报错就行），继续下一步

## 第四步：初始化数据库

还是在刚才的窗口里，输入：

```bash
npx prisma generate
npx prisma db push
```

这两条命令分别执行，执行完一条再执行下一条。

## 第五步：启动程序

输入：

```bash
npm run dev
```

等一会儿，看到类似这样的提示：

```
✓ Ready in 1931ms
```

就说明启动成功了！

## 第六步：开始使用

打开浏览器，访问：**http://localhost:3000**

你就可以看到晓桃知识库了！

---

## 常用操作

### 怎么关闭程序？
在终端窗口里按 `Ctrl + C`，然后关闭窗口就行。

### 下次怎么打开？
1. 进入 `knowledge-base` 文件夹
2. 按住 Shift + 右键，打开终端
3. 输入 `npm run dev`
4. 浏览器打开 http://localhost:3000

### 数据存在哪里？
所有数据都存在 `knowledge-base/prisma/dev.db` 这个文件里（SQLite 数据库）。
- 想备份的话，直接复制这个文件就行
- 想迁移到服务器，也是用这个文件

---

## 页面说明

| 地址 | 说明 |
|------|------|
| http://localhost:3000 | 后台管理端（你自己用的） |
| http://localhost:3000/blog | 前台博客展示站（给粉丝看的） |
| http://localhost:3000/import | 导入 Markdown 文件（语雀导出） |
| http://localhost:3000/webhook-test | 微信消息接入测试 |
| http://localhost:3000/yuque-sync | 语雀同步（需要会员Token） |

---

## 桌面端 App（可选）

如果你想做成像语雀那样的桌面 App（不用开浏览器）：

```bash
npm run electron:dev
```

这会同时启动服务和桌面窗口。

---

## 遇到问题怎么办？

1. **npm install 报错**：检查网络，或者试试用淘宝镜像：
   ```bash
   npm config set registry https://registry.npmmirror.com
   ```
   然后重新 `npm install`

2. **端口被占用**：改端口的话告诉我，我教你

3. **其他报错**：把报错截图发给我，我来帮你看

---

## 后续功能

目前已经有的功能：
- ✅ 知识库分类（00-06 体系）
- ✅ 文档编辑（块级编辑器）
- ✅ 小记/速记
- ✅ 文档公开/私密设置
- ✅ 前台博客展示站
- ✅ Markdown 导入（语雀导出）
- ✅ 移动端适配
- ✅ 微信/飞书消息接入接口
- ✅ AI 自动分类接口

待开发（你需要时再加）：
- 📱 手机端 App 打包
- 🤖 AI 知识库问答
- 🔄 云端同步
- 💬 评论功能
- 📊 数据统计
- ... 更多

有任何问题随时告诉我！
