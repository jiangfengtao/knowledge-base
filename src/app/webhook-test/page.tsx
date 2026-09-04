"use client";

import { useState } from "react";
import { Send, CheckCircle, XCircle, Tag, Folder } from "lucide-react";

export default function WebhookTestPage() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const quickMessages = [
    "今天学到了 React Server Components 的原理，感觉很有意思，服务端渲染确实能提升首屏性能 #前端 #React",
    "下季度产品规划：1. 优化注册流程 2. 增加AI助手 3. 改版首页 #产品 #规划",
    "看了《原子习惯》这本书，核心观点是：习惯的养成不在于意志力，而在于环境设计。",
    "突然有个想法：能不能做一个 AI 帮我自动整理知识库的工具？",
    "周末学了下 TypeScript 的高级类型，条件类型和映射类型真的很强大 #技术 #TypeScript",
  ];

  const handleSend = async () => {
    if (!message.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: message, source: "web-test" }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: "发送失败" });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSend = (text: string) => {
    setMessage(text);
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-2">📱 微信消息接入 - 测试</h1>
        <p className="text-muted mb-6">
          模拟从微信发送消息到知识库，AI 会自动分类并存储
        </p>

        {/* 模拟手机界面 */}
        <div className="bg-white border border-rule rounded-xl overflow-hidden shadow-sm">
          {/* 手机顶部 */}
          <div className="bg-accent text-white px-4 py-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              🤖
            </div>
            <div>
              <div className="font-medium text-sm">知识库助手</div>
              <div className="text-xs text-white/70">发消息给我，自动记录到知识库</div>
            </div>
          </div>

          {/* 消息区域 */}
          <div className="p-4 min-h-[200px] bg-[#f7f8fa]">
            {result ? (
              <div className="space-y-3">
                {/* 用户消息 */}
                <div className="flex justify-end">
                  <div className="bg-accent text-white px-3 py-2 rounded-lg max-w-[80%] text-sm">
                    {message}
                  </div>
                </div>

                {/* 回复 */}
                <div className="flex justify-start">
                  <div className="bg-white border border-rule px-3 py-2 rounded-lg max-w-[80%] text-sm">
                    {result.success ? (
                      <div>
                        <div className="flex items-center gap-1.5 text-accent-deep font-medium mb-2">
                          <CheckCircle size={16} />
                          <span>记录成功</span>
                        </div>
                        <div className="text-ink mb-2">{result.message}</div>
                        {result.classification && (
                          <div className="space-y-1 pt-2 border-t border-rule">
                            <div className="flex items-center gap-1.5 text-xs text-muted">
                              <Folder size={12} />
                              <span>
                                分类：{result.classification.categoryName}
                                {result.classification.subCategory &&
                                  ` / ${result.classification.subCategory}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted">
                              <Tag size={12} />
                              <span>
                                标签：
                                {result.classification.tags.length > 0
                                  ? result.classification.tags
                                      .map((t: string) => `#${t}`)
                                      .join(" ")
                                  : "无"}
                              </span>
                            </div>
                            <div className="text-xs text-muted">
                              类型：{result.result.type === "note" ? "小记" : "文档"}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500">
                        <XCircle size={16} />
                        <span>{result.error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted text-sm py-8">
                发送一条消息试试 👇
              </div>
            )}
          </div>

          {/* 输入框 */}
          <div className="p-3 border-t border-rule">
            <div className="flex gap-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="输入内容..."
                className="flex-1 resize-none outline-none text-sm p-2 bg-[#f2f3f5] rounded-lg min-h-[60px]"
                rows={2}
              />
              <button
                onClick={handleSend}
                disabled={loading || !message.trim()}
                className="px-4 py-2 bg-accent text-white rounded-lg text-sm hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end flex items-center gap-1"
              >
                <Send size={16} />
                <span>发送</span>
              </button>
            </div>
          </div>
        </div>

        {/* 快捷消息 */}
        <div className="mt-6">
          <div className="text-sm text-muted mb-3">快捷测试消息：</div>
          <div className="space-y-2">
            {quickMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => handleQuickSend(msg)}
                className="block w-full text-left p-3 bg-white border border-rule rounded-lg text-sm text-ink hover:border-accent/30 hover:bg-accent-soft/30 transition-all"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-8 p-4 bg-white border border-rule rounded-lg">
          <h3 className="font-medium mb-2">💡 如何接入微信？</h3>
          <ol className="text-sm text-ink space-y-2 list-decimal list-inside">
            <li>
              <strong>方式一（推荐）：飞书/企业微信机器人</strong>
              <br />
              <span className="text-muted">
                配置一个 Webhook 机器人，把消息转发到
                /api/webhook，最快半天搞定
              </span>
            </li>
            <li>
              <strong>方式二：微信公众号</strong>
              <br />
              <span className="text-muted">
                需要注册公众号（个人号也可以），配置服务器地址指向
                /api/webhook
              </span>
            </li>
            <li>
              <strong>方式三：iOS 快捷指令 / Android 任务</strong>
              <br />
              <span className="text-muted">
                用手机系统的快捷指令，把分享的内容发到 Webhook
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
