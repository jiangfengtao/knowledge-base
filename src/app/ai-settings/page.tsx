"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, Save, Check, Key, Globe, Sparkles, ArrowLeft } from "lucide-react";

export default function AISettingsPage() {
  const router = useRouter();
  const [provider, setProvider] = useState("deepseek");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.deepseek.com");
  const [model, setModel] = useState("deepseek-chat");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [keyPreview, setKeyPreview] = useState("");

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await fetch("/api/ai/config");
      const data = await res.json();
      if (data.success && data.data) {
        setProvider(data.data.provider || "deepseek");
        setModel(data.data.model || "deepseek-chat");
        setHasKey(data.data.hasApiKey);
        setKeyPreview(data.data.apiKeyPreview || "");
      }
    } catch (e) {
      console.error("Load AI config error:", e);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/ai/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          baseUrl,
          model,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setHasKey(true);
        setTimeout(() => setSaved(false), 2000);
        loadConfig();
      }
    } catch (e) {
      console.error("Save AI config error:", e);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const providers = [
    { id: "deepseek", name: "DeepSeek", url: "https://api.deepseek.com", model: "deepseek-chat" },
    { id: "doubao", name: "豆包（字节跳动）", url: "https://ark.cn-beijing.volces.com/api/v3", model: "doubao-pro-32k" },
    { id: "openai", name: "OpenAI (GPT)", url: "https://api.openai.com/v1", model: "gpt-4o-mini" },
  ];

  const handleProviderChange = (p: string) => {
    setProvider(p);
    const prov = providers.find((x) => x.id === p);
    if (prov) {
      setBaseUrl(prov.url);
      setModel(prov.model);
    }
  };

  return (
    <div className="min-h-screen bg-bg pt-12 lg:pt-0">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-ink mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>返回</span>
        </button>

        <div className="bg-white border border-rule rounded-xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
              <Sparkles className="text-accent-deep" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-ink">AI 设置</h1>
              <p className="text-sm text-muted">配置 AI 服务，开启智能写作助手</p>
            </div>
          </div>

          {/* 选择服务商 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink mb-3">
              选择 AI 服务商
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {providers.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleProviderChange(p.id)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all ${
                    provider === p.id
                      ? "border-accent bg-accent-soft/50"
                      : "border-rule hover:border-[#d0d4d9]"
                  }`}
                >
                  <div className="font-medium text-sm text-ink">{p.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* API Key */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink mb-2">
              API Key
            </label>
            {hasKey && !apiKey ? (
              <div className="flex items-center gap-2 mb-2">
                <Key size={14} className="text-muted" />
                <span className="text-sm text-muted">
                  已配置：{keyPreview}
                </span>
                <button
                  onClick={() => setApiKey("")}
                  className="text-xs text-accent hover:underline"
                >
                  更换
                </button>
              </div>
            ) : (
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入 API Key，如 sk-xxxxxxxxxx"
                className="w-full px-3 py-2 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            )}
            <p className="text-xs text-muted mt-2">
              {provider === "deepseek" && (
                <>获取地址：https://platform.deepseek.com/</>
              )}
              {provider === "doubao" && (
                <>获取地址：https://console.volcengine.com/ark</>
              )}
              {provider === "openai" && (
                <>获取地址：https://platform.openai.com/api-keys</>
              )}
            </p>
          </div>

          {/* API 地址 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-ink mb-2">
              API 地址
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="w-full px-3 py-2 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
          </div>

          {/* 模型 */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-ink mb-2">
              模型名称
            </label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
            />
            <p className="text-xs text-muted mt-2">
              一般保持默认即可，有需要可以更换模型
            </p>
          </div>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={saving || (!apiKey && hasKey)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-2 transition-colors disabled:opacity-50"
          >
            {saved ? (
              <>
                <Check size={18} />
                <span>保存成功</span>
              </>
            ) : saving ? (
              <span>保存中...</span>
            ) : (
              <>
                <Save size={18} />
                <span>保存设置</span>
              </>
            )}
          </button>
        </div>

        {/* 功能说明 */}
        <div className="mt-6 bg-white border border-rule rounded-xl p-6">
          <h3 className="font-semibold text-ink mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-accent" />
            AI 写作助手功能
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-bg rounded-lg">
              <div className="font-medium text-ink mb-1">✍️ AI 续写</div>
              <div className="text-xs text-muted">写不下去了，AI 帮你接着写</div>
            </div>
            <div className="p-3 bg-bg rounded-lg">
              <div className="font-medium text-ink mb-1">✨ AI 润色</div>
              <div className="text-xs text-muted">让文字更通顺、更优雅</div>
            </div>
            <div className="p-3 bg-bg rounded-lg">
              <div className="font-medium text-ink mb-1">📝 AI 扩写</div>
              <div className="text-xs text-muted">一句话变一段，丰富细节</div>
            </div>
            <div className="p-3 bg-bg rounded-lg">
              <div className="font-medium text-ink mb-1">📏 AI 缩写</div>
              <div className="text-xs text-muted">长文浓缩成精华摘要</div>
            </div>
            <div className="p-3 bg-bg rounded-lg">
              <div className="font-medium text-ink mb-1">🌐 AI 翻译</div>
              <div className="text-xs text-muted">中英文互译</div>
            </div>
            <div className="p-3 bg-bg rounded-lg">
              <div className="font-medium text-ink mb-1">📋 AI 大纲</div>
              <div className="text-xs text-muted">给个标题，AI 帮你列大纲</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
