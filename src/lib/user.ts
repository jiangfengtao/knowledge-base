import prisma from "./prisma";

// 单用户模式，先简化处理
const DEFAULT_USER_ID = "user-default";

export async function getDefaultUser() {
  let user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: DEFAULT_USER_ID,
        name: "我",
        email: "me@local.dev",
      },
    });

    // 初始化默认知识库结构
    const defaultKbs = [
      { name: "00 收集箱", icon: "📥", categoryCode: "00", sortOrder: 0 },
      { name: "01 项目", icon: "📁", categoryCode: "01", sortOrder: 1 },
      { name: "02 领域", icon: "🎯", categoryCode: "02", sortOrder: 2 },
      { name: "03 资源", icon: "📚", categoryCode: "03", sortOrder: 3 },
      { name: "04 长期关注", icon: "🔭", categoryCode: "04", sortOrder: 4 },
      { name: "05 输出", icon: "✍️", categoryCode: "05", sortOrder: 5 },
      { name: "06 个人", icon: "🏠", categoryCode: "06", sortOrder: 6 },
    ];

    for (const kb of defaultKbs) {
      await prisma.knowledgeBase.create({
        data: {
          ...kb,
          userId: DEFAULT_USER_ID,
        },
      });
    }

    // 给「02 领域」加一个「技术」子知识库
    const kb02 = await prisma.knowledgeBase.findFirst({
      where: { userId: DEFAULT_USER_ID, categoryCode: "02" },
    });
    if (kb02) {
      await prisma.knowledgeBase.create({
        data: {
          name: "技术",
          icon: "💻",
          parentId: kb02.id,
          userId: DEFAULT_USER_ID,
          sortOrder: 0,
        },
      });
    }
  }

  return user;
}

export { DEFAULT_USER_ID };
