#!/usr/bin/env node
/**
 * 生产环境数据库种子脚本
 * 在 Vercel 构建过程中运行，创建用户+知识库+文档+标签+小记
 * 
 * 运行条件：DATABASE_URL 指向 PostgreSQL 且数据库表已创建
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 使用 bcryptjs 与登录验证保持一致
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function main() {
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl.startsWith('postgres')) {
    console.log('[seed] Not PostgreSQL, skipping seed.');
    return;
  }

  console.log('[seed] Starting production seed...');

  // 检查是否已有数据
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('[seed] Database already has users, skipping.');
    return;
  }

  // === 1. 创建用户 ===
  const email = 'jiangfengtao@example.com';
  const password = 'tao2026';
  const name = 'jiangfengtao';
  const hashedPassword = await hashPassword(password);
  
  const user = await prisma.user.create({
    data: { id: 'user-default', name, email, password: hashedPassword },
  });
  console.log(`[seed] Created user: ${user.name}`);
  const userId = user.id;

  // === 2. 创建默认知识库结构 ===
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
    await prisma.knowledgeBase.create({ data: { ...kb, userId } });
  }
  console.log('[seed] Created default KBs');

  // === 3. 创建自媒体知识库 ===
  const kb02 = await prisma.knowledgeBase.findFirst({
    where: { userId, categoryCode: "02" },
  });
  
  const mediaKb = await prisma.knowledgeBase.create({
    data: {
      name: "晓桃自媒体运营",
      icon: "🎯",
      parentId: kb02.id,
      userId,
      sortOrder: 99,
    },
  });
  console.log('[seed] Created media KB');

  // === 4. 创建分类和子分类 ===
  const categories = [
    { name: "内容创作体系", icon: "📝", color: "#FF6B6B", children: [
      { name: "选题方法论", icon: "🎯" },
      { name: "脚本写作技巧", icon: "✍️" },
      { name: "文案写作模板", icon: "📄" },
      { name: "短视频叙事结构", icon: "🎬" },
    ]},
    { name: "AI工具应用", icon: "🤖", color: "#4ECDC4", children: [
      { name: "AI选题与热点追踪", icon: "🔍" },
      { name: "AI脚本与文案生成", icon: "✨" },
      { name: "AI视频生成", icon: "🎥" },
      { name: "AI图片与封面设计", icon: "🖼️" },
      { name: "AI声音与数字人", icon: "🎙️" },
      { name: "AI剪辑与后期制作", icon: "✂️" },
    ]},
    { name: "平台运营策略", icon: "📊", color: "#45B7D1", children: [
      { name: "抖音运营", icon: "🎵" },
      { name: "小红书运营", icon: "📕" },
      { name: "B站运营", icon: "📺" },
      { name: "视频号运营", icon: "💚" },
      { name: "跨平台分发策略", icon: "🔄" },
    ]},
    { name: "增长策略", icon: "🚀", color: "#96CEB4", children: [
      { name: "流量获取与算法理解", icon: "🌊" },
      { name: "粉丝增长策略", icon: "📈" },
      { name: "私域引流与运营", icon: "💬" },
    ]},
    { name: "变现方法", icon: "💰", color: "#FFEAA7", children: [
      { name: "变现路径规划", icon: "🗺️" },
      { name: "广告与品牌合作", icon: "🤝" },
      { name: "带货与电商变现", icon: "🛒" },
      { name: "知识付费与课程", icon: "📚" },
      { name: "直播变现", icon: "🔴" },
    ]},
    { name: "个人品牌建设", icon: "👑", color: "#DDA0DD", children: [
      { name: "IP定位与人设打造", icon: "🎭" },
      { name: "品牌视觉识别系统", icon: "🎨" },
      { name: "品牌故事与差异化", icon: "📖" },
    ]},
    { name: "数据分析", icon: "📈", color: "#98D8C8", children: [
      { name: "数据指标体系", icon: "📊" },
      { name: "内容复盘方法", icon: "🔍" },
      { name: "用户画像分析", icon: "👥" },
    ]},
    { name: "AI持续迭代方案", icon: "🔄", color: "#F7DC6F", children: [
      { name: "AI辅助创作SOP", icon: "📋" },
      { name: "每周AI复盘流程", icon: "📅" },
      { name: "竞品AI分析", icon: "🔬" },
    ]},
    { name: "法律合规与版权保护", icon: "⚖️", color: "#E74C3C", children: [
      { name: "自媒体法律合规", icon: "📋" },
      { name: "税务与财务管理", icon: "💰" },
    ]},
    { name: "工具箱与资源导航", icon: "🧰", color: "#3498DB", children: [
      { name: "2026必备工具清单", icon: "📋" },
      { name: "免费资源与素材库", icon: "🎁" },
    ]},
    { name: "创作者心态与时间管理", icon: "🧠", color: "#9B59B6", children: [
      { name: "心态管理", icon: "💪" },
      { name: "时间管理与效率", icon: "⏰" },
    ]},
    { name: "2026趋势与未来展望", icon: "🔮", color: "#E67E22", children: [
      { name: "年度趋势报告", icon: "📊" },
      { name: "未来展望与战略规划", icon: "🚀" },
    ]},
  ];

  const kbMap = {};
  let sortOrder = 0;
  for (const cat of categories) {
    const parent = await prisma.knowledgeBase.create({
      data: { name: cat.name, icon: cat.icon, color: cat.color, parentId: mediaKb.id, sortOrder: sortOrder++, userId },
    });
    kbMap[cat.name] = parent.id;
    
    let childSort = 0;
    for (const child of cat.children || []) {
      const childKb = await prisma.knowledgeBase.create({
        data: { name: child.name, icon: child.icon, parentId: parent.id, sortOrder: childSort++, userId },
      });
      kbMap[`${cat.name}/${child.name}`] = childKb.id;
    }
  }
  console.log('[seed] Created 12 categories + 29 subcategories');

  // === 5. 创建标签 ===
  const tagNames = [
    "选题", "方法论", "热点", "脚本", "创作", "文案", "模板", "转化",
    "叙事", "完播率", "结构", "AI工具", "视频生成", "工具箱", "图片",
    "封面", "声音", "数字人", "剪辑", "后期", "平台运营", "抖音",
    "算法", "小红书", "种草", "B站", "视频号", "私域", "分发", "效率",
    "增长", "流量", "粉丝", "策略", "变现", "规划", "广告", "品牌合作",
    "带货", "电商", "知识付费", "课程", "直播", "个人品牌", "IP定位",
    "人设", "视觉", "设计", "品牌故事", "差异化", "数据分析", "指标",
    "运营", "复盘", "用户画像", "受众", "SOP", "竞品分析", "法律合规",
    "版权", "风险", "税务", "财务管理", "免费资源", "素材", "心态管理",
    "长期主义", "健康", "时间管理", "2026趋势", "行业报告", "战略规划",
  ];

  const tagMap = {};
  for (const name of tagNames) {
    const tag = await prisma.tag.create({
      data: { name, userId, color: "#4ECDC4" },
    });
    tagMap[name] = tag;
  }
  console.log(`[seed] Created ${tagNames.length} tags`);

  // === 6. 创建文档 ===
  const documents = [
    { kbKey: "内容创作体系/选题方法论", title: "选题方法论：从0到1找到爆款选题", content: "<h2>选题是自媒体的生死线</h2><p>一个好的选题决定了80%的流量。掌握系统化的选题方法，比盲目创作更重要。</p><h3>一、选题来源渠道</h3><ul><li><strong>热点追踪</strong>：抖音热榜、微博热搜、知乎热榜、百度风云榜</li><li><strong>竞品分析</strong>：分析同领域爆款内容，找到选题规律</li><li><strong>用户需求</strong>：评论区高频问题、私信咨询、搜索关键词</li><li><strong>个人经历</strong>：真实故事、踩坑经验、成长感悟</li></ul><h3>二、选题评估标准</h3><ul><li><strong>需求度</strong>：用户想不想看？（搜索量/讨论度）</li><li><strong>竞争度</strong>：做的人多不多？（竞品数量/质量）</li><li><strong>匹配度</strong>：和你的人设搭不搭？</li><li><strong>可持续度</strong>：能否系列化、持续产出？</li></ul><h3>三、AI辅助选题</h3><p>提示词模板：</p><p>'我的账号定位是[定位]，目标用户是[用户画像]。请基于以下热点/需求，生成10个选题建议，要求：1.有钩子 2.有情绪价值 3.适合短视频。热点信息：[热点内容]'</p>", tags: ["选题", "方法论", "热点"] },
    { kbKey: "内容创作体系/脚本写作技巧", title: "短视频脚本写作：爆款脚本公式", content: "<h2>脚本是视频的灵魂</h2><p>一个好的脚本能让完播率提升3倍以上。</p><h3>一、短视频脚本结构</h3><ul><li><strong>0-3秒（钩子）</strong>：抛出悬念/痛点/反常观点，让人不得不看</li><li><strong>3-15秒（铺垫）</strong>：建立信任，给出背景信息</li><li><strong>15-45秒（核心）</strong>：价值输出，干货/故事/反转</li><li><strong>45-60秒（收尾）</strong>：总结+引导互动（点赞/关注/评论）</li></ul><h3>二、爆款脚本公式</h3><p><strong>痛点+解决方案+效果展示</strong></p><p><strong>反常识+论证+结论</strong></p><p><strong>故事+感悟+价值</strong></p><h3>三、AI辅助脚本</h3><p>提示词：'请为[主题]写一个60秒短视频脚本，目标用户[用户画像]，要求：1.前3秒有强钩子 2.口语化表达 3.结尾引导互动'</p>", tags: ["脚本", "创作", "方法论"] },
    { kbKey: "内容创作体系/文案写作模板", title: "文案写作模板：高转化文案的底层逻辑", content: "<h2>文案决定转化率</h2><h3>一、AIDA模型</h3><ul><li>Attention（注意）：标题/封面吸引眼球</li><li>Interest（兴趣）：开头建立共鸣</li><li>Desire（欲望）：展示价值/效果</li><li>Action（行动）：明确行动指令</li></ul><h3>二、痛点-爽点公式</h3><p>'你是不是也[痛点场景]？用了[解决方案]后，[效果描述]'</p><h3>三、数字量化法</h3><p>用具体数字增加可信度：'3天涨粉5000'比'快速涨粉'更有说服力</p>", tags: ["文案", "模板", "转化"] },
    { kbKey: "内容创作体系/短视频叙事结构", title: "短视频叙事结构：完播率提升技巧", content: "<h2>叙事结构决定完播率</h2><h3>一、金字塔结构</h3><p>结论先行 → 分点论证 → 总结升华</p><h3>二、故事弧线</h3><p>日常 → 冲突 → 高潮 → 解决 → 新日常</p><h3>三、悬念递进法</h3><p>每隔15秒设置一个小悬念，保持观众期待</p><h3>四、反转技巧</h3><p>铺垫A方向 → 结尾反转B方向，制造惊喜感</p>", tags: ["叙事", "完播率", "结构"] },
    { kbKey: "AI工具应用/AI选题与热点追踪", title: "AI选题与热点追踪：让AI帮你找选题", content: "<h2>AI选题工作流</h2><h3>一、热点监控</h3><ul><li>用AI监控各平台热搜榜</li><li>AI分析热点与账号定位的关联度</li><li>AI生成选题建议（含角度/标题/大纲）</li></ul><h3>二、需求挖掘</h3><ul><li>AI批量分析评论区高频问题</li><li>AI分析搜索关键词趋势</li><li>AI生成选题矩阵（需求×竞争）</li></ul><h3>三、竞品AI分析</h3><p>提示词：'分析以下竞品账号的最近20条爆款内容，找出选题规律：[竞品内容列表]'</p>", tags: ["AI工具", "选题", "热点"] },
    { kbKey: "AI工具应用/AI脚本与文案生成", title: "AI脚本与文案生成：从提示词到成稿", content: "<h2>AI写作四层次</h2><ul><li><strong>Level 1 润色</strong>：给AI初稿，让它优化</li><li><strong>Level 2 扩写</strong>：给大纲，让AI扩写</li><li><strong>Level 3 选题</strong>：给方向，让AI生成选题+大纲</li><li><strong>Level 4 风格定制</strong>：用你的文风库让AI模仿你的风格</li></ul><h3>提示词模板</h3><p>'你是[领域]博主，风格[风格描述]。请为[主题]写一个[时长]的脚本，要求：[具体要求]'</p><h3>建立文风库</h3><p>把满意的3-5篇文章喂给AI，让它学习你的语言习惯、句式特点、用词偏好。</p>", tags: ["AI工具", "脚本", "文案"] },
    { kbKey: "AI工具应用/AI视频生成", title: "AI视频生成工具全指南", content: "<h2>2026主流AI视频工具</h2><ul><li><strong>Seedance 2.0</strong>：字节出品，30秒高质量，免费</li><li><strong>Runway Gen-4</strong>：电影级画面，$15/月起</li><li><strong>Kling 2.0</strong>：快手出品，长视频，物理模拟强</li><li><strong>即梦AI</strong>：文生图+视频一体</li><li><strong>Pika 2.0</strong>：实时编辑/风格迁移</li></ul><h3>使用技巧</h3><ul><li>提示词要具体：描述画面、动作、风格、镜头</li><li>分镜生成：把长视频拆成多个5秒片段</li><li>AI生成+实拍混合：AI生成背景/特效，实拍人物</li></ul>", tags: ["AI工具", "视频生成", "工具箱"] },
    { kbKey: "AI工具应用/AI图片与封面设计", title: "AI图片与封面设计指南", content: "<h2>AI图片生成工具</h2><ul><li><strong>Seedream</strong>：字节出品，中文友好，免费</li><li><strong>Midjourney V7</strong>：审美天花板，$10-60/月</li><li><strong>即梦AI</strong>：文生图+视频一体</li><li><strong>Flux Pro</strong>：文字渲染精准</li></ul><h3>封面设计原则</h3><ul><li>大字标题+人物/场景，一眼看懂</li><li>高对比度色彩，小屏可读</li><li>风格统一，形成品牌识别</li><li>AI生成+Canva排版=最佳组合</li></ul>", tags: ["AI工具", "图片", "封面"] },
    { kbKey: "AI工具应用/AI声音与数字人", title: "AI声音与数字人应用指南", content: "<h2>AI音频工具</h2><ul><li><strong>Suno V4</strong>：AI音乐生成，4分钟完整歌曲</li><li><strong>ElevenLabs</strong>：AI声音克隆，最逼真</li><li><strong>豆包TTS</strong>：免费中文配音</li></ul><h3>AI数字人</h3><ul><li><strong>HeyGen</strong>：效果最好，支持对口型</li><li><strong>D-ID</strong>：照片转视频</li><li><strong>硅基智能</strong>：国内主流</li></ul><h3>应用场景</h3><ul><li>无人出镜：AI数字人+AI配音</li><li>多语言：AI翻译+数字人</li><li>24小时直播：AI数字人直播</li></ul>", tags: ["AI工具", "声音", "数字人"] },
    { kbKey: "AI工具应用/AI剪辑与后期制作", title: "AI剪辑与后期制作工作流", content: "<h2>AI剪辑工具</h2><ul><li><strong>剪映/CapCut</strong>：免费，AI功能强大</li><li><strong>Descript</strong>：文字编辑视频</li><li><strong>Opus Clip</strong>：长视频自动切片</li></ul><h3>AI剪辑技巧</h3><ul><li>AI自动字幕（剪映一键生成）</li><li>AI去口癖（Descript删除'嗯啊'）</li><li>AI智能裁剪（Opus Clip自动选高光）</li><li>AI背景替换（剪映绿幕/AI抠图）</li></ul>", tags: ["AI工具", "剪辑", "后期"] },
    { kbKey: "平台运营策略/抖音运营", title: "抖音运营全攻略", content: "<h2>抖音：日活7亿的短视频之王</h2><h3>一、算法机制</h3><ul><li>流量池赛马：200→500→1000→5000→10000+</li><li>核心指标：完播率>点赞>评论>转发>收藏</li><li>黄金3秒：前3秒决定能否进入下一个流量池</li></ul><h3>二、内容策略</h3><ul><li>时长：15-60秒最佳（知识类可到3分钟）</li><li>频率：日更1-2条，保持活跃度</li><li>话题：3-5个相关话题标签</li><li>发布时间：7:00-9:00 / 12:00-13:00 / 18:00-22:00</li></ul><h3>三、变现路径</h3><ul><li>星图广告（粉丝1000+可接单）</li><li>橱窗带货</li><li>直播</li><li>小程序/游戏推广</li></ul>", tags: ["平台运营", "抖音", "算法"] },
    { kbKey: "平台运营策略/小红书运营", title: "小红书运营全攻略", content: "<h2>小红书：种草社区，女性用户为主</h2><h3>一、算法特点</h3><ul><li>搜索权重高：长尾效应强</li><li>图文>视频（图文更容易出爆款）</li><li>收藏权重>点赞</li></ul><h3>二、内容策略</h3><ul><li>封面：大字标题+高清图片</li><li>标题：包含关键词+情绪词+数字</li><li>正文：emoji分段，结构清晰</li><li>话题：3-5个精准话题</li></ul><h3>三、变现</h3><ul><li>蒲公英平台广告</li><li>带货（小红书店铺）</li><li>引流私域</li></ul>", tags: ["平台运营", "小红书", "种草"] },
    { kbKey: "平台运营策略/B站运营", title: "B站运营全攻略：社区文化与增长策略", content: "<h2>B站：中长视频的黄金赛道</h2><p>B站用户粘性高、社区氛围强，是知识类、深度内容创作者的最佳平台。</p><h3>一、B站推荐算法</h3><ul><li>完播率（权重最高）：≥40%有机会上首页推荐</li><li>一键三连（点赞+投币+收藏）：综合互动率≥5%为优秀</li><li>弹幕密度：弹幕多的视频被推荐更多</li></ul><h3>二、内容策略</h3><ul><li>时长：5-15分钟为黄金区间，知识科普可到20分钟</li><li>格式：横屏1080P，前15秒必须有钩子</li><li>封面：高清截图+大字标题，风格统一</li></ul><h3>三、变现</h3><ul><li>创作激励计划（播放量分成）</li><li>充电计划（粉丝打赏）</li><li>品牌合作（花火平台）</li><li>课程/付费内容</li></ul>", tags: ["平台运营", "B站", "算法"] },
    { kbKey: "平台运营策略/视频号运营", title: "视频号运营全攻略：社交裂变与私域联动", content: "<h2>视频号：微信生态的流量新入口</h2><p>视频号背靠14亿微信用户，社交推荐+算法推荐双引擎，是私域变现的最佳平台。</p><h3>一、算法特点</h3><ul><li>社交推荐：朋友点赞/看过的内容优先推荐</li><li>搜索流量：微信搜一搜导流，长尾效应强</li><li>公私域联动：可直接导流到公众号/微信群/小程序</li></ul><h3>二、私域联动SOP</h3><ol><li>视频号发布内容</li><li>引导关注视频号</li><li>主页挂载公众号链接</li><li>公众号引导加微信/进群</li><li>私域沉淀后变现</li></ol><h3>三、变现</h3><ul><li>直播带货（微信小店/小程序商城）</li><li>视频号广告（互选平台）</li><li>私域变现（社群/课程/咨询）</li></ul>", tags: ["平台运营", "视频号", "私域"] },
    { kbKey: "平台运营策略/跨平台分发策略", title: "跨平台分发策略：一次创作全网覆盖", content: "<h2>一次创作，多平台分发</h2><h3>一、内容适配</h3><ul><li>抖音/快手：竖屏，15-60秒，强钩子</li><li>小红书：图文/竖视频，重标题和封面</li><li>B站：横屏，5-15分钟，深度内容</li><li>视频号：竖屏，15-60秒，社交话题</li><li>公众号：图文长文，深度解读</li></ul><h3>二、分发SOP</h3><ol><li>创作主内容（竖屏短视频版）</li><li>适配各平台格式</li><li>用AI生成各平台标题/封面</li><li>定时发布（各平台最佳时段）</li></ol><h3>三、AI辅助分发</h3><ul><li>AI一键生成多平台标题</li><li>AI自动裁剪横竖屏</li><li>AI生成各平台封面</li></ul>", tags: ["平台运营", "分发", "效率"] },
    { kbKey: "增长策略/流量获取与算法理解", title: "流量获取与算法理解：让平台给你推流", content: "<h2>算法是自媒体的流量分配器</h2><h3>一、通用算法逻辑</h3><ul><li>内容质量分（完播/互动/分享）</li><li>账号权重分（活跃度/垂直度/粉丝质量）</li><li>用户匹配度（标签匹配/兴趣推荐）</li></ul><h3>二、提升推流的方法</h3><ul><li>提高完播率（前3秒钩子+悬念递进）</li><li>引导互动（提问/投票/评论引导）</li><li>保持垂直度（不要频繁换领域）</li><li>固定发布频率（算法偏好活跃账号）</li></ul>", tags: ["增长", "算法", "流量"] },
    { kbKey: "增长策略/粉丝增长策略", title: "粉丝增长策略：从0到10万", content: "<h2>粉丝增长阶段</h2><ul><li><strong>0-1000</strong>：种子用户期，靠朋友分享+搜索流量</li><li><strong>1000-1万</strong>：算法推荐期，靠爆款内容+投流</li><li><strong>1万-10万</strong>：矩阵增长期，靠系列内容+跨平台</li><li><strong>10万+</strong>：品牌裂变期，靠IP效应+用户自发传播</li></ul><h3>增长技巧</h3><ul><li>系列化内容（提升回访率）</li><li>评论区互动（提升账号活跃度）</li><li>评论区截流（在竞品评论区曝光）</li><li>合作互推（同量级博主合作）</li><li>投流（DOU+/薯条/起飞）</li></ul>", tags: ["增长", "粉丝", "策略"] },
    { kbKey: "增长策略/私域引流与运营", title: "私域引流与运营：把流量变成资产", content: "<h2>私域是自媒体的终极护城河</h2><h3>一、引流路径</h3><ul><li>抖音→个人微信（主页简介/评论区引导）</li><li>小红书→微信群（笔记引导+私信）</li><li>B站→QQ群/微信群</li><li>视频号→公众号→个人微信</li></ul><h3>二、私域运营</h3><ul><li>社群分层（免费群/VIP群/核心群）</li><li>日常运营（早安/干货/互动/答疑）</li><li>朋友圈经营（人设+生活+干货+产品）</li></ul><h3>三、私域变现</h3><ul><li>社群付费（月费/年费）</li><li>1对1咨询</li><li>课程/产品首发</li><li>团购/带货</li></ul>", tags: ["增长", "私域", "变现"] },
    { kbKey: "变现方法/变现路径规划", title: "变现路径规划：从0到月入万元", content: "<h2>变现阶段规划</h2><h3>一、0-1000粉：起步期</h3><ul><li>平台创作激励（播放量分成）</li><li>小额带货（佣金模式）</li></ul><h3>二、1000-1万粉：成长期</h3><ul><li>广告合作（星图/蒲公英）</li><li>带货（橱窗/小店）</li><li>知识付费（低价课程/付费社群）</li></ul><h3>三、1万-10万粉：爆发期</h3><ul><li>品牌广告（高价合作）</li><li>自有产品/课程</li><li>直播带货</li><li>私域变现</li></ul><h3>四、10万+：IP期</h3><ul><li>自有品牌</li><li>授权/联名</li><li>投资/孵化</li></ul>", tags: ["变现", "规划", "策略"] },
    { kbKey: "变现方法/广告与品牌合作", title: "广告与品牌合作完全指南：从报价到交付", content: "<h2>广告合作：自媒体变现的核心路径</h2><h3>一、报价体系</h3><ul><li>视频广告：粉丝数×0.03-0.1元/粉</li><li>图文广告：粉丝数×0.02-0.05元/粉</li><li>全案合作：1万-50万（根据需求定制）</li></ul><h3>二、接单渠道</h3><ul><li>抖音：星图（官方）</li><li>小红书：蒲公英平台</li><li>B站：花火平台</li><li>视频号：互选平台</li><li>直接合作：品牌方直接联系（利润最高）</li></ul><h3>三、避坑指南</h3><ul><li>不接与领域不符的广告</li><li>合同明确修改次数</li><li>预付50%+发布后50%</li><li>遵守广告法，不用绝对化用语</li></ul>", tags: ["变现", "广告", "品牌合作"] },
    { kbKey: "变现方法/带货与电商变现", title: "带货与电商变现：选品到爆单全流程", content: "<h2>带货变现全流程</h2><h3>一、选品策略</h3><ul><li>引流款（低价高需求）：9.9-29.9</li><li>利润款（高价高利润）：99-299</li><li>爆款返场（热卖复推）</li></ul><h3>二、带货形式</h3><ul><li>短视频带货（挂车）</li><li>直播带货（实时转化）</li><li>图文种草（小红书）</li><li>橱窗/店铺</li></ul><h3>三、爆单技巧</h3><ul><li>痛点引入→产品展示→效果对比→限时优惠</li><li>用AI分析竞品爆款选品</li><li>AI生成带货话术</li></ul>", tags: ["变现", "带货", "电商"] },
    { kbKey: "变现方法/知识付费与课程", title: "知识付费与课程设计指南：从内容到产品", content: "<h2>知识付费：把经验变成产品</h2><h3>一、产品形态</h3><ul><li>付费专栏：按月/系列付费</li><li>录播课程：一次性购买</li><li>训练营：课程+作业+点评+社群</li><li>1对1咨询：个性化服务</li></ul><h3>二、定价策略</h3><ul><li>入门课：99-299元（引流）</li><li>系统课：499-1999元（主力）</li><li>训练营：1999-9999元（高利润）</li></ul><h3>三、AI辅助课程制作</h3><ul><li>AI生成课程大纲和逐字稿</li><li>AI制作课件PPT</li><li>AI生成课程营销文案</li></ul>", tags: ["变现", "知识付费", "课程"] },
    { kbKey: "变现方法/直播变现", title: "直播变现全攻略：从起播到爆单", content: "<h2>直播：自媒体变现的加速器</h2><h3>一、直播流程SOP</h3><ol><li>开播前30分钟：预热短视频/动态通知</li><li>0-5分钟：留人环节（抽奖/红包/福利预告）</li><li>5-10分钟：第一波引流款</li><li>10-30分钟：利润款主推</li><li>30-60分钟：穿插互动+限时秒杀</li><li>最后10分钟：总结+最后福利</li></ol><h3>二、AI辅助直播</h3><ul><li>AI生成直播话术</li><li>AI自动回复弹幕</li><li>AI实时数据分析</li><li>AI数字人24小时直播</li></ul>", tags: ["变现", "直播", "带货"] },
    { kbKey: "个人品牌建设/IP定位与人设打造", title: "IP定位与人设打造：让别人记住你", content: "<h2>IP定位：在用户心智中占据一个位置</h2><h3>一、定位三要素</h3><ul><li>你是谁？（人设标签：身份/特点/经历）</li><li>做什么？（内容方向：领域/形式/价值）</li><li>为谁做？（目标用户：画像/需求/场景）</li></ul><h3>二、人设打造方法</h3><ul><li>视觉识别：头像/封面/穿搭/场景风格统一</li><li>语言识别：口头禅/语气/表达方式</li><li>行为识别：固定栏目/标志性动作</li></ul><h3>三、AI辅助定位</h3><p>提示词：'分析以下5个同领域博主的人设标签，找出差异化空间：[竞品信息]'</p>", tags: ["个人品牌", "IP定位", "人设"] },
    { kbKey: "个人品牌建设/品牌视觉识别系统", title: "品牌视觉识别系统：统一风格指南", content: "<h2>视觉识别系统（VIS）</h2><h3>一、核心要素</h3><ul><li>Logo/头像：简洁有辨识度</li><li>主色调：1-2种主色+辅助色</li><li>字体：标题字体+正文字体</li><li>版式：封面/标题/字幕的排版规则</li></ul><h3>二、AI辅助设计</h3><ul><li>AI生成Logo方案（Midjourney/Seedream）</li><li>AI生成封面模板</li><li>Canva建立品牌模板套件</li></ul>", tags: ["个人品牌", "视觉", "设计"] },
    { kbKey: "个人品牌建设/品牌故事与差异化", title: "品牌故事与差异化策略：让别人选择你", content: "<h2>品牌故事：从'又一个博主'到'不可替代的存在'</h2><h3>一、差异化定位方法</h3><ul><li>蓝海定位：找出没人占据的定位</li><li>跨界定位：A领域+B领域=新定位</li><li>极致垂直：不做'美食博主'，做'一人食快手菜博主'</li></ul><h3>二、品牌故事要素</h3><ul><li>起源故事：为什么开始做自媒体</li><li>转折点：从失败到成功的历程</li><li>使命愿景：你在为谁解决什么问题</li></ul><h3>三、AI辅助</h3><ul><li>AI分析竞品定位，找出差异化空间</li><li>AI提炼个人故事核心要素</li></ul>", tags: ["个人品牌", "品牌故事", "差异化"] },
    { kbKey: "数据分析/数据指标体系", title: "数据指标体系：用数据驱动内容决策", content: "<h2>核心数据指标</h2><h3>一、曝光层</h3><ul><li>播放量/阅读量</li><li>展现量（平台给多少曝光）</li><li>点击率（CTR）：点击/展现</li></ul><h3>二、互动层</h3><ul><li>完播率：看完的比例（最重要）</li><li>点赞率：点赞/播放</li><li>评论率：评论/播放</li><li>转发率：转发/播放</li><li>收藏率：收藏/播放</li></ul><h3>三、转化层</h3><ul><li>涨粉率：新增粉丝/播放</li><li>转化率：下单/点击</li><li>ROI：投入产出比</li></ul>", tags: ["数据分析", "指标", "运营"] },
    { kbKey: "数据分析/内容复盘方法", title: "内容复盘方法：从数据中学习", content: "<h2>复盘是进步最快的方式</h2><h3>一、每日复盘（5分钟）</h3><ul><li>今天发的内容数据如何？</li><li>哪条最好？为什么？</li><li>哪条最差？为什么？</li></ul><h3>二、每周复盘（30分钟）</h3><ul><li>本周整体数据趋势</li><li>爆款内容分析（选题/标题/结构）</li><li>下周选题方向调整</li></ul><h3>三、AI辅助复盘</h3><p>提示词：'以下是本周5条内容的数据：[数据]。请分析：1.哪条最好/最差？2.成功/失败原因？3.下周选题建议？'</p>", tags: ["数据分析", "复盘", "方法论"] },
    { kbKey: "数据分析/用户画像分析", title: "用户画像分析方法：精准理解你的受众", content: "<h2>用户画像：内容创作的指南针</h2><h3>一、用户画像维度</h3><ul><li>基础属性：性别/年龄/地域/职业</li><li>行为特征：活跃时段/内容偏好/互动习惯</li><li>心理特征：核心痛点/核心需求/价值观</li><li>决策特征：信息获取渠道/消费习惯</li></ul><h3>二、AI辅助分析</h3><p>提示词：'以下是我最近30条内容的评论区数据：[评论]。请分析用户的核心痛点、最感兴趣的方向、用户画像'</p>", tags: ["数据分析", "用户画像", "受众"] },
    { kbKey: "AI持续迭代方案/AI辅助创作SOP", title: "AI辅助创作SOP：从选题到发布全流程", content: "<h2>AI辅助创作标准流程</h2><h3>第一步：AI选题（15分钟）</h3><ol><li>收集热点和用户需求</li><li>用AI生成10个选题建议</li><li>评估选题需求度×竞争度</li><li>选定1-2个选题</li></ol><h3>第二步：AI脚本（20分钟）</h3><ol><li>用AI生成初稿</li><li>人工修改调整（加入个人经历/观点）</li><li>优化开头钩子和结尾互动</li></ol><h3>第三步：素材制作（30分钟）</h3><ol><li>AI生成图片/视频素材</li><li>实拍补充</li><li>AI生成封面方案</li></ol><h3>第四步：剪辑发布（20分钟）</h3><ol><li>AI辅助剪辑（字幕/去口癖/裁剪）</li><li>AI生成多平台标题</li><li>定时发布</li></ol><p>总计：约1.5小时/条（传统方式需4-6小时）</p>", tags: ["AI工具", "SOP", "效率"] },
    { kbKey: "AI持续迭代方案/每周AI复盘流程", title: "每周AI复盘流程：数据驱动的内容优化", content: "<h2>每周日晚上1小时AI复盘</h2><h3>第一部分：数据收集（10分钟）</h3><ul><li>导出本周所有内容数据</li><li>收集评论区高频问题</li><li>记录本周热点话题</li></ul><h3>第二部分：AI分析（20分钟）</h3><p>提示词：'以下是我本周的内容数据：[数据]。请分析：1.本周表现最好/最差的内容 2.成功和失败的原因 3.选题趋势 4.下周选题建议10个 5.需要调整的地方'</p><h3>第三部分：策略调整（15分钟）</h3><ul><li>根据AI建议调整下周选题</li><li>优化内容结构和表现</li><li>更新选题库</li></ul><h3>第四部分：行动计划（15分钟）</h3><ul><li>制定下周内容日历</li><li>分配创作/拍摄/发布时间</li></ul>", tags: ["AI工具", "复盘", "SOP"] },
    { kbKey: "AI持续迭代方案/竞品AI分析", title: "竞品AI分析：用AI拆解竞品爆款", content: "<h2>竞品分析SOP</h2><h3>一、选择竞品</h3><ul><li>同领域、粉丝量相近或略高</li><li>选3-5个直接竞品</li><li>关注1-2个跨界参考</li></ul><h3>二、数据收集</h3><ul><li>收集竞品最近30天爆款内容</li><li>记录选题/标题/封面/时长</li></ul><h3>三、AI分析</h3><p>提示词：'分析以下竞品最近20条爆款内容：[列表]。请输出：1.选题规律 2.标题套路 3.封面风格 4.内容结构 5.我可以借鉴的点 6.我的差异化机会'</p><h3>四、行动计划</h3><ul><li>借鉴选题角度（不是抄袭内容）</li><li>找到差异化切入点</li><li>形成自己的内容策略</li></ul>", tags: ["AI工具", "竞品分析", "策略"] },
    { kbKey: "法律合规与版权保护/自媒体法律合规", title: "自媒体法律合规与版权保护完全指南", content: "<h2>合规是自媒体的生命线</h2><h3>一、广告法合规</h3><ul><li>禁用绝对化用语（最好/第一/100%）</li><li>广告需标注'广告'或'推广'</li></ul><h3>二、版权合规</h3><ul><li>音乐用平台自带库或AI生成</li><li>图片用免费素材库或AI生成</li><li>引用他人内容需标注来源</li></ul><h3>三、内容红线</h3><ul><li>不发布涉政/涉黄/涉暴内容</li><li>不造谣传谣</li><li>不侵犯他人名誉权/肖像权</li></ul><h3>四、AI内容合规</h3><ul><li>AI生成内容需标注</li><li>AI数字人/声音克隆需有授权</li></ul>", tags: ["法律合规", "版权", "风险"] },
    { kbKey: "法律合规与版权保护/税务与财务管理", title: "自媒体人税务与财务管理指南", content: "<h2>自媒体人的财务必修课</h2><h3>一、主体选择</h3><ul><li>个人：简单，税率较高</li><li>个体工商户：税率较低，可申请核定征收</li><li>有限公司：适合团队/高收入</li></ul><h3>二、税务优化</h3><ul><li>合理选择经营主体</li><li>保留成本发票</li><li>利用税收优惠</li><li>预留30%收入作为税务储备</li></ul><h3>三、财务管理</h3><ul><li>公私分开（专用银行账户）</li><li>使用记账工具</li><li>建立应急基金（3-6个月开支）</li></ul>", tags: ["法律合规", "税务", "财务管理"] },
    { kbKey: "工具箱与资源导航/2026必备工具清单", title: "2026自媒体必备工具清单（实时更新）", content: "<h2>2026年自媒体人工具箱</h2><h3>一、AI写作</h3><ul><li>豆包：中文写作/选题/免费</li><li>ChatGPT GPT-5.5：逻辑分析/结构化</li><li>Gemini 3.5 Flash：极速输出/完全免费</li></ul><h3>二、AI图片</h3><ul><li>Seedream：中文友好/免费</li><li>Midjourney V7：审美天花板</li></ul><h3>三、AI视频</h3><ul><li>Seedance 2.0：30秒高质量/免费</li><li>Runway Gen-4：电影级画面</li></ul><h3>四、AI音频</h3><ul><li>Suno V4：AI音乐生成</li><li>ElevenLabs：AI声音克隆</li></ul><h3>五、剪辑</h3><ul><li>剪映/CapCut：免费/AI功能强</li><li>Opus Clip：长视频自动切片</li></ul><h3>六、工具组合</h3><p>零成本：豆包+Seedream+Seedance+剪映</p>", tags: ["工具箱", "AI工具", "资源"] },
    { kbKey: "工具箱与资源导航/免费资源与素材库", title: "免费资源与素材库导航", content: "<h2>免费资源汇总</h2><h3>一、免费图片</h3><ul><li>Pexels / Unsplash / Pixabay</li></ul><h3>二、免费音乐</h3><ul><li>平台自带音乐库</li><li>Suno V4 AI生成</li></ul><h3>三、免费字体</h3><ul><li>思源黑体/宋体</li><li>阿里巴巴普惠体</li></ul><h3>四、免费AI工具</h3><ul><li>豆包 / Gemini Flash / 即梦AI</li></ul><h3>五、效率工具</h3><ul><li>Notion / 飞书 / 语雀</li></ul>", tags: ["工具箱", "免费资源", "素材"] },
    { kbKey: "创作者心态与时间管理/心态管理", title: "创作者心态管理：长期主义的生存指南", content: "<h2>心态决定走多远</h2><h3>一、新手期心态</h3><ul><li>先完成再完美，发布就是胜利</li><li>不比较，专注自己的节奏</li><li>先做20条再说，量变到质变</li></ul><h3>二、长期主义</h3><ul><li>把自媒体当5年的事业</li><li>每周进步1%，一年后提升50倍</li><li>把失败当数据，把成功当验证</li></ul><h3>三、应对恶评</h3><ul><li>恶评是流量的代价</li><li>不与喷子争论</li><li>建设性批评认真对待</li></ul>", tags: ["心态管理", "长期主义", "健康"] },
    { kbKey: "创作者心态与时间管理/时间管理与效率", title: "创作者时间管理方法论：20小时/周高效运营", content: "<h2>每周20小时高效运营</h2><h3>一、时间分配</h3><ul><li>选题调研：3小时（15%）</li><li>内容创作：8小时（40%）</li><li>剪辑后期：4小时（20%）</li><li>发布分发：1小时（5%）</li><li>数据复盘：2小时（10%）</li><li>学习提升：2小时（10%）</li></ul><h3>二、AI提效</h3><ul><li>选题：2小时→0.5小时（75%）</li><li>脚本：2小时→0.5小时（75%）</li><li>素材：3小时→1小时（67%）</li><li>剪辑：4小时→1.5小时（62%）</li></ul><h3>三、批量生产</h3><ul><li>集中拍摄：1天拍5-7条</li><li>AI批量生成脚本/封面</li><li>模板化内容填充</li></ul>", tags: ["时间管理", "效率", "AI工具"] },
    { kbKey: "2026趋势与未来展望/年度趋势报告", title: "2026自媒体趋势报告：AI重塑内容产业", content: "<h2>2026年：AI与自媒体深度融合之年</h2><h3>一、AI工具格局</h3><ul><li>写作：ChatGPT GPT-5.5 / Claude Opus 4.7 / Gemini 3.5 Flash</li><li>图片：Midjourney V7 / Flux Pro / Seedream</li><li>视频：Runway Gen-4 / Kling 2.0 / Seedance 2.0</li><li>音频：Suno V4 / ElevenLabs</li></ul><h3>二、关键趋势</h3><ul><li>一站式AI平台崛起（豆包/即梦AI/纳米AI）</li><li>AI辅助效率提升60-72%</li><li>AI自动化工作流</li><li>内容门槛持续降低</li></ul><h3>三、创作者策略</h3><ul><li>用AI的创作者淘汰不用AI的</li><li>AI是副驾驶，创意方向人来把控</li><li>建立文风库让AI学习你的风格</li></ul>", tags: ["2026趋势", "AI工具", "行业报告"] },
    { kbKey: "2026趋势与未来展望/未来展望与战略规划", title: "自媒体未来3年战略规划：拥抱AI浪潮", content: "<h2>未来3年战略</h2><h3>一、2026年</h3><ul><li>建立AI辅助创作SOP，实现日更</li><li>选定1-2个平台深耕</li><li>积累前1000个铁粉</li></ul><h3>二、2027年</h3><ul><li>AI全链路自动化</li><li>跨平台矩阵运营</li><li>知识付费产品化</li><li>月收入稳定1万+</li></ul><h3>三、2028年</h3><ul><li>IP品牌化</li><li>团队化/公司化运营</li><li>自有产品/品牌</li><li>AI数字人矩阵</li></ul><h3>四、核心竞争力</h3><ul><li>AI无法替代：个人经历、独特观点、审美判断、情感共鸣</li><li>AI赋能：内容产能10倍、数据分析、跨平台、自动化</li></ul>", tags: ["2026趋势", "战略规划", "AI工具"] },
  ];

  let docCount = 0;
  for (const doc of documents) {
    const kbId = kbMap[doc.kbKey];
    if (!kbId) {
      console.log(`[seed] WARNING: KB not found for ${doc.kbKey}`);
      continue;
    }
    const plainText = doc.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const created = await prisma.document.create({
      data: {
        title: doc.title,
        content: doc.content,
        plainText,
        wordCount: plainText.length,
        knowledgeBaseId: kbId,
        userId,
      },
    });
    
    // 关联标签
    for (const tagName of doc.tags || []) {
      const tag = tagMap[tagName];
      if (tag) {
        try {
          await prisma.documentTag.create({
            data: { documentId: created.id, tagId: tag.id },
          });
        } catch (e) { /* 忽略重复 */ }
      }
    }
    docCount++;
  }
  console.log(`[seed] Created ${docCount} documents`);

  // === 7. 创建小记 ===
  const notes = [
    { content: "【每日SOP】选题(15min)→AI脚本(20min)→素材(30min)→剪辑(20min)→发布。总计约1.5h/条", tags: ["效率", "SOP"] },
    { content: "【选题公式】需求度×竞争度×匹配度=选题价值。需求高竞争低最优先", tags: ["选题", "方法论"] },
    { content: "【AI写作四层次】L1润色→L2扩写→L3选题→L4风格定制。Level 3-4才是差异化", tags: ["AI工具", "写作"] },
    { content: "【流量池赛马】200→500→1000→5000→10000+。完播率是进入下一个池子的关键", tags: ["增长", "算法"] },
    { content: "【变现阶梯】0-1k创作激励→1k-1w广告带货→1w-10w品牌+课程→10w+IP品牌化", tags: ["变现", "规划"] },
    { content: "【法律红线】绝对化用语不能用。广告需标注。音乐用平台自带或AI生成", tags: ["法律合规", "版权"] },
    { content: "【心态管理】先完成再完美。自媒体是5年事业不是5个月。每周休息1天", tags: ["心态管理", "长期主义"] },
    { content: "【AI提效】选题75%+脚本75%+素材67%+剪辑62%=整体约70%提效。每周20h即可运营", tags: ["效率", "AI工具"] },
    { content: "【2026趋势】一站式AI平台崛起。豆包+即梦AI+纳米AI。用AI的创作者淘汰不用AI的", tags: ["2026趋势", "AI工具"] },
    { content: "【战略规划】2026建SOP+1000铁粉→2027全链路AI+知识付费→2028IP品牌化+团队运营", tags: ["战略规划", "2026趋势"] },
  ];

  let noteCount = 0;
  for (const note of notes) {
    const created = await prisma.note.create({
      data: { content: note.content, plainText: note.content, userId },
    });
    for (const tagName of note.tags || []) {
      const tag = tagMap[tagName];
      if (tag) {
        try {
          await prisma.noteTag.create({
            data: { noteId: created.id, tagId: tag.id },
          });
        } catch (e) { /* 忽略重复 */ }
      }
    }
    noteCount++;
  }
  console.log(`[seed] Created ${noteCount} notes`);

  // === 8. 创建视频分类和示例视频 ===
  console.log('[seed] Creating video categories...');
  
  const videoKb = await prisma.knowledgeBase.create({
    data: {
      name: "视频内容",
      icon: "🎬",
      categoryCode: "video",
      sortOrder: 8,
      userId,
    },
  });
  
  const videoChildren = [
    { name: "学习vlog", icon: "📹", sortOrder: 0 },
    { name: "读书分享", icon: "📚", sortOrder: 1 },
    { name: "成长记录", icon: "🌱", sortOrder: 2 },
    { name: "工具教程", icon: "🛠️", sortOrder: 3 },
  ];
  for (const child of videoChildren) {
    await prisma.knowledgeBase.create({
      data: { ...child, parentId: videoKb.id, userId },
    });
  }
  
  // 创建示例视频文章
  const videoPosts = [
    {
      title: "我的学习vlog：一天学10小时是种什么体验",
      videoDuration: "12:35",
      videoThumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a65738?w=800&h=450&fit=crop",
      isVideo: true,
      visibility: "public",
      content: "<p>很多人问我每天怎么能学那么久，今天就带大家看看我真实的一天学习生活。</p><h2>早上 6:30 起床</h2><p>起床后先喝一杯温水，然后做 10 分钟拉伸，让身体醒过来。</p><h2>上午 3 小时深度学习</h2><p>上午是精力最好的时候，用来做最难的事情。我一般安排英语学习或者深度阅读。</p><h2>下午 4 小时专项训练</h2><p>下午做练习题、复习笔记、整理知识体系。</p><h2>晚上 2 小时复盘</h2><p>晚上是复盘的时间，整理当天学了什么，哪些地方需要加强。</p>",
      kbName: "学习vlog",
    },
    {
      title: "读书分享：这本书改变了我的思考方式",
      videoDuration: "08:20",
      videoThumbnail: "https://images.unsplash.com/photo-1544716306-8beeada7d80b?w=800&h=450&fit=crop",
      isVideo: true,
      visibility: "public",
      content: "<p>今天给大家分享一本对我影响很大的书——《思考，快与慢》。</p><h2>为什么推荐这本书？</h2><p>这本书让我第一次意识到，人的大脑有两套思考系统，而我们大部分决策都是靠直觉做出的。</p><h2>三个最触动我的观点</h2><p><strong>1. 锚定效应</strong>：我们的判断很容易被第一个信息影响。</p><p><strong>2. 损失厌恶</strong>：失去的痛苦比得到的快乐更强烈。</p><p><strong>3. 峰终定律</strong>：我们对一段经历的记忆，只取决于峰值和结尾。</p>",
      kbName: "读书分享",
    },
    {
      title: "30天健身打卡：从零基础到养成运动习惯",
      videoDuration: "15:48",
      videoThumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2efda17a4?w=800&h=450&fit=crop",
      isVideo: true,
      visibility: "public",
      content: "<p>坚持健身 30 天了，来聊聊我的感受和变化。</p><h2>第 1 周：痛苦期</h2><p>刚开始真的很难，每次都想放弃。但我告诉自己，先坚持 7 天再说。</p><h2>第 2 周：适应期</h2><p>身体开始适应了，运动完不会那么累了。</p><h2>第 3 周：习惯期</h2><p>到第三周，不运动反而觉得不舒服了。</p><h2>第 4 周：享受期</h2><p>现在运动已经成了生活的一部分，享受每次出汗的感觉。</p>",
      kbName: "成长记录",
    },
    {
      title: "【工具教程】Notion 零基础入门，搭建你的知识体系",
      videoDuration: "22:15",
      videoThumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a65738?w=800&h=450&fit=crop",
      isVideo: true,
      visibility: "public",
      content: "<p>很多人问我用什么工具管理知识，今天就分享我的主力工具——Notion。</p><h2>为什么选 Notion？</h2><p>灵活、强大、可以自己搭建各种系统。</p><h2>基础操作</h2><p>页面、数据库、模板... 一步步带你入门。</p><h2>我的知识体系搭建</h2><p>展示我自己的知识库是怎么组织的。</p>",
      kbName: "工具教程",
    },
  ];
  
  let videoCount = 0;
  for (const vp of videoPosts) {
    const childKb = await prisma.knowledgeBase.findFirst({
      where: { parentId: videoKb.id, name: vp.kbName, userId },
    });
    if (!childKb) continue;
    
    const plainText = vp.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    await prisma.document.create({
      data: {
        title: vp.title,
        content: vp.content,
        plainText,
        wordCount: plainText.length,
        videoDuration: vp.videoDuration,
        videoThumbnail: vp.videoThumbnail || null,
        isVideo: vp.isVideo,
        visibility: vp.visibility,
        knowledgeBaseId: childKb.id,
        userId,
      },
    });
    videoCount++;
  }
  console.log(`[seed] Created ${videoCount} video posts`);

  // === 9. 创建用户设置 ===
  await prisma.userSettings.create({
    data: {
      userId,
      blogTitle: "晓桃终生成长",
      blogSubtitle: "记录学习、思考与成长的点滴",
      bio: "一个在终生学习路上的普通人。这里记录我的学习笔记、思考和成长。",
      avatarUrl: "",
      socialLinks: JSON.stringify({
        wechat: "",
        weibo: "",
        zhihu: "",
        xiaohongshu: "",
        email: "",
        github: "",
      }),
      defaultLicense: "all-rights",
      defaultAllowCopy: true,
      defaultAllowShare: true,
      aiConfig: null,
    },
  }).catch(() => {
    console.log('[seed] UserSettings already exists or table not available');
  });

  console.log('[seed] ✅ Production seed completed!');
  console.log(`[seed] Summary: 1 user, 8 root KBs, 12+4 categories, 33 subcategories, ${docCount + videoCount} docs, ${tagNames.length} tags, ${noteCount} notes`);
  console.log(`[seed] Login: email=${email}, password=${password}`);
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e);
    // 不退出失败，让构建继续
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
