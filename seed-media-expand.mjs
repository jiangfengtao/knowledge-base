#!/usr/bin/env node
/**
 * 自媒体知识库扩展脚本（幂等）
 * 补充缺失文档 + 新增知识分类
 * 基于2026年最新自媒体趋势研究
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 幂等工具函数
async function findOrCreateTag(name, color = '#4ECDC4') {
  let tag = await prisma.tag.findFirst({
    where: { name, userId: 'user-default', parentId: null }
  });
  if (!tag) {
    tag = await prisma.tag.create({
      data: { name, userId: 'user-default', color }
    });
  }
  return tag;
}

async function findOrCreateKb(name, parentId, opts = {}) {
  let kb = await prisma.knowledgeBase.findFirst({
    where: { name, parentId, userId: 'user-default' }
  });
  if (!kb) {
    kb = await prisma.knowledgeBase.create({
      data: {
        name,
        parentId,
        userId: 'user-default',
        icon: opts.icon || null,
        color: opts.color || null,
        sortOrder: opts.sortOrder || 0,
      }
    });
    console.log(`Created KB: ${name}`);
  }
  return kb;
}

async function findOrCreateDocument(title, kbId, content, tags = []) {
  let doc = await prisma.document.findFirst({
    where: { title, knowledgeBaseId: kbId, userId: 'user-default' }
  });
  if (!doc) {
    const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = plainText.length;
    doc = await prisma.document.create({
      data: { title, content, plainText, wordCount, knowledgeBaseId: kbId, userId: 'user-default' }
    });

    // 关联标签
    for (const tagName of tags) {
      const tag = await findOrCreateTag(tagName);
      await prisma.documentTag.create({
        data: { documentId: doc.id, tagId: tag.id }
      }).catch(() => {});
    }
    console.log(`Doc: ${title}`);
  } else {
    console.log(`Skip (exists): ${title}`);
  }
  return doc;
}

async function main() {
  const user = await prisma.user.findFirst({ where: { id: 'user-default' } });
  if (!user) throw new Error('Default user not found');

  const mediaRoot = await prisma.knowledgeBase.findFirst({
    where: { name: { contains: '自媒体' }, userId: 'user-default' }
  });
  if (!mediaRoot) throw new Error('Self-media root KB not found');
  console.log(`Root: ${mediaRoot.name} (${mediaRoot.id})`);

  // ========================================
  // 第一部分：修复视频号运营图标
  // ========================================
  const videoChannel = await prisma.knowledgeBase.findFirst({
    where: { name: '视频号运营', userId: 'user-default' }
  });
  if (videoChannel && videoChannel.icon === '绿色') {
    await prisma.knowledgeBase.update({
      where: { id: videoChannel.id },
      data: { icon: '💚' }
    });
    console.log('Fixed 视频号运营 icon');
  }

  // ========================================
  // 第二部分：补充缺失文档（7篇）
  // ========================================
  console.log('\n=== 补充缺失文档 ===');

  // 1. B站运营
  const bStationKb = await prisma.knowledgeBase.findFirst({
    where: { name: 'B站运营', userId: 'user-default' }
  });
  if (bStationKb) {
    await findOrCreateDocument(
      'B站运营全攻略：社区文化与增长策略',
      bStationKb.id,
      `<h2>B站：中长视频的黄金赛道</h2><p>B站用户粘性高、社区氛围强，是知识类、深度内容创作者的最佳平台。</p><h3>一、B站社区文化</h3><ul><li><strong>弹幕文化</strong>：用户通过弹幕实时互动，是B站独有的社交货币</li><li><strong>社区认同</strong>：B站用户对"用爱发电"的内容有天然好感</li><li><strong>二次元基因</strong>：ACG文化是根基，但已扩展到知识、生活、科技等</li><li><strong>年轻用户</strong>：18-35岁为主，消费力强，付费意愿高</li></ul><h3>二、B站推荐算法</h3><p><strong>核心指标</strong>：</p><ul><li>完播率（权重最高）：≥40%有机会上首页推荐</li><li>一键三连（点赞+投币+收藏）：综合互动率≥5%为优秀</li><li>弹幕密度：弹幕多的视频被推荐更多</li><li>评论质量：长评论/高质量讨论提升权重</li></ul><h3>三、内容策略</h3><ul><li><strong>时长</strong>：5-15分钟为黄金区间，知识科普可到20分钟</li><li><strong>格式</strong>：横屏1080P，前15秒必须有钩子</li><li><strong>封面</strong>：高清截图+大字标题，风格统一</li><li><strong>分区</strong>：选择精准分区，提升推荐效率</li><li><strong>标签</strong>：3-5个精准标签，包含核心关键词</li></ul><h3>四、增长策略</h3><ul><li>固定更新频率（周更2-3条）</li><li>系列化内容，提升回访率</li><li>互动区运营，回复弹幕和评论</li><li>参与活动（创作激励/充电计划）</li><li>动态运营（类似朋友圈，保持日常互动）</li></ul><h3>五、变现路径</h3><ul><li>创作激励计划（播放量分成）</li><li>充电计划（粉丝打赏）</li><li>品牌合作（花火平台）</li><li>课程/付费内容</li><li>直播</li><li>带货（逛逛+商品橱窗）</li></ul>`,
      ['平台运营', 'B站', '算法']
    );
  }

  // 2. 视频号运营
  const wxChannelKb = await prisma.knowledgeBase.findFirst({
    where: { name: '视频号运营', userId: 'user-default' }
  });
  if (wxChannelKb) {
    await findOrCreateDocument(
      '视频号运营全攻略：社交裂变与私域联动',
      wxChannelKb.id,
      `<h2>视频号：微信生态的流量新入口</h2><p>视频号背靠14亿微信用户，社交推荐+算法推荐双引擎，是私域变现的最佳平台。</p><h3>一、视频号算法特点</h3><ul><li><strong>社交推荐</strong>：朋友点赞/看过的内容优先推荐</li><li><strong>算法推荐</strong>：基于用户兴趣标签推荐</li><li><strong>搜索流量</strong>：微信搜一搜导流，长尾效应强</li><li><strong>公私域联动</strong>：可直接导流到公众号/微信群/小程序</li></ul><h3>二、内容策略</h3><ul><li><strong>时长</strong>：15-60秒最佳，完播率权重高</li><li><strong>格式</strong>：竖屏为主，清晰度1080P</li><li><strong>风格</strong>：情感共鸣/实用干货/社交话题更受欢迎</li><li><strong>封面</strong>：大字标题+人物/场景，一眼看懂</li><li><strong>更新</strong>：日更或隔日更新，保持活跃度</li></ul><h3>三、社交裂变策略</h3><ul><li>引导点赞：点赞=推荐给朋友，是核心传播方式</li><li>引导转发：转发到朋友圈/群聊，触发社交推荐</li><li>引导关注：关注后可推送新内容</li><li>评论区互动：提升内容活跃度</li></ul><h3>四、私域联动SOP</h3><ol><li>视频号发布内容</li><li>引导关注视频号</li><li>主页挂载公众号链接</li><li>公众号引导加微信/进群</li><li>私域沉淀后变现</li></ol><h3>五、变现路径</h3><ul><li>直播带货（微信小店/小程序商城）</li><li>视频号广告（互选平台）</li><li>私域变现（社群/课程/咨询）</li><li>公众号导流（广告/带货）</li><li>小程序/企微联动</li></ul>`,
      ['平台运营', '视频号', '私域']
    );
  }

  // 3. 广告与品牌合作
  const adKb = await prisma.knowledgeBase.findFirst({
    where: { name: '广告与品牌合作', userId: 'user-default' }
  });
  if (adKb) {
    await findOrCreateDocument(
      '广告与品牌合作完全指南：从报价到交付',
      adKb.id,
      `<h2>广告合作：自媒体变现的核心路径</h2><p>品牌合作是自媒体最直接的收入来源，掌握报价、谈判、交付的全流程至关重要。</p><h3>一、广告报价体系</h3><p><strong>基础报价公式</strong>：</p><ul><li>视频广告：粉丝数×0.03-0.1元/粉</li><li>图文广告：粉丝数×0.02-0.05元/粉</li><li>直播口播：粉丝数×0.05-0.15元/粉</li><li>全案合作：根据需求定制，通常1万-50万</li></ul><p><strong>影响因素</strong>：</p><ul><li>粉丝质量（活跃度/消费力）</li><li>内容垂直度（越垂直溢价越高）</li><li>数据表现（近30天平均播放/互动）</li><li>品牌预算和合作形式</li><li>排期紧密度（加急可溢价20-50%）</li></ul><h3>二、接单渠道</h3><ul><li><strong>抖音</strong>：星图（官方）、巨量星图</li><li><strong>小红书</strong>：蒲公英平台</li><li><strong>B站</strong>：花火平台</li><li><strong>视频号</strong>：互选平台</li><li><strong>公众号</strong>：新榜/第三方广告平台</li><li><strong>直接合作</strong>：品牌方直接联系（利润最高）</li></ul><h3>三、合作流程SOP</h3><ol><li><strong>需求确认</strong>：品牌需求+预算+排期</li><li><strong>报价沟通</strong>：发报价单+案例参考</li><li><strong>合同签订</strong>：明确内容要求/修改次数/发布时间/付款方式</li><li><strong>内容创作</strong>：品牌Brief→脚本确认→拍摄→剪辑</li><li><strong>审核修改</strong>：品牌确认→修改→终稿</li><li><strong>按时发布</strong>：按约定时间发布，保留数据截图</li><li><strong>数据反馈</strong>：发布后7天给品牌数据报告</li><li><strong>结算收款</strong>：按合同约定收款</li></ol><h3>四、避坑指南</h3><ul><li>不接与领域不符的广告（伤人设）</li><li>不接无资质/灰色产品广告</li><li>合同明确修改次数（防止无限修改）</li><li>收款方式：预付50%+发布后50%</li><li>保留创作自主权，不完全按品牌意思来</li><li>遵守广告法，不使用绝对化用语</li></ul><h3>五、长期合作</h3><ul><li>好品牌合作后维护关系，争取年度框架</li><li>建立品牌案例库，用于新客户开发</li><li>提供增值服务（如多平台分发/数据报告）</li><li>推荐其他博主，赚取中介费</li></ul>`,
      ['变现', '广告', '品牌合作']
    );
  }

  // 4. 知识付费与课程
  const courseKb = await prisma.knowledgeBase.findFirst({
    where: { name: '知识付费与课程', userId: 'user-default' }
  });
  if (courseKb) {
    await findOrCreateDocument(
      '知识付费与课程设计指南：从内容到产品',
      courseKb.id,
      `<h2>知识付费：把经验变成产品</h2><p>知识付费是边际成本最低的变现方式，一次制作，反复销售。</p><h3>一、知识付费产品形态</h3><ul><li><strong>付费专栏</strong>：系列图文/视频，按月或按系列付费</li><li><strong>录播课程</strong>：系统化视频课程，一次性购买</li><li><strong>直播课</strong>：实时互动+回放，高价定位</li><li><strong>训练营</strong>：课程+作业+点评+社群，高客单价</li><li><strong>1对1咨询</strong>：个性化服务，最高客单价</li><li><strong>社群</strong>：持续陪伴+答疑+资源，月费/年费</li></ul><h3>二、课程设计方法论</h3><p><strong>需求验证</strong>：</p><ul><li>评论区/私信高频问题分析</li><li>搜索关键词需求洞察</li><li>竞品课程销量分析</li><li>小范围预售测试</li></ul><p><strong>课程结构</strong>：</p><ul><li>总论：为什么学+能解决什么问题+学习路径</li><li>基础篇：核心概念+底层逻辑</li><li>实操篇：分步骤教学+案例演示</li><li>进阶篇：高阶技巧+常见问题</li><li>答疑篇：FAQ+持续更新</li></ul><p><strong>定价策略</strong>：</p><ul><li>入门课：99-299元（引流）</li><li>系统课：499-1999元（主力）</li><li>训练营：1999-9999元（高利润）</li><li>1对1：500-5000元/次（个性化）</li></ul><h3>三、课程制作SOP</h3><ol><li>需求调研（1周）：确定选题和目标用户</li><li>大纲设计（3天）：列出课程目录和学习目标</li><li>逐字稿编写（2周）：每节课的详细内容</li><li>录制拍摄（1周）：视频拍摄/屏幕录制</li><li>剪辑后期（1周）：剪辑+字幕+片头片尾</li><li>配套资料（3天）：课件PDF+模板+工具包</li><li>上架推广（3天）：课程详情页+营销文案</li></ol><h3>四、AI辅助课程制作</h3><ul><li>AI生成课程大纲和逐字稿</li><li>AI制作课件PPT</li><li>AI生成课程营销文案</li><li>AI生成FAQ和答疑文档</li><li>AI辅助课程视频剪辑</li></ul><h3>五、课程平台选择</h3><ul><li>小鹅通/海星知道：功能全，适合系统课</li><li>知识星球：适合社群+轻量内容</li><li>公众号付费阅读：适合专栏</li><li>抖音/视频号课程：适合短视频教学</li><li>自建网站：利润最高，但技术门槛</li></ul>`,
      ['变现', '知识付费', '课程']
    );
  }

  // 5. 直播变现
  const liveKb = await prisma.knowledgeBase.findFirst({
    where: { name: '直播变现', userId: 'user-default' }
  });
  if (liveKb) {
    await findOrCreateDocument(
      '直播变现全攻略：从起播到爆单',
      liveKb.id,
      `<h2>直播：自媒体变现的加速器</h2><p>直播是最直接的变现方式，一场好的直播收入可抵一个月的内容广告。</p><h3>一、直播类型与定位</h3><ul><li><strong>带货直播</strong>：直接卖货，选品+话术+促单</li><li><strong>知识直播</strong>：分享干货+卖课/咨询，客单价高</li><li><strong>娱乐直播</strong>：才艺/聊天/互动，打赏为主</li><li><strong>品牌直播</strong>：品牌专场，高客单+强信任</li></ul><h3>二、直播前准备</h3><p><strong>选品排品</strong>：</p><ul><li>引流款（低价高需求）：前15分钟推</li><li>利润款（高价高利润）：中段主推</li><li>清仓款（低价清库存）：穿插推</li><li>爆款返场（热卖复推）：后段收尾</li></ul><p><strong>话术准备</strong>：</p><ul><li>开场话术（留人）：欢迎+抽奖+预告福利</li><li>产品话术（卖货）：痛点+卖点+对比+限时优惠</li><li>互动话术（活跃）：提问/投票/截屏抽奖</li><li>逼单话术（成交）：库存/限时/限量/倒计时</li></ul><h3>三、直播流程SOP</h3><ol><li><strong>开播前30分钟</strong>：预热短视频/动态通知</li><li><strong>0-5分钟</strong>：留人环节（抽奖/红包/福利预告）</li><li><strong>5-10分钟</strong>：第一波引流款（建立信任）</li><li><strong>10-30分钟</strong>：利润款主推（重点讲解）</li><li><strong>30-60分钟</strong>：穿插互动+限时秒杀</li><li><strong>60-90分钟</strong>：爆款返场+清仓款</li><li><strong>最后10分钟</strong>：总结+最后福利+预告下期</li></ol><h3>四、直播间数据指标</h3><ul><li>在线人数：峰值/平均，反映留人能力</li><li>观看时长：≥3分钟为合格</li><li>互动率：评论+点赞+分享</li><li>转化率：下单人数/观看人数</li><li>客单价：GMV/下单人数</li><li>UV价值：GMV/观看人数（核心指标）</li></ul><h3>五、AI辅助直播</h3><ul><li>AI生成直播话术和脚本</li><li>AI自动回复常见问题（弹幕机器人）</li><li>AI实时数据分析（提醒调整策略）</li><li>AI数字人直播（24小时无人直播）</li><li>AI生成直播切片短视频（二次分发）</li></ul><h3>六、起播策略</h3><ul><li>固定时间开播，培养观看习惯</li><li>开播前1小时发预热短视频</li><li>前3场不卖货，只送福利+分享干货</li><li>邀请粉丝团/铁粉捧场，制造热度</li><li>直播切片二次分发，放大流量</li></ul>`,
      ['变现', '直播', '带货']
    );
  }

  // 6. 品牌故事与差异化
  const brandStoryKb = await prisma.knowledgeBase.findFirst({
    where: { name: '品牌故事与差异化', userId: 'user-default' }
  });
  if (brandStoryKb) {
    await findOrCreateDocument(
      '品牌故事与差异化策略：让别人选择你',
      brandStoryKb.id,
      `<h2>品牌故事：从"又一个博主"到"不可替代的存在"</h2><p>在AI时代，内容可以被生成，但品牌故事和个人经历无法被复制。这是你最大的护城河。</p><h3>一、品牌故事的核心要素</h3><ul><li><strong>起源故事</strong>：你为什么开始做自媒体？什么触动了你？</li><li><strong>转折点</strong>：你经历了什么关键转变？从失败到成功的历程</li><li><strong>使命愿景</strong>：你在为谁解决什么问题？想创造什么改变？</li><li><strong>价值观</strong>：你相信什么？你的原则和底线是什么？</li><li><strong>独特经历</strong>：只有你有的经历/视角/资源</li></ul><h3>二、差异化定位方法</h3><p><strong>蓝海定位法</strong>：</p><ol><li>列出领域内所有竞品的人设标签</li><li>找出空白区域（没人占据的定位）</li><li>结合自身优势，选择空白区域</li><li>用内容持续强化这个定位</li></ol><p><strong>跨界定位法</strong>：</p><ul><li>A领域+B领域=新的差异化定位</li><li>例：程序员+美食=技术流美食博主</li><li>例：英语老师+健身=双语健身教练</li><li>跨界越大，差异化越明显</li></ul><p><strong>极致垂直法</strong>：</p><ul><li>不做"美食博主"，做"一人食快手菜博主"</li><li>不做"知识博主"，做"用AI做副业的程序员博主"</li><li>越垂直，越容易被记住，越容易变现</li></ul><h3>三、品牌故事讲述技巧</h3><ul><li><strong>真实性</strong>：不编造故事，真实的经历最有力量</li><li><strong>细节感</strong>：具体的时间/地点/细节让故事可信</li><li><strong>情绪共鸣</strong>：让观众在你的故事里看到自己</li><li><strong>反差感</strong>：从低谷到高峰的对比最有感染力</li><li><strong>持续性</strong>：在不同内容中反复提及核心故事</li></ul><h3>四、差异化内容策略</h3><ul><li>独家方法论：你独创的/你命名的方法</li><li>独家形式：别人没有的内容形式</li><li>独家视角：同一件事，你的独特角度</li><li>独家资源：你才能获取的信息/人脉</li><li>独家产品：你开发的工具/模板/课程</li></ul><h3>五、AI辅助品牌建设</h3><ul><li>AI分析竞品定位，找出差异化空间</li><li>AI帮你提炼个人故事的核心要素</li><li>AI生成品牌故事的不同版本（用于不同场景）</li><li>AI分析你的内容标签一致性</li><li>AI监测品牌口碑和用户认知</li></ul>`,
      ['个人品牌', '品牌故事', '差异化']
    );
  }

  // 7. 用户画像分析
  const userPersonaKb = await prisma.knowledgeBase.findFirst({
    where: { name: '用户画像分析', userId: 'user-default' }
  });
  if (userPersonaKb) {
    await findOrCreateDocument(
      '用户画像分析方法：精准理解你的受众',
      userPersonaKb.id,
      `<h2>用户画像：内容创作的指南针</h2><p>不了解用户，就没有好内容。精准的用户画像能让选题命中率和转化率提升3倍。</p><h3>一、用户画像维度</h3><p><strong>基础属性</strong>：</p><ul><li>性别/年龄/地域</li><li>职业/收入/教育水平</li><li>婚姻/家庭状态</li></ul><p><strong>行为特征</strong>：</p><ul><li>活跃时段（什么时候看内容）</li><li>内容偏好（喜欢什么类型）</li><li>互动习惯（评论/点赞/转发/收藏）</li><li>消费习惯（买什么/怎么买/预算）</li></ul><p><strong>心理特征</strong>：</p><ul><li>核心痛点（最想解决的问题）</li><li>核心需求（功能需求+情感需求）</li><li>价值观（认同什么/反对什么）</li><li>焦虑点（担心什么/害怕什么）</li></ul><p><strong>决策特征</strong>：</p><ul><li>信息获取渠道（在哪看/怎么搜）</li><li>决策影响因素（价格/品牌/口碑/推荐）</li><li>决策周期（冲动消费/理性比较）</li><li>分享意愿（是否愿意推荐给朋友）</li></ul><h3>二、用户画像构建方法</h3><ol><li><strong>平台数据分析</strong>：各平台后台的粉丝画像数据</li><li><strong>评论区分析</strong>：高频问题/关键词/情绪</li><li><strong>私信调研</strong>：主动与核心粉丝交流</li><li><strong>问卷调研</strong>：用工具发放问卷（如问卷星）</li><li><strong>竞品粉丝分析</strong>：分析竞品评论区画像</li><li><strong>AI分析</strong>：用AI批量分析评论/私信内容</li></ol><h3>三、典型用户画像模板</h3><p><strong>用户名</strong>：小张（化名）</p><p><strong>基础信息</strong>：28岁女性，一二线城市，白领，月薪8000-15000</p><p><strong>核心痛点</strong>：工作忙没时间学习，想提升但不知从何入手</p><p><strong>内容偏好</strong>：3分钟以内的实用干货，带具体方法</p><p><strong>活跃时间</strong>：通勤7:00-9:00、午休12:00-13:00、睡前22:00-23:00</p><p><strong>互动习惯</strong>：收藏>点赞>评论，转发给闺蜜</p><p><strong>消费特征</strong>：99-299元的课程容易下单，需要信任建立</p><h3>四、AI辅助用户画像</h3><p>提示词模板：</p><p>"以下是我最近30条内容的评论区数据：[评论数据]。请帮我分析：1.用户的核心痛点是什么？2.用户最感兴趣的内容方向是什么？3.用户画像是什么？4.有什么内容机会我还没覆盖？"</p><h3>五、画像应用</h3><ul><li>选题：根据用户痛点选择内容方向</li><li>文案：用用户的语言写文案</li><li>时间：在用户活跃时段发布</li><li>变现：匹配用户消费力的产品</li><li>运营：针对用户互动习惯设计互动</li></ul>`,
      ['数据分析', '用户画像', '受众']
    );
  }

  // ========================================
  // 第三部分：新增知识分类和文档
  // ========================================
  console.log('\n=== 新增知识分类 ===');

  // 新分类1：法律合规与版权保护
  const legalKb = await findOrCreateKb('法律合规与版权保护', mediaRoot.id, { icon: '⚖️', color: '#E74C3C', sortOrder: 8 });
  const legalChildKb = await findOrCreateKb('自媒体法律合规', legalKb.id, { icon: '📋' });
  await findOrCreateDocument(
    '自媒体法律合规与版权保护完全指南',
    legalChildKb.id,
    `<h2>合规是自媒体的生命线</h2><p>一次违规可能导致账号被封，多年积累毁于一旦。掌握法律合规知识，是自媒体人的必修课。</p><h3>一、广告法合规</h3><p><strong>绝对化用语禁用</strong>：</p><ul><li>禁止：最好/最佳/第一/国家级/顶级/极品</li><li>禁止：100%/最便宜/全网最低/独家</li><li>禁止：万能/神效/根治/纯天然</li><li>替代：较好的/优质的/行业领先（需有依据）</li></ul><p><strong>广告标注</strong>：</p><ul><li>赞助/合作内容需标注"广告"或"推广"</li><li>小红书笔记需标注"赞助"标签</li><li>B站视频需在标题或简介标注合作</li></ul><h3>二、版权合规</h3><p><strong>音乐版权</strong>：</p><ul><li>平台自带音乐库可安全使用</li><li>外部音乐需有授权或使用AI生成</li><li>Suno V4等AI生成的音乐版权属于用户</li></ul><p><strong>图片/视频素材</strong>：</p><ul><li>使用免费素材库：Pexels/Unsplash/Pixabay</li><li>AI生成的图片需注意工具的版权条款</li><li>他人内容二创需获授权或合理使用</li></ul><p><strong>文字内容</strong>：</p><ul><li>引用他人内容需标注来源</li><li>AI生成内容需按平台规则标注</li><li>洗稿/抄袭可能面临法律风险</li></ul><h3>三、个人信息保护</h3><ul><li>不泄露他人隐私（电话/地址/身份证等）</li><li>用户投稿/互动内容需获授权后使用</li><li>收集用户数据需明示用途并获得同意</li><li>遵守《个人信息保护法》</li></ul><h3>四、内容红线</h3><ul><li>不发布涉政/涉黄/涉暴内容</li><li>不造谣传谣</li><li>不进行虚假宣传</li><li>不侵犯他人名誉权/肖像权</li><li>不发布金融/医疗等专业领域误导信息</li></ul><h3>五、合同与知识产权</h3><ul><li>广告合作必须签合同</li><li>课程/付费内容注意知识产权条款</li><li>MCN签约注意权利转让条款</li><li>商标注册保护个人品牌</li></ul><h3>六、AI内容合规</h3><ul><li>2026年各平台对AI内容标注要求日趋严格</li><li>AI生成内容需标注"AI生成"或"AI辅助"</li><li>AI数字人/声音克隆需有授权</li><li>AI生成内容不得用于虚假宣传</li></ul>`,
    ['法律合规', '版权', '风险']
  );

  const legal2Kb = await findOrCreateKb('税务与财务管理', legalKb.id, { icon: '💰' });
  await findOrCreateDocument(
    '自媒体人税务与财务管理指南',
    legal2Kb.id,
    `<h2>自媒体人的财务必修课</h2><p>做自媒体就是做生意，懂税务和财务管理才能合法合规地赚钱。</p><h3>一、收入类型与税务</h3><ul><li><strong>广告收入</strong>：劳务报酬所得/经营所得</li><li><strong>带货佣金</strong>：经营所得（需缴增值税+个税）</li><li><strong>课程/知识付费</strong>：经营所得/劳务报酬</li><li><strong>打赏/礼物</strong>：个人所得/经营所得</li><li><strong>平台分成</strong>：经营所得</li></ul><h3>二、主体选择</h3><p><strong>个人</strong>：简单，但税率较高，无法开专票</p><p><strong>个体工商户</strong>：税率较低（可申请核定征收），可开票</p><p><strong>个人独资企业</strong>：适合高收入创作者</p><p><strong>有限公司</strong>：适合团队/高收入，有有限责任</p><h3>三、税务优化</h3><ul><li>合理选择经营主体</li><li>保留所有成本发票（设备/差旅/外包）</li><li>利用小微企业和个体户税收优惠</li><li>分散收入来源（多主体/多平台）</li><li>按时报税，不偷税漏税</li></ul><h3>四、财务管理</h3><ul><li>开立专用银行账户，公私分开</li><li>使用记账工具（如随手记/金蝶）</li><li>每月做收支报表</li><li>预留30%收入作为税务储备</li><li>建立应急基金（3-6个月开支）</li></ul><h3>五、版权资产</h3><ul><li>内容作品是知识产权，有长期价值</li><li>课程/模板/工具可反复销售</li><li>建立内容资产清单</li><li>考虑版权登记保护核心作品</li></ul>`,
    ['法律合规', '税务', '财务管理']
  );

  // 新分类2：自媒体工具箱与资源导航
  const toolKb = await findOrCreateKb('工具箱与资源导航', mediaRoot.id, { icon: '🧰', color: '#3498DB', sortOrder: 9 });
  const toolChildKb = await findOrCreateKb('2026必备工具清单', toolKb.id, { icon: '📋' });
  await findOrCreateDocument(
    '2026自媒体必备工具清单（实时更新）',
    toolChildKb.id,
    `<h2>2026年自媒体人工具箱</h2><p>工欲善其事，必先利其器。以下是基于2026年最新趋势整理的自媒体工具清单。</p><h3>一、AI写作与文案</h3><table><tr><th>工具</th><th>用途</th><th>费用</th><th>推荐指数</th></tr><tr><td>豆包</td><td>中文写作/选题/多轮对话</td><td>免费</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>ChatGPT (GPT-5.5)</td><td>逻辑分析/结构化内容</td><td>免费/付费</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>Claude (Opus 4.7)</td><td>深度长文/学术风格</td><td>免费/付费</td><td>⭐⭐⭐⭐</td></tr><tr><td>Gemini 3.5 Flash</td><td>极速输出/多语言/搜索</td><td>免费</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>Kimi</td><td>长文本处理/文档分析</td><td>免费</td><td>⭐⭐⭐⭐</td></tr></table><h3>二、AI图片生成</h3><table><tr><th>工具</th><th>特点</th><th>费用</th><th>推荐指数</th></tr><tr><td>Seedream</td><td>字节出品，中文友好</td><td>免费</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>Midjourney V7</td><td>审美天花板</td><td>$10-60/月</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>即梦AI</td><td>文生图+视频一体</td><td>免费/付费</td><td>⭐⭐⭐⭐</td></tr><tr><td>Flux Pro</td><td>文字渲染精准</td><td>免费/付费</td><td>⭐⭐⭐⭐</td></tr><tr><td>Stable Diffusion</td><td>开源可本地部署</td><td>免费</td><td>⭐⭐⭐⭐</td></tr></table><h3>三、AI视频生成</h3><table><tr><th>工具</th><th>特点</th><th>费用</th><th>推荐指数</th></tr><tr><td>Seedance 2.0</td><td>字节出品，30秒高质量</td><td>免费</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>Runway Gen-4</td><td>电影级画面</td><td>$15/月起</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>Kling 2.0</td><td>长视频，物理模拟强</td><td>免费/付费</td><td>⭐⭐⭐⭐</td></tr><tr><td>即梦AI</td><td>文生图+视频一体</td><td>免费/付费</td><td>⭐⭐⭐⭐</td></tr><tr><td>Pika 2.0</td><td>实时编辑/风格迁移</td><td>免费/付费</td><td>⭐⭐⭐</td></tr></table><h3>四、AI音频与音乐</h3><ul><li><strong>Suno V4</strong>：AI音乐生成，4分钟完整歌曲，支持中文</li><li><strong>Udio</strong>：音质更纯净，适合商业配乐</li><li><strong>ElevenLabs</strong>：AI声音克隆，最逼真</li><li><strong>豆包TTS</strong>：免费中文配音</li><li><strong>魔音工坊</strong>：国内主流配音工具</li></ul><h3>五、AI数字人</h3><ul><li><strong>HeyGen</strong>：效果最好，支持对口型</li><li><strong>D-ID</strong>：照片转视频</li><li><strong>硅基智能</strong>：国内主流，性价比高</li></ul><h3>六、剪辑工具</h3><ul><li><strong>剪映/CapCut</strong>：免费，AI功能强大，适合短视频</li><li><strong>Descript</strong>：文字编辑视频，删除口癖</li><li><strong>Opus Clip</strong>：长视频自动切片</li><li><strong>Premiere Pro</strong>：专业级，AI辅助</li></ul><h3>七、数据分析工具</h3><ul><li><strong>蝉妈妈</strong>：抖音数据分析</li><li><strong>新抖</strong>：抖音/小红书数据</li><li><strong>飞瓜数据</strong>：多平台数据</li><li><strong>5118</strong>：搜索关键词分析</li><li><strong>百度指数</strong>：搜索趋势</li></ul><h3>八、一站式平台</h3><ul><li><strong>豆包</strong>：写作+翻译+图片+视频，全链路免费</li><li><strong>即梦AI</strong>：文生图+文生视频，与剪映打通</li><li><strong>纳米AI</strong>：多智能体蜂群，一句话生成</li><li><strong>千问</strong>：阿里出品，全场景AI助手</li></ul><h3>九、工具组合建议</h3><p><strong>零成本起步</strong>：豆包+Seedream+Seedance+剪映</p><p><strong>进阶配置</strong>：+ChatGPT+Midjourney+ElevenLabs</p><p><strong>专业配置</strong>：+Runway+HeyGen+Opus Clip+Descript</p>`,
    ['工具箱', 'AI工具', '资源']
  );

  const tool2Kb = await findOrCreateKb('免费资源与素材库', toolKb.id, { icon: '🎁' });
  await findOrCreateDocument(
    '免费资源与素材库导航',
    tool2Kb.id,
    `<h2>免费资源汇总</h2><p>起步阶段不需要花大钱，这些免费资源足够你做出高质量内容。</p><h3>一、免费图片素材</h3><ul><li><strong>Pexels</strong>：免费高质量图片和视频</li><li><strong>Unsplash</strong>：高分辨率摄影图片</li><li><strong>Pixabay</strong>：图片+视频+音乐</li><li><strong>站酷海洛</strong>：国内免费图片</li></ul><h3>二、免费音乐素材</h3><ul><li><strong>平台自带音乐库</strong>：抖音/小红书/B站官方曲库</li><li><strong>YouTube音频库</strong>：免费音乐和音效</li><li><strong>免费商用音乐</strong>：Free Music Archive/incompetech</li><li><strong>AI生成</strong>：Suno V4生成的音乐可商用</li></ul><h3>三、免费字体</h3><ul><li><strong>思源黑体/思源宋体</strong>：Google开源，中文可商用</li><li><strong>阿里巴巴普惠体</strong>：免费商用</li><li><strong>站酷系列字体</strong>：部分免费商用</li></ul><h3>四、免费设计工具</h3><ul><li><strong>Canva</strong>：免费版功能强大，模板丰富</li><li><strong>稿定设计</strong>：国内版Canva</li><li><strong>Figma</strong>：免费版可做UI和简单设计</li></ul><h3>五、免费AI工具</h3><ul><li><strong>豆包</strong>：全链路AI创作，核心功能免费</li><li><strong>Gemini 3.5 Flash</strong>：完全免费的极速AI</li><li><strong>即梦AI</strong>：文生图+文生视频</li><li><strong>Seedance 2.0</strong>：免费AI视频生成</li><li><strong>Seedream</strong>：免费AI图片生成</li></ul><h3>六、免费数据工具</h3><ul><li><strong>百度指数</strong>：搜索趋势分析</li><li><strong>微信指数</strong>：微信生态搜索热度</li><li><strong>巨量算数</strong>：抖音生态趋势</li><li><strong>5118免费版</strong>：基础关键词分析</li></ul><h3>七、效率工具</h3><ul><li><strong>Notion</strong>：知识管理/选题库/素材库</li><li><strong>飞书</strong>：团队协作/文档/日历</li><li><strong>语雀</strong>：知识库管理</li><li><strong>腾讯文档</strong>：在线协作表格</li></ul>`,
    ['工具箱', '免费资源', '素材']
  );

  // 新分类3：创作者心态与时间管理
  const mindsetKb = await findOrCreateKb('创作者心态与时间管理', mediaRoot.id, { icon: '🧠', color: '#9B59B6', sortOrder: 10 });
  const mindsetChildKb = await findOrCreateKb('心态管理', mindsetKb.id, { icon: '💪' });
  await findOrCreateDocument(
    '创作者心态管理：长期主义的生存指南',
    mindsetChildKb.id,
    `<h2>心态决定走多远</h2><p>自媒体是一场马拉松，不是短跑。90%的人放弃不是因为能力不够，而是心态崩了。</p><h3>一、新手期心态陷阱</h3><ul><li><strong>完美主义</strong>：总觉得内容不够好不敢发。解法：先完成再完美，发布就是胜利</li><li><strong>比较焦虑</strong>：看到别人爆款就自我怀疑。解法：专注自己的节奏</li><li><strong>数据焦虑</strong>：每天刷播放量影响心情。解法：设固定时间看数据</li><li><strong>选题焦虑</strong>：不知道做什么内容。解法：先做20条再说，量变到质变</li></ul><h3>二、瓶颈期心态调整</h3><ul><li><strong>增长停滞</strong>：粉丝不涨了。解法：复盘内容方向，尝试新形式</li><li><strong>创作倦怠</strong>：没有创作欲望。解法：休息一周，充电再战</li><li><strong>对比挫败</strong>：同行比自己做的好。解法：学习而不是比较</li><li><strong>变现焦虑</strong>：赚不到钱想放弃。解法：看长线价值，先做价值后做变现</li></ul><h3>三、长期主义心态</h3><ul><li>把自媒体当5年的事业来做，不是5个月</li><li>每周进步1%，一年后提升50倍</li><li>不追求每条爆款，追求持续输出</li><li>把失败当数据，把成功当验证</li><li>保持学习，AI时代工具在变，但好内容的需求不变</li></ul><h3>四、应对恶评与负面</h3><ul><li>恶评是流量的代价，说明你被看到了</li><li>不与喷子争论，拉黑/删除/举报</li><li>建设性批评认真对待，恶意攻击忽略</li><li>保持情绪稳定，不被评论区带节奏</li></ul><h3>五、创作者心理健康</h3><ul><li>设定工作边界，不24小时在线</li><li>保持运动和社交，不与世隔绝</li><li>定期休息，避免过度创作</li><li>有Plan B，不把所有鸡蛋放在自媒体</li><li>感到严重焦虑时寻求专业帮助</li></ul>`,
    ['心态管理', '长期主义', '健康']
  );

  const timeMgmtKb = await findOrCreateKb('时间管理与效率', mindsetKb.id, { icon: '⏰' });
  await findOrCreateDocument(
    '创作者时间管理方法论：20小时/周高效运营',
    timeMgmtKb.id,
    `<h2>时间是最稀缺资源</h2><p>用AI辅助，每周20小时就能运营一个高质量自媒体账号。关键是把时间花在刀刃上。</p><h3>一、时间分配模型</h3><p><strong>每周20小时分配</strong>：</p><ul><li>选题与调研：3小时（15%）</li><li>内容创作：8小时（40%）</li><li>剪辑与后期：4小时（20%）</li><li>发布与分发：1小时（5%）</li><li>数据与复盘：2小时（10%）</li><li>学习与提升：2小时（10%）</li></ul><h3>二、每日时间块管理</h3><p><strong>创作日（3天/周）</strong>：</p><ul><li>8:00-9:00：选题+AI生成脚本</li><li>9:00-12:00：拍摄/创作</li><li>14:00-16:00：剪辑+后期</li><li>16:00-16:30：发布+分发</li></ul><p><strong>运营日（2天/周）</strong>：</p><ul><li>8:00-9:00：数据复盘</li><li>9:00-12:00：互动+评论运营</li><li>14:00-16:00：选题+竞品分析</li><li>16:00-18:00：学习+工具测试</li></ul><p><strong>休息日（2天/周）</strong>：</p><ul><li>完全不工作，充电恢复</li><li>阅读/运动/社交</li><li>灵感记录但不执行</li></ul><h3>三、AI提效清单</h3><table><tr><th>环节</th><th>传统时间</th><th>AI辅助后</th><th>节省</th></tr><tr><td>选题</td><td>2小时</td><td>0.5小时</td><td>75%</td></tr><tr><td>脚本</td><td>2小时</td><td>0.5小时</td><td>75%</td></tr><tr><td>素材</td><td>3小时</td><td>1小时</td><td>67%</td></tr><tr><td>剪辑</td><td>4小时</td><td>1.5小时</td><td>62%</td></tr><tr><td>分发</td><td>1小时</td><td>0.3小时</td><td>70%</td></tr></table><h3>四、批量生产策略</h3><ul><li><strong>集中拍摄</strong>：1天拍5-7条素材，分开剪辑发布</li><li><strong>AI批量生成</strong>：1次生成多条脚本/封面/标题</li><li><strong>模板化</strong>：建立内容模板，填充即可</li><li><strong>分发批量化</strong>：1次适配多平台，用工具定时发布</li></ul><h3>五、时间管理工具</h3><ul><li><strong>日历工具</strong>：飞书日历/Google Calendar</li><li><strong>任务管理</strong>：Notion/飞书任务</li><li><strong>番茄钟</strong>：Forest/番茄TODO</li><li><strong>定时发布</strong>：各平台自带或第三方工具</li></ul><h3>六、避免的时间陷阱</h3><ul><li>过度追求完美，一条视频改一天</li><li>无目的刷竞品内容</li><li>重复性工作不交给AI</li><li>多平台同时运营导致精力分散</li><li>不设截止时间，无限拖延</li></ul>`,
    ['时间管理', '效率', 'AI工具']
  );

  // 新分类4：2026趋势与未来展望
  const trendKb = await findOrCreateKb('2026趋势与未来展望', mediaRoot.id, { icon: '🔮', color: '#E67E22', sortOrder: 11 });
  const trendChildKb = await findOrCreateKb('年度趋势报告', trendKb.id, { icon: '📊' });
  await findOrCreateDocument(
    '2026自媒体趋势报告：AI重塑内容产业',
    trendChildKb.id,
    `<h2>2026年：AI与自媒体深度融合之年</h2><p>2026年，AI内容创作市场已突破240亿美元，年增长率超30%。自媒体正在经历一场从"人力驱动"到"AI驱动"的范式转换。</p><h3>一、AI内容创作工具格局</h3><p><strong>三大AI写作助手</strong>：</p><ul><li>ChatGPT (GPT-5.5)：自然语气，长文逻辑强</li><li>Claude (Opus 4.7)：1M tokens上下文，学术严谨</li><li>Gemini 3.5 Flash：289 tokens/秒，完全免费，4倍速输出</li></ul><p><strong>图像生成</strong>：</p><ul><li>Midjourney V7：审美天花板，已支持短动画</li><li>Flux Pro：文字渲染精准（解决中文渲染痛点）</li><li>Stable Diffusion 4：开源可本地部署</li></ul><p><strong>视频生成</strong>：</p><ul><li>Runway Gen-4：电影级画面质量</li><li>Kling 2.0（快手）：长视频生成，物理模拟强</li><li>Seedance 2.0（字节）：30秒高质量，免费</li><li>即梦AI（字节）：文生图+视频一体</li></ul><p><strong>音频与音乐</strong>：</p><ul><li>Suno V4：4分钟完整歌曲，支持中文歌词</li><li>Udio：音质纯净，适合商业配乐</li></ul><h3>二、关键趋势</h3><p><strong>趋势1：一站式AI平台崛起</strong></p><ul><li>豆包：聊天框集成写作+翻译+图片+视频，核心免费</li><li>即梦AI：文生图+文生视频，与剪映生态打通</li><li>纳米AI：多智能体蜂群，一句话生成专家级内容</li><li>千问：阿里出品，全场景AI助手</li></ul><p><strong>趋势2：AI辅助效率提升60-72%</strong></p><ul><li>选题与调研：4小时→1.2小时（70%提效）</li><li>脚本写作：3小时→0.7小时（77%提效）</li><li>视频制作：8小时→2.5小时（68%提效）</li><li>多平台发布：2小时→0.3小时（85%提效）</li></ul><p><strong>趋势3：AI自动化工作流</strong></p><ul><li>LLM+图片/视频生成+调度+变现=全链路自动化</li><li>AI Agent自动谈判赞助、优化广告、管理订阅</li><li>创作者品牌差异化靠"AI增强创意"而非仅速度</li></ul><p><strong>趋势4：内容门槛持续降低</strong></p><ul><li>从"会用AI"降低到"会描述需求"</li><li>一个人就是一支团队成为现实</li><li>国产工具免费开放降低成本门槛</li></ul><h3>三、创作者生存策略</h3><ul><li><strong>用AI的创作者正在淘汰不用AI的创作者</strong></li><li>AI是副驾驶，不是替身：创意方向、内容策略、个人风格需要人来把控</li><li>建立"文风库"：把满意的文章喂给AI，让它学习你的文风</li><li>AI写作四层次：润色→扩写→选题→风格定制（Level 3-4才是差异化）</li><li>组合使用不同AI工具：各有擅长领域，组合最优</li></ul><h3>四、合规与伦理趋势</h3><ul><li>AI内容标注要求日趋严格</li><li>数据隐私和GDPR/CCPA合规</li><li>AI生成内容水印</li><li>开源和本地部署模型兴起（隐私导向）</li></ul><h3>五、未来24个月展望</h3><ul><li>AI Agent获得更多自主权：谈判、合同、受众分析</li><li>创作者品牌靠"AI增强创意"差异化</li><li>多模态内容成为标配（文字+图片+视频+音频）</li><li>知识付费与AI结合：AI个性化学习路径</li><li>虚拟人/数字人IP成为新赛道</li></ul>`,
    ['2026趋势', 'AI工具', '行业报告']
  );

  const trend2Kb = await findOrCreateKb('未来展望与战略规划', trendKb.id, { icon: '🚀' });
  await findOrCreateDocument(
    '自媒体未来3年战略规划：拥抱AI浪潮',
    trend2Kb.id,
    `<h2>未来3年的自媒体战略</h2><p>AI不会取代创作者，但会用AI的创作者会取代不用AI的。提前布局，抢占先机。</p><h3>一、2026年战略重点</h3><ul><li>建立AI辅助创作SOP，实现日更</li><li>选定1-2个平台深耕，不盲目全平台</li><li>积累前1000个铁粉</li><li>建立个人品牌识别系统</li><li>测试至少1种变现方式</li></ul><h3>二、2027年战略重点</h3><ul><li>AI全链路自动化（选题→创作→分发→复盘）</li><li>跨平台矩阵运营</li><li>知识付费产品化</li><li>私域用户积累到5000+</li><li>月收入稳定在1万+</li></ul><h3>三、2028年战略重点</h3><ul><li>IP品牌化（个人品牌=品类代名词）</li><li>团队化/公司化运营</li><li>自有产品/品牌</li><li>AI数字人矩阵运营</li><li>多元化变现（广告+电商+课程+咨询+品牌）</li></ul><h3>四、核心竞争力构建</h3><p><strong>AI无法替代的能力</strong>：</p><ul><li>个人经历与故事</li><li>独特观点与视角</li><li>审美判断力</li><li>情感共鸣能力</li><li>社区运营能力</li><li>商业判断力</li></ul><p><strong>AI赋能的能力</strong>：</p><ul><li>内容产能（10倍提升）</li><li>数据分析（深度洞察）</li><li>跨平台运营（一次创作全网分发）</li><li>个性化内容（千人千面）</li><li>自动化运营（7×24小时）</li></ul><h3>五、风险与应对</h3><ul><li><strong>平台政策变化</strong>：多平台布局，不依赖单一平台</li><li><strong>AI工具迭代</strong>：持续学习，保持工具灵活性</li><li><strong>内容同质化</strong>：强化个人品牌和差异化</li><li><strong>版权法规变化</strong>：关注合规，使用合规素材</li><li><strong>注意力碎片化</strong>：做深度内容，建立深度连接</li></ul><h3>六、关键指标监控</h3><ul><li>内容产能：每周发布条数</li><li>粉丝增长：月增长率</li><li>互动率：点赞+评论+转发+收藏</li><li>变现效率：月收入/粉丝数</li><li>私域积累：私域用户数</li><li>品牌认知度：搜索量/提及量</li></ul>`,
    ['2026趋势', '战略规划', 'AI工具']
  );

  // ========================================
  // 第四部分：新增标签和小记
  // ========================================
  console.log('\n=== 新增标签 ===');
  const newTags = ['法律合规', '版权', '风险', '税务', '财务管理', '工具箱', '免费资源', '素材', '心态管理', '长期主义', '健康', '时间管理', '2026趋势', '行业报告', '战略规划'];
  for (const name of newTags) {
    await findOrCreateTag(name);
    console.log(`Tag: ${name}`);
  }

  console.log('\n=== 新增小记 ===');
  const newNotes = [
    { content: '【法律红线】绝对化用语不能用（最好/第一/100%）。广告需标注。音乐用平台自带或AI生成。', tags: ['法律合规', '版权'] },
    { content: '【工具组合】零成本：豆包+Seedream+Seedance+剪映。进阶：+ChatGPT+Midjourney+ElevenLabs。', tags: ['工具箱', 'AI工具'] },
    { content: '【心态管理】先完成再完美。不与喷子争论。每周休息1天。自媒体是5年事业不是5个月。', tags: ['心态管理', '长期主义'] },
    { content: '【时间管理】每周20小时=3天创作+2天运营+2天休息。AI提效60-72%。批量拍摄集中剪辑。', tags: ['时间管理', '效率'] },
    { content: '【2026趋势】AI写作四层次：润色→扩写→选题→风格定制。Level 3-4才是差异化。建立文风库。', tags: ['2026趋势', 'AI工具'] },
    { content: '【战略规划】2026建SOP+1000铁粉→2027全链路AI+知识付费→2028IP品牌化+团队运营。', tags: ['战略规划', '2026趋势'] },
  ];

  for (const note of newNotes) {
    const existing = await prisma.note.findFirst({
      where: { content: note.content, userId: 'user-default' }
    });
    if (!existing) {
      const plainText = note.content.replace(/<[^>]+>/g, ' ').trim();
      const created = await prisma.note.create({
        data: { content: note.content, plainText, userId: 'user-default' }
      });
      for (const tagName of note.tags) {
        const tag = await findOrCreateTag(tagName);
        await prisma.noteTag.create({
          data: { noteId: created.id, tagId: tag.id }
        }).catch(() => {});
      }
      console.log(`Note: ${note.content.substring(0, 30)}...`);
    } else {
      console.log(`Skip note: ${note.content.substring(0, 30)}...`);
    }
  }

  // ========================================
  // 最终统计
  // ========================================
  const totalKbs = await prisma.knowledgeBase.count({ where: { userId: 'user-default' } });
  const totalDocs = await prisma.document.count({ where: { userId: 'user-default', isDeleted: false } });
  const totalTags = await prisma.tag.count({ where: { userId: 'user-default' } });
  const totalNotes = await prisma.note.count({ where: { userId: 'user-default', isDeleted: false } });

  console.log('\n✅ 知识库扩展完成！');
  console.log(`总分类: ${totalKbs}`);
  console.log(`总文档: ${totalDocs}`);
  console.log(`总标签: ${totalTags}`);
  console.log(`总小记: ${totalNotes}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
