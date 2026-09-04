"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  FolderOpen,
} from "lucide-react";

export default function ImportPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetKbId, setTargetKbId] = useState("");
  const [kbs, setKbs] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载知识库列表
  const loadKnowledgeBases = async () => {
    try {
      const res = await fetch("/api/knowledge-bases");
      const data = await res.json();
      setKbs(data.data || []);
      // 默认选收集箱
      const inbox = data.data?.find((k: any) => k.categoryCode === "00");
      if (inbox) setTargetKbId(inbox.id);
    } catch (e: any) {
      console.error("Load kbs error:", e);
    }
  };

  // 页面加载时获取知识库列表
  useEffect(() => {
    loadKnowledgeBases();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    // 过滤出 .md 和 .zip 文件
    const valid = selected.filter(
      (f) => f.name.endsWith(".md") || f.name.endsWith(".zip")
    );
    setFiles(valid);
    setResults(null);
    setError("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    const valid = dropped.filter(
      (f) => f.name.endsWith(".md") || f.name.endsWith(".zip")
    );
    setFiles(valid);
    setResults(null);
    setError("");
  };

  const handleImport = async () => {
    if (files.length === 0) return;
    setImporting(true);
    setError("");
    setResults(null);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      if (targetKbId) formData.append("knowledgeBaseId", targetKbId);

      const res = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "导入失败");
      }

      setResults(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setImporting(false);
    }
  };

  const totalMdFiles = files.filter((f) => f.name.endsWith(".md")).length;
  const totalZipFiles = files.filter((f) => f.name.endsWith(".zip")).length;

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
            <Upload size={22} className="text-accent-deep" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">导入文档</h1>
            <p className="text-sm text-muted">
              从语雀或其他地方导入 Markdown 文档到晓桃
            </p>
          </div>
        </div>

        {/* 选择目标知识库 */}
        <div className="bg-white border border-rule rounded-xl p-6 mb-6">
          <h2 className="font-medium text-ink mb-4 flex items-center gap-2">
            <FolderOpen size={18} className="text-accent" />
            导入到哪个知识库？
          </h2>
          <select
            value={targetKbId}
            onChange={(e) => setTargetKbId(e.target.value)}
            className="w-full px-3 py-2 border border-rule rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all bg-white"
          >
            {kbs.map((kb) => (
              <option key={kb.id} value={kb.id}>
                {kb.icon} {kb.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted mt-2">
            💡 默认导入到「00 收集箱」，导入后可以再移动到其他分类
          </p>
        </div>

        {/* 上传区域 */}
        <div className="bg-white border border-rule rounded-xl p-6 mb-6">
          <h2 className="font-medium text-ink mb-4 flex items-center gap-2">
            <FileText size={18} className="text-accent" />
            选择文件
          </h2>

          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-rule rounded-xl p-8 text-center cursor-pointer hover:border-accent/50 hover:bg-accent-soft/30 transition-all"
          >
            <Upload size={36} className="mx-auto text-muted mb-3" />
            <p className="text-sm text-ink mb-1">
              点击选择文件，或拖拽到这里
            </p>
            <p className="text-xs text-muted">
              支持 .md 单文件 和 .zip 压缩包（语雀导出格式）
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".md,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* 已选文件列表 */}
          {files.length > 0 && (
            <div className="mt-4 p-3 bg-[#f9fafb] rounded-lg">
              <div className="text-sm font-medium text-ink mb-2">
                已选择 {files.length} 个文件
                {totalZipFiles > 0 && `（${totalZipFiles} 个 zip 压缩包）`}
              </div>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="text-xs text-muted flex items-center gap-2"
                  >
                    <FileText size={12} />
                    <span className="truncate">{f.name}</span>
                    <span className="text-muted/60">
                      ({(f.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm mt-4">
              <XCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={importing || files.length === 0}
            className="w-full mt-4 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>导入中...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>开始导入</span>
              </>
            )}
          </button>
        </div>

        {/* 导入结果 */}
        {results && (
          <div className="bg-white border border-rule rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle size={22} className="text-accent" />
              <h2 className="font-medium text-ink">导入完成</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-[#f9fafb] rounded-lg">
                <div className="text-2xl font-semibold text-ink">
                  {results.total}
                </div>
                <div className="text-xs text-muted">总文档数</div>
              </div>
              <div className="text-center p-3 bg-accent-soft rounded-lg">
                <div className="text-2xl font-semibold text-accent-deep">
                  {results.successCount}
                </div>
                <div className="text-xs text-accent-deep">成功</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-semibold text-red-500">
                  {results.failCount}
                </div>
                <div className="text-xs text-red-400">失败</div>
              </div>
            </div>

            {results.results && results.results.length > 0 && (
              <div className="max-h-60 overflow-y-auto space-y-1">
                {results.results.map((r: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm py-1"
                  >
                    {r.status === "success" ? (
                      <CheckCircle size={14} className="text-accent" />
                    ) : (
                      <XCircle size={14} className="text-red-500" />
                    )}
                    <span className="flex-1 truncate text-ink">
                      {r.title}
                    </span>
                    <span className="text-xs text-muted">
                      {r.action === "created"
                        ? "新建"
                        : r.action === "updated"
                        ? "更新"
                        : "失败"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 语雀导出教程 */}
        <div className="p-4 bg-white border border-rule rounded-lg">
          <h3 className="font-medium text-sm text-ink mb-3">
            📖 如何从语雀导出？
          </h3>
          <ol className="text-sm text-muted space-y-2 list-decimal list-inside">
            <li>打开语雀，进入你要导出的知识库</li>
            <li>点击知识库右上角的「...」更多按钮</li>
            <li>选择「导出」→ 选择「Markdown」格式</li>
            <li>等待导出完成，下载 zip 压缩包</li>
            <li>回到本页面，上传 zip 文件即可</li>
          </ol>
          <p className="text-xs text-muted mt-3 pt-2 border-t border-rule">
            💡 提示：免费用户也可以导出，不需要会员。每个知识库单独导出。
          </p>
        </div>
      </div>
    </div>
  );
}
