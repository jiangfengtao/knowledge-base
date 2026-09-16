"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [checking, setChecking] = useState(true);

  // 如果已登录且 token 有效，跳转首页
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      setChecking(false);
      return;
    }

    // 先验证 token 是否有效，避免无效 token 导致跳转循环
    fetch("/api/knowledge-bases", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (res.ok) {
          // token 有效，跳转首页
          window.location.href = "/";
        } else {
          // token 无效，清除并留在登录页
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_info");
          setChecking(false);
        }
      })
      .catch(() => {
        // 网络错误，清除 token 留在登录页
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_info");
        setChecking(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email.trim() || !password.trim()) {
      setError("请填写邮箱和密码");
      return;
    }

    if (mode === "register" && !name.trim()) {
      setError("请填写用户名");
      return;
    }

    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("user_info", JSON.stringify(data.user));
        setSuccess(mode === "login" ? "登录成功，正在跳转..." : "注册成功，正在跳转...");
        setTimeout(() => {
          window.location.href = "/";
        }, 800);
      } else {
        setError(data.error || "操作失败");
      }
    } catch (err: any) {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f6f7] via-white to-[#e8f5f0]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-accent mx-auto mb-2" />
          <p className="text-sm text-muted">正在检查登录状态...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f6f7] via-white to-[#e8f5f0] px-4 py-8">
      {/* 装饰背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-accent/30">
              晓桃
            </div>
            <span className="text-2xl font-bold text-ink">晓桃自学英语</span>
          </div>
          <p className="text-sm text-muted">个人知识管理与成长系统</p>
        </div>

        {/* 登录卡片 */}
        <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-rule p-6 sm:p-8">
          {/* 标签切换 */}
          <div className="flex gap-1 p-1 bg-[#f2f3f5] rounded-lg mb-6">
            <button
              onClick={() => {
                setMode("login");
                setError("");
                setSuccess("");
              }}
              className={clsx(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                mode === "login"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              )}
            >
              登录
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError("");
                setSuccess("");
              }}
              className={clsx(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                mode === "register"
                  ? "bg-white text-ink shadow-sm"
                  : "text-muted hover:text-ink"
              )}
            >
              注册
            </button>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-600">
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* 成功提示 */}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-sm text-green-600">
              <Check size={16} />
              <span className="flex-1">{success}</span>
            </div>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  用户名
                </label>
                <div className="relative">
                  <User
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="输入你的昵称"
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-rule rounded-lg outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                邮箱
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-3 py-2.5 text-sm border border-rule rounded-lg outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">
                密码
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "login" ? "输入密码" : "至少6位密码"}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-rule rounded-lg outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={loading}
              className={clsx(
                "w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all",
                loading
                  ? "bg-accent/60 text-white cursor-wait"
                  : "bg-accent text-white hover:bg-accent-2 hover:shadow-lg hover:shadow-accent/30"
              )}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  处理中...
                </>
              ) : (
                <>
                  {mode === "login" ? "登录" : "注册"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* 分割线 */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-rule" />
            <span className="text-xs text-muted">或</span>
            <div className="flex-1 h-px bg-rule" />
          </div>

          {/* 快速体验 */}
          <button
            onClick={async () => {
              setLoading(true);
              setError("");
              try {
                const res = await fetch("/api/auth/login", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: "guest@xiaotao.dev",
                    password: "guest123",
                  }),
                });
                const data = await res.json();
                if (data.success) {
                  localStorage.setItem("auth_token", data.token);
                  localStorage.setItem("user_info", JSON.stringify(data.user));
                  setSuccess("正在进入体验模式...");
                  setTimeout(() => {
                    window.location.href = "/";
                  }, 600);
                } else {
                  // 如果访客账号不存在，自动注册
                  const regRes = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: "guest@xiaotao.dev",
                      password: "guest123",
                      name: "访客",
                    }),
                  });
                  const regData = await regRes.json();
                  if (regData.success) {
                    localStorage.setItem("auth_token", regData.token);
                    localStorage.setItem("user_info", JSON.stringify(regData.user));
                    setSuccess("正在进入体验模式...");
                    setTimeout(() => {
                      window.location.href = "/";
                    }, 600);
                  } else {
                    setError("体验模式失败，请手动注册");
                  }
                }
              } catch (e) {
                setError("网络错误");
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted border border-rule rounded-lg hover:bg-[#f2f3f5] hover:text-ink transition-all"
          >
            <Sparkles size={16} className="text-accent" />
            <span>快速体验</span>
          </button>
        </div>

        {/* 底部说明 */}
        <p className="text-center text-xs text-muted mt-4">
          登录即代表同意我们的服务条款和隐私政策
        </p>
      </div>
    </div>
  );
}
