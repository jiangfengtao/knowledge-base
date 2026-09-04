"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Bot,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Server,
  Send,
  Zap,
} from "lucide-react";

export default function WechatSetupPage() {
  const router = useRouter();
  const [copied, setCopied] = useState("");
  const [testResult, setTestResult] = useState("");
  const [testing, setTesting] = useState(false);

  // 动态获取当前访问地址
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPublicUrl(`${window.location.origin}/api/webhook`);
    }
  }, []);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  // 测试 webhook 是否正常
  const testWebhook = async () => {
    setTesting(true);
    setTestResult("");
    try {
      const res = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: "这是一条测试消息 #测试",
          source: "test",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult(`✅ ${data.message}`);
      } else {
        setTestResult(`❌ ${data.error || "测试失败"}`);
      }
    } catch (e: any) {
      setTestResult(`❌ 网络错误: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* 顶栏 */}
      <div className="sticky top-0 bg-white border-b border-[#e8e8e8] z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">微信接入配置</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* 当前状态 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-green-800 mb-1">公网隧道已开启</div>
            <div className="text-sm text-green-700">
              你的知识库已通过公网地址可访问，微信可以发消息过来了！
            </div>
            <div className="mt-2 text-xs text-green-600 bg-green-100 rounded px-2 py-1 font-mono break-all">
              {publicUrl}
            </div>
          </div>
          <button
            onClick={() => copyText(publicUrl, "public")}
            className="p-2 hover:bg-green-100 rounded transition-colors"
          >
            {copied === "public" ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-green-600" />}
          </button>
        </div>

        {/* Webhook 地址 */}
        <div className="bg-white rounded-lg border border-[#e8e8e8] p-5">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={18} className="text-[#d4a574]" />
            <h2 className="font-bold">消息接收地址</h2>
          </div>
          <p className="text-sm text-[#888] mb-3">
            将下面的地址填入微信配置中，发到微信的消息就会自动收录到知识库
          </p>
          <div className="bg-[#f5f5f5] rounded-lg p-3 flex items-center justify-between gap-2">
            <code className="text-xs text-[#333] break-all flex-1">{publicUrl}</code>
            <button
              onClick={() => copyText(publicUrl, "url")}
              className="p-2 hover:bg-[#e8e8e8] rounded transition-colors flex-shrink-0"
            >
              {copied === "url" ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>
          <button
            onClick={testWebhook}
            disabled={testing}
            className="mt-3 px-4 py-2 bg-[#d4a574] text-white rounded-lg text-sm font-medium hover:bg-[#c9955f] transition-colors disabled:opacity-50"
          >
            {testing ? "测试中..." : "发送测试消息"}
          </button>
          {testResult && (
            <div className="mt-2 text-sm text-[#666]">{testResult}</div>
          )}
        </div>

        {/* 方式一：企业微信（推荐） */}
        <div className="bg-white rounded-lg border border-[#e8e8e8] overflow-hidden">
          <div className="bg-gradient-to-r from-[#07c160] to-[#06ad56] p-4 flex items-center gap-3">
            <Bot size={24} className="text-white" />
            <div>
              <h2 className="font-bold text-white text-lg">方式一：企业微信机器人</h2>
              <p className="text-green-50 text-xs">最简单，5 分钟搞定，个人可用</p>
            </div>
            <span className="ml-auto bg-white/20 text-white text-xs px-2 py-1 rounded-full">推荐</span>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#07c160] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">下载企业微信</div>
                  <div className="text-xs text-[#888]">
                    手机应用商店搜索「企业微信」下载安装，用个人微信扫码登录
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#07c160] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">创建一个群（自己和自己）</div>
                  <div className="text-xs text-[#888]">
                    企业微信 → 通讯录 → 群聊 → 创建群聊（可以只加自己）
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#07c160] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">群内添加机器人</div>
                  <div className="text-xs text-[#888]">
                    群设置 → 群机器人 → 添加 → 自定义机器人 → 填一个名字
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#07c160] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">配置 Webhook 回调</div>
                  <div className="text-xs text-[#888]">
                    机器人设置里，把上面的 Webhook 地址填入「回调地址」
                  </div>
                  <button
                    onClick={() => copyText(publicUrl, "bot")}
                    className="mt-2 text-xs text-[#07c160] hover:underline flex items-center gap-1"
                  >
                    {copied === "bot" ? <Check size={12} /> : <Copy size={12} />}
                    {copied === "bot" ? "已复制" : "复制地址"}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#07c160] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">在群里发消息</div>
                  <div className="text-xs text-[#888]">
                    在群里发任何文字，机器人会转发到你的知识库，AI 自动分类存储
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 方式二：微信公众号 */}
        <div className="bg-white rounded-lg border border-[#e8e8e8] overflow-hidden">
          <div className="bg-gradient-to-r from-[#2c3e50] to-[#34495e] p-4 flex items-center gap-3">
            <MessageCircle size={24} className="text-white" />
            <div>
              <h2 className="font-bold text-white text-lg">方式二：微信公众号</h2>
              <p className="text-gray-300 text-xs">功能最全，需要一个订阅号</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2c3e50] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">注册微信公众号</div>
                  <div className="text-xs text-[#888]">
                    访问{" "}
                    <a href="https://mp.weixin.qq.com" target="_blank" className="text-[#d4a574] underline">
                      mp.weixin.qq.com
                    </a>
                    {" "}注册一个「订阅号」（个人可注册）
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2c3e50] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">进入开发设置</div>
                  <div className="text-xs text-[#888]">
                    公众号后台 → 设置与开发 → 开发 → 基本配置
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2c3e50] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">配置服务器地址</div>
                  <div className="text-xs text-[#888] space-y-1">
                    <div>URL 填入：<code className="text-[#d4a574]">{publicUrl}</code></div>
                    <div>Token 填入：<code className="text-[#d4a574]">xiaotao2024</code></div>
                    <div>EncodingAESKey：随机生成即可</div>
                    <div>消息加解密方式：选「明文模式」</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#2c3e50] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">关注公众号后发消息</div>
                  <div className="text-xs text-[#888]">
                    用个人微信关注你的公众号，直接给公众号发消息即可收录
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 方式三：手机快捷指令 */}
        <div className="bg-white rounded-lg border border-[#e8e8e8] overflow-hidden">
          <div className="bg-gradient-to-r from-[#d4a574] to-[#c9955f] p-4 flex items-center gap-3">
            <Smartphone size={24} className="text-white" />
            <div>
              <h2 className="font-bold text-white text-lg">方式三：手机快捷指令</h2>
              <p className="text-amber-50 text-xs">免注册，iOS/Android 都可用</p>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div className="bg-amber-50 rounded-lg p-3 text-sm text-[#666]">
              适合不想注册企业微信/公众号的情况，通过手机系统的「分享」功能发送内容
            </div>

            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#d4a574] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">iOS 快捷指令</div>
                  <div className="text-xs text-[#888]">
                    打开「快捷指令」App → 创建新指令 → 添加「获取 URL 内容」→ URL 填入上面的地址，方法选 POST，请求体填 <code className="text-[#d4a574]">{"{ content: [要发送的内容] }"}</code>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#d4a574] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">Android Tasker / HTTP Shortcuts</div>
                  <div className="text-xs text-[#888]">
                    下载「HTTP Shortcuts」App → 创建快捷方式 → POST 到上面的地址，Body 填 <code className="text-[#d4a574]">{"{ content: [选中文字] }"}</code>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-[#d4a574] text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div className="flex-1">
                  <div className="font-medium text-sm mb-1">在任何 App 里分享</div>
                  <div className="text-xs text-[#888]">
                    选中文字 → 分享 → 选择你的快捷指令，内容自动发送到知识库
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 消息处理流程 */}
        <div className="bg-white rounded-lg border border-[#e8e8e8] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server size={18} className="text-[#888]" />
            <h2 className="font-bold">消息处理流程</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="bg-[#f5f5f5] rounded-lg px-3 py-2 text-center">
              <div className="text-lg mb-1">💬</div>
              <div className="text-[#666]">微信发消息</div>
            </div>
            <div className="text-[#ccc]">→</div>
            <div className="bg-[#f5f5f5] rounded-lg px-3 py-2 text-center">
              <div className="text-lg mb-1">🔗</div>
              <div className="text-[#666]">Webhook 接收</div>
            </div>
            <div className="text-[#ccc]">→</div>
            <div className="bg-[#f5f5f5] rounded-lg px-3 py-2 text-center">
              <div className="text-lg mb-1">🤖</div>
              <div className="text-[#666]">AI 自动分类</div>
            </div>
            <div className="text-[#ccc]">→</div>
            <div className="bg-[#f5f5f5] rounded-lg px-3 py-2 text-center">
              <div className="text-lg mb-1">📚</div>
              <div className="text-[#666]">存入知识库</div>
            </div>
          </div>
          <div className="mt-4 text-xs text-[#888] space-y-1">
            <div>• 短消息（&lt;200字）→ 存为「小记」，自动提取 #标签</div>
            <div>• 长文章 → 存为「文档」，AI 自动生成标题和摘要</div>
            <div>• AI 根据内容自动分到：收集箱/项目/领域/资源/输出/个人</div>
            <div>• 内容中加 #标签 可以标记分类，如 <code className="text-[#d4a574]">#英语</code> <code className="text-[#d4a574]">#日记</code></div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-800 space-y-1">
            <div className="font-medium">注意事项</div>
            <div>• 公网隧道地址在服务器重启后会变化，重新启动后会生成新地址</div>
            <div>• 隧道关闭后微信消息会暂时无法接收，重启后恢复</div>
            <div>• 部署到正式服务器后地址固定，无需隧道（后续帮你做）</div>
            <div>• Token 默认为 <code>xiaotao2024</code>，可在环境变量 WECHAT_TOKEN 中修改</div>
          </div>
        </div>
      </div>
    </div>
  );
}
