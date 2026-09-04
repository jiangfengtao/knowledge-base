import prisma from "@/lib/prisma";
import { getDefaultUser } from "@/lib/user";

// 初始化示例数据 - 一些公开文章
export async function seedSamplePosts() {
  const user = await getDefaultUser();

  // 检查是否已经有公开文章了
  const publicCount = await prisma.document.count({
    where: { userId: user.id, isPublic: true },
  });

  if (publicCount > 0) {
    return { message: "已存在公开文章，跳过初始化" };
  }

  // 找一个知识库（02 领域下的技术）
  const kb02 = await prisma.knowledgeBase.findFirst({
    where: { userId: user.id, categoryCode: "02" },
    include: { children: true },
  });

  let techKb: any = kb02;
  if (kb02?.children && kb02.children.length > 0) {
    techKb = kb02.children[0];
  }

  if (!techKb) {
    return { error: "找不到目标知识库" };
  }

  const samplePosts = [
    {
      title: "如何高效学习英语：我的三年自学经验分享",
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

<blockquote>
  没有足够的输入，就急于开口说，说出来的永远是「中式英语」。
</blockquote>

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
      title: "2026 年我的个人成长书单推荐",
      content: `
<h1>2026 年我的个人成长书单推荐</h1>
<p>今年读了不少书，挑出几本对我影响最大的分享给大家。每一本都让我有新的思考。</p>

<h2>📖 认知提升</h2>
<h3>《原子习惯》</h3>
<p>强烈推荐！讲的是如何培养好习惯、改掉坏习惯。核心观点是：不要盯着目标，要关注系统。微小的改变，复利的效果。</p>

<h3>《深度工作》</h3>
<p>在这个注意力稀缺的时代，如何保持专注，进行高质量的深度工作？这本书给了很多实用的方法。</p>

<h2>🧠 思维方式</h2>
<h3>《思考，快与慢》</h3>
<p>诺贝尔经济学奖得主的经典著作。讲我们大脑有两个系统：快思考和慢思考。了解了这些，你会发现自己平时做决策有多不靠谱。</p>

<h2>💪 行动力</h2>
<h3>《微习惯》</h3>
<p>如果你总是「开始很积极，坚持不下去」，一定要读这本书。方法很简单：把目标缩小到不可思议的程度，比如每天只做 1 个俯卧撑。</p>

<hr>
<p>读书不在多，在于用。希望这些书也能对你有帮助～</p>
      `.trim(),
    },
    {
      title: "如何用 AI 提升学习效率：我的实践心得",
      content: `
<h1>如何用 AI 提升学习效率：我的实践心得</h1>
<p>AI 时代，学习方式也在变。分享一下我是怎么用 AI 工具加速学习的。</p>

<h2>一、AI 当老师，随时提问</h2>
<p>以前遇到不懂的问题，要翻书、查资料、问人，效率很低。现在直接问 AI，它能给你讲得明明白白。</p>
<p>比如学编程，遇到 bug，直接贴给 AI，大多数时候都能帮你定位问题。</p>

<h2>二、AI 当陪练，对话练习</h2>
<p>学英语最怕没人对话？AI 就是最好的语伴！你可以：</p>
<ul>
<li>让 AI 扮演不同角色和你对话</li>
<li>说错了 AI 帮你纠正</li>
<li>想练什么话题就练什么话题</li>
</ul>

<h2>三、AI 当助教，帮你总结</h2>
<p>读一篇长文、看一个长视频，先让 AI 帮你总结一下要点，看看值不值得深入学习。节省了大量筛选信息的时间。</p>

<h2>四、但要注意...</h2>
<p>AI 是工具，不是替代品。</p>
<blockquote>
  AI 可以帮你学得更快，但不能替你思考。
</blockquote>
<p>重要的知识，还是要自己消化、自己理解。AI 只是帮你提速的工具。</p>

<p>你平时用 AI 学什么呢？欢迎交流～</p>
      `.trim(),
    },
    {
      title: "我的每日时间管理方法",
      content: `
<h1>我的每日时间管理方法</h1>
<p>经常有人问我：你每天怎么安排时间？今天来分享一下我的方法。</p>

<h2>早晨：最重要的事最先做</h2>
<p>我是「晨型人」，早上效率最高。所以把最难、最重要的事情放在早上做。</p>
<ul>
<li>6:30 起床</li>
<li>7:00-9:00 深度学习/写作（黄金 2 小时）</li>
<li>9:00 开始处理日常工作</li>
</ul>

<h2>白天：番茄工作法 + 批量处理</h2>
<p>工作时间用番茄钟：25 分钟专注 + 5 分钟休息。同时把类似的事情攒到一起做：</p>
<ul>
<li>上午 10 点、下午 3 点各集中回复一次消息</li>
<li>开会尽量约在下午</li>
<li>每周固定时间做复盘和规划</li>
</ul>

<h2>晚上：充电和休息</h2>
<p>晚上不做高强度的脑力工作，用来：</p>
<ul>
<li>阅读输入</li>
<li>运动健身</li>
<li>写日记复盘</li>
<li>早点睡觉</li>
</ul>

<h2>最重要的原则</h2>
<blockquote>
  时间管理不是把时间排满，而是把时间花在真正重要的事情上。
</blockquote>

<p>每周日晚上花 30 分钟想清楚：下周最重要的 3 件事是什么？然后围绕这 3 件事安排时间。</p>

<p>你的时间管理方法是什么样的？</p>
      `.trim(),
    },
  ];

  for (const post of samplePosts) {
    const plainText = post.content.replace(/<[^>]*>/g, "").trim();

    await prisma.document.create({
      data: {
        title: post.title,
        content: post.content,
        plainText,
        wordCount: plainText.length,
        knowledgeBaseId: techKb.id,
        userId: user.id,
        isPublic: true,
      },
    });
  }

  return {
    success: true,
    created: samplePosts.length,
    message: `已创建 ${samplePosts.length} 篇示例公开文章`,
  };
}
