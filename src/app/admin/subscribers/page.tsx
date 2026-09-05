"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Users,
  CheckCircle,
  Download,
  ArrowLeft,
  Mail,
  Clock,
  Tag,
} from "lucide-react";
import dayjs from "dayjs";
import MobileBottomNav from "@/components/MobileBottomNav";

type Subscriber = {
  id: string;
  email: string;
  source: string | null;
  confirmed: boolean;
  createdAt: string;
  lastSentAt: string | null;
};

export default function SubscribersPage() {
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const loadSubscribers = async (searchQuery: string = "", pageNum: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      params.set("page", String(pageNum));
      params.set("pageSize", String(pageSize));

      const res = await fetch(`/api/admin/subscribers?${params.toString()}`);

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (data.success) {
        setSubscribers(data.data.subscribers);
        setTotal(data.data.total);
        setConfirmedCount(data.data.confirmedCount);
        setPage(pageNum);
      }
    } catch (e) {
      console.error("Load subscribers error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscribers(search, page);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
    loadSubscribers(searchInput, 1);
  };

  // 导出 CSV
  const handleExport = async () => {
    try {
      // 获取所有数据（不分页）
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", "1");
      params.set("pageSize", "10000"); // 足够大的数

      const res = await fetch(`/api/admin/subscribers?${params.toString()}`);
      const data = await res.json();

      if (data.success && data.data.subscribers.length > 0) {
        const rows = data.data.subscribers;
        // CSV 表头
        const headers = ["邮箱", "来源", "是否确认", "订阅时间", "最后发送时间"];
        const csvContent = [
          headers.join(","),
          ...rows.map((row: Subscriber) =>
            [
              row.email,
              row.source || "",
              row.confirmed ? "是" : "否",
              dayjs(row.createdAt).format("YYYY-MM-DD HH:mm:ss"),
              row.lastSentAt ? dayjs(row.lastSentAt).format("YYYY-MM-DD HH:mm:ss") : "",
            ]
              .map((cell) => `"${cell.replace(/"/g, '""')}"`)
              .join(",")
          ),
        ].join("\n");

        // 添加 BOM 以支持中文
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `订阅者列表_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Export error:", e);
      alert("导出失败，请稍后重试");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="min-h-screen bg-bg">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rule">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 hover:bg-[#f2f3f5] rounded-lg transition-colors"
              title="返回看板"
            >
              <ArrowLeft size={18} className="text-muted" />
            </Link>
            <h1 className="text-lg font-semibold text-ink">订阅管理</h1>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent text-white hover:bg-accent-2 rounded-lg transition-colors"
          >
            <Download size={14} />
            导出 CSV
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-28 md:pb-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-rule rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
                <Users size={20} className="text-accent-deep" />
              </div>
              <div>
                <div className="text-2xl font-bold text-ink">{total}</div>
                <div className="text-xs text-muted">总订阅数</div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-rule rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-ink">{confirmedCount}</div>
                <div className="text-xs text-muted">已确认</div>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="bg-white border border-rule rounded-xl p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="搜索邮箱地址..."
                className="w-full pl-9 pr-4 py-2 bg-[#f2f3f5] border border-transparent rounded-lg text-sm outline-none focus:bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-accent text-white text-sm rounded-lg hover:bg-accent-2 transition-colors"
            >
              搜索
            </button>
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  setPage(1);
                  loadSubscribers("", 1);
                }}
                className="px-4 py-2 border border-rule text-ink text-sm rounded-lg hover:bg-[#f2f3f5] transition-colors"
              >
                清除
              </button>
            )}
          </form>
        </div>

        {/* 订阅者列表 */}
        <div className="bg-white border border-rule rounded-xl overflow-hidden">
          {/* 桌面端表格 */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-rule bg-[#f9fafb]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">邮箱</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">来源</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">状态</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">订阅时间</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted">最后发送</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted text-sm">
                      加载中...
                    </td>
                  </tr>
                ) : subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted text-sm">
                      暂无订阅者
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="border-b border-rule last:border-0 hover:bg-[#f9fafb] transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-ink">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-muted flex-shrink-0" />
                          <span className="truncate">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f2f3f5] rounded text-xs">
                          <Tag size={10} />
                          {sub.source || "未知"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sub.confirmed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                            <CheckCircle size={12} />
                            已确认
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                            <Clock size={12} />
                            待确认
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {dayjs(sub.createdAt).format("YYYY-MM-DD HH:mm")}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted">
                        {sub.lastSentAt
                          ? dayjs(sub.lastSentAt).format("YYYY-MM-DD HH:mm")
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 移动端卡片列表 */}
          <div className="sm:hidden divide-y divide-rule">
            {loading ? (
              <div className="text-center py-12 text-muted text-sm">加载中...</div>
            ) : subscribers.length === 0 ? (
              <div className="text-center py-12 text-muted text-sm">暂无订阅者</div>
            ) : (
              subscribers.map((sub) => (
                <div key={sub.id} className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Mail size={14} className="text-muted flex-shrink-0" />
                      <span className="text-sm text-ink truncate">{sub.email}</span>
                    </div>
                    {sub.confirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex-shrink-0">
                        <CheckCircle size={10} />
                        已确认
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex-shrink-0">
                        <Clock size={10} />
                        待确认
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Tag size={10} />
                      {sub.source || "未知"}
                    </span>
                    <span>{dayjs(sub.createdAt).format("MM-DD HH:mm")}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-rule bg-[#f9fafb]">
              <span className="text-xs text-muted">
                共 {total} 条，第 {page} / {totalPages} 页
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newPage = page - 1;
                    setPage(newPage);
                    loadSubscribers(search, newPage);
                  }}
                  disabled={page <= 1}
                  className="px-3 py-1 text-sm border border-rule rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => {
                    const newPage = page + 1;
                    setPage(newPage);
                    loadSubscribers(search, newPage);
                  }}
                  disabled={page >= totalPages}
                  className="px-3 py-1 text-sm border border-rule rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* 移动端底部导航 */}
      <MobileBottomNav />
    </div>
  );
}
