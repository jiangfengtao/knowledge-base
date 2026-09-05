import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// ==================== 数据定义 ====================

// 一级分类（知识库）及其二级子分类
const CATEGORY_TREE = [
  {
    name: "学习成长",
    icon: "📚",
    color: "#6366f1",
    description: "英语学习、阅读方法、学习技巧",
    categoryCode: "blog-01",
    sortOrder: 1,
    children: [
      { name: "英语学习", icon: "🇬🇧", description: "英语学习方法与资源", sortOrder: 1 },
      { name: "阅读方法", icon: "📖", description: "高效阅读技巧与实践", sortOrder: 2 },
      { name: "学习方法论", icon: "🧠", description: "学习如何学习", sortOrder: 3 },
      { name: "记忆技巧", icon: "💡", description: "提升记忆力的方法", sortOrder: 4 },
    ],
  },
  {
    name: "思考笔记",
    icon: "💭",
    color: "#8b5cf6",
    description: "深度思考、认知升级、复盘",
    categoryCode: "blog-02",
    sortOrder: 2,
    children: [
      { name: "认知升级", icon: "🚀", description: "思维方式与认知提升", sortOrder: 1 },
      { name: "年度复盘", icon: "📅", description: "年度总结与回顾", sortOrder: 2 },
      { name: "行业洞察", icon: "🔍", description: "行业趋势与观察", sortOrder: 3 },
      { name: "随想", icon: "☁️", description: "日常思考与感悟", sortOrder: 4 },
    ],
  },
  {
    name: "自媒体运营",
    icon: "💰",
    color: "#f59e0b",
    description: "运营技巧、内容创作、变现",
    categoryCode: "blog-03",
    sortOrder: 3,
    children: [
      { name: "内容创作", icon: "✍️", description: "写作方法与内容技巧", sortOrder: 1 },
      { name: "平台运营", icon: "📱", description: "各平台运营经验", sortOrder: 2 },
      { name: "变现思路", icon: "💎", description: "知识变现与副业", sortOrder: 3 },
      { name: "工具推荐", icon: "🛠️", description: "运营必备工具", sortOrder: 4 },
    ],
  },
  {
    name: "生活方式",
    icon: "🌱",
    color: "#10b981",
    description: "健身、习惯养成、效率工具",
    categoryCode: "blog-04",
    sortOrder: 4,
    children: [
      { name: "健身打卡", icon: "💪", description: "健身记录与心得", sortOrder: 1 },
      { name: "习惯养成", icon: "🎯", description: "好习惯培养方法", sortOrder: 2 },
      { name: "效率工具", icon: "⚡", description: "提升效率的好工具", sortOrder: 3 },
      { name: "好物推荐", icon: "🎁", description: "生活好物分享", sortOrder: 4 },
    ],
  },
  {
    name: "读书笔记",
    icon: "📖",
    color: "#ec4899",
    description: "各类型读书笔记",
    categoryCode: "blog-05",
    sortOrder: 5,
    children: [
      { name: "成长类", icon: "🌿", description: "个人成长类书籍", sortOrder: 1 },
      { name: "认知类", icon: "🧩", description: "认知思维类书籍", sortOrder: 2 },
      { name: "工具类", icon: "🔧", description: "实用工具类书籍", sortOrder: 3 },
      { name: "文学类", icon: "📚", description: "文学小说类书籍", sortOrder: 4 },
    ],
  },
  {
    name: "会员专属",
    icon: "✨",
    color: "#ef4444",
    description: "深度教程、私密分享、成长社群",
    categoryCode: "blog-06",
    sortOrder: 6,
    children: [
      { name: "深度教程", icon: "🎓", description: "系统性深度教程", sortOrder: 1 },
      { name: "私密分享", icon: "🔒", description: "仅会员可见的分享", sortOrder: 2 },
      { name: "学习日记", icon: "📔", description: "每日学习记录", sortOrder: 3 },
      { name: "社群答疑", icon: "💬", description: "社群问答精选", sortOrder: 4 },
    ],
  },
  {
    name: "🎬 视频内容",
    icon: "🎬",
    color: "#f43f5e",
    description: "学习vlog、读书分享、成长记录、工具教程",
    categoryCode: "blog-07",
    sortOrder: 7,
    children: [
      { name: "学习vlog", icon: "📹", description: "学习过程记录与分享", sortOrder: 1 },
      { name: "读书分享", icon: "📚", description: "书籍推荐与读书心得", sortOrder: 2 },
      { name: "成长记录", icon: "🌱", description: "个人成长与生活记录", sortOrder: 3 },
      { name: "工具教程", icon: "🛠️", description: "实用工具使用教程", sortOrder: 4 },
    ],
  },
];

// 标签系统（一级标签 → 二级标签）
const TAG_TREE = [
  {
    name: "学习方法",
    color: "#6366f1",
    sortOrder: 1,
    children: ["费曼技巧", "番茄工作法", "记忆宫殿", "刻意练习"],
  },
  {
    name: "英语学习",
    color: "#8b5cf6",
    sortOrder: 2,
    children: ["听力训练", "口语练习", "单词记忆", "英语阅读"],
  },
  {
    name: "阅读",
    color: "#ec4899",
    sortOrder: 3,
    children: ["书单推荐", "读书笔记", "快速阅读", "深度阅读"],
  },
  {
    name: "思考成长",
    color: "#f59e0b",
    sortOrder: 4,
    children: ["深度思考", "认知偏差", "复盘方法", "思维模型"],
  },
  {
    name: "个人成长",
    color: "#10b981",
    sortOrder: 5,
    children: ["习惯养成", "自律", "时间管理", "目标管理"],
  },
  {
    name: "自媒体",
    color: "#ef4444",
    sortOrder: 6,
    children: ["内容创作", "涨粉技巧", "知识变现", "个人IP"],
  },
  {
    name: "效率工具",
    color: "#14b8a6",
    sortOrder: 7,
    children: ["AI工具", "笔记软件", "效率App", "生产力"],
  },
  {
    name: "生活方式",
    color: "#84cc16",
    sortOrder: 8,
    children: ["健身", "早起", "极简生活", "好物分享"],
  },
];

// ==================== 示例文章 ====================

interface SamplePost {
  title: string;
  content: string;
  visibility: "public" | "members" | "private";
  category: string;
  subCategory: string;
  tags: string[];
  isVideo?: boolean;
  videoUrl?: string;
  videoDuration?: string;
  videoThumbnail?: string;
}

const SAMPLE_POSTS: SamplePost[] = [
  // ===== 公开文章（10篇）=====
  {
    title: "如何高效学习英语：我的三年自学经验分享",
    category: "学习成长",
    subCategory: "英语学习",
    visibility: "public",
    tags: ["英语学习", "听力训练", "口语练习"],
    content: `<h1>如何高效学习英语：我的三年自学经验分享</h1><p>很多人问我，英语是怎么学好的？其实没有捷径，但有方法。今天分享一下我三年来自学英语的一些心得。</p><h2>一、明确目标，找对方向</h2><p>学英语之前，先想清楚你为什么学？是为了考试？为了工作？还是为了看美剧、出国旅游？</p><p>不同的目标，学习的重点完全不一样。</p><h2>二、输入是基础，输出是升华</h2><p>语言学习的规律是：先有大量输入，才能有输出。就像我们学母语，也是先听了好几年才会说话。</p><blockquote>没有足够的输入，就急于开口说，说出来的永远是「中式英语」。</blockquote><h2>三、坚持比方法更重要</h2><p>再好的方法，不坚持也没用。学语言是个慢功夫，每天 30 分钟，坚持一年，比突击一个月有效得多。</p><p>最后想说：<em>语言学习没有「太晚了」这回事，最好的时间就是现在。</em> 一起加油！</p>`,
  },
  {
    title: "费曼学习法：用输出倒逼输入",
    category: "学习成长",
    subCategory: "学习方法论",
    visibility: "public",
    tags: ["学习方法", "费曼技巧", "深度思考"],
    content: `<h1>费曼学习法：用输出倒逼输入</h1><p>费曼学习法是诺贝尔物理学奖得主理查德·费曼发明的学习方法，核心只有四步，但威力巨大。</p><h2>什么是费曼学习法？</h2><p>简单来说就是：如果你不能用简单的语言把一个概念讲清楚，说明你还没有真正理解它。</p><h2>四个步骤</h2><p>第一步：选择一个概念<br>第二步：用最简单的话解释它<br>第三步：找出你的知识缺口<br>第四步：简化和类比</p><blockquote>教是最好的学。当你要向别人解释一个概念时，你的大脑会被迫进行深度思考。</blockquote><h2>如何实践？</h2><p>写学习笔记、在社交平台分享、给朋友讲解、录视频或音频...试试看，你会发现自己的学习效率提升不止一个档次。</p>`,
  },
  {
    title: "为什么你学了那么多，却还是过不好这一生？",
    category: "思考笔记",
    subCategory: "认知升级",
    visibility: "public",
    tags: ["思考成长", "认知偏差", "深度思考"],
    content: `<h1>为什么你学了那么多，却还是过不好这一生？</h1><p>这是一个扎心但真实的问题。很多人每天都在学习、看书、听课，但生活似乎并没有什么改变。</p><h2>问题出在哪里？</h2><h3>1. 学而不思</h3><p>很多人的学习只是「信息收集」，不是「知识消化」。</p><h3>2. 知行不合一</h3><p>知道和做到之间有巨大的鸿沟。</p><blockquote>知道但做不到，等于不知道。</blockquote><h3>3. 贪多嚼不烂</h3><p>今天学英语、明天学编程、后天学理财...什么都想学，结果什么都没学好。</p><h2>怎么破局？</h2><p>以「用」为导向、少即是多、定期复盘...学习的目的不是为了囤积知识，而是为了改变生活。</p>`,
  },
  {
    title: "2025年度复盘：在不确定中寻找确定",
    category: "思考笔记",
    subCategory: "年度复盘",
    visibility: "public",
    tags: ["思考成长", "复盘方法", "目标管理"],
    content: `<h1>2025年度复盘：在不确定中寻找确定</h1><p>又到了一年一度的复盘时间。2025 年对我来说是充满变化的一年，有收获，也有遗憾。</p><h2>一、今年做了什么？</h2><p>公众号粉丝从 5000 涨到了 20000<br>读完了 36 本书<br>开设了第一个知识付费课程<br>坚持每周健身 3 次</p><h2>二、今年最大的收获</h2><p>1. 理解了「慢就是快」<br>2. 学会了说「不」<br>3. 身体是革命的本钱</p><blockquote>很多事情就像种庄稼，你不能拔苗助长。该浇水浇水，该施肥施肥，剩下的交给时间。</blockquote><h2>三、明年的计划</h2><p>保持每周 2 篇内容、打磨好课程、每天 30 分钟英语、坚持健身...</p>`,
  },
  {
    title: "新手做自媒体的5个误区",
    category: "自媒体运营",
    subCategory: "内容创作",
    visibility: "public",
    tags: ["自媒体", "内容创作", "个人IP"],
    content: `<h1>新手做自媒体的5个误区</h1><p>最近很多朋友问我怎么做自媒体，发现大家都踩过同样的坑。今天总结一下新手最容易犯的 5 个错误。</p><h2>误区一：想太多，做太少</h2><p>「我还没准备好」「我不知道写什么」... 永远在准备，永远不开始。</p><h2>误区二：追热点，丢定位</h2><p>什么火就发什么，结果粉丝不知道你到底是干嘛的。</p><h2>误区三：只看数据，不看价值</h2><blockquote>数据是结果，不是目标。你的目标应该是：我有没有给读者提供价值？</blockquote><h2>误区四：追求完美，不敢发布</h2><p>完成比完美重要。先完成，再完美。</p><h2>误区五：单打独斗，闭门造车</h2><p>找到你的「同行者」，互相鼓励、互相学习，你会走得更远。</p>`,
  },
  {
    title: "公众号、小红书、知乎，哪个更适合新手？",
    category: "自媒体运营",
    subCategory: "平台运营",
    visibility: "public",
    tags: ["自媒体", "涨粉技巧", "内容创作"],
    content: `<h1>公众号、小红书、知乎，哪个更适合新手？</h1><p>经常有人问我：想做自媒体，应该从哪个平台开始？今天就来对比一下三大主流平台的特点。</p><h2>一、公众号</h2><p>优点：粉丝价值最高、内容寿命长、变现方式多<br>缺点：冷启动难、对内容要求高</p><h2>二、小红书</h2><p>优点：起号快、用户消费力强、创作门槛低<br>缺点：内容寿命短、粉丝粘性低</p><h2>三、知乎</h2><p>优点：长尾效应极强、用户质量高、信任度高<br>缺点：起号慢、对专业度要求高</p><blockquote>新手不要纠结选哪个平台，先选一个你最容易上手的开始做。</blockquote>`,
  },
  {
    title: "如何用21天养成一个好习惯",
    category: "生活方式",
    subCategory: "习惯养成",
    visibility: "public",
    tags: ["个人成长", "习惯养成", "自律"],
    content: `<h1>如何用21天养成一个好习惯</h1><p>很多人觉得养成习惯很难，其实是方法不对。今天分享我亲测有效的 21 天习惯养成法。</p><h2>第一步：选对习惯</h2><p>不要贪多，一次只养成一个习惯。而且这个习惯要足够小，小到你不可能失败。</p><blockquote>习惯的关键不是量有多大，而是每天都做。</blockquote><h2>第二步：设定触发点</h2><p>把新习惯和你每天必做的事情绑定在一起。</p><h2>第三步：记录和追踪</h2><p>用日历或 App 记录你的完成情况。看着连续的勾越来越多，你会有一种不想断掉的动力。</p><h2>第四步：允许失败，但不要连续失败</h2><p>偶尔断一天很正常，但永远不要连续失败两天。</p><h2>第五步：逐步加码</h2><p>当你能连续 21 天完成，再慢慢增加量。循序渐进，你会发现自己不知不觉就坚持下来了。</p>`,
  },
  {
    title: "我每天都在用的5个效率工具",
    category: "生活方式",
    subCategory: "效率工具",
    visibility: "public",
    tags: ["效率工具", "生产力", "AI工具"],
    content: `<h1>我每天都在用的5个效率工具</h1><p>工欲善其事，必先利其器。今天分享 5 个我每天都在用、大大提升效率的工具。</p><h2>1. Notion — 我的第二大脑</h2><p>所有的学习笔记、项目管理、日程安排都在里面。</p><h2>2. AI 助手</h2><blockquote>AI 不能替你思考，但能帮你节省大量时间。</blockquote><h2>3. 番茄钟 — 专注神器</h2><p>25 分钟专注 + 5 分钟休息，统计每天的专注时长。</p><h2>4. 滴答清单 — 任务管理</h2><p>所有待办事项都放在这里，不用记在脑子里。</p><h2>5. Flomo — 随手记</h2><p>有了想法随时记下来，不用打开复杂的笔记软件。</p><p>工具只是辅助，真正重要的是你想用它来做什么。</p>`,
  },
  {
    title: "《原子习惯》读书笔记：1%的进步，复利的人生",
    category: "读书笔记",
    subCategory: "成长类",
    visibility: "public",
    tags: ["阅读", "读书笔记", "个人成长", "习惯养成"],
    content: `<h1>《原子习惯》读书笔记：1%的进步，复利的人生</h1><p>这本书我读了三遍，每次读都有新收获。今天分享一些对我影响最大的观点。</p><h2>核心观点：不要盯着目标，要关注系统</h2><p>很多人设定目标，但作者说，目标不重要，系统才重要。</p><blockquote>目标和系统不矛盾。目标决定方向，系统决定进度。</blockquote><h2>习惯养成的四个步骤</h2><p>1. 提示（让它显而易见）<br>2. 渴望（让它有吸引力）<br>3. 反应（让它简单易行）<br>4. 奖励（让它令人满足）</p><h2>最改变我的三个认知</h2><p>身份认同比行为改变更重要<br>1% 的进步，复利的力量<br>环境设计比意志力更靠谱</p><p>这是一本我逢人就推荐的书。</p>`,
  },
  {
    title: "《思考，快与慢》读书笔记：你的大脑其实很不靠谱",
    category: "读书笔记",
    subCategory: "认知类",
    visibility: "public",
    tags: ["阅读", "读书笔记", "思考成长", "认知偏差"],
    content: `<h1>《思考，快与慢》读书笔记：你的大脑其实很不靠谱</h1><p>诺贝尔经济学奖得主丹尼尔·卡尼曼的经典著作。读完这本书，你会发现：原来我们每天都在犯各种认知错误。</p><h2>大脑的两个系统</h2><p><strong>系统 1：快思考</strong> — 直觉、自动反应、不需要费力</p><p><strong>系统 2：慢思考</strong> — 理性思考、需要集中注意力</p><blockquote>我们以为自己是理性的，但实际上，我们大部分时间都在用系统 1 做决策。</blockquote><h2>常见的认知偏差</h2><p>锚定效应、可得性启发、损失厌恶、确认偏误...</p><h2>如何避免？</h2><p>意识到自己可能错了、用数据说话、引入外部视角、慢下来...</p>`,
  },

  // ===== 视频内容（4个公开视频）=====
  {
    title: "我的晨间学习routine分享",
    category: "🎬 视频内容",
    subCategory: "学习vlog",
    visibility: "public",
    tags: ["学习方法", "自律", "早起"],
    isVideo: true,
    videoDuration: "8:32",
    videoThumbnail: "https://images.unsplash.com/photo-1499750310107-5fef28a65738?w=800&h=450&fit=crop",
    content: `<h1>我的晨间学习routine分享</h1><p>很多人好奇我每天早上是怎么安排学习的，今天就用视频记录一下我的晨间学习日常。</p><h2>视频内容概览</h2><ul><li>06:30 起床 + 冥想</li><li>07:00 英语听力 30分钟</li><li>07:30 阅读 + 笔记</li><li>08:30 运动 + 早餐</li><li>09:00 开始深度工作</li></ul><blockquote>早上的时间是一天中最宝贵的，没有人打扰，精力也最充沛。</blockquote><p>完整内容请看视频～</p>`,
  },
  {
    title: "3分钟学会费曼学习法",
    category: "🎬 视频内容",
    subCategory: "工具教程",
    visibility: "public",
    tags: ["学习方法", "费曼技巧"],
    isVideo: true,
    videoDuration: "3:15",
    videoThumbnail: "https://images.unsplash.com/photo-1544716306-8beeada7d80b?w=800&h=450&fit=crop",
    content: `<h1>3分钟学会费曼学习法</h1><p>费曼学习法是公认最高效的学习方法之一，今天用 3 分钟给你讲清楚。</p><h2>核心原理</h2><p>如果你不能用简单的语言把一个概念讲给一个10岁的孩子听，说明你还没有真正理解它。</p><h2>四个步骤</h2><ol><li>选择一个概念</li><li>用最简单的话解释</li><li>找出知识缺口</li><li>简化和类比</li><li></ol><p>详细讲解请看视频～</p>`,
  },
  {
    title: "5月读书报告：这个月我读了6本书",
    category: "🎬 视频内容",
    subCategory: "读书分享",
    visibility: "public",
    tags: ["阅读", "书单推荐", "读书笔记"],
    isVideo: true,
    videoDuration: "12:45",
    videoThumbnail: "https://images.unsplash.com/photo-1488190211105-8b0fc5308247?w=800&h=450&fit=crop",
    content: `<h1>5月读书报告：这个月我读了6本书</h1><p>5月份一共读了 6 本书，今天来给大家分享一下。</p><h2>本月书单</h2><ul><li>《原子习惯》⭐⭐⭐⭐⭐ 强烈推荐</li><li>《思考，快与慢》⭐⭐⭐⭐ 有点难读但很有价值</li><li>《人类简史》⭐⭐⭐⭐ 拓宽视野</li><li>《刻意练习》⭐⭐⭐⭐ 方法论类</li><li>《小王子》⭐⭐⭐⭐⭐ 重温经典</li><li>《高效能人士的七个习惯》⭐⭐⭐ 有点过时但经典</li></ul><p>每本书的详细分享请看视频～</p>`,
  },
  {
    title: "从零开始做博主的第100天",
    category: "🎬 视频内容",
    subCategory: "成长记录",
    visibility: "public",
    tags: ["自媒体", "个人成长", "内容创作"],
    isVideo: true,
    videoDuration: "10:20",
    videoThumbnail: "https://images.unsplash.com/photo-1571019613454-1cb2efda17a4?w=800&h=450&fit=crop",
    content: `<h1>从零开始做博主的第100天</h1><p>今天是我做自媒体的第 100 天，想拍个视频记录一下这段时间的收获和感悟。</p><h2>100天的成果</h2><ul><li>发布了 30 篇内容</li><li>粉丝从 0 涨到了 3000+</li><li>接到了第一单广告</li><li>认识了很多同频的朋友</li></ul><h2>最大的感悟</h2><blockquote>开始比完美重要。行动比想重要。</blockquote><p>详细的心路历程请看视频～</p>`,
  },

  // ===== 会员文章（5篇）=====
  {
    title: "我的英语听力训练系统（完整版）",
    category: "会员专属",
    subCategory: "深度教程",
    visibility: "members",
    tags: ["英语学习", "听力训练", "深度教程"],
    content: `<h1>我的英语听力训练系统（完整版）</h1><p>这是我花了三年时间打磨的英语听力训练方法。按照这个方法坚持 6 个月，你的听力会有质的飞跃。</p><h2>一、核心理念：可理解性输入</h2><p>只要输入足够多的「可理解的」内容，语言自然就能学会。</p><blockquote>太难的内容听不懂会放弃，太简单的内容没有进步。找到「i+1」的难度是关键。</blockquote><h2>二、材料选择</h2><p>初级：ESL Pod、BBC Learning English、英语动画片</p><p>中级：TED-Ed、Crash Course、英语有声书</p><p>高级：TED 演讲、播客、美剧（去字幕）</p><h2>三、训练方法：精听 + 泛听结合</h2><p>精听每天 30 分钟，泛听越多越好。</p><p>坚持 1 个月就能感觉到变化，3 个月会有明显进步，6 个月能上一个大台阶。</p>`,
  },
  {
    title: "从零开始做自媒体：6个月涨粉1万的完整路径",
    category: "会员专属",
    subCategory: "深度教程",
    visibility: "members",
    tags: ["自媒体", "内容创作", "涨粉技巧", "个人IP"],
    content: `<h1>从零开始做自媒体：6个月涨粉1万的完整路径</h1><p>很多人觉得涨粉 1 万很难，其实只要方法对，6 个月足够了。</p><h2>第 1 个月：定位和准备</h2><p>确定你的赛道（能力 + 热情 + 需求的交集），做好账号基础设置。</p><h2>第 2 个月：内容冷启动</h2><p>先做 20 篇内容储备，研究爆款的底层逻辑。</p><blockquote>不是让你抄袭，而是学习爆款的底层逻辑。</blockquote><h2>第 3 个月：找到爆款公式</h2><p>分析数据，找到你的「爆款公式」，然后重复它。</p><h2>第 4-5 个月：矩阵和互推</h2><p>多平台分发，找同频博主互推。</p><h2>第 6 个月：变现尝试</h2><p>广告、付费社群、课程/产品...</p>`,
  },
  {
    title: "我是如何通过知识付费赚到第一个10万的",
    category: "会员专属",
    subCategory: "私密分享",
    visibility: "members",
    tags: ["自媒体", "知识变现", "私密分享"],
    content: `<h1>我是如何通过知识付费赚到第一个10万的</h1><p>这是一篇比较私密的分享，聊聊我做知识付费的完整经历。</p><h2>为什么做知识付费？</h2><p>粉丝多了之后，经常有人问能不能系统地教。既然有需求，为什么不试试呢？</p><h2>第一门课：从 0 到 1</h2><p>定价 99 元，第一期招了 120 多人，收入 1 万多。</p><h2>迭代和涨价</h2><blockquote>课程的价值感是一点点做出来的，不是一开始就有的。</blockquote><h2>踩过的坑</h2><p>不要一开始就追求完美、社群运营很花时间、不要过度承诺...</p><h2>给你的建议</h2><p>先有粉丝再做产品、从小处开始、重视口碑、长期主义...</p>`,
  },
  {
    title: "30天深度学习实验：每天学习8小时是什么体验",
    category: "会员专属",
    subCategory: "学习日记",
    visibility: "members",
    tags: ["学习方法", "学习日记", "深度思考"],
    content: `<h1>30天深度学习实验：每天学习8小时是什么体验</h1><p>上个月我做了一个实验：连续 30 天，每天深度学习 8 小时。</p><h2>第一周：鸡血期</h2><p>刚开始干劲十足，感觉自己要起飞了。</p><h2>第二周：疲劳期</h2><p>明显感觉累了，有效学习时间可能只有 5-6 小时。</p><blockquote>学习时间不等于学习效果。坐在书桌前 8 小时，不代表你真的学了 8 小时。</blockquote><h2>第三周：调整期</h2><p>开始调整策略：时间改成 6 小时，增加运动，用番茄工作法...</p><h2>第四周：稳定期</h2><p>找到了节奏，状态很稳定。</p><h2>最重要的发现</h2><p>意志力是有限的、深度工作 4 小时 > 摸鱼 8 小时、运动是最好的休息、输出比输入重要...</p>`,
  },
  {
    title: "知识变现的5种模式，适合普通人的是哪一种？",
    category: "自媒体运营",
    subCategory: "变现思路",
    visibility: "members",
    tags: ["自媒体", "知识变现", "个人IP"],
    content: `<h1>知识变现的5种模式，适合普通人的是哪一种？</h1><p>很多人想做知识变现，但不知道从哪里开始。今天来拆解一下 5 种主流模式。</p><h2>模式一：广告变现</h2><p>简单直接，但需要大量粉丝。</p><h2>模式二：付费社群</h2><p>收入稳定，用户粘性高，但需要持续运营。</p><blockquote>社群的核心不是内容，而是连接。</blockquote><h2>模式三：线上课程</h2><p>一次制作，多次销售，边际成本低。</p><h2>模式四：一对一咨询</h2><p>客单价高，起步快，但时间换钱。</p><h2>模式五：付费产品/工具</h2><p>可规模化，天花板高，但需要技术能力。</p><h2>普通人从哪里开始？</h2><p>从一对一咨询开始 → 付费社群 → 线上课程 → 产品，逐步升级。</p>`,
  },

  // ===== 私密文章（3篇）=====
  {
    title: "关于人生意义的一些碎碎念（草稿）",
    category: "思考笔记",
    subCategory: "随想",
    visibility: "private",
    tags: ["思考成长", "深度思考"],
    content: `<h1>关于人生意义的一些碎碎念（草稿）</h1><p>最近一直在想：人活着到底是为了什么？</p><p>年轻的时候觉得要赚大钱、要出人头地。现在慢慢觉得，那些好像也没那么重要。</p><h2>目前的答案</h2><p>人生可能本来就没有什么意义。意义是我们自己赋予的。</p><ul><li>体验：尽可能多地体验这个世界</li><li>成长：成为更好的自己</li><li>连接：和喜欢的人建立深度的关系</li><li>创造：留下一些有价值的东西</li></ul><p>（这是一篇草稿，以后想清楚了再整理）</p>`,
  },
  {
    title: "我的健身计划（私人记录）",
    category: "生活方式",
    subCategory: "健身打卡",
    visibility: "private",
    tags: ["生活方式", "健身"],
    content: `<h1>我的健身计划（私人记录）</h1><p>从今年开始认真健身，记录一下计划和进度。</p><h2>目标</h2><ul><li>体脂率从 22% 降到 15%</li><li>体重保持在 65kg 左右</li><li>能做 10 个引体向上</li></ul><h2>训练计划</h2><p>周一：胸 + 三头<br>周三：背 + 二头<br>周五：腿 + 肩</p><h2>饮食计划</h2><p>每天 100g 蛋白质、训练日多吃碳水、每天 2L 水...</p><p>（待更新）</p>`,
  },
  {
    title: "社群问答精选草稿V1",
    category: "会员专属",
    subCategory: "社群答疑",
    visibility: "private",
    tags: ["自媒体", "社群答疑"],
    content: `<h1>社群问答精选草稿V1</h1><p>整理了一些社群里大家问得比较多的问题。</p><h2>问题1：刚开始做自媒体，不知道写什么怎么办？</h2><p>从你最常被问到的问题开始、从学习笔记开始、从踩过的坑开始...</p><h2>问题2：如何保持日更的动力？</h2><p>不要日更。不要为了更新而更新。建立素材库、设定最低输出标准、找同频朋友互相监督...</p><p>（更多问题整理中...）</p>`,
  },
];

// ==================== 主函数 ====================

export async function seedContentArchitecture() {
  const user = await getDefaultUser();
  const userId = user.id;

  // ========== 1. 清理旧的博客分类 ==========
  const oldBlogKbs = await prisma.knowledgeBase.findMany({
    where: {
      userId,
      categoryCode: { startsWith: "blog-" },
    },
    select: { id: true },
  });
  const oldKbIds = oldBlogKbs.map((k) => k.id);

  if (oldKbIds.length > 0) {
    // 删除相关文档标签
    const oldDocs = await prisma.document.findMany({
      where: { knowledgeBaseId: { in: oldKbIds } },
      select: { id: true },
    });
    const oldDocIds = oldDocs.map((d) => d.id);

    if (oldDocIds.length > 0) {
      await prisma.documentTag.deleteMany({ where: { documentId: { in: oldDocIds } } });
      await prisma.document.deleteMany({ where: { id: { in: oldDocIds } } });
    }

    await prisma.knowledgeBase.deleteMany({ where: { id: { in: oldKbIds } } });
  }

  // ========== 2. 清理旧标签 ==========
  const tagNamesToRecreate: string[] = [];
  for (const parent of TAG_TREE) {
    tagNamesToRecreate.push(parent.name);
    tagNamesToRecreate.push(...parent.children);
  }

  const oldTags = await prisma.tag.findMany({
    where: { userId, name: { in: tagNamesToRecreate } },
    select: { id: true },
  });
  const oldTagIds = oldTags.map((t) => t.id);

  if (oldTagIds.length > 0) {
    await prisma.documentTag.deleteMany({ where: { tagId: { in: oldTagIds } } });
    await prisma.noteTag.deleteMany({ where: { tagId: { in: oldTagIds } } });
    await prisma.tag.deleteMany({ where: { id: { in: oldTagIds } } });
  }

  // ========== 3. 创建知识库分类树 ==========
  const kbMap = new Map<string, { id: string; children: Map<string, string> }>();

  for (const parent of CATEGORY_TREE) {
    const parentKb = await prisma.knowledgeBase.create({
      data: {
        name: parent.name,
        description: parent.description,
        icon: parent.icon,
        color: parent.color,
        categoryCode: parent.categoryCode,
        sortOrder: parent.sortOrder,
        userId,
      },
    });

    const childMap = new Map<string, string>();
    for (const child of parent.children) {
      const childKb = await prisma.knowledgeBase.create({
        data: {
          name: child.name,
          description: child.description,
          icon: child.icon,
          parentId: parentKb.id,
          sortOrder: child.sortOrder,
          userId,
        },
      });
      childMap.set(child.name, childKb.id);
    }

    kbMap.set(parent.name, { id: parentKb.id, children: childMap });
  }

  // ========== 4. 创建标签体系 ==========
  const tagMap = new Map<string, string>();

  for (const parent of TAG_TREE) {
    const parentTag = await prisma.tag.create({
      data: {
        name: parent.name,
        color: parent.color,
        sortOrder: parent.sortOrder,
        userId,
      },
    });
    tagMap.set(parent.name, parentTag.id);

    let childSortOrder = 1;
    for (const childName of parent.children) {
      const childTag = await prisma.tag.create({
        data: {
          name: childName,
          parentId: parentTag.id,
          sortOrder: childSortOrder,
          userId,
        },
      });
      tagMap.set(childName, childTag.id);
      childSortOrder++;
    }
  }

  // ========== 5. 创建示例文章 ==========
  let publicCount = 0;
  let membersCount = 0;
  let privateCount = 0;

  for (const post of SAMPLE_POSTS) {
    const categoryInfo = kbMap.get(post.category);
    if (!categoryInfo) continue;

    const subKbId = categoryInfo.children.get(post.subCategory);
    if (!subKbId) continue;

    const plainText = post.content.replace(/<[^>]*>/g, "").trim();
    const wordCount = plainText.length;

    const doc = await prisma.document.create({
      data: {
        title: post.title,
        content: post.content,
        plainText,
        wordCount,
        knowledgeBaseId: subKbId,
        userId,
        visibility: post.visibility,
        allowShare: true,
        allowCopy: true,
        license: "cc-by-nc-sa",
        isVideo: post.isVideo || false,
        videoUrl: post.videoUrl || "",
        videoDuration: post.videoDuration || "",
        videoThumbnail: post.videoThumbnail || null,
      },
    });

    // 关联标签
    for (const tagName of post.tags) {
      const tagId = tagMap.get(tagName);
      if (tagId) {
        await prisma.documentTag.create({
          data: { documentId: doc.id, tagId },
        });
      }
    }

    if (post.visibility === "public") publicCount++;
    else if (post.visibility === "members") membersCount++;
    else privateCount++;
  }

  // ========== 6. 初始化用户设置 ==========
  const existingSettings = await prisma.userSettings.findUnique({ where: { userId } });
  if (!existingSettings) {
    await prisma.userSettings.create({
      data: {
        userId,
        blogTitle: "晓桃终生成长",
        blogSubtitle: "记录学习、思考与成长的点滴。关于英语学习、个人成长、以及那些让生活更美好的小发现。",
        bio: "你好，我是晓桃。一个在终生学习路上的普通人。这里记录我的学习笔记、思考和成长。关于自媒体运营、个人成长、以及那些让生活更美好的小发现。我相信知识的力量，也相信分享的价值。",
        avatarUrl: "",
        socialLinks: JSON.stringify({
          wechat: "",
          weibo: "",
          zhihu: "",
          xiaohongshu: "",
          email: "",
          github: "",
        }),
        defaultLicense: "cc-by-nc-sa",
        defaultAllowCopy: true,
        defaultAllowShare: true,
      },
    });
  }

  return {
    success: true,
    message: "内容架构初始化完成",
    categories: CATEGORY_TREE.length,
    subCategories: CATEGORY_TREE.reduce((sum, c) => sum + c.children.length, 0),
    tags: tagMap.size,
    publicPosts: publicCount,
    memberPosts: membersCount,
    privatePosts: privateCount,
    totalPosts: publicCount + membersCount + privateCount,
  };
}
