"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Settings,
  Save,
  Check,
  User,
  FileText,
  Link2,
  Shield,
  ArrowLeft,
  Home,
  MessageCircle,
  Mail,
  Github,
  Copy,
  CheckCircle2,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";

interface SocialLinks {
  wechat?: string;
  weibo?: string;
  zhihu?: string;
  xiaohongshu?: string;
  email?: string;
  github?: string;
  [key: string]: string | undefined;
}

interface SettingsData {
  blogTitle: string;
  blogSubtitle: string;
  bio: string;
  avatarUrl: string;
  socialLinks: SocialLinks;
  defaultLicense: string;
  defaultAllowCopy: boolean;
  defaultAllowShare: boolean;
}

const defaultSocialLinks: SocialLinks = {
  wechat: "",
  weibo: "",
  zhihu: "",
  xiaohongshu: "",
  email: "",
  github: "",
};

const licenseOptions = [
  { value: "all-rights", label: "保留所有权利" },
  { value: "cc-by", label: "CC BY（署名）" },
  { value: "cc-by-nc", label: "CC BY-NC（署名-非商业）" },
  { value: "cc-by-nc-sa", label: "CC BY-NC-SA（署名-非商业-相同方式共享）" },
];

const socialLinkFields = [
  { key: "wechat", label: "微信", icon: MessageCircle, placeholder: "微信号" },
  { key: "weibo", label: "微博", icon: MessageCircle, placeholder: "微博链接" },
  { key: "zhihu", label: "知乎", icon: FileText, placeholder: "知乎链接" },
  { key: "xiaohongshu", label: "小红书", icon: MessageCircle, placeholder: "小红书链接" },
  { key: "email", label: "邮箱", icon: Mail, placeholder: "邮箱地址" },
  { key: "github", label: "GitHub", icon: Github, placeholder: "GitHub 链接" },
];

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  // 基本信息
  const [blogTitle, setBlogTitle] = useState("");
  const [blogSubtitle, setBlogSubtitle] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  // 社交链接
  const [socialLinks, setSocialLinks] = useState<SocialLinks>(defaultSocialLinks);

  // 内容设置
  const [defaultLicense, setDefaultLicense] = useState("all-rights");
  const [defaultAllowCopy, setDefaultAllowCopy] = useState(true);
  const [defaultAllowShare, setDefaultAllowShare] = useState(true);

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadSettings();
  }, [router]);

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data as SettingsData;
        setBlogTitle(d.blogTitle || "");
        setBlogSubtitle(d.blogSubtitle || "");
        setBio(d.bio || "");
        setAvatarUrl(d.avatarUrl || "");
        setSocialLinks({ ...defaultSocialLinks, ...d.socialLinks });
        setDefaultLicense(d.defaultLicense || "all-rights");
        setDefaultAllowCopy(d.defaultAllowCopy ?? true);
        setDefaultAllowShare(d.defaultAllowShare ?? true);
      }
    } catch (e) {
      console.error("Load settings error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blogTitle,
          blogSubtitle,
          bio,
          avatarUrl,
          socialLinks,
          defaultLicense,
          defaultAllowCopy,
          defaultAllowShare,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        alert(data.error || "保存失败");
      }
    } catch (e) {
      console.error("Save settings error:", e);
      alert("保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleSocialLinkChange = (key: string, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-muted text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              桃
            </div>
            <span className="font-semibold text-ink">晓桃终生成长</span>
          </Link>

          <nav className="flex items-center gap-3 text-sm text-muted">
            <Link
              href="/"
              className="hover:text-accent-deep transition-colors flex items-center gap-1"
            >
              <Home size={14} />
              <span>首页</span>
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* 页面头部 */}
      <section className="bg-gradient-to-b from-accent-soft/50 to-transparent py-8 sm:py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/30">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink">网站设置</h1>
              <p className="text-sm text-muted mt-1">
                配置你的博客信息、社交链接和内容默认设置
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 主体内容 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* 基本信息 */}
        <section className="bg-white border border-rule rounded-xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full" />
            <User size={18} className="text-accent" />
            基本信息
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-base font-medium text-ink mb-2">
                博客标题
              </label>
              <input
                type="text"
                value={blogTitle}
                onChange={(e) => setBlogTitle(e.target.value)}
                placeholder="输入博客标题"
                className="w-full px-3 py-3 border border-rule rounded-lg text-base outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-ink mb-2">
                博客副标题
              </label>
              <input
                type="text"
                value={blogSubtitle}
                onChange={(e) => setBlogSubtitle(e.target.value)}
                placeholder="输入博客副标题"
                className="w-full px-3 py-3 border border-rule rounded-lg text-base outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
            </div>

            <div>
              <label className="block text-base font-medium text-ink mb-2">
                头像 URL
              </label>
              <div className="flex gap-3">
                {avatarUrl && (
                  <img
                    src={avatarUrl}
                    alt="头像预览"
                    className="w-12 h-12 rounded-lg object-cover border border-rule flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <input
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="输入头像图片链接"
                  className="flex-1 px-3 py-3 border border-rule rounded-lg text-base outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-base font-medium text-ink mb-2">
                个人简介
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="介绍一下你自己..."
                rows={4}
                className="w-full px-3 py-3 border border-rule rounded-lg text-base outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
              />
            </div>
          </div>
        </section>

        {/* 社交链接 */}
        <section className="bg-white border border-rule rounded-xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full" />
            <Link2 size={18} className="text-accent" />
            社交链接
          </h2>

          <div className="space-y-4">
            {socialLinkFields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.key}>
                  <label className="block text-base font-medium text-ink mb-2">
                    {field.label}
                  </label>
                  <div className="relative">
                    <Icon
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                      type="text"
                      value={socialLinks[field.key] || ""}
                      onChange={(e) =>
                        handleSocialLinkChange(field.key, e.target.value)
                      }
                      placeholder={field.placeholder}
                      className="w-full pl-10 pr-3 py-2.5 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted mt-4">
            社交链接以 JSON 格式存储，可在博客页面展示
          </p>
        </section>

        {/* 内容设置 */}
        <section className="bg-white border border-rule rounded-xl p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-accent rounded-full" />
            <Shield size={18} className="text-accent" />
            内容设置
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-base font-medium text-ink mb-2">
                默认版权协议
              </label>
              <select
                value={defaultLicense}
                onChange={(e) => setDefaultLicense(e.target.value)}
                className="w-full px-3 py-3 border border-rule rounded-lg text-base outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-white"
              >
                {licenseOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted mt-2">
                新建文章时默认使用的版权协议
              </p>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-rule">
              <div>
                <div className="text-sm font-medium text-ink">默认允许复制</div>
                <div className="text-xs text-muted mt-0.5">
                  读者是否可以复制文章内容
                </div>
              </div>
              <button
                onClick={() => setDefaultAllowCopy(!defaultAllowCopy)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  defaultAllowCopy ? "bg-accent" : "bg-gray-300"
                }`}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{
                    transform: defaultAllowCopy
                      ? "translateX(22px)"
                      : "translateX(2px)",
                  }}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-rule">
              <div>
                <div className="text-sm font-medium text-ink">默认允许分享</div>
                <div className="text-xs text-muted mt-0.5">
                  是否显示分享按钮
                </div>
              </div>
              <button
                onClick={() => setDefaultAllowShare(!defaultAllowShare)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  defaultAllowShare ? "bg-accent" : "bg-gray-300"
                }`}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                  style={{
                    transform: defaultAllowShare
                      ? "translateX(22px)"
                      : "translateX(2px)",
                  }}
                />
              </button>
            </div>
          </div>
        </section>

        {/* 保存按钮 */}
        <div className="sticky bottom-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent text-white rounded-xl hover:bg-accent-2 transition-colors disabled:opacity-50 shadow-lg shadow-accent/20 font-medium"
          >
            {saved ? (
              <>
                <CheckCircle2 size={18} />
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
      </main>

      {/* 底部间距 */}
      <div className="h-8 pb-16 md:pb-8" />

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
