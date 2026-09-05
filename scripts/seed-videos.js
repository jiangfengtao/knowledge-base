const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 找到视频分类
  let videoKb = await prisma.knowledgeBase.findFirst({
    where: { name: '视频内容' },
  });
  
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log('没有用户');
    return;
  }
  
  // 如果没有视频分类，创建一个
  if (!videoKb) {
    console.log('创建视频分类...');
    videoKb = await prisma.knowledgeBase.create({
      data: {
        name: '视频内容',
        description: '视频内容专栏',
        icon: '🎬',
        categoryCode: 'blog-07',
        sortOrder: 7,
        userId: user.id,
      },
    });
    
    // 创建子分类
    const children = [
      { name: '学习vlog', icon: '📹', sortOrder: 0 },
      { name: '读书分享', icon: '📚', sortOrder: 1 },
      { name: '成长记录', icon: '🌱', sortOrder: 2 },
      { name: '工具教程', icon: '🛠️', sortOrder: 3 },
    ];
    for (const child of children) {
      await prisma.knowledgeBase.create({
        data: {
          ...child,
          parentId: videoKb.id,
          userId: user.id,
        },
      });
    }
  }
  
  // 检查是否已有视频文章
  const existing = await prisma.document.count({
    where: { isVideo: true, userId: user.id },
  });
  
  if (existing > 0) {
    console.log('已有', existing, '篇视频文章，跳过创建');
    return;
  }
  
  // 创建示例视频文章
  const videos = [
    {
      title: '我的学习vlog：一天学10小时是种什么体验',
      videoUrl: '',
      videoDuration: '12:35',
      videoThumbnail: '',
      isVideo: true,
      visibility: 'public',
      content: '<p>很多人问我每天怎么能学那么久，今天就带大家看看我真实的一天学习生活。</p><h2>早上 6:30 起床</h2><p>起床后先喝一杯温水，然后做 10 分钟拉伸，让身体醒过来。</p><h2>上午 3 小时深度学习</h2><p>上午是精力最好的时候，用来做最难的事情。我一般安排英语学习或者深度阅读。</p><h2>下午 4 小时专项训练</h2><p>下午做练习题、复习笔记、整理知识体系。</p><h2>晚上 2 小时复盘</h2><p>晚上是复盘的时间，整理当天学了什么，哪些地方需要加强。</p>',
      plainText: '很多人问我每天怎么能学那么久，今天就带大家看看我真实的一天学习生活。',
      wordCount: 380,
      knowledgeBaseId: videoKb.id,
      userId: user.id,
    },
    {
      title: '读书分享：这本书改变了我的思考方式',
      videoUrl: '',
      videoDuration: '08:20',
      videoThumbnail: '',
      isVideo: true,
      visibility: 'public',
      content: '<p>今天给大家分享一本对我影响很大的书——《思考，快与慢》。</p><h2>为什么推荐这本书？</h2><p>这本书让我第一次意识到，人的大脑有两套思考系统，而我们大部分决策都是靠直觉做出的。</p><h2>三个最触动我的观点</h2><p><strong>1. 锚定效应</strong>：我们的判断很容易被第一个信息影响。</p><p><strong>2. 损失厌恶</strong>：失去的痛苦比得到的快乐更强烈。</p><p><strong>3. 峰终定律</strong>：我们对一段经历的记忆，只取决于峰值和结尾。</p>',
      plainText: '今天给大家分享一本对我影响很大的书——《思考，快与慢》。',
      wordCount: 320,
      knowledgeBaseId: videoKb.id,
      userId: user.id,
    },
    {
      title: '30天健身打卡：从零基础到养成运动习惯',
      videoUrl: '',
      videoDuration: '15:48',
      videoThumbnail: '',
      isVideo: true,
      visibility: 'public',
      content: '<p>坚持健身 30 天了，来聊聊我的感受和变化。</p><h2>第 1 周：痛苦期</h2><p>刚开始真的很难，每次都想放弃。但我告诉自己，先坚持 7 天再说。</p><h2>第 2 周：适应期</h2><p>身体开始适应了，运动完不会那么累了。</p><h2>第 3 周：习惯期</h2><p>到第三周，不运动反而觉得不舒服了。</p><h2>第 4 周：享受期</h2><p>现在运动已经成了生活的一部分，享受每次出汗的感觉。</p>',
      plainText: '坚持健身 30 天了，来聊聊我的感受和变化。',
      wordCount: 290,
      knowledgeBaseId: videoKb.id,
      userId: user.id,
    },
    {
      title: '【工具教程】Notion 零基础入门，搭建你的知识体系',
      videoUrl: '',
      videoDuration: '22:15',
      videoThumbnail: '',
      isVideo: true,
      visibility: 'public',
      content: '<p>很多人问我用什么工具管理知识，今天就分享我的主力工具——Notion。</p><h2>为什么选 Notion？</h2><p>灵活、强大、可以自己搭建各种系统。</p><h2>基础操作</h2><p>页面、数据库、模板... 一步步带你入门。</p><h2>我的知识体系搭建</h2><p>展示我自己的知识库是怎么组织的。</p>',
      plainText: '很多人问我用什么工具管理知识，今天就分享我的主力工具——Notion。',
      wordCount: 250,
      knowledgeBaseId: videoKb.id,
      userId: user.id,
    },
  ];
  
  for (const v of videos) {
    await prisma.document.create({ data: v });
    console.log('✓ 创建视频:', v.title);
  }
  
  console.log('\n完成！共创建', videos.length, '篇视频文章');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
