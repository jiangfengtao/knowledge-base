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
  category: string; // 一级分类名
  subCategory: string; // 二级分类名
  tags: string[];
}

const SAMPLE_POSTS: SamplePost[] = [
  // ===== 公开文章（10篇）=====
  {
    title: "如何高效学习英语：我的三年自学经验分享",
    category: "学习成长",
    subCategory: "英语学习",
    visibility: "public",
    tags: ["英语学习", "听力训练", "口语练习"],
    content: `
<h1>如何高效学习英语：我的三年自学经验分享</h1>
<p>很多人问我，英语是怎么学好的？其实没有捷径，但有方法。今天分享一下我三年来自学英语的一些心得。</p>

<h2>一、明确目标，找对方向</h2>
<p>学英语之前，先想清楚你为什么学？是为了考试？为了工作？还是为了看美剧、出国旅游？</p>
<p>不同的目标，学习的重点完全不一样。比如：</p>
<ul>
<li><strong>应试</strong>：重点在词汇、语法、做题技巧</li>
<li><strong>口语</strong>：重点在听力输入、模仿跟读、大胆开口</li>
<li><strong>阅读</strong>：重点在词汇量、阅读速度、理解能力</li>
</ul>

<h2>二、输入是基础，输出是升华</h2>
<p>语言学习的规律是：先有大量输入，才能有输出。就像我们学母语，也是先听了好几年才会说话。</p>

<blockquote>没有足够的输入，就急于开口说，说出来的永远是「中式英语」。</blockquote>

<p>我的建议是：前 6 个月只做输入（听和读），不急着说。等积累到一定程度，自然就会想说了。</p>

<h2>三、坚持比方法更重要</h2>
<p>再好的方法，不坚持也没用。学语言是个慢功夫，每天 30 分钟，坚持一年，比突击一个月有效得多。</p>

<p>分享一个小技巧：把英语融入生活。比如：</p>
<ol>
<li>手机系统改成英文</li>
<li>看美剧去掉字幕</li>
<li>每天听 15 分钟英语播客</li>
<li>用英语写日记</li>
</ol>

<hr>
<p>最后想说：<em>语言学习没有「太晚了」这回事，最好的时间就是现在。</em> 一起加油！</p>
    `.trim(),
  },
  {
    title: "费曼学习法：用输出倒逼输入",
    category: "学习成长",
    subCategory: "学习方法论",
    visibility: "public",
    tags: ["学习方法", "费曼技巧", "深度思考"],
    content: `
<h1>费曼学习法：用输出倒逼输入</h1>
<p>费曼学习法是诺贝尔物理学奖得主理查德·费曼发明的学习方法，核心只有四步，但威力巨大。</p>

<h2>什么是费曼学习法？</h2>
<p>简单来说就是：如果你不能用简单的语言把一个概念讲清楚，说明你还没有真正理解它。</p>

<h2>四个步骤</h2>

<h3>第一步：选择一个概念</h3>
<p>拿出一张白纸，写下你想学习的概念或主题。</p>

<h3>第二步：用最简单的话解释它</h3>
<p>假装你在给一个 10 岁的孩子解释这个概念。用最简单的语言，避免专业术语。如果你卡住了，说明你理解得还不够深。</p>

<h3>第三步：找出你的知识缺口</h3>
<p>在解释的过程中，你会发现有些地方说不清楚，或者自己也似懂非懂。这些就是你的知识缺口。回到原始材料重新学习。</p>

<h3>第四步：简化和类比</h3>
<p>用更简洁的语言重新组织你的解释，并且尝试用生活中的事物做类比。能做到这一步，说明你真的理解了。</p>

<h2>为什么费曼学习法有效？</h2>
<p>大多数人学习都是被动输入：看书、听课、划重点。但真正的学习发生在输出的时候。</p>

<blockquote>教是最好的学。当你要向别人解释一个概念时，你的大脑会被迫进行深度思考。</blockquote>

<h2>如何实践？</h2>
<p>给大家几个简单的实践方法：</p>
<ul>
<li>写学习笔记，用自己的话总结</li>
<li>在社交平台分享你的学习心得</li>
<li>给朋友或家人讲你学到的东西</li>
<li>录视频或音频讲解</li>
</ul>

<p>试试看，你会发现自己的学习效率提升不止一个档次。</p>
    `.trim(),
  },
  {
    title: "为什么你学了那么多，却还是过不好这一生？",
    category: "思考笔记",
    subCategory: "认知升级",
    visibility: "public",
    tags: ["思考成长", "认知偏差", "深度思考"],
    content: `
<h1>为什么你学了那么多，却还是过不好这一生？</h1>
<p>这是一个扎心但真实的问题。很多人每天都在学习、看书、听课，但生活似乎并没有什么改变。</p>

<h2>问题出在哪里？</h2>

<h3>1. 学而不思</h3>
<p>很多人的学习只是「信息收集」，不是「知识消化」。收藏了一堆文章、买了一堆课，但从来没有认真思考过：这些东西对我意味着什么？我能用它做什么？</p>

<h3>2. 知行不合一</h3>
<p>知道和做到之间有巨大的鸿沟。我们都知道运动有益健康，但有多少人能坚持锻炼？我们都知道拖延不好，但有多少人能立刻行动？</p>

<blockquote>知道但做不到，等于不知道。</blockquote>

<h3>3. 贪多嚼不烂</h3>
<p>今天学英语、明天学编程、后天学理财...什么都想学，结果什么都没学好。人的精力是有限的，聚焦才是力量。</p>

<h2>怎么破局？</h2>

<h3>一、以「用」为导向</h3>
<p>不要为了学习而学习，要为了解决问题而学习。比如：</p>
<ul>
<li>想学写作？那就开一个公众号开始写</li>
<li>想学英语？那就找一个需要用英语的场景</li>
<li>想学理财？那就从记账开始</li>
</ul>

<h3>二、少即是多</h3>
<p>每个阶段只聚焦一个主要目标。把它攻克了，再学下一个。一个好习惯的养成，比十个半途而废的尝试有价值得多。</p>

<h3>三、定期复盘</h3>
<p>每周花 30 分钟复盘：这周我学到了什么？哪些用在了生活中？哪些只是「假装在学习」？</p>

<h2>写在最后</h2>
<p>学习的目的不是为了囤积知识，而是为了改变生活。如果你的学习没有带来改变，那就该停下来想一想：问题到底出在哪里？</p>
    `.trim(),
  },
  {
    title: "2025年度复盘：在不确定中寻找确定",
    category: "思考笔记",
    subCategory: "年度复盘",
    visibility: "public",
    tags: ["思考成长", "复盘方法", "目标管理"],
    content: `
<h1>2025年度复盘：在不确定中寻找确定</h1>
<p>又到了一年一度的复盘时间。2025 年对我来说是充满变化的一年，有收获，也有遗憾。</p>

<h2>一、今年做了什么？</h2>

<h3>✅ 完成的事</h3>
<ul>
<li>公众号粉丝从 5000 涨到了 20000</li>
<li>读完了 36 本书（目标 24 本，超额完成）</li>
<li>开设了第一个知识付费课程，收入 5 万+</li>
<li>坚持每周健身 3 次，体脂率下降了 5%</li>
<li>去了 3 个一直想去但没去的城市</li>
</ul>

<h3>❌ 没完成的事</h3>
<ul>
<li>英语口语没有达到预期水平</li>
<li>早起习惯断断续续，没有坚持下来</li>
<li>视频号没做起来</li>
</ul>

<h2>二、今年最大的收获</h2>

<h3>1. 理解了「慢就是快」</h3>
<p>年初的时候很焦虑，想快点涨粉、快点变现。结果越急越乱。后来静下心来，专注做好每一篇内容，反而增长更快了。</p>

<blockquote>很多事情就像种庄稼，你不能拔苗助长。该浇水浇水，该施肥施肥，剩下的交给时间。</blockquote>

<h3>2. 学会了说「不」</h3>
<p>以前什么机会都想抓住，结果精力分散，什么都做不好。今年学会了拒绝那些看似不错但不在主线上的事情。聚焦之后，效率反而更高了。</p>

<h3>3. 身体是革命的本钱</h3>
<p>年中生了一场小病，让我意识到健康的重要性。开始规律健身后，不仅身体好了，精力也更充沛了。</p>

<h2>三、明年的计划</h2>
<ul>
<li><strong>内容创作</strong>：保持每周 2 篇的节奏，打造 3-5 篇爆款</li>
<li><strong>产品</strong>：打磨好课程，争取做到 500 个学员</li>
<li><strong>英语</strong>：每天 30 分钟听力 + 口语练习</li>
<li><strong>健康</strong>：坚持健身，学会游泳</li>
<li><strong>阅读</strong>：读完 30 本书，重点是认知和商业类</li>
</ul>

<h2>写在最后</h2>
<p>2025 年，我最大的感悟是：生活中很多事情是我们无法控制的，但我们可以控制自己的态度和行动。在不确定的世界里，找到自己确定的东西，然后坚定不移地走下去。</p>
    `.trim(),
  },
  {
    title: "新手做自媒体的5个误区",
    category: "自媒体运营",
    subCategory: "内容创作",
    visibility: "public",
    tags: ["自媒体", "内容创作", "个人IP"],
    content: `
<h1>新手做自媒体的5个误区</h1>
<p>最近很多朋友问我怎么做自媒体，发现大家都踩过同样的坑。今天总结一下新手最容易犯的 5 个错误。</p>

<h2>误区一：想太多，做太少</h2>
<p>「我还没准备好」「我长得不好看」「我不知道写什么」... 永远在准备，永远不开始。</p>
<p><strong>真相是</strong>：你永远不会「准备好」。最好的学习方式是边做边学。先写 10 篇、拍 10 个视频，你自然就知道该怎么改进了。</p>

<h2>误区二：追热点，丢定位</h2>
<p>什么火就发什么，今天发美食、明天发旅游、后天发读书。结果粉丝不知道你到底是干嘛的，关注了也很快取关。</p>
<p><strong>真相是</strong>：定位清晰比什么都重要。让别人一想到某个领域就能想到你，你就成功了一半。</p>

<h2>误区三：只看数据，不看价值</h2>
<p>每天刷 10 次后台，看阅读量、看涨粉数。数据好就开心，数据差就沮丧。</p>

<blockquote>数据是结果，不是目标。你的目标应该是：我有没有给读者提供价值？</blockquote>

<p>价值到位了，数据自然会来。</p>

<h2>误区四：追求完美，不敢发布</h2>
<p>一篇文章改了又改，一个视频录了十几遍，总觉得不够好。结果半个月过去了，什么都没发出来。</p>
<p><strong>真相是</strong>：完成比完美重要。先完成，再完美。你发布的第 100 篇内容，肯定比第 1 篇好得多。但如果一直不发，你永远停留在第 0 篇。</p>

<h2>误区五：单打独斗，闭门造车</h2>
<p>自己一个人闷头做，不交流、不学习、不链接。结果走了很多弯路，还不知道问题出在哪。</p>
<p><strong>建议</strong>：找到你的「同行者」。加入几个社群，认识几个同频的朋友。互相鼓励、互相学习，你会走得更远。</p>

<h2>写在最后</h2>
<p>做自媒体没有那么难，但也没有那么容易。避开这些坑，你已经赢过了 80% 的人。剩下的，就交给时间吧。</p>
    `.trim(),
  },
  {
    title: "公众号、小红书、知乎，哪个更适合新手？",
    category: "自媒体运营",
    subCategory: "平台运营",
    visibility: "public",
    tags: ["自媒体", "涨粉技巧", "内容创作"],
    content: `
<h1>公众号、小红书、知乎，哪个更适合新手？</h1>
<p>经常有人问我：想做自媒体，应该从哪个平台开始？今天就来对比一下三大主流平台的特点。</p>

<h2>一、公众号</h2>

<h3>优点</h3>
<ul>
<li><strong>粉丝价值最高</strong>：打开率虽然低，但粉丝粘性强，转化率高</li>
<li><strong>内容寿命长</strong>：好文章会被反复转发，长尾效应明显</li>
<li><strong>变现方式多</strong>：广告、赞赏、付费阅读、知识付费...</li>
</ul>

<h3>缺点</h3>
<ul>
<li><strong>冷启动难</strong>：没有推荐机制，粉丝涨得慢</li>
<li><strong>对内容要求高</strong>：需要持续输出高质量长文</li>
</ul>

<h3>适合谁？</h3>
<p>有一定文字功底、愿意长期深耕、想做个人品牌的人。</p>

<h2>二、小红书</h2>

<h3>优点</h3>
<ul>
<li><strong>起号快</strong>：推荐算法给力，新人也容易出爆款</li>
<li><strong>用户消费力强</strong>：女性用户多，种草属性强</li>
<li><strong>创作门槛低</strong>：图文笔记，不需要写长文</li>
</ul>

<h3>缺点</h3>
<ul>
<li><strong>内容寿命短</strong>：笔记火几天就凉了</li>
<li><strong>粉丝粘性低</strong>：大家都是来看内容的，不是来看人的</li>
</ul>

<h3>适合谁？</h3>
<p>做美妆、穿搭、美食、家居、学习笔记等视觉化内容的人。</p>

<h2>三、知乎</h2>

<h3>优点</h3>
<ul>
<li><strong>长尾效应极强</strong>：回答几年后还在持续涨赞涨粉</li>
<li><strong>用户质量高</strong>：一二线城市、高学历用户多</li>
<li><strong>信任度高</strong>：专业回答容易建立个人品牌</li>
</ul>

<h3>缺点</h3>
<ul>
<li><strong>起号慢</strong>：需要积累足够的专业回答才能起量</li>
<li><strong>对专业度要求高</strong>：没有干货很难混</li>
</ul>

<h3>适合谁？</h3>
<p>在某个领域有专业积累、擅长写深度内容的人。</p>

<h2>我的建议</h2>
<blockquote>新手不要纠结选哪个平台，先选一个你最容易上手的开始做。做起来之后，再考虑多平台分发。</blockquote>

<p>如果你不知道选什么：</p>
<ul>
<li>擅长写长文 → 公众号 + 知乎</li>
<li>擅长图文 → 小红书</li>
<li>有专业背景 → 知乎</li>
<li>想做个人IP → 公众号是必选项</li>
</ul>

<p>最重要的是：开始做，坚持做。平台会变，但内容能力是你自己的。</p>
    `.trim(),
  },
  {
    title: "如何用21天养成一个好习惯",
    category: "生活方式",
    subCategory: "习惯养成",
    visibility: "public",
    tags: ["个人成长", "习惯养成", "自律"],
    content: `
<h1>如何用21天养成一个好习惯</h1>
<p>很多人觉得养成习惯很难，其实是方法不对。今天分享我亲测有效的 21 天习惯养成法。</p>

<h2>第一步：选对习惯</h2>
<p>不要贪多，一次只养成一个习惯。而且这个习惯要足够小，小到你不可能失败。</p>
<p>比如：</p>
<ul>
<li>❌ 「每天运动 1 小时」→ 太宏大了</li>
<li>✅ 「每天做 1 个俯卧撑」→ 简单到不可能不做</li>
</ul>

<blockquote>习惯的关键不是量有多大，而是每天都做。</blockquote>

<h2>第二步：设定触发点</h2>
<p>把新习惯和你每天必做的事情绑定在一起。比如：</p>
<ul>
<li>「刷完牙之后做 1 个俯卧撑」</li>
<li>「吃完晚饭后读 1 页书」</li>
<li>「早上起床后喝 1 杯水」</li>
</ul>
<p>这样你不用记，到了那个时间点自然就会做。</p>

<h2>第三步：记录和追踪</h2>
<p>用日历或 App 记录你的完成情况。每完成一天就打一个勾。</p>
<p>看着连续的勾越来越多，你会有一种不想断掉的动力。这就是「链效应」。</p>

<h2>第四步：允许失败，但不要连续失败</h2>
<p>偶尔断一天很正常，不要因为一次失败就放弃。</p>
<p>但要记住一个原则：<strong>永远不要连续失败两天</strong>。一天是意外，两天就是坏习惯的开始。</p>

<h2>第五步：逐步加码</h2>
<p>当你能连续 21 天完成这个微习惯后，再慢慢增加量：</p>
<ul>
<li>1 个俯卧撑 → 5 个 → 10 个 → 20 个</li>
<li>1 页书 → 5 页 → 10 页 → 30 页</li>
</ul>
<p>循序渐进，你会发现自己不知不觉就坚持下来了。</p>

<h2>常见问题</h2>
<p><strong>Q: 21天真的能养成习惯吗？</strong><br>
A: 研究表明，养成一个习惯平均需要 66 天。但 21 天足够让你度过最艰难的启动期。</p>

<p><strong>Q: 一天中什么时候做最好？</strong><br>
A: 早上最好。意志力在早上最强，而且不容易被其他事情打断。</p>

<p>从今天开始，选一个微习惯试试吧。21 天后，你会感谢现在的自己。</p>
    `.trim(),
  },
  {
    title: "我每天都在用的5个效率工具",
    category: "生活方式",
    subCategory: "效率工具",
    visibility: "public",
    tags: ["效率工具", "生产力", "AI工具"],
    content: `
<h1>我每天都在用的5个效率工具</h1>
<p>工欲善其事，必先利其器。今天分享 5 个我每天都在用、大大提升效率的工具。</p>

<h2>1. Notion — 我的第二大脑</h2>
<p>Notion 是我的主力笔记工具，所有的学习笔记、项目管理、日程安排都在里面。</p>
<p>最喜欢的几个功能：</p>
<ul>
<li><strong>数据库视图</strong>：可以切换表格、看板、日历等多种视图</li>
<li><strong>模板功能</strong>：把重复的工作做成模板，一键复用</li>
<li><strong>双向链接</strong>：笔记之间可以互相关联，形成知识网络</li>
</ul>

<h2>2. Claude — AI 助手</h2>
<p>AI 时代，一个好用的 AI 助手是必备的。我用 Claude 做这些事：</p>
<ul>
<li>写文章前先 brainstorm 思路</li>
<li>写完后帮忙润色和校对</li>
<li>读长文前先让它总结要点</li>
<li>写代码时的 debug 助手</li>
</ul>

<blockquote>AI 不能替你思考，但能帮你节省大量时间。</blockquote>

<h2>3. 番茄钟 App — 专注神器</h2>
<p>我用的是「番茄 ToDo」，每天工作都离不开它。</p>
<ul>
<li>25 分钟专注 + 5 分钟休息</li>
<li>统计每天的专注时长</li>
<li>白噪音功能，帮助进入状态</li>
</ul>

<h2>4. 滴答清单 — 任务管理</h2>
<p>所有待办事项都放在这里，不用记在脑子里。</p>
<ul>
<li>支持日历视图，一目了然</li>
<li>可以设置重复任务</li>
<li>番茄钟功能集成，直接从任务开始专注</li>
</ul>

<h2>5. Flomo — 随手记</h2>
<p>有了想法随时记下来，不用打开复杂的笔记软件。</p>
<ul>
<li>界面极简，打开就能写</li>
<li>支持标签分类</li>
<li>每日回顾功能，帮你复盘</li>
</ul>

<h2>写在最后</h2>
<p>工具只是辅助，真正重要的是你想用它来做什么。不要沉迷于收集工具，选几个顺手的，把精力放在真正重要的事情上。</p>
<p>你有什么私藏的效率工具？欢迎在评论区分享～</p>
    `.trim(),
  },
  {
    title: "《原子习惯》读书笔记：1%的进步，复利的人生",
    category: "读书笔记",
    subCategory: "成长类",
    visibility: "public",
    tags: ["阅读", "读书笔记", "个人成长", "习惯养成"],
    content: `
<h1>《原子习惯》读书笔记：1%的进步，复利的人生</h1>
<p>这本书我读了三遍，每次读都有新收获。今天分享一些对我影响最大的观点。</p>

<h2>核心观点：不要盯着目标，要关注系统</h2>
<p>很多人设定目标：「我要减肥 20 斤」「我要赚 100 万」。但作者说，目标不重要，系统才重要。</p>
<p>什么意思？</p>
<ul>
<li><strong>目标</strong>是你想要达成的结果</li>
<li><strong>系统</strong>是导致结果的过程</li>
</ul>
<p>如果你是一个每天都运动的人（系统），减肥只是迟早的事（结果）。</p>

<blockquote>目标和系统不矛盾。目标决定方向，系统决定进度。</blockquote>

<h2>习惯养成的四个步骤</h2>

<h3>1. 提示（让它显而易见）</h3>
<p>把好习惯的提示放在显眼的地方。比如想喝水，就把水杯放在桌子上你一眼就能看到的地方。</p>

<h3>2. 渴望（让它有吸引力）</h3>
<p>把好习惯和你喜欢的事情绑定。比如你喜欢听歌，那就只在运动的时候听。</p>

<h3>3. 反应（让它简单易行）</h3>
<p>把好习惯的难度降到最低。想读书，就把书翻开，放在枕头边。</p>

<h3>4. 奖励（让它令人满足）</h3>
<p>完成好习惯后给自己一个小奖励。比如坚持一周早起，周末奖励自己睡个懒觉。</p>

<h2>最改变我的三个认知</h2>

<h3>1. 身份认同比行为改变更重要</h3>
<p>不要说「我想戒烟」，要说「我不是一个抽烟的人」。当你的身份认同改变了，行为自然会跟着改变。</p>

<h3>2. 1% 的进步，复利的力量</h3>
<p>每天进步 1%，一年后你会进步 37 倍。每天退步 1%，一年后你会趋近于 0。不要小看每天一点点的改变。</p>

<h3>3. 环境设计比意志力更靠谱</h3>
<p>靠意志力坚持的习惯很难长久。真正聪明的做法是设计环境，让好习惯变得容易，让坏习惯变得困难。</p>

<h2>总结</h2>
<p>这是一本我逢人就推荐的书。如果你总是「开始很积极，坚持不下去」，一定要读一读。</p>
    `.trim(),
  },
  {
    title: "《思考，快与慢》读书笔记：你的大脑其实很不靠谱",
    category: "读书笔记",
    subCategory: "认知类",
    visibility: "public",
    tags: ["阅读", "读书笔记", "思考成长", "认知偏差"],
    content: `
<h1>《思考，快与慢》读书笔记：你的大脑其实很不靠谱</h1>
<p>诺贝尔经济学奖得主丹尼尔·卡尼曼的经典著作。读完这本书，你会发现：原来我们每天都在犯各种认知错误。</p>

<h2>大脑的两个系统</h2>

<h3>系统 1：快思考</h3>
<p>直觉、自动反应、不需要费力。比如：</p>
<ul>
<li>识别一张愤怒的脸</li>
<li>回答 2+2=?</li>
<li>开车时的习惯性动作</li>
</ul>
<p>特点：快、省力、容易出错。</p>

<h3>系统 2：慢思考</h3>
<p>理性思考、需要集中注意力。比如：</p>
<ul>
<li>计算 17×24=?</li>
<li>在嘈杂的环境中听某个人说话</li>
<li>做重要的决策</li>
</ul>
<p>特点：慢、费力、更准确。</p>

<blockquote>我们以为自己是理性的，但实际上，我们大部分时间都在用系统 1 做决策。</blockquote>

<h2>常见的认知偏差</h2>

<h3>1. 锚定效应</h3>
<p>人们做判断时，会被第一印象或第一个数字「锚定」。比如砍价时，先出价的人会占据主动，因为对方的心理价位会被你的出价锚定。</p>

<h3>2. 可得性启发</h3>
<p>人们判断一件事发生的概率，取决于能想起多少例子。比如最近看到很多飞机失事的新闻，就会觉得坐飞机很危险。但实际上，飞机是最安全的交通工具。</p>

<h3>3. 损失厌恶</h3>
<p>失去 100 块的痛苦，大于得到 100 块的快乐。这就是为什么我们宁愿放弃潜在的收益，也不愿意承受可能的损失。</p>

<h3>4. 确认偏误</h3>
<p>我们会主动寻找支持自己观点的证据，而忽略相反的证据。所以你觉得什么是对的，往往总能找到「证据」。</p>

<h2>如何避免？</h2>
<p>认知偏差是大脑的默认设置，我们无法完全避免，但可以有意识地减少：</p>
<ol>
<li><strong>意识到自己可能错了</strong>：保持谦逊，多想想「我会不会是错的？」</li>
<li><strong>用数据说话</strong>：不要凭感觉做决策，去找数据、做调研</li>
<li><strong>引入外部视角</strong>：听听别人的意见，尤其是反对的声音</li>
<li><strong>慢下来</strong>：重要决策不要急着做，给系统 2 一些时间</li>
</ol>

<h2>总结</h2>
<p>这本书很厚，读起来也不轻松，但非常值得。了解大脑的运作方式，能帮你在生活中做出更明智的决策。</p>
    `.trim(),
  },

  // ===== 会员文章（5篇）=====
  {
    title: "我的英语听力训练系统（完整版）",
    category: "会员专属",
    subCategory: "深度教程",
    visibility: "members",
    tags: ["英语学习", "听力训练", "深度教程"],
    content: `
<h1>我的英语听力训练系统（完整版）</h1>
<p>这是我花了三年时间打磨的英语听力训练方法。按照这个方法坚持 6 个月，你的听力会有质的飞跃。</p>

<h2>一、核心理念：可理解性输入</h2>
<p>语言学家 Krashen 提出的「输入假说」认为：只要输入足够多的「可理解的」内容，语言自然就能学会。</p>
<p>什么是「可理解的」？就是你能听懂 70%-80% 的内容，剩下的 20%-30% 可以通过上下文猜出来。</p>

<blockquote>太难的内容听不懂会放弃，太简单的内容没有进步。找到「i+1」的难度是关键。</blockquote>

<h2>二、材料选择</h2>

<h3>初级水平</h3>
<ul>
<li>ESL Pod（语速慢、有讲解）</li>
<li>BBC Learning English</li>
<li>英语动画片（小猪佩奇、蓝色小考拉）</li>
</ul>

<h3>中级水平</h3>
<ul>
<li>TED-Ed（动画 + 科普，有趣又有料）</li>
<li>Crash Course（各种学科的快速入门）</li>
<li>英语有声书（先从感兴趣的题材开始）</li>
</ul>

<h3>高级水平</h3>
<ul>
<li>TED 演讲</li>
<li>播客（The Daily、How I Built This 等）</li>
<li>美剧/英剧（去掉字幕）</li>
</ul>

<h2>三、训练方法：精听 + 泛听结合</h2>

<h3>精听（每天 30 分钟）</h3>
<ol>
<li>选一段 3-5 分钟的音频</li>
<li>第一遍：盲听，听懂大意</li>
<li>第二遍：逐句听，听不懂就暂停反复听</li>
<li>第三遍：对照文本，标记没听出来的地方</li>
<li>第四遍：跟着读，模仿语音语调</li>
</ol>

<h3>泛听（越多越好）</h3>
<ul>
<li>通勤、做饭、运动时都可以听</li>
<li>不需要每句都听懂，让耳朵熟悉英语的节奏</li>
<li>听你感兴趣的内容，保持动力</li>
</ul>

<h2>四、常见问题</h2>
<p><strong>Q: 听了很久还是听不懂怎么办？</strong><br>
A: 可能是材料太难了。降低难度，从更简单的开始。基础打牢了，进步自然就快了。</p>

<p><strong>Q: 要不要背单词？</strong><br>
A: 要，但不要孤立地背。在听力材料中遇到的生词，结合语境去记，效果最好。</p>

<p><strong>Q: 多久能见效？</strong><br>
A: 坚持 1 个月就能感觉到变化，3 个月会有明显进步，6 个月能上一个大台阶。</p>

<h2>写在最后</h2>
<p>听力是一个厚积薄发的过程。前面可能很长时间都感觉不到进步，但某一天你会突然发现：哎？我怎么都听懂了？那个就是「开窍」的时刻。坚持住，它一定会来的。</p>
    `.trim(),
  },
  {
    title: "从零开始做自媒体：6个月涨粉1万的完整路径",
    category: "会员专属",
    subCategory: "深度教程",
    visibility: "members",
    tags: ["自媒体", "内容创作", "涨粉技巧", "个人IP"],
    content: `
<h1>从零开始做自媒体：6个月涨粉1万的完整路径</h1>
<p>很多人觉得涨粉 1 万很难，其实只要方法对，6 个月足够了。今天把我的完整路径分享给大家。</p>

<h2>第 1 个月：定位和准备</h2>

<h3>确定你的赛道</h3>
<p>选择大于努力。选赛道要考虑三个因素：</p>
<ul>
<li><strong>你擅长什么？</strong>（能力）</li>
<li><strong>你喜欢什么？</strong>（热情）</li>
<li><strong>市场需要什么？</strong>（需求）</li>
</ul>
<p>三者的交集就是你的最佳赛道。</p>

<h3>账号基础设置</h3>
<ul>
<li>头像：清晰、有辨识度</li>
<li>昵称：好记、和赛道相关</li>
<li>简介：一句话说清楚你是谁、能提供什么价值</li>
</ul>

<h2>第 2 个月：内容冷启动</h2>

<h3>先做 20 篇内容储备</h3>
<p>不要发一篇等一篇。先写好 20 篇，保证持续输出。</p>

<h3>研究爆款</h3>
<p>找你赛道里的 10 个头部账号，把他们的爆款内容列出来，分析：</p>
<ul>
<li>标题是怎么起的？</li>
<li>结构是怎样的？</li>
<li>戳中了什么痛点？</li>
</ul>

<blockquote>不是让你抄袭，而是学习爆款的底层逻辑。</blockquote>

<h2>第 3 个月：找到爆款公式</h2>

<h3>数据分析</h3>
<p>发了 20 篇之后，你会发现有些内容数据特别好，有些特别差。分析数据好的内容：</p>
<ul>
<li>主题有什么特点？</li>
<li>标题有什么规律？</li>
<li>发布时间？</li>
</ul>

<h3>复制成功</h3>
<p>找到你的「爆款公式」，然后重复它。比如你发现「XX 个误区」「XX 个方法」这类内容数据好，那就多写这类。</p>

<h2>第 4-5 个月：矩阵和互推</h2>

<h3>多平台分发</h3>
<p>一个平台做起来之后，把内容分发到其他平台。一鱼多吃，效率最大化。</p>

<h3>找同频博主互推</h3>
<p>加入博主社群，认识一些粉丝量级差不多的朋友，互相推荐。这是涨粉最快的方式之一。</p>

<h2>第 6 个月：变现尝试</h2>
<p>粉丝过万之后，可以开始尝试变现了：</p>
<ul>
<li>接广告（最直接）</li>
<li>做付费社群（最稳定）</li>
<li>卖课程/产品（天花板最高）</li>
</ul>

<h2>最关键的建议</h2>
<p><strong>1. 日更不是必须的</strong>：质量比数量重要。每周 2-3 篇高质量内容，好过每天水一篇。</p>
<p><strong>2. 数据焦虑是正常的</strong>：每个人都会有。但记住，数据是结果，不是目标。把注意力放回内容本身。</p>
<p><strong>3. 长期主义</strong>：做自媒体是一场马拉松，不是百米冲刺。能坚持一年的人，已经赢过了 90% 的对手。</p>
    `.trim(),
  },
  {
    title: "我是如何通过知识付费赚到第一个10万的",
    category: "会员专属",
    subCategory: "私密分享",
    visibility: "members",
    tags: ["自媒体", "知识变现", "私密分享"],
    content: `
<h1>我是如何通过知识付费赚到第一个10万的</h1>
<p>这是一篇比较私密的分享，聊聊我做知识付费的完整经历，包括踩过的坑、赚到的钱、以及一些真心话。</p>

<h2>一、为什么做知识付费？</h2>
<p>最开始做公众号的时候，我只想写写文章。后来粉丝多了，经常有人问我能不能系统地教他们。我想，既然有需求，为什么不试试呢？</p>
<p>第一次做课程是在去年 3 月，当时粉丝只有 8000 多。说实话，心里很没底。</p>

<h2>二、第一门课：从 0 到 1</h2>

<h3>课程选题</h3>
<p>选的是我最擅长的领域：高效学习方法。原因很简单：</p>
<ol>
<li>我自己有真实的经验和成果</li>
<li>粉丝也是因为这个关注我的</li>
<li>这个话题受众广、刚需</li>
</ol>

<h3>定价策略</h3>
<p>第一门课定价 99 元。为什么这么便宜？</p>
<ul>
<li>第一次做，没信心定太高</li>
<li>低价容易启动，先验证需求</li>
<li>第一批用户是种子用户，价格低一点也值得</li>
</ul>

<h3>发售结果</h3>
<p>第一期招了 120 多人，收入 1 万多。虽然不多，但给了我很大的信心。</p>

<h2>三、迭代和涨价</h2>
<p>有了第一期的反馈，我开始迭代课程：</p>
<ul>
<li>增加了更多实操案例</li>
<li>增加了社群答疑</li>
<li>制作了配套的练习模板</li>
</ul>
<p>第二期涨到 199 元，招了 200 多人。</p>
<p>第三期涨到 299 元，招了 300 多人。</p>

<blockquote>课程的价值感是一点点做出来的，不是一开始就有的。</blockquote>

<h2>四、踩过的坑</h2>

<h3>1. 不要一开始就追求完美</h3>
<p>第一版课程很粗糙，但没关系。先上线，再迭代。用户的反馈比你自己瞎琢磨有用得多。</p>

<h3>2. 社群运营很花时间</h3>
<p>原以为做课程只要录好课就行，后来发现社群答疑才是最花时间的。但这也是价值感最高的部分。</p>

<h3>3. 不要过度承诺</h3>
<p>为了卖课而夸大效果，短期可能有用，但长期会反噬。口碑才是最重要的。</p>

<h2>五、现在的情况</h2>
<p>目前有两门课，加上社群，累计收入大概 15 万左右。虽然不算多，但作为副业收入，我已经很满意了。</p>
<p>更重要的是，这个过程让我成长了很多。从只会写文章，到会做产品、会运营、会服务用户。这些能力比钱更有价值。</p>

<h2>六、给想做知识付费的你的建议</h2>
<ol>
<li><strong>先有粉丝，再做产品</strong>：不要反过来。</li>
<li><strong>从小处开始</strong>：第一门课不用大而全，解决一个小问题就行。</li>
<li><strong>重视口碑</strong>：一个满意的用户会带来很多新用户。</li>
<li><strong>长期主义</strong>：知识付费不是赚快钱的地方，但可以做得很久。</li>
</ol>

<p>就聊这么多吧。有问题欢迎在社群里问我～</p>
    `.trim(),
  },
  {
    title: "30天深度学习实验：每天学习8小时是什么体验",
    category: "会员专属",
    subCategory: "学习日记",
    visibility: "members",
    tags: ["学习方法", "学习日记", "深度思考"],
    content: `
<h1>30天深度学习实验：每天学习8小时是什么体验</h1>
<p>上个月我做了一个实验：连续 30 天，每天深度学习 8 小时。想看看极限状态下自己能学多少东西。</p>

<h2>实验背景</h2>
<p>平时我每天大概学习 3-4 小时，总觉得还不够。刚好有一个月的空档期，就想试试如果全力投入，能到什么程度。</p>
<p>学习内容：一门新的编程语言 + 一本厚书 + 英语听力</p>

<h2>第一周：鸡血期</h2>
<p>刚开始干劲十足，每天 8 小时完全没问题。甚至还想学得更久。</p>
<p>进度很快，一周就学完了编程语言的基础部分。感觉自己要起飞了。</p>

<h2>第二周：疲劳期</h2>
<p>第二周明显感觉累了。上午效率还可以，下午开始走神，晚上根本学不动。</p>
<p>硬撑着学满 8 小时，但有效学习时间可能只有 5-6 小时。</p>

<blockquote>学习时间不等于学习效果。坐在书桌前 8 小时，不代表你真的学了 8 小时。</blockquote>

<h2>第三周：调整期</h2>
<p>我开始调整策略：</p>
<ul>
<li>学习时间改成 6 小时，但保证每一分钟都是专注的</li>
<li>增加了运动时间，下午一定要出去走一走</li>
<li>用番茄工作法，25 分钟专注 + 5 分钟休息</li>
<li>最难的内容放在早上精力最好的时候</li>
</ul>
<p>调整之后，虽然时间少了，但效率反而更高了。</p>

<h2>第四周：稳定期</h2>
<p>慢慢找到了节奏。每天 6-7 小时的高效学习，加上运动和休息，状态很稳定。</p>
<p>这一周的进步反而比第二周大。</p>

<h2>实验结果</h2>
<p>30 天下来：</p>
<ul>
<li>✅ 学完了一门编程语言，能独立做小项目了</li>
<li>✅ 读完了那本厚书，做了详细的笔记</li>
<li>✅ 英语听力明显提升，播客能听懂 80% 了</li>
</ul>

<h2>最重要的几个发现</h2>

<h3>1. 意志力是有限的</h3>
<p>不要试图靠意志力撑 8 小时。合理的休息和运动，才能让你走得更远。</p>

<h3>2. 深度工作 4 小时 > 摸鱼 8 小时</h3>
<p>真正高质量的深度学习，每天能有 4-5 小时就很不错了。剩下的时间可以做一些机械性的学习任务。</p>

<h3>3. 运动是最好的休息</h3>
<p>学累了刷手机，只会更累。出去走一走、跑跑步，回来之后效率会高很多。</p>

<h3>4. 输出比输入重要</h3>
<p>每天花 30 分钟总结当天学到的东西，比多学 1 小时新内容效果更好。</p>

<h2>写在最后</h2>
<p>这个实验让我明白：学习不是比谁学的时间长，而是比谁的方法对、效率高。与其追求时长，不如追求质量。</p>
<p>当然，这个实验是极端情况。对大多数人来说，每天能有 2-3 小时的高质量学习，就已经很厉害了。重要的是，每天都学一点，长期坚持。</p>
    `.trim(),
  },
  {
    title: "知识变现的5种模式，适合普通人的是哪一种？",
    category: "自媒体运营",
    subCategory: "变现思路",
    visibility: "members",
    tags: ["自媒体", "知识变现", "个人IP"],
    content: `
<h1>知识变现的5种模式，适合普通人的是哪一种？</h1>
<p>很多人想做知识变现，但不知道从哪里开始。今天就来拆解一下 5 种主流的知识变现模式，以及各自的优缺点。</p>

<h2>模式一：广告变现</h2>
<p>粉丝多了之后，接品牌广告。这是最常见的变现方式。</p>
<ul>
<li><strong>优点</strong>：简单直接，不需要做产品</li>
<li><strong>缺点</strong>：需要大量粉丝，收入不稳定</li>
<li><strong>适合</strong>：粉丝量大、阅读量高的账号</li>
</ul>
<p>一般来说，1 万阅读量的公众号头条，广告费大概 1000-3000 元。</p>

<h2>模式二：付费社群</h2>
<p>建一个付费社群，提供定期分享和答疑。</p>
<ul>
<li><strong>优点</strong>：收入稳定，用户粘性高</li>
<li><strong>缺点</strong>：需要持续运营，很花时间</li>
<li><strong>适合</strong>：有专业能力、喜欢和人交流的人</li>
</ul>

<blockquote>社群的核心不是内容，而是连接。让群成员之间产生连接，社群才有价值。</blockquote>

<h2>模式三：线上课程</h2>
<p>把你的知识系统化，做成录播课或直播课。</p>
<ul>
<li><strong>优点</strong>：一次制作，多次销售，边际成本低</li>
<li><strong>缺点</strong>：前期制作成本高，需要营销能力</li>
<li><strong>适合</strong>：在某个领域有系统性知识的人</li>
</ul>

<h2>模式四：一对一咨询/教练</h2>
<p>按小时收费，提供一对一的咨询或指导。</p>
<ul>
<li><strong>优点</strong>：客单价高，起步快</li>
<li><strong>缺点</strong>：时间换钱，天花板低</li>
<li><strong>适合</strong>：有专业背景、擅长沟通的人</li>
</ul>

<h2>模式五：付费产品/工具</h2>
<p>做一个付费的产品或工具，比如模板、插件、SaaS 等。</p>
<ul>
<li><strong>优点</strong>：可规模化，天花板高</li>
<li><strong>缺点</strong>：需要技术能力，开发周期长</li>
<li><strong>适合</strong>：有产品思维、懂技术的人</li>
</ul>

<h2>普通人从哪里开始？</h2>
<p>我的建议是从「低门槛」的开始，逐步升级：</p>

<h3>第一阶段：从一对一咨询开始</h3>
<p>不需要做产品，不需要很多粉丝。只要你能解决某个人的问题，就可以收费。这是验证需求最快的方式。</p>

<h3>第二阶段：做付费社群</h3>
<p>当你有了一些咨询案例，发现大家的问题都差不多，就可以把这些内容整理成社群分享。</p>

<h3>第三阶段：做线上课程</h3>
<p>社群分享的内容成熟之后，可以录制成课程，让更多人可以学习。</p>

<h3>第四阶段：做产品</h3>
<p>如果课程的需求足够大，可以考虑做成产品或工具，进一步提升效率。</p>

<h2>写在最后</h2>
<p>知识变现没有最好的模式，只有最适合你的模式。不要羡慕别人赚得多，找到适合自己的节奏和方式最重要。</p>
<p>先从最小的事情开始，边做边调整。做着做着，路就清晰了。</p>
    `.trim(),
  },

  // ===== 私密文章（3篇）=====
  {
    title: "关于人生意义的一些碎碎念（草稿）",
    category: "思考笔记",
    subCategory: "随想",
    visibility: "private",
    tags: ["思考成长", "深度思考"],
    content: `
<h1>关于人生意义的一些碎碎念（草稿）</h1>
<p>最近一直在想一个问题：人活着到底是为了什么？</p>

<h2>一些胡思乱想</h2>
<p>年轻的时候觉得要赚大钱、要出人头地。现在慢慢觉得，那些好像也没那么重要。</p>
<p>钱当然重要，但钱是工具，不是目的。有了钱之后呢？还是要回答那个问题：然后呢？</p>

<h2>目前的答案</h2>
<p>我现在觉得，人生可能本来就没有什么意义。意义是我们自己赋予的。</p>
<p>那我想赋予我的人生什么意义呢？</p>
<ul>
<li>体验：尽可能多地体验这个世界</li>
<li>成长：成为更好的自己</li>
<li>连接：和喜欢的人建立深度的关系</li>
<li>创造：留下一些有价值的东西</li>
</ul>

<h2>还没想清楚的</h2>
<p>关于家庭、关于事业、关于理想...很多事情还在摸索中。</p>
<p>也许人生就是这样，边走边看，边活边想。</p>

<p>（这是一篇草稿，以后想清楚了再整理）</p>
    `.trim(),
  },
  {
    title: "我的健身计划（私人记录）",
    category: "生活方式",
    subCategory: "健身打卡",
    visibility: "private",
    tags: ["生活方式", "健身"],
    content: `
<h1>我的健身计划（私人记录）</h1>
<p>从今年开始认真健身，记录一下计划和进度。</p>

<h2>目标</h2>
<ul>
<li>体脂率从 22% 降到 15%</li>
<li>体重保持在 65kg 左右</li>
<li>能做 10 个引体向上</li>
</ul>

<h2>训练计划</h2>

<h3>周一：胸 + 三头</h3>
<ul>
<li>卧推 4×12</li>
<li>上斜哑铃推举 3×12</li>
<li>哑铃飞鸟 3×15</li>
<li>绳索下压 3×15</li>
</ul>

<h3>周三：背 + 二头</h3>
<ul>
<li>引体向上 4×力竭</li>
<li>高位下拉 4×12</li>
<li>划船 3×12</li>
<li>二头弯举 3×15</li>
</ul>

<h3>周五：腿 + 肩</h3>
<ul>
<li>深蹲 4×12</li>
<li>硬拉 4×8</li>
<li>推肩 3×12</li>
<li>侧平举 3×15</li>
</ul>

<h2>饮食计划</h2>
<ul>
<li>蛋白质：每天 100g（鸡胸肉、鸡蛋、牛奶、蛋白粉）</li>
<li>碳水：训练日多吃，休息日少吃</li>
<li>脂肪：适量，以坚果、牛油果为主</li>
<li>每天喝 2L 水</li>
</ul>

<h2>进度记录</h2>
<p>（待更新）</p>
    `.trim(),
  },
  {
    title: "社群问答精选草稿V1",
    category: "会员专属",
    subCategory: "社群答疑",
    visibility: "private",
    tags: ["自媒体", "社群答疑"],
    content: `
<h1>社群问答精选草稿V1</h1>
<p>整理了一些社群里大家问得比较多的问题，准备整理成一篇长文。这是草稿。</p>

<h2>问题1：刚开始做自媒体，不知道写什么怎么办？</h2>
<p>答：三个方法：</p>
<ol>
<li>从你最常被问到的问题开始</li>
<li>从你最近的学习笔记开始</li>
<li>从你踩过的坑开始</li>
</ol>
<p>核心是：先写起来，写着写着就知道该写什么了。</p>

<h2>问题2：如何保持日更的动力？</h2>
<p>答：不要日更。不要为了更新而更新。质量比数量重要。</p>
<p>但如果你想保持输出习惯，可以：</p>
<ul>
<li>建立素材库，平时有想法就记下来</li>
<li>设定一个最低输出标准（比如每周 1 篇）</li>
<li>找到同频的朋友互相监督</li>
</ul>

<h2>问题3：粉丝增长遇到瓶颈怎么办？</h2>
<p>答：先分析原因：</p>
<ol>
<li>内容质量问题？→ 提升内容质量</li>
<li>内容类型太窄？→ 适当拓宽选题</li>
<li>分发不够？→ 多平台分发</li>
<li>没有爆款？→ 研究爆款逻辑</li>
</ol>

<p>（更多问题整理中...）</p>
    `.trim(),
  },
];

// ==================== 主函数 ====================

export async function seedContentArchitecture() {
  const user = await getDefaultUser();
  const userId = user.id;

  // 使用事务保证数据一致性
  const result = await prisma.$transaction(async (tx) => {
    // ========== 1. 清理旧的博客分类和相关内容（幂等性）==========
    // 先找出所有 categoryCode 以 blog- 开头的知识库
    const oldBlogKbs = await tx.knowledgeBase.findMany({
      where: {
        userId,
        categoryCode: { startsWith: "blog-" },
      },
      select: { id: true, children: { select: { id: true } } },
    });

    const oldKbIds: string[] = [];
    for (const kb of oldBlogKbs) {
      oldKbIds.push(kb.id);
      for (const child of kb.children) {
        oldKbIds.push(child.id);
      }
    }

    // 删除相关文档的标签关联
    const oldDocs = await tx.document.findMany({
      where: { userId, knowledgeBaseId: { in: oldKbIds } },
      select: { id: true },
    });
    const oldDocIds = oldDocs.map((d) => d.id);

    if (oldDocIds.length > 0) {
      await tx.documentTag.deleteMany({
        where: { documentId: { in: oldDocIds } },
      });
      await tx.document.deleteMany({
        where: { id: { in: oldDocIds } },
      });
    }

    // 删除旧的博客知识库
    if (oldKbIds.length > 0) {
      await tx.knowledgeBase.deleteMany({
        where: { id: { in: oldKbIds } },
      });
    }

    // 清理旧的内容标签（标记为 content-tag 体系的）
    // 我们通过 sortOrder 和颜色模式来识别，或者简单地：删除所有没有文档关联的标签？
    // 更稳妥的方式：只删除我们即将重新创建的标签
    const tagNamesToRecreate: string[] = [];
    for (const parent of TAG_TREE) {
      tagNamesToRecreate.push(parent.name);
      tagNamesToRecreate.push(...parent.children);
    }

    // 找出这些标签的 ID（包括父子关系的）
    const oldTags = await tx.tag.findMany({
      where: { userId, name: { in: tagNamesToRecreate } },
      select: { id: true },
    });
    const oldTagIds = oldTags.map((t) => t.id);

    if (oldTagIds.length > 0) {
      // 删除文档标签关联
      await tx.documentTag.deleteMany({
        where: { tagId: { in: oldTagIds } },
      });
      await tx.noteTag.deleteMany({
        where: { tagId: { in: oldTagIds } },
      });
      // 删除标签
      await tx.tag.deleteMany({
        where: { id: { in: oldTagIds } },
      });
    }

    // ========== 2. 创建知识库分类树 ==========
    const kbMap = new Map<string, { id: string; children: Map<string, string> }>();

    for (const parent of CATEGORY_TREE) {
      // 创建一级分类
      const parentKb = await tx.knowledgeBase.create({
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

      // 创建二级分类
      for (const child of parent.children) {
        const childKb = await tx.knowledgeBase.create({
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

    // ========== 3. 创建标签体系 ==========
    const tagMap = new Map<string, string>(); // tagName -> tagId

    for (const parent of TAG_TREE) {
      // 创建一级标签
      const parentTag = await tx.tag.create({
        data: {
          name: parent.name,
          color: parent.color,
          sortOrder: parent.sortOrder,
          userId,
        },
      });
      tagMap.set(parent.name, parentTag.id);

      // 创建二级标签
      let childSortOrder = 1;
      for (const childName of parent.children) {
        const childTag = await tx.tag.create({
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

    // ========== 4. 创建示例文章 ==========
    let publicCount = 0;
    let membersCount = 0;
    let privateCount = 0;

    for (const post of SAMPLE_POSTS) {
      // 找到对应的子知识库
      const categoryInfo = kbMap.get(post.category);
      if (!categoryInfo) continue;

      const subKbId = categoryInfo.children.get(post.subCategory);
      if (!subKbId) continue;

      // 计算纯文本和字数
      const plainText = post.content.replace(/<[^>]*>/g, "").trim();
      const wordCount = plainText.length;

      // 创建文档
      const doc = await tx.document.create({
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
        },
      });

      // 关联标签
      for (const tagName of post.tags) {
        const tagId = tagMap.get(tagName);
        if (tagId) {
          await tx.documentTag.create({
            data: {
              documentId: doc.id,
              tagId,
            },
          });
          // 更新标签使用计数
          await tx.tag.update({
            where: { id: tagId },
            data: { useCount: { increment: 1 } },
          });
        }
      }

      if (post.visibility === "public") publicCount++;
      else if (post.visibility === "members") membersCount++;
      else privateCount++;
    }

    // ========== 5. 初始化用户设置 ==========
    const defaultSettings = {
      blogTitle: "晓桃终生成长",
      blogSubtitle: "记录学习、思考与成长的点滴。关于英语学习、个人成长、以及那些让生活更美好的小发现。",
      bio: "你好，我是晓桃。一个在终生学习路上的普通人。这里记录我的学习笔记、思考和成长。关于自媒体运营、个人成长、以及那些让生活更美好的小发现。我相信知识的力量，也相信分享的价值。这个博客是我学习和思考的输出窗口，希望这些内容能对你有所帮助。",
      avatarUrl: "",
      socialLinks: JSON.stringify({
        wechat: "",
        weibo: "",
        zhihu: "",
        xiaohongshu: "",
        email: "",
        github: "",
      }),
    };

    await tx.userSettings.upsert({
      where: { userId },
      update: {
        // 如果已经有设置了，不覆盖用户的自定义内容
        // 只补充缺失的字段
      },
      create: {
        userId,
        blogTitle: defaultSettings.blogTitle,
        blogSubtitle: defaultSettings.blogSubtitle,
        bio: defaultSettings.bio,
        avatarUrl: defaultSettings.avatarUrl,
        socialLinks: defaultSettings.socialLinks,
      },
    });

    return {
      categories: CATEGORY_TREE.length,
      subCategories: CATEGORY_TREE.reduce((sum, c) => sum + c.children.length, 0),
      tags: tagMap.size,
      publicPosts: publicCount,
      memberPosts: membersCount,
      privatePosts: privateCount,
      totalPosts: publicCount + membersCount + privateCount,
    };
  });

  return {
    success: true,
    message: "内容架构初始化完成",
    ...result,
  };
}
