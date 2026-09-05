"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

type SubscribeBoxProps = {
  source?: string;
  variant?: "sidebar" | "bottom";
};

export default function SubscribeBox({ source = "blog", variant = "sidebar" }: SubscribeBoxProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("请输入有效的邮箱地址");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("success");
        setMessage(data.message || "订阅成功！");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "订阅失败，请稍后重试");
      }
    } catch (err) {
      setStatus("error");
      setMessage("网络错误，请稍后重试");
    }
  };

  if (variant === "bottom") {
    return (
      <div className="bg-gradient-to-br from-accent via-accent-deep to-purple-600 rounded-2xl p-6 sm:p-10 text-white text-center overflow-hidden relative">
        {/* 装饰性圆点 */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles size={20} className="text-yellow-300" />
            <h3 className="text-xl sm:text-2xl font-bold">订阅我的周刊</h3>
          </div>
          <p className="text-white/80 text-sm sm:text-base mb-6 max-w-md mx-auto">
            每周一封精选邮件，分享学习笔记、读书感悟和成长思考。不打扰，有价值。
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder="输入你的邮箱..."
                className="w-full pl-10 pr-4 py-3 bg-white text-ink rounded-xl text-sm outline-none focus:ring-2 focus:ring-white/50 transition-all placeholder:text-muted"
                disabled={status === "loading" || status === "success"}
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading" || status === "success"}
              className="px-6 py-3 bg-white text-accent-deep font-semibold rounded-xl hover:bg-white/90 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  订阅中...
                </>
              ) : status === "success" ? (
                <>
                  <CheckCircle size={18} />
                  已订阅
                </>
              ) : (
                <>
                  <Send size={16} />
                  订阅
                </>
              )}
            </button>
          </form>

          {/* 状态提示 */}
          {status === "success" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-green-200 text-sm">
              <CheckCircle size={16} />
              {message}
            </div>
          )}
          {status === "error" && (
            <div className="mt-4 flex items-center justify-center gap-2 text-red-200 text-sm">
              <AlertCircle size={16} />
              {message}
            </div>
          )}

          <p className="mt-4 text-xs text-white/60">
            我们尊重你的隐私，绝不发送垃圾邮件，随时可退订
          </p>
        </div>
      </div>
    );
  }

  // sidebar 变体
  return (
    <div className="bg-gradient-to-br from-accent-soft via-white to-purple-50 border border-accent/20 rounded-xl p-5 overflow-hidden relative">
      {/* 装饰 */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <Mail size={16} className="text-accent-deep" />
          </div>
          <h3 className="font-semibold text-ink">邮件订阅</h3>
        </div>
        <p className="text-xs text-muted leading-relaxed mb-4">
          订阅周刊，每周收到精选学习笔记和成长思考
        </p>

        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="输入邮箱地址..."
            className="w-full px-3 py-2 bg-white border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-muted"
            disabled={status === "loading" || status === "success"}
          />
          <button
            type="submit"
            disabled={status === "loading" || status === "success"}
            className="w-full py-2 bg-accent hover:bg-accent-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
          >
            {status === "loading" ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                订阅中...
              </>
            ) : status === "success" ? (
              <>
                <CheckCircle size={16} />
                订阅成功
              </>
            ) : (
              <>
                <Send size={14} />
                立即订阅
              </>
            )}
          </button>
        </form>

        {/* 状态提示 */}
        {status === "success" && (
          <div className="mt-3 flex items-start gap-1.5 text-green-600 text-xs">
            <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}
        {status === "error" && (
          <div className="mt-3 flex items-start gap-1.5 text-red-500 text-xs">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        <p className="mt-3 text-[11px] text-muted/70">
          尊重隐私，可随时退订
        </p>
      </div>
    </div>
  );
}
