"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Ticket,
  Crown,
  Home,
  Search,
  Copy,
  Check,
  Plus,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
  XCircle,
  Mail,
  User,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import MobileBottomNav from "@/components/MobileBottomNav";
import clsx from "clsx";

interface InviteCode {
  id: string;
  code: string;
  tier: string;
  days: number;
  isUsed: boolean;
  usedBy: string | null;
  usedByName: string | null;
  usedByEmail: string | null;
  createdAt: string;
  usedAt: string | null;
}

interface Member {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isMember: boolean;
  memberTier: string | null;
  memberExpiresAt: string | null;
  createdAt: string;
  status: "active" | "expired";
}

const tierLabels: Record<string, { label: string; className: string }> = {
  basic: { label: "基础", className: "bg-blue-50 text-blue-600" },
  premium: { label: "高级", className: "bg-amber-50 text-amber-600" },
  vip: { label: "VIP", className: "bg-purple-50 text-purple-600" },
};

export default function AdminMembersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"invites" | "members">("invites");
  const [loading, setLoading] = useState(true);

  // 邀请码相关
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [generating, setGenerating] = useState(false);
  const [newTier, setNewTier] = useState("premium");
  const [newDays, setNewDays] = useState(365);
  const [newCount, setNewCount] = useState(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // 会员列表相关
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
      return;
    }
    loadInviteCodes();
  }, [router]);

  useEffect(() => {
    if (activeTab === "members") {
      loadMembers();
    }
  }, [activeTab]);

  const loadInviteCodes = async () => {
    try {
      const res = await fetch("/api/invite-codes");
      const data = await res.json();
      if (data.success) {
        setInviteCodes(data.codes || []);
      }
    } catch (e) {
      console.error("Load invite codes error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    setSearching(true);
    try {
      const url = searchQuery
        ? `/api/admin/members?search=${encodeURIComponent(searchQuery)}`
        : "/api/admin/members";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members || []);
      }
    } catch (e) {
      console.error("Load members error:", e);
    } finally {
      setSearching(false);
    }
  };

  const handleGenerateCodes = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/invite-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier: newTier,
          days: newDays,
          count: newCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInviteCodes([...(data.codes || []), ...inviteCodes]);
        loadInviteCodes(); // 重新加载以获取完整信息
      } else {
        alert(data.error || "生成失败");
      }
    } catch (e) {
      console.error("Generate invite codes error:", e);
      alert("生成失败");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white font-bold">
              晓桃
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
            <Link
              href="/settings"
              className="hover:text-accent-deep transition-colors"
            >
              设置
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* 页面头部 */}
      <section className="bg-gradient-to-b from-accent-soft/50 to-transparent py-8 sm:py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-white shadow-lg shadow-accent/30">
              <Users size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-ink">
                会员管理
              </h1>
              <p className="text-sm text-muted mt-1">
                管理邀请码和会员用户
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tab 切换 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-2">
        <div className="flex gap-1 p-1 bg-white border border-rule rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("invites")}
            className={clsx(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "invites"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            <Ticket size={16} />
            邀请码管理
          </button>
          <button
            onClick={() => setActiveTab("members")}
            className={clsx(
              "flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all",
              activeTab === "members"
                ? "bg-accent text-white shadow-sm"
                : "text-muted hover:text-ink"
            )}
          >
            <Crown size={16} />
            会员列表
          </button>
        </div>
      </div>

      {/* 主体内容 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-28 md:pb-6">
        {/* Tab 1: 邀请码管理 */}
        {activeTab === "invites" && (
          <div className="space-y-6">
            {/* 生成邀请码表单 */}
            <section className="bg-white border border-rule rounded-xl p-5 sm:p-6">
              <h2 className="text-base font-semibold text-ink mb-5 flex items-center gap-2">
                <span className="w-1 h-5 bg-accent rounded-full" />
                <Plus size={18} className="text-accent" />
                生成邀请码
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    会员等级
                  </label>
                  <select
                    value={newTier}
                    onChange={(e) => setNewTier(e.target.value)}
                    className="w-full px-3 py-2.5 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all bg-white"
                  >
                    <option value="basic">基础会员</option>
                    <option value="premium">高级会员</option>
                    <option value="vip">VIP 会员</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    有效天数
                  </label>
                  <input
                    type="number"
                    value={newDays}
                    onChange={(e) => setNewDays(parseInt(e.target.value) || 0)}
                    min={1}
                    className="w-full px-3 py-2.5 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                  <p className="text-xs text-muted mt-1">0 表示永久</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">
                    生成数量
                  </label>
                  <input
                    type="number"
                    value={newCount}
                    onChange={(e) =>
                      setNewCount(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    min={1}
                    max={100}
                    className="w-full px-3 py-2.5 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateCodes}
                disabled={generating}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg hover:bg-accent-2 transition-colors disabled:opacity-50 text-sm font-medium"
              >
                {generating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    生成邀请码
                  </>
                )}
              </button>
            </section>

            {/* 邀请码列表 */}
            <section className="bg-white border border-rule rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-rule flex items-center justify-between">
                <h2 className="text-base font-semibold text-ink flex items-center gap-2">
                  <Ticket size={18} className="text-accent" />
                  邀请码列表
                </h2>
                <span className="text-sm text-muted">
                  共 {inviteCodes.length} 个
                </span>
              </div>

              {inviteCodes.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <div className="text-4xl mb-3">🎫</div>
                  <p>还没有邀请码</p>
                  <p className="text-sm mt-1">生成第一个邀请码吧</p>
                </div>
              ) : (
                <div className="divide-y divide-rule max-h-[600px] overflow-y-auto">
                  {inviteCodes.map((invite) => {
                    const tierInfo =
                      tierLabels[invite.tier] || tierLabels.premium;
                    return (
                      <div
                        key={invite.id}
                        className={clsx(
                          "px-5 py-4 flex items-center justify-between gap-4 transition-colors",
                          invite.isUsed ? "bg-gray-50 opacity-70" : "hover:bg-bg"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <code className="text-sm font-mono font-semibold text-ink">
                              {invite.code}
                            </code>
                            <span
                              className={clsx(
                                "text-xs px-2 py-0.5 rounded",
                                tierInfo.className
                              )}
                            >
                              {tierInfo.label}
                            </span>
                            <span className="text-xs text-muted">
                              {invite.days === 0 ? "永久" : `${invite.days} 天`}
                            </span>
                            {invite.isUsed ? (
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-200 text-gray-500 flex items-center gap-1">
                                <XCircle size={12} />
                                已使用
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                未使用
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              创建于 {formatDateTime(invite.createdAt)}
                            </span>
                            {invite.isUsed && invite.usedByName && (
                              <span className="flex items-center gap-1">
                                <User size={12} />
                                {invite.usedByName} ({invite.usedByEmail})
                              </span>
                            )}
                            {invite.isUsed && invite.usedAt && (
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                使用于 {formatDateTime(invite.usedAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {!invite.isUsed && (
                          <button
                            onClick={() => copyToClipboard(invite.code)}
                            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs text-accent-deep bg-accent-soft rounded-lg hover:bg-accent/20 transition-colors"
                          >
                            {copiedCode === invite.code ? (
                              <>
                                <Check size={14} />
                                已复制
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                复制
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Tab 2: 会员列表 */}
        {activeTab === "members" && (
          <div className="space-y-6">
            {/* 搜索栏 */}
            <section className="bg-white border border-rule rounded-xl p-5 sm:p-6">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      loadMembers();
                    }
                  }}
                  placeholder="搜索会员名称或邮箱..."
                  className="w-full pl-10 pr-4 py-2.5 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted">
                  共 {members.length} 位会员
                </span>
                <button
                  onClick={loadMembers}
                  className="text-xs text-accent-deep hover:underline"
                >
                  刷新
                </button>
              </div>
            </section>

            {/* 会员列表 */}
            <section className="bg-white border border-rule rounded-xl overflow-hidden">
              {searching ? (
                <div className="text-center py-12 text-muted">
                  <Loader2
                    size={24}
                    className="animate-spin text-accent mx-auto mb-3"
                  />
                  <p>搜索中...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <div className="text-4xl mb-3">👥</div>
                  <p>暂无会员用户</p>
                  <p className="text-sm mt-1">生成邀请码邀请用户加入吧</p>
                </div>
              ) : (
                <div className="divide-y divide-rule">
                  {members.map((member) => {
                    const tierInfo =
                      tierLabels[member.memberTier || "premium"] ||
                      tierLabels.premium;
                    const isExpired = member.status === "expired";

                    return (
                      <div
                        key={member.id}
                        className="px-5 py-4 flex items-center gap-4 hover:bg-bg transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-accent-soft flex items-center justify-center text-accent-deep font-semibold flex-shrink-0">
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            member.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-ink truncate">
                              {member.name}
                            </span>
                            <span
                              className={clsx(
                                "text-xs px-2 py-0.5 rounded flex-shrink-0",
                                tierInfo.className
                              )}
                            >
                              {tierInfo.label}
                            </span>
                            {isExpired ? (
                              <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500 flex-shrink-0">
                                已过期
                              </span>
                            ) : (
                              <span className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 flex-shrink-0">
                                正常
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted">
                            <span className="flex items-center gap-1 truncate">
                              <Mail size={12} className="flex-shrink-0" />
                              <span className="truncate">{member.email}</span>
                            </span>
                            <span className="flex items-center gap-1 flex-shrink-0">
                              <Calendar size={12} />
                              加入于 {formatDate(member.createdAt)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className="text-xs text-muted mb-1">到期时间</div>
                          <div className="text-sm font-medium text-ink">
                            {member.memberExpiresAt
                              ? formatDate(member.memberExpiresAt)
                              : "永久"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* 底部间距 */}
      <div className="h-8 pb-16 md:pb-8" />

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
