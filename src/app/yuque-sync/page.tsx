"use client";

import { useState } from "react";
import {
  Settings,
  BookOpen,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";

export default function YuqueSyncPage() {
  const [token, setToken] = useState("");
  const [step, setStep] = useState<"input" | "loading" | "list">("input");
  const [repos, setRepos] = useState<any[]>([]);
  const [yuqueUser, setYuqueUser] = useState<any>(null);
  const [error, setError] = useState("");
  const [syncingRepo, setSyncingRepo] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<any>(null);

  // 验证 Token 并获取知识库列表
  const handleVerify = async () => {
    if (!token.trim()) return;
    setStep("loading");
    setError("");

    try {
      // 验证 token
      const verifyRes = await fetch("/api/yuque", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const verifyData = await verifyRes.json();

      if (!verifyData.success) {
        throw new Error(verifyData.error || "Token 验证失败");
      }

      setYuqueUser(verifyData.yuqueUser);

      // 获取知识库列表
      const reposRes = await fetch(`/api/yuque?token=${encodeURIComponent(token.trim())}`);
      const reposData = await reposRes.json();

      if (reposData.error) {
        throw new Error(reposData.error);
      }

      setRepos(reposData.data || []);
      setStep("list");
    } catch (e: any) {
      setError(e.message);
      setStep("input");
    }
  };

  // 同步单个知识库
  const handleSync = async (repo: any) => {
    setSyncingRepo(repo.id);
    setSyncResults(null);

    try {
      const res = await fetch("/api/yuque/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          repoId: repo.id,
          repoName: repo.name,
        }),
      });
      const data = await res.json();
      setSyncResults(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSyncingRepo(null);
    }
  };

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
            <Settings size={22} className="text-accent-deep" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">语雀同步设置</h1>
            <p className="text-sm text-muted">
              将你的语雀知识库同步到晓桃终生成长
            </p>
          </div>
        </div>

        {/* Token 输入 */}
        <div className="bg-white border border-rule rounded-xl p-6 mb-6">
          <h2 className="font-medium text-ink mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-accent" />
            连接语雀账号
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-ink mb-2">
                语雀 Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="请输入语雀访问 Token..."
                className="w-full px-3 py-2 border border-rule rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              />
            </div>

            <div className="text-xs text-muted bg-[#f9fafb] p-3 rounded-lg">
              <p className="font-medium text-ink mb-1">💡 如何获取 Token？</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>登录语雀，进入「设置」→「Token」</li>
                <li>点击「创建新 Token」，选择读取权限</li>
                <li>复制生成的 Token 粘贴到这里</li>
              </ol>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <XCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={step === "loading" || !token.trim()}
              className="w-full py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {step === "loading" ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>验证中...</span>
                </>
              ) : (
                <>
                  <ArrowRight size={18} />
                  <span>连接并获取知识库</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 知识库列表 */}
        {step === "list" && (
          <div className="bg-white border border-rule rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-ink flex items-center gap-2">
                <CheckCircle size={18} className="text-accent" />
                已连接：{yuqueUser?.name || yuqueUser?.login}
              </h2>
              <span className="text-sm text-muted">
                共 {repos.length} 个知识库
              </span>
            </div>

            {syncResults && (
              <div className="mb-4 p-4 bg-accent-soft border border-accent/20 rounded-lg">
                <div className="font-medium text-accent-deep mb-2">
                  ✅ 同步完成
                </div>
                <div className="text-sm text-ink">
                  成功导入 {syncResults.imported} 篇，失败{" "}
                  {syncResults.failed} 篇
                </div>
              </div>
            )}

            <div className="space-y-2">
              {repos.map((repo) => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 border border-rule rounded-lg hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-accent-soft flex items-center justify-center text-lg">
                      📖
                    </div>
                    <div>
                      <div className="font-medium text-sm text-ink">
                        {repo.name}
                      </div>
                      <div className="text-xs text-muted">
                        {repo.items_count || 0} 篇文档 · {repo.namespace}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSync(repo)}
                    disabled={syncingRepo === repo.id}
                    className="px-3 py-1.5 text-sm bg-accent-soft text-accent-deep rounded-lg hover:bg-accent hover:text-white transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {syncingRepo === repo.id ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>同步中...</span>
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        <span>导入</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-rule text-xs text-muted">
              <p>
                💡 提示：首次导入会拉取最新 10 篇文档进行测试。确认没问题后，可以开启全量同步。
              </p>
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="mt-6 p-4 bg-white border border-rule rounded-lg">
          <h3 className="font-medium text-sm text-ink mb-2">📋 同步说明</h3>
          <ul className="text-sm text-muted space-y-1.5">
            <li>• 导入的知识库默认放在「00 收集箱」，你可以后续移动到其他分类</li>
            <li>• 文档内容会保留语雀的格式（标题、列表、引用等）</li>
            <li>• 重复导入会更新已有的文档，不会创建重复</li>
            <li>• 目前是手动同步，后续可以开启自动定时同步</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
