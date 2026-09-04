#!/usr/bin/env node
/**
 * 自媒体博主知识库种子数据
 * 在"晓桃自媒体运营"下创建完整的知识体系
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 获取默认用户和自媒体知识库
  const user = await prisma.user.findFirst({ where: { id: 'user-default' } });
  if (!user) throw new Error('Default user not found');

  const mediaKb = await prisma.knowledgeBase.findFirst({
    where: { name: { contains: '自媒体' }, userId: 'user-default' }
  });
  if (!mediaKb) throw new Error('Self-media KB not found');

  console.log(`Found media KB: ${mediaKb.name} (${mediaKb.id})`);

  // === 知识库分类定义 ===
  const categories = [
    { name: '内容创作体系', icon: '📝', color: '#FF6B6B', children: [
      { name: '选题方法论', icon: '🎯' },
      { name: '脚本写作技巧', icon: '✍️' },
      { name: '文案写作模板', icon: '📄' },
      { name: '短视频叙事结构', icon: '🎬' },
    ]},
    { name: 'AI工具应用', icon: '🤖', color: '#4ECDC4', children: [
      { name: 'AI选题与热点追踪', icon: '🔍' },
      { name: 'AI脚本与文案生成', icon: '✨' },
      { name: 'AI视频生成', icon: '🎥' },
      { name: 'AI图片与封面设计', icon: '🖼️' },
      { name: 'AI声音与数字人', icon: '🎙️' },
      { name: 'AI剪辑与后期制作', icon: '✂️' },
    ]},
    { name: '平台运营策略', icon: '📊', color: '#45B7D1', children: [
      { name: '抖音运营', icon: '🎵' },
      { name: '小红书运营', icon: '📕' },
      { name: 'B站运营', icon: '📺' },
      { name: '视频号运营', icon: '绿色' },
      { name: '跨平台分发策略', icon: '🔄' },
    ]},
    { name: '增长策略', icon: '🚀', color: '#96CEB4', children: [
      { name: '流量获取与算法理解', icon: '🌊' },
      { name: '粉丝增长策略', icon: '📈' },
      { name: '私域引流与运营', icon: '💬' },
    ]},
    { name: '变现方法', icon: '💰', color: '#FFEAA7', children: [
      { name: '变现路径规划', icon: '🗺️' },
      { name: '广告与品牌合作', icon: '🤝' },
      { name: '带货与电商变现', icon: '🛒' },
      { name: '知识付费与课程', icon: '📚' },
      { name: '直播变现', icon: '🔴' },
    ]},
    { name: '个人品牌建设', icon: '👑', color: '#DDA0DD', children: [
      { name: 'IP定位与人设打造', icon: '🎭' },
      { name: '品牌视觉识别系统', icon: '🎨' },
      { name: '品牌故事与差异化', icon: '📖' },
    ]},
    { name: '数据分析', icon: '📈', color: '#98D8C8', children: [
      { name: '数据指标体系', icon: '📊' },
      { name: '内容复盘方法', icon: '🔍' },
      { name: '用户画像分析', icon: '👥' },
    ]},
    { name: 'AI持续迭代方案', icon: '🔄', color: '#F7DC6F', children: [
      { name: 'AI辅助创作SOP', icon: '📋' },
      { name: '每周AI复盘流程', icon: '📅' },
      { name: '竞品AI分析', icon: '🔬' },
    ]},
  ];

  // === 创建知识库分类 ===
  const createdKbs = {};
  let sortOrder = 0;
  for (const cat of categories) {
    const parent = await prisma.knowledgeBase.create({
      data: {
        name: cat.name,
        icon: cat.icon || null,
        color: cat.color || null,
        parentId: mediaKb.id,
        sortOrder: sortOrder++,
        userId: 'user-default',
      }
    });
    createdKbs[cat.name] = parent;
    console.log(`Created: ${cat.name}`);

    let childSort = 0;
    for (const child of cat.children || []) {
      const childKb = await prisma.knowledgeBase.create({
        data: {
          name: child.name,
          icon: child.icon || null,
          parentId: parent.id,
          sortOrder: childSort++,
          userId: 'user-default',
        }
      });
      createdKbs[`${cat.name}/${child.name}`] = childKb;
    }
  }

  // === 文档内容定义 ===
  const documents = [
    // === 内容创作体系 ===
    {
      kbKey: '内容创作体系/选题方法论',
      title: '选题方法论：从0到1找到爆款选题',
      content: `<h2>选题是自媒体的生死线</h2><p>一个好的选题决定了80%的流量。掌握系统化的选题方法，比盲目创作更重要。</p><h3>一、选题来源渠道</h3><ul><li><strong>热点追踪</strong>：抖音热榜、微博热搜、知乎热榜、百度风云榜</li><li><strong>竞品分析</strong>：同行最近30天爆款内容拆解</li><li><strong>用户需求</strong>：评论区高频问题、私信咨询、搜索关键词</li><li><strong>个人经验</strong>：踩坑经历、成长故事、技能心得</li><li><strong>数据工具</strong>：蝉妈妈、新抖、飞瓜数据等</li></ul><h3>二、选题评估模型</h3><p>每个选题用以下5个维度打分（1-5分）：</p><ul><li><strong>需求度</strong>：目标用户是否真的关心？</li><li><strong>时效性</strong>：是长效内容还是蹭热点？</li><li><strong>竞争度</strong>：同行做得多不多？能否差异化？</li><li><strong>执行度</strong>：以现有资源能否完成？</li><li><strong>传播度</strong>：有没有分享/转发的动力？</li></ul><p>总分≥20分的选题值得做，≥18分可以考虑，低于15分放弃。</p><h3>三、选题库管理</h3><p>建立选题库表格，包含：选题名称、来源、目标受众、预期效果、创作优先级、状态（待创作/创作中/已发布/已复盘）。</p><h3>四、AI辅助选题</h3><p>用AI工具（如豆包、ChatGPT）进行选题拓展：输入关键词，让AI生成20个选题方向，再人工筛选。结合热点工具，实现选题半自动化。</p>`,
      tags: ['内容创作', '选题']
    },
    {
      kbKey: '内容创作体系/脚本写作技巧',
      title: '脚本写作技巧：让观众看完的黄金结构',
      content: `<h2>脚本是短视频的灵魂</h2><p>优秀的脚本能让完播率从15%提升到60%以上。掌握结构化写作方法至关重要。</p><h3>一、黄金3秒开头</h3><ul><li><strong>悬念式</strong>："99%的人都不知道..."</li><li><strong>冲突式</strong>："我花了3万块踩的坑，今天告诉你"</li><li><strong>数据式</strong>："3天涨粉10万，我只做对了这1件事"</li><li><strong>共鸣式</strong>："如果你也XX，一定要看完这条视频"</li></ul><h3>二、爆款脚本结构模板</h3><p><strong>结构1：痛点+方案+案例+CTA</strong></p><p>提出痛点 → 给出解决方案 → 用真实案例验证 → 引导关注/互动</p><p><strong>结构2：反常识+论证+结论</strong></p><p>抛出反常识观点 → 数据/案例论证 → 给出结论和价值</p><p><strong>结构3：故事+教训+方法</strong></p><p>讲一个故事 → 提炼教训 → 给出可执行方法</p><h3>三、脚本写作SOP</h3><ol><li>确定选题和目标受众</li><li>写出3个开头版本，选最好的</li><li>填充核心内容（控制在60秒以内）</li><li>设计互动点（提问/投票/挑战）</li><li>写结尾CTA（关注/收藏/评论）</li><li>朗读测试，删减多余内容</li></ol><h3>四、AI辅助脚本写作</h3><p>用AI生成脚本初稿，再人工优化。提示词模板："请用[语气]写一个关于[主题]的短视频脚本，目标受众是[人群]，时长约[秒数]秒，要求开头3秒有悬念，结尾有互动引导。"</p>`,
      tags: ['内容创作', '脚本']
    },
    {
      kbKey: '内容创作体系/文案写作模板',
      title: '文案写作模板：高转化文案的万能公式',
      content: `<h2>高转化文案的核心公式</h2><p>无论标题、正文还是口播文案，都可以套用经过验证的模板。</p><h3>一、标题公式（5种万能模板）</h3><ul><li><strong>数字+利益</strong>："3个方法让你的XX提升200%"</li><li><strong>对比反差</strong>："月薪3000和月薪3万的人，差别只在这一点"</li><li><strong>悬念引发</strong>："这个功能90%的人没用过，但超级好用"</li><li><strong>身份认同</strong>："写给XX人的XX指南"</li><li><strong>时效紧迫</strong>："2026年最后一个季度，你必须知道的XX"</li></ul><h3>二、正文结构模板</h3><p><strong>PAS模型</strong>：Problem（痛点）→ Agitate（激化）→ Solve（解决）</p><p><strong>AIDA模型</strong>：Attention（注意）→ Interest（兴趣）→ Desire（欲望）→ Action（行动）</p><p><strong>SCQA模型</strong>：Situation（情境）→ Complication（冲突）→ Question（问题）→ Answer（回答）</p><h3>三、口播文案技巧</h3><ul><li>短句为主，一句不超过15个字</li><li>用"你"代替"大家"，增强对话感</li><li>每30秒设一个"钩子"（悬念、反转）</li><li>关键信息重复2-3次</li></ul><h3>四、AI文案优化</h3><p>用AI进行文案润色和A/B测试。提示词："请优化以下文案，让它更有吸引力，同时给出3个不同风格版本：[原文案]"</p>`,
      tags: ['内容创作', '文案']
    },
    {
      kbKey: '内容创作体系/短视频叙事结构',
      title: '短视频叙事结构：让完播率翻倍的节奏设计',
      content: `<h2>叙事节奏决定完播率</h2><p>短视频的叙事不是长视频的缩水版，而是完全不同的节奏体系。</p><h3>一、15-30秒短视频结构</h3><p><strong>0-3秒</strong>：钩子（悬念/冲突/数据/共鸣）</p><p><strong>3-10秒</strong>：核心信息（快速切入正题）</p><p><strong>10-20秒</strong>：案例/演示/论证</p><p><strong>20-30秒</strong>：总结+CTA</p><h3>二、1-3分钟中长视频结构</h3><p><strong>0-5秒</strong>：强力钩子</p><p><strong>5-15秒</strong>：背景铺垫（建立共鸣）</p><p><strong>15-60秒</strong>：核心内容（分点论述）</p><p><strong>60-90秒</strong>：案例/实操演示</p><p><strong>90-120秒</strong>：总结+互动引导</p><h3>三、节奏控制要点</h3><ul><li>每5-8秒一个画面切换</li><li>每15秒一个情绪/节奏转折</li><li>背景音乐与内容情绪匹配</li><li>关键信息用字幕强化</li><li>适当留白，不要信息过载</li></ul><h3>四、情绪曲线设计</h3><p>好的短视频情绪曲线：好奇→认同→惊喜→感动/启发→行动。每个节点都要有对应的画面和文案设计。</p>`,
      tags: ['内容创作', '短视频', '叙事']
    },

    // === AI工具应用 ===
    {
      kbKey: 'AI工具应用/AI选题与热点追踪',
      title: 'AI选题与热点追踪：让AI帮你找爆款方向',
      content: `<h2>AI让选题效率提升10倍</h2><p>2026年，AI选题工具已经从辅助变成了标配，掌握AI选题能力是自媒体人的核心竞争力。</p><h3>一、AI选题工具清单</h3><ul><li><strong>豆包</strong>（字节跳动）：免费，支持热点追踪+选题拓展+竞品分析</li><li><strong>ChatGPT/Claude</strong>：深度选题分析，生成长尾选题矩阵</li><li><strong>蝉妈妈/新抖</strong>：数据型选题，发现低竞争高需求赛道</li><li><strong>5118/百度指数</strong>：搜索需求洞察，发现用户真实问题</li></ul><h3>二、AI选题工作流</h3><ol><li>输入领域关键词，让AI生成20个选题方向</li><li>用AI分析每个选题的需求度、竞争度、时效性</li><li>结合热榜数据，筛选最有时效性的选题</li><li>让AI生成每个选题的3种切入角度</li><li>人工评估，选择最终选题</li></ol><h3>三、热点追踪自动化</h3><p>设置AI每日自动执行：</p><ul><li>早上8点：抓取各平台热榜，AI分析哪些与领域相关</li><li>中午12点：AI生成3个热点结合选题</li><li>晚上6点：AI评估当天选题执行效果</li></ul><h3>四、选题提示词模板</h3><p>"我是[领域]博主，目标受众是[人群]。请基于以下热点[热点信息]，生成5个与我的领域相关的选题，每个选题包含：标题、切入角度、预期效果、最佳发布时间。"</p>`,
      tags: ['AI工具', '选题', '效率']
    },
    {
      kbKey: 'AI工具应用/AI脚本与文案生成',
      title: 'AI脚本与文案生成：从提示词到成品的完整流程',
      content: `<h2>AI脚本生成的完整SOP</h2><p>AI不能替代创作，但能让创作效率提升5-10倍。关键在于如何写好提示词。</p><h3>一、AI脚本生成提示词框架</h3><p><strong>角色设定</strong>：你是一个拥有100万粉丝的[领域]博主，擅长用[风格]表达</p><p><strong>任务描述</strong>：请写一个关于[主题]的短视频脚本</p><p><strong>约束条件</strong>：</p><ul><li>时长：[X]秒</li><li>平台：[抖音/小红书/B站]</li><li>开头3秒必须有[悬念/冲突/数据]</li><li>结尾引导[关注/收藏/评论]</li><li>语气：[专业/幽默/温暖/犀利]</li></ul><p><strong>输出格式</strong>：分镜表（画面描述+口播文案+字幕）</p><h3>二、AI文案优化流程</h3><ol><li>AI生成初稿（3个版本）</li><li>人工选择最佳版本</li><li>AI针对弱项优化（开头/结尾/过渡）</li><li>人工朗读测试，调整口语化</li><li>AI生成标题5选1</li></ol><h3>三、常用AI写作工具</h3><ul><li><strong>豆包</strong>：免费，中文理解强，支持多轮对话优化</li><li><strong>ChatGPT</strong>：逻辑性强，适合结构化内容</li><li><strong>Claude</strong>：文笔最好，适合深度内容</li><li><strong>Kimi</strong>：长文本处理强，适合拆解长文章</li></ul><h3>四、AI文案A/B测试</h3><p>让AI对同一内容生成3种不同风格的文案（专业型/情绪型/故事型），分别发布到不同平台或时段，对比数据效果。</p>`,
      tags: ['AI工具', '脚本', '文案']
    },
    {
      kbKey: 'AI工具应用/AI视频生成',
      title: 'AI视频生成：2026最新工具与实操指南',
      content: `<h2>AI视频生成：一个人抵一个团队</h2><p>2026年AI视频生成已经从实验走向实用，掌握这些工具等于拥有了无限内容产能。</p><h3>一、AI视频生成工具对比</h3><table><tr><th>工具</th><th>特点</th><th>适合场景</th><th>费用</th></tr><tr><td>Seedance 2.0</td><td>字节出品，30秒高质量视频</td><td>短视频素材生成</td><td>免费</td></tr><tr><td>即梦AI</td><td>文生图+文生视频一体</td><td>封面+视频一站式</td><td>免费</td></tr><tr><td>Runway Gen-3</td><td>电影级画面质量</td><td>高质量B-roll素材</td><td>付费</td></tr><tr><td>Kling</td><td>国产，中文理解强</td><td>中国风内容</td><td>免费/付费</td></tr><tr><td>Sora</td><td>OpenAI，物理世界模拟</td><td>复杂场景生成</td><td>付费</td></tr></table><h3>二、AI视频生成工作流</h3><ol><li><strong>脚本</strong>：AI生成分镜脚本</li><li><strong>主镜头</strong>：用Runway/Kling生成关键画面</li><li><strong>补充镜头</strong>：用Seedance生成B-roll素材</li><li><strong>配音</strong>：AI声音克隆+对口型</li><li><strong>剪辑</strong>：CapCut/剪映自动剪辑</li><li><strong>字幕</strong>：AI自动生成+翻译</li></ol><h3>三、AI视频典型应用场景</h3><ul><li><strong>知识科普</strong>：文字→AI动画+AI配音→成片</li><li><strong>产品展示</strong>：商品图→AI动态展示→带货视频</li><li><strong>情景短剧</strong>：AI数字人+AI场景→连续剧</li><li><strong>混剪二创</strong>：AI素材+原创脚本→新内容</li></ul><h3>四、注意事项</h3><ul><li>AI生成内容需要人工审核，避免低质内容</li><li>保持个人风格，AI是工具不是替代品</li><li>关注平台对AI内容的标注要求</li><li>素材版权问题需注意</li></ul>`,
      tags: ['AI工具', '视频生成', 'Seedance']
    },
    {
      kbKey: 'AI工具应用/AI图片与封面设计',
      title: 'AI图片与封面设计：让点击率提升3倍',
      content: `<h2>封面是视频的第一印象</h2><p>好的封面能让点击率从3%提升到10%以上。AI让封面设计变得零门槛。</p><h3>一、AI图片生成工具</h3><ul><li><strong>Seedream</strong>（字节）：免费，中文提示词友好</li><li><strong>Midjourney</strong>：艺术感最强，适合创意封面</li><li><strong>即梦AI</strong>：文生图+智能排版一体化</li><li><strong>Canva AI</strong>：模板+AI生成，适合批量制作</li><li><strong>美图设计室</strong>：电商风格图片批量生成</li></ul><h3>二、封面设计原则</h3><ul><li><strong>大字标题</strong>：手机端可读，3-5个字</li><li><strong>高对比色</strong>：亮色背景+深色文字</li><li><strong>人脸优先</strong>：带人脸的封面点击率高30%</li><li><strong>情绪表达</strong>：惊讶/好奇/冲突的表情最吸引人</li><li><strong>一致性</strong>：系列内容保持统一风格</li></ul><h3>三、AI封面生成SOP</h3><ol><li>确定封面主题和关键文字</li><li>用AI生成背景图片（3-5张选1）</li><li>用Canva/美图添加文字和排版</li><li>生成3个版本进行A/B测试</li><li>根据点击数据持续优化风格</li></ol><h3>四、批量封面模板</h3><p>建立封面模板库，按内容类型分类：知识科普类、产品种草类、故事情感类、数据报告类。每类3-5个模板，AI填充内容即可。</p>`,
      tags: ['AI工具', '封面设计', '图片']
    },
    {
      kbKey: 'AI工具应用/AI声音与数字人',
      title: 'AI声音克隆与数字人：让内容生产24小时不停',
      content: `<h2>AI声音与数字人：内容产能的革命</h2><p>2026年，AI声音克隆和数字人技术已经成熟到可以大规模商用。一个人可以同时运营多个IP。</p><h3>一、AI声音克隆</h3><p><strong>原理</strong>：录制3-5分钟原声音，AI学习音色、语调、停顿习惯，生成任意内容的语音。</p><p><strong>工具</strong>：</p><ul><li><strong>豆包TTS</strong>：免费，中文自然度高</li><li><strong>ElevenLabs</strong>：最逼真，支持多语言</li><li><strong>魔音工坊</strong>：国内主流，方言支持好</li></ul><p><strong>应用场景</strong>：</p><ul><li>口播视频配音（不用反复录音）</li><li>多语言内容（中文→英文/日文自动配音）</li><li>有声书/播客批量制作</li></ul><h3>二、AI数字人</h3><p><strong>原理</strong>：用照片/视频素材训练数字人模型，输入文字即可生成说话视频。</p><p><strong>工具</strong>：</p><ul><li><strong>HeyGen</strong>：效果最好，支持对口型</li><li><strong>D-ID</strong>：照片转视频，门槛低</li><li><strong>硅基智能</strong>：国内主流，性价比高</li></ul><p><strong>应用场景</strong>：</p><ul><li>知识科普视频（不用出镜）</li><li>多账号矩阵运营</li><li>24小时直播带货</li><li>课程批量录制</li></ul><h3>三、视觉配音与对口型</h3><p>2026年的AI可以：改变视频中说话人的语言，同时完美匹配口型。这意味着一条中文视频可以自动生成英文、日文版本，实现全球分发。</p><h3>四、注意事项</h3><ul><li>声音/形象授权：使用自己的声音和形象</li><li>标注AI生成：遵守平台规则</li><li>保持真实感：AI内容也需要人工润色</li><li>版权意识：AI训练数据来源需合规</li></ul>`,
      tags: ['AI工具', '声音克隆', '数字人']
    },
    {
      kbKey: 'AI工具应用/AI剪辑与后期制作',
      title: 'AI剪辑与后期：让剪辑效率提升10倍',
      content: `<h2>AI剪辑工具全攻略</h2><p>2026年的AI剪辑已经能完成80%的后期工作，人工只需做创意决策。</p><h3>一、AI剪辑工具</h3><ul><li><strong>剪映/CapCut</strong>：自动字幕、智能抠像、AI配音、模板剪辑</li><li><strong>Descript</strong>：文字编辑视频，删除口癖自动剪辑</li><li><strong>Premiere Pro AI</strong>：自动色彩、智能追踪、AI降噪</li><li><strong>Opus Clip</strong>：长视频自动切片成短视频</li></ul><h3>二、AI剪辑工作流</h3><ol><li><strong>素材整理</strong>：AI自动标记素材关键帧</li><li><strong>粗剪</strong>：AI根据脚本自动排列素材</li><li><strong>精剪</strong>：AI去除口癖、停顿、废镜头</li><li><strong>字幕</strong>：AI自动生成+校对</li><li><strong>配乐</strong>：AI推荐匹配BGM</li><li><strong>调色</strong>：AI一键调色+风格统一</li><li><strong>导出</strong>：自动适配各平台规格</li></ol><h3>三、长转短切片技巧</h3><p>用Opus Clip或手动方式，将1小时直播/长视频切成10-20条短视频：</p><ul><li>AI自动识别精彩片段</li><li>自动生成竖屏版本</li><li>自动添加字幕和特效</li><li>一键分发到各平台</li></ul><h3>四、批量生产SOP</h3><p>建立标准化的剪辑流程，每条视频从素材到成品控制在30分钟以内。使用模板+AI，实现日更甚至一日三更。</p>`,
      tags: ['AI工具', '剪辑', '效率']
    },

    // === 平台运营策略 ===
    {
      kbKey: '平台运营策略/抖音运营',
      title: '抖音运营全攻略：算法理解与增长策略',
      content: `<h2>抖音算法与运营核心</h2><p>抖音的推荐算法是流量分发的核心，理解它才能获得持续流量。</p><h3>一、抖音推荐算法机制</h3><p><strong>流量池机制</strong>：初始200-500播放 → 数据达标 → 下一级流量池 → 逐级放大</p><p><strong>核心数据指标</strong>：</p><ul><li>完播率（最重要）：≥30%有机会进入下一流量池</li><li>点赞率：≥3%为优秀</li><li>评论率：≥0.5%为优秀</li><li>转发率：≥0.5%为优秀</li><li>关注率：≥1%说明内容吸粉</li></ul><h3>二、起号策略</h3><ol><li><strong>定位</strong>：明确领域和人设，前20条内容高度垂直</li><li><strong>养号</strong>：前3-5天正常浏览互动，每天1小时</li><li><strong>首条</strong>：精心准备，确保数据达标</li><li><strong>频率</strong>：前期每天1-2条，保持稳定</li><li><strong>时间</strong>：工作日12:00/18:00/21:00，周末10:00-22:00</li></ol><h3>三、内容策略</h3><ul><li><strong>3+1法则</strong>：3条流量内容+1条深度内容</li><li><strong>系列化</strong>：做成系列，提升关注率</li><li><strong>热点结合</strong>：每周至少1条蹭热点内容</li><li><strong>评论区运营</strong>：主动回复，引导讨论</li></ul><h3>四、变现路径</h3><ul><li>星图广告（1万粉可接）</li><li>橱窗带货</li><li>直播带货</li><li>小程序推广</li><li>知识付费引流</li></ul>`,
      tags: ['平台运营', '抖音', '算法']
    },
    {
      kbKey: '平台运营策略/小红书运营',
      title: '小红书运营全攻略：种草逻辑与爆款笔记',
      content: `<h2>小红书：最适合图文+视频混合运营的平台</h2><p>小红书的搜索流量长尾效应强，一篇好笔记可以持续获客数月甚至数年。</p><h3>一、小红书算法特点</h3><ul><li><strong>搜索权重高</strong>：SEO优化比抖音更重要</li><li><strong>图文笔记</strong>：封面+标题是点击率关键</li><li><strong>视频笔记</strong>：完播率+互动率为核心</li><li><strong>推荐周期长</strong>：好内容可被推荐1-3个月</li></ul><h3>二、爆款笔记公式</h3><p><strong>封面</strong>：高颜值/强对比/大字标题/步骤感</p><p><strong>标题</strong>：包含关键词+数字+情绪+利益点</p><p><strong>正文</strong>：</p><ul><li>开头50字决定是否展开</li><li>分段清晰，用emoji做视觉分隔</li><li>干货密度高，每段都有价值</li><li>结尾引导互动（提问/投票）</li></ul><h3>三、关键词布局</h3><ol><li>标题包含核心关键词</li><li>正文自然出现3-5次关键词</li><li>标签用长尾关键词</li><li>话题选择相关+热门</li></ol><h3>四、起号策略</h3><ul><li>前10篇笔记高度垂直</li><li>每天1篇，保持更新频率</li><li>参与平台活动获取流量扶持</li><li>1000粉后开始接商单</li></ul><h3>五、变现方式</h3><ul><li>蒲公英平台接广告</li><li>带货链接（淘宝/天猫）</li><li>私域引流（需注意平台规则）</li><li>品牌合作定制内容</li></ul>`,
      tags: ['平台运营', '小红书', '种草']
    },
    {
      kbKey: '平台运营策略/跨平台分发策略',
      title: '跨平台分发策略：一次创作全网分发',
      content: `<h2>一次创作，多平台分发</h2><p>同样的内容，适配不同平台格式，实现效率最大化。</p><h3>一、内容适配矩阵</h3><table><tr><th>平台</th><th>格式</th><th>时长</th><th>横竖屏</th><th>文案风格</th></tr><tr><td>抖音</td><td>短视频</td><td>15-60秒</td><td>竖屏</td><td>口语化/悬念</td></tr><tr><td>小红书</td><td>图文+视频</td><td>1-3分钟</td><td>竖屏</td><td>干货/种草</td></tr><tr><td>B站</td><td>长视频</td><td>5-15分钟</td><td>横屏</td><td>深度/专业</td></tr><tr><td>视频号</td><td>短视频</td><td>15-60秒</td><td>竖屏</td><td>情感/社交</td></tr><tr><td>公众号</td><td>图文</td><td>2000-5000字</td><td>-</td><td>深度/系统</td></tr></table><h3>二、分发SOP</h3><ol><li>创作原始内容（视频或图文）</li><li>抖音版：竖屏短剪辑+口播文案</li><li>小红书版：截图+图文笔记+关键词</li><li>B站版：横屏完整版+深度解说</li><li>视频号版：竖屏+社交话题引导</li><li>公众号版：图文长文+完整方法论</li></ol><h3>三、AI辅助分发</h3><p>用AI将一条内容自动适配多平台：</p><ul><li>AI根据平台特点改写文案</li><li>AI自动生成各平台标题</li><li>AI推荐最佳发布时间</li><li>AI生成各平台标签</li></ul><h3>四、发布时间表</h3><ul><li>抖音：12:00 / 18:00 / 21:00</li><li>小红书：7:00 / 12:00 / 20:00</li><li>B站：18:00 / 21:00（周末14:00）</li><li>视频号：19:00 / 21:00</li><li>公众号：8:00 / 21:00</li></ul>`,
      tags: ['平台运营', '分发', '效率']
    },

    // === 增长策略 ===
    {
      kbKey: '增长策略/流量获取与算法理解',
      title: '流量获取与算法理解：各平台推荐机制深度解析',
      content: `<h2>理解算法才能驾驭流量</h2><p>每个平台的推荐算法不同，但底层逻辑相通。</p><h3>一、通用算法逻辑</h3><p><strong>用户画像匹配</strong>：内容标签匹配用户兴趣标签</p><p><strong>质量评分</strong>：完播率×权重 + 互动率×权重 + 关注率×权重</p><p><strong>流量池升级</strong>：达标→下一级流量池→不达标→停止推荐</p><h3>二、各平台权重对比</h3><table><tr><th>指标</th><th>抖音</th><th>小红书</th><th>B站</th><th>视频号</th></tr><tr><td>完播率</td><td>★★★★★</td><td>★★★</td><td>★★★★</td><td>★★★★</td></tr><tr><td>点赞</td><td>★★★★</td><td>★★★★★</td><td>★★★</td><td>★★★</td></tr><tr><td>评论</td><td>★★★★</td><td>★★★★</td><td>★★★★★</td><td>★★★★</td></tr><tr><td>转发</td><td>★★★★★</td><td>★★★</td><td>★★★</td><td>★★★★★</td></tr><tr><td>收藏</td><td>★★</td><td>★★★★★</td><td>★★★★</td><td>★★</td></tr><tr><td>关注</td><td>★★★★</td><td>★★★</td><td>★★★★</td><td>★★★</td></tr></table><h3>三、提升各指标的方法</h3><ul><li><strong>完播率</strong>：开头3秒抓住注意力，控制时长，设置悬念</li><li><strong>互动率</strong>：结尾提问，制造争议观点，引导评论</li><li><strong>转发率</strong>：内容有价值/有情绪共鸣/有社交货币属性</li><li><strong>关注率</strong>：系列化内容，展示专业度，给出关注理由</li></ul><h3>四、AI辅助算法优化</h3><p>用AI分析每条内容的数据表现，找出影响流量的关键因素：</p><ul><li>AI分析完播率曲线，找出流失点</li><li>AI对比爆款和普通内容差异</li><li>AI生成优化建议（开头/时长/节奏）</li><li>AI预测内容流量潜力</li></ul>`,
      tags: ['增长策略', '算法', '流量']
    },
    {
      kbKey: '增长策略/粉丝增长策略',
      title: '粉丝增长策略：从0到10万的系统方法',
      content: `<h2>粉丝增长=内容力×运营力×传播力</h2><p>没有捷径，但有方法。系统化的增长策略能让效率提升3-5倍。</p><h3>一、0-1000粉：冷启动</h3><ul><li><strong>垂直内容</strong>：前30条内容专注一个细分领域</li><li><strong>高频更新</strong>：每天1-2条，稳定输出</li><li><strong>互动引流</strong>：在同行评论区提供价值</li><li><strong>互推合作</strong>：与同量级账号互相推荐</li><li><strong>活动涨粉</strong>：抽奖/福利/挑战赛</li></ul><h3>二、1000-10000粉：增长期</h3><ul><li><strong>内容矩阵</strong>：3+1法则（流量内容+深度内容）</li><li><strong>系列化</strong>：打造IP系列，提升回访率</li><li><strong>热点结合</strong>：每周蹭1-2个热点</li><li><strong>直播固粉</strong>：每周1-2次直播，增强粘性</li><li><strong>粉丝社群</strong>：建立核心粉丝群</li></ul><h3>三、10000-100000粉：爆发期</h3><ul><li><strong>矩阵号</strong>：用AI辅助运营多个账号</li><li><strong>跨平台</strong>：一次创作多平台分发</li><li><strong>品牌合作</strong>：借力品牌流量</li><li><strong>私域沉淀</strong>：引导加微信/进社群</li><li><strong>产品化</strong>：将内容沉淀为产品/课程</li></ul><h3>四、增长加速器</h3><ul><li><strong>AI内容</strong>：用AI提升产能，日更不累</li><li><strong>数据分析</strong>：每周复盘，找到增长杠杆</li><li><strong>用户UGC</strong>：设计挑战赛，让粉丝帮你传播</li><li><strong>跨界合作</strong>：与其他领域博主联动</li></ul>`,
      tags: ['增长策略', '粉丝增长']
    },
    {
      kbKey: '增长策略/私域引流与运营',
      title: '私域引流与运营：把流量变成资产',
      content: `<h2>公域获客，私域变现</h2><p>粉丝不是你的，私域用户才是。把平台流量沉淀到私域是长期变现的基础。</p><h3>一、私域引流路径</h3><ul><li><strong>抖音→私域</strong>：主页简介/粉丝群/直播引导</li><li><strong>小红书→私域</strong>：瞬间/收藏夹/评论区暗示</li><li><strong>B站→私域</strong>：简介区/动态/视频结尾</li><li><strong>公众号→私域</strong>：菜单栏/文末/自动回复</li></ul><h3>二、私域运营SOP</h3><ol><li><strong>人设</strong>：私域里展示更真实、更有温度的一面</li><li><strong>内容</strong>：每天1条朋友圈，3天1条价值内容，1周1条产品/活动</li><li><strong>互动</strong>：主动评论互动，点赞好友圈，保持存在感</li><li><strong>分层</strong>：核心用户/普通用户/潜在用户分类运营</li></ol><h3>三、私域变现路径</h3><ul><li><strong>咨询</strong>：一对一服务，客单价高</li><li><strong>社群</strong>：付费社群，月费/年费</li><li><strong>课程</strong>：系统课程，批量交付</li><li><strong>带货</strong>：团购/推荐好物</li><li><strong>活动</strong>：线下活动/训练营</li></ul><h3>四、AI辅助私域运营</h3><ul><li>AI自动回复常见问题</li><li>AI生成朋友圈文案（每日3条）</li><li>AI分析用户画像和需求</li><li>AI推荐最佳互动时机</li><li>AI自动生成用户分层标签</li></ul>`,
      tags: ['增长策略', '私域', '变现']
    },

    // === 变现方法 ===
    {
      kbKey: '变现方法/变现路径规划',
      title: '变现路径规划：从0到月入10万的路线图',
      content: `<h2>变现不是终点，而是起点</h2><p>没有变现的自媒体是爱好，能变现的自媒体才是事业。规划好变现路径，每一步都有的放矢。</p><h3>一、变现阶段规划</h3><p><strong>阶段1（0-1000粉）</strong>：</p><ul><li>积累内容，不急于变现</li><li>测试内容方向，找到最擅长领域</li><li>建立个人品牌认知</li></ul><p><strong>阶段2（1000-1万粉）</strong>：</p><ul><li>接小额广告（星图/蒲公英）</li><li>开始私域引流</li><li>测试知识付费（小额付费内容）</li></ul><p><strong>阶段3（1万-10万粉）</strong>：</p><ul><li>品牌广告合作</li><li>直播带货/橱窗</li><li>付费社群/课程</li><li>咨询/1对1服务</li></ul><p><strong>阶段4（10万+粉）</strong>：</p><ul><li>品牌代言</li><li>自建品牌/产品</li><li>矩阵运营</li><li>IP授权/联名</li></ul><h3>二、变现收入结构建议</h3><ul><li>广告收入：30-40%</li><li>电商带货：20-30%</li><li>知识付费：20-30%</li><li>私域变现：10-20%</li></ul><p>不要依赖单一收入来源，分散风险。</p><h3>三、AI辅助变现</h3><ul><li>AI分析粉丝画像，推荐最匹配的变现方式</li><li>AI生成带货文案和产品描述</li><li>AI分析竞品变现模式</li><li>AI预测不同变现方式的ROI</li></ul>`,
      tags: ['变现', '规划', '商业']
    },
    {
      kbKey: '变现方法/带货与电商变现',
      title: '带货与电商变现：选品到成交的全流程',
      content: `<h2>带货变现全流程</h2><p>带货不是硬推，而是把好产品匹配给需要的人。</p><h3>一、选品原则</h3><ul><li><strong>人货匹配</strong>：产品与你的领域和人设一致</li><li><strong>需求验证</strong>：搜索量高、讨论度高的品类</li><li><strong>利润空间</strong>：佣金率≥20%才有推广价值</li><li><strong>复购可能</strong>：消耗品/持续需求的产品</li><li><strong>品质保障</strong>：自己用过，确认质量</li></ul><h3>二、带货内容类型</h3><ul><li><strong>种草测评</strong>：真实体验+优缺点分析</li><li><strong>对比横评</strong>：多产品对比，帮用户决策</li><li><strong>场景植入</strong>：在生活中自然使用产品</li><li><strong>教程攻略</strong>：用产品解决问题的方法</li><li><strong>直播带货</strong>：实时互动+限时优惠</li></ul><h3>三、带货SOP</h3><ol><li>选品：AI分析市场趋势+粉丝需求</li><li>体验：自己使用1周以上</li><li>脚本：AI生成带货脚本+人工优化</li><li>拍摄：真实场景+产品特写</li><li>剪辑：突出卖点+使用效果</li><li>发布：最佳时间+平台适配</li><li>复盘：分析转化数据，优化选品</li></ol><h3>四、直播带货要点</h3><ul><li>固定时间，培养观看习惯</li><li>前3分钟留住人（抽奖/福利）</li><li>每5分钟讲一个品</li><li>用AI辅助：自动回复/数据分析</li><li>下播后立即复盘数据</li></ul>`,
      tags: ['变现', '带货', '电商']
    },

    // === 个人品牌建设 ===
    {
      kbKey: '个人品牌建设/IP定位与人设打造',
      title: 'IP定位与人设打造：让别人记住你',
      content: `<h2>IP定位是自媒体的根基</h2><p>内容可以被AI替代，但个人IP不能。你的独特性就是最大的护城河。</p><h3>一、IP定位三要素</h3><ul><li><strong>我是谁</strong>：你的身份标签（XX领域的XX人）</li><li><strong>我做什么</strong>：你为谁解决什么问题</li><li><strong>我有什么不同</strong>：你的独特价值主张</li></ul><h3>二、人设打造方法</h3><p><strong>外在标签</strong>：</p><ul><li>口头禅/标志性开场白</li><li>穿着风格/视觉符号</li><li>背景/拍摄场景一致性</li></ul><p><strong>内在特质</strong>：</p><ul><li>性格标签（专业/幽默/温暖/犀利）</li><li>价值观表达（对事物的态度）</li><li>故事背景（个人经历/转折点）</li></ul><h3>三、差异化策略</h3><ol><li>找出领域内Top10博主的人设标签</li><li>找出空白点（没人做的定位）</li><li>结合自身优势，选择差异化方向</li><li>用AI分析竞品人设，找到差异化空间</li></ol><h3>四、IP演进路径</h3><ul><li><strong>初期</strong>：单一标签（XX领域的分享者）</li><li><strong>中期</strong>：多元标签（XX领域+生活方式+观点输出）</li><li><strong>后期</strong>：品牌化（XX=某个品类/某种生活方式）</li></ul>`,
      tags: ['个人品牌', 'IP定位', '人设']
    },
    {
      kbKey: '个人品牌建设/品牌视觉识别系统',
      title: '品牌视觉识别系统：统一的视觉记忆',
      content: `<h2>视觉一致性=品牌识别力</h2><p>从封面到头像，从字幕到背景，每个视觉元素都应该有统一的设计语言。</p><h3>一、视觉系统要素</h3><ul><li><strong>主色调</strong>：1个主色+1个辅色（如晓桃的绿色系）</li><li><strong>字体</strong>：标题字体+正文字体（全平台统一）</li><li><strong>Logo/头像</strong>：简洁、辨识度高、小尺寸可读</li><li><strong>封面模板</strong>：3-5套封面模板，按内容类型使用</li><li><strong>字幕样式</strong>：统一的字体/颜色/描边/位置</li><li><strong>片头片尾</strong>：≤2秒的品牌动画</li></ul><h3>二、AI辅助视觉设计</h3><ul><li>用AI生成品牌色方案</li><li>用AI批量生成封面</li><li>用AI设计logo和视觉元素</li><li>用AI保持跨平台视觉统一</li></ul><h3>三、视觉规范文档</h3><p>建立品牌视觉规范，包含：</p><ul><li>色值（HEX/RGB）</li><li>字体名称和大小</li><li>Logo使用规范</li><li>封面模板PSD/Canva链接</li><li>各平台头像/背景规格</li></ul>`,
      tags: ['个人品牌', '视觉设计', '品牌']
    },

    // === 数据分析 ===
    {
      kbKey: '数据分析/数据指标体系',
      title: '数据指标体系：自媒体人必须关注的核心数据',
      content: `<h2>数据是内容的指南针</h2><p>不看数据的创作是盲目创作，用数据驱动决策才能持续增长。</p><h3>一、核心数据指标</h3><p><strong>流量指标</strong>：</p><ul><li>播放量/阅读量</li><li>完播率/完读率</li><li>曝光量→点击率</li></ul><p><strong>互动指标</strong>：</p><ul><li>点赞率 = 点赞数 / 播放量</li><li>评论率 = 评论数 / 播放量</li><li>转发率 = 转发数 / 播放量</li><li>收藏率 = 收藏数 / 播放量</li></ul><p><strong>增长指标</strong>：</p><ul><li>关注率 = 新增关注 / 播放量</li><li>取关率</li><li>粉丝净增长</li></ul><p><strong>变现指标</strong>：</p><ul><li>转化率</li><li>客单价</li><li>复购率</li><li>ROI</li></ul><h3>二、数据基准线</h3><table><tr><th>指标</th><th>一般</th><th>良好</th><th>优秀</th></tr><tr><td>完播率</td><td>15%</td><td>30%</td><td>50%+</td></tr><tr><td>点赞率</td><td>1%</td><td>3%</td><td>5%+</td></tr><tr><td>评论率</td><td>0.3%</td><td>0.5%</td><td>1%+</td></tr><tr><td>关注率</td><td>0.5%</td><td>1%</td><td>2%+</td></tr></table><h3>三、AI辅助数据分析</h3><ul><li>AI自动生成每周数据报告</li><li>AI分析内容数据与趋势的关系</li><li>AI预测下周内容表现</li><li>AI推荐优化方向</li></ul>`,
      tags: ['数据分析', '指标', '优化']
    },
    {
      kbKey: '数据分析/内容复盘方法',
      title: '内容复盘方法：让每条内容都成为养分',
      content: `<h2>不复盘=白做</h2><p>每条内容都是一次实验，复盘是把实验结果转化为经验的唯一方法。</p><h3>一、复盘SOP</h3><ol><li><strong>数据收集</strong>：发布48小时后记录核心数据</li><li><strong>对比分析</strong>：与近10条内容的平均值对比</li><li><strong>归因分析</strong>：找出数据好/差的原因</li><li><strong>经验提炼</strong>：总结可复用的方法</li><li><strong>计划调整</strong>：基于复盘优化下一条内容</li></ol><h3>二、复盘维度</h3><p><strong>内容维度</strong>：</p><ul><li>选题方向是否对？</li><li>开头3秒是否抓住了注意力？</li><li>内容结构是否清晰？</li><li>结尾CTA是否有效？</li></ul><p><strong>执行维度</strong>：</p><ul><li>拍摄质量如何？</li><li>剪辑节奏是否好？</li><li>封面标题是否吸引？</li><li>发布时间是否最佳？</li></ul><p><strong>外部维度</strong>：</p><ul><li>是否蹭到了热点？</li><li>算法推荐情况如何？</li><li>竞品同期表现如何？</li></ul><h3>三、AI辅助复盘</h3><p>提示词模板：</p><p>"以下是我最新一条内容的数据：[数据]。近10条平均数据：[平均数据]。内容描述：[内容摘要]。请分析：1.这条内容表现如何？2.可能的原因是什么？3.对下一条内容有什么建议？"</p>`,
      tags: ['数据分析', '复盘', '优化']
    },

    // === AI持续迭代方案 ===
    {
      kbKey: 'AI持续迭代方案/AI辅助创作SOP',
      title: 'AI辅助创作SOP：从选题到发布的标准化流程',
      content: `<h2>AI辅助创作全流程SOP</h2><p>把AI融入创作每个环节，建立可重复、可优化的标准化流程。</p><h3>一、日更SOP（每天1条内容）</h3><table><tr><th>时间</th><th>环节</th><th>AI辅助</th><th>人工</th></tr><tr><td>8:00</td><td>选题</td><td>AI推送热点+生成选题</td><td>筛选确认</td></tr><tr><td>8:30</td><td>脚本</td><td>AI生成脚本初稿</td><td>优化口语化</td></tr><tr><td>9:00</td><td>素材</td><td>AI生成图片/视频素材</td><td>审核选择</td></tr><tr><td>10:00</td><td>拍摄</td><td>-</td><td>真人拍摄</td></tr><tr><td>11:00</td><td>剪辑</td><td>AI自动字幕+粗剪</td><td>精剪+调色</td></tr><tr><td>12:00</td><td>发布</td><td>AI生成标题+标签</td><td>确认发布</td></tr><tr><td>21:00</td><td>复盘</td><td>AI数据分析</td><td>记录结论</td></tr></table><h3>二、周更SOP（每周1条深度内容）</h3><ol><li><strong>周一</strong>：选题会（AI分析+人工决策）</li><li><strong>周二</strong>：调研（AI收集资料+人工补充）</li><li><strong>周三</strong>：大纲（AI生成+人工调整）</li><li><strong>周四</strong>：创作（AI辅助+人工主导）</li><li><strong>周五</strong>：制作（AI素材+人工剪辑）</li><li><strong>周六</strong>：审核（AI质检+人工终审）</li><li><strong>周日</strong>：发布+复盘</li></ol><h3>三、AI工具链配置</h3><ul><li><strong>选题</strong>：豆包/ChatGPT + 热榜API</li><li><strong>脚本</strong>：Claude（逻辑强）/ 豆包（口语化）</li><li><strong>素材</strong>：Seedream（图片）/ Seedance（视频）</li><li><strong>配音</strong>：声音克隆（ElevenLabs/豆包TTS）</li><li><strong>剪辑</strong>：剪映/CapCut AI功能</li><li><strong>分析</strong>：AI自定义数据报告</li></ul><h3>四、效率目标</h3><ul><li>日更内容：每条≤2小时（含拍摄）</li><li>周更深度内容：每条≤6小时</li><li>跨平台分发：额外30分钟/平台</li><li>每周总投入：≤20小时</li></ul>`,
      tags: ['AI迭代', 'SOP', '效率', '方法论']
    },
    {
      kbKey: 'AI持续迭代方案/每周AI复盘流程',
      title: '每周AI复盘流程：让AI帮你持续进化',
      content: `<h2>每周AI复盘：持续进化的引擎</h2><p>设定固定的每周复盘流程，用AI帮你发现问题、找到方向、持续优化。</p><h3>一、每周复盘时间表</h3><p><strong>周日晚上 20:00-21:00</strong>：</p><ol><li>数据汇总（10分钟）</li><li>AI分析报告（15分钟）</li><li>人工深度思考（20分钟）</li><li>下周计划制定（15分钟）</li></ol><h3>二、AI复盘提示词模板</h3><p>"我是一个[领域]自媒体博主。本周发布了以下内容：</p><p>[内容1：标题+数据]</p><p>[内容2：标题+数据]...</p><p>近4周平均数据：[平均数据]</p><p>本周目标：[目标]</p><p>请帮我分析：</p><p>1.本周整体表现如何？哪些内容超出预期？哪些低于预期？</p><p>2.分析每条内容表现好坏的可能原因</p><p>3.与上月相比，有什么趋势变化？</p><p>4.下周应该重点做什么类型的内容？</p><p>5.有什么需要改进的地方？</p><p>6.给出下周3个具体选题建议。"</p><h3>三、月度复盘</h3><p>每月最后一天，用AI进行更深入的分析：</p><ul><li>月度内容矩阵分析（哪些类型效果好）</li><li>粉丝增长趋势分析</li><li>变现效率分析</li><li>竞品月度对比</li><li>下月内容日历规划</li></ul><h3>四、季度战略复盘</h3><p>每季度一次深度复盘：</p><ul><li>IP定位是否需要调整？</li><li>内容方向是否需要转向？</li><li>变现模式是否需要升级？</li><li>AI工具链是否需要更新？</li><li>团队/工具/流程是否需要升级？</li></ul><h3>五、AI复盘输出物</h3><ul><li>每周：1页纸分析报告+下周计划</li><li>每月：3页纸月度报告+下月日历</li><li>每季度：战略复盘文档+下季度OKR</li></ul>`,
      tags: ['AI迭代', '复盘', '方法论', '持续进化']
    },
    {
      kbKey: 'AI持续迭代方案/竞品AI分析',
      title: '竞品AI分析：用AI帮你监控和学习同行',
      content: `<h2>竞品分析：知己知彼</h2><p>用AI持续监控竞品动态，学习他们的优点，避开他们的弯路。</p><h3>一、竞品选择</h3><p>选择5-10个同领域博主作为竞品：</p><ul><li>头部竞品（比你大10倍）：学习方向</li><li>同级竞品（与你差不多）：直接竞争</li><li>增长竞品（增长最快）：学习增长方法</li><li>跨界竞品（其他领域）：创新灵感</li></ul><h3>二、竞品监控维度</h3><ul><li><strong>内容方向</strong>：最近在做什么内容？有什么新方向？</li><li><strong>数据表现</strong>：哪些内容爆了？哪些扑了？</li><li><strong>运营策略</strong>：更新频率/发布时间/互动方式</li><li><strong>变现模式</strong>：在做什么变现？效果如何？</li><li><strong>人设变化</strong>：IP定位有没有调整？</li></ul><h3>三、AI竞品分析SOP</h3><ol><li>每周用AI抓取竞品内容数据</li><li>AI分析竞品爆款内容的共同特征</li><li>AI对比你和竞品的内容差异</li><li>AI生成学习建议和差异化方向</li><li>人工评估，选择性吸收</li></ol><h3>四、AI竞品分析提示词</h3><p>"以下是5个竞品最近一周的内容数据：</p><p>[竞品1数据]</p><p>[竞品2数据]...</p><p>我的内容数据：[我的数据]</p><p>请分析：</p><p>1.竞品本周的共同热门选题方向是什么？</p><p>2.我和竞品在内容上的差异主要在哪？</p><p>3.竞品有哪些做法值得我学习？</p><p>4.我有哪些优势是竞品没有的？</p><p>5.下周我应该如何差异化？"</p><h3>五、竞品分析工具</h3><ul><li>蝉妈妈/新抖：数据型分析</li><li>AI自定义分析：灵活深度分析</li><li>人工体验：关注竞品+体验内容</li><li>用户调研：粉丝对竞品的看法</li></ul>`,
      tags: ['AI迭代', '竞品分析', '方法论']
    },
  ];

  // === 创建标签 ===
  const tagNames = [...new Set(documents.flatMap(d => d.tags))];
  const tagMap = {};
  for (const name of tagNames) {
    let tag = await prisma.tag.findFirst({
      where: { name, userId: 'user-default', parentId: null }
    });
    if (!tag) {
      tag = await prisma.tag.create({
        data: { name, userId: 'user-default', color: '#4ECDC4' }
      });
    }
    tagMap[name] = tag;
    console.log(`Tag: ${name}`);
  }

  // === 创建文档 ===
  for (const doc of documents) {
    const kb = createdKbs[doc.kbKey];
    if (!kb) {
      console.error(`KB not found for key: ${doc.kbKey}`);
      continue;
    }

    const plainText = doc.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.length;

    const document = await prisma.document.create({
      data: {
        title: doc.title,
        content: doc.content,
        plainText,
        wordCount,
        knowledgeBaseId: kb.id,
        userId: 'user-default',
      }
    });

    // 关联标签
    for (const tagName of doc.tags) {
      const tag = tagMap[tagName];
      if (tag) {
        await prisma.documentTag.create({
          data: { documentId: document.id, tagId: tag.id }
        }).catch(() => {}); // 忽略重复
      }
    }

    console.log(`Doc: ${doc.title}`);
  }

  // === 创建自媒体专属标签 ===
  const extraTags = ['自媒体', '2026趋势', '爆款', 'SOP', '成长'];
  for (const name of extraTags) {
    let existing = await prisma.tag.findFirst({
      where: { name, userId: 'user-default', parentId: null }
    });
    if (!existing) {
      await prisma.tag.create({
        data: { name, userId: 'user-default', color: '#FF6B6B' }
      });
    }
    console.log(`Extra tag: ${name}`);
  }

  // === 创建小记：自媒体每日提醒 ===
  const notes = [
    { content: '【每日提醒】选题>创作>分发>复盘，每天4步循环。AI提效，但创意归你。', tags: ['自媒体', 'SOP'] },
    { content: '【起号三要素】定位垂直+高频更新+数据复盘。前30条不求爆款，求垂直和稳定。', tags: ['自媒体', '增长策略'] },
    { content: '【AI工具优先级】先用免费的：豆包(选题/文案)+Seedream(图片)+Seedance(视频)+剪映(剪辑)。付费后加：ElevenLabs(声音)+HeyGen(数字人)。', tags: ['AI工具', '效率'] },
    { content: '【变现节奏】0-1k粉养号→1k-1w粉接广告→1w-10w粉带货+课程→10w+粉品牌化。不要跳级。', tags: ['变现', '规划'] },
    { content: '【每周复盘5问】1.哪条最火？为什么？2.哪条最差？为什么？3.粉丝在问什么？4.竞品在做什么？5.下周做什么？', tags: ['AI迭代', '复盘'] },
  ];

  for (const note of notes) {
    const plainText = note.content.replace(/<[^>]+>/g, ' ').trim();
    const created = await prisma.note.create({
      data: { content: note.content, plainText, userId: 'user-default' }
    });
    for (const tagName of note.tags) {
      const tag = tagMap[tagName];
      if (tag) {
        await prisma.noteTag.create({
          data: { noteId: created.id, tagId: tag.id }
        }).catch(() => {});
      }
    }
    console.log(`Note: ${note.content.substring(0, 30)}...`);
  }

  console.log('\n✅ 自媒体知识库创建完成！');
  console.log(`新增分类: ${Object.keys(createdKbs).length}`);
  console.log(`新增文档: ${documents.length}`);
  console.log(`新增标签: ${tagNames.length + extraTags.length}`);
  console.log(`新增小记: ${notes.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
