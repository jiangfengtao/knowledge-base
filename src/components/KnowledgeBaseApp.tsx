"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import DocumentList from "@/components/DocumentList";
import NotesView from "@/components/NotesView";
import SearchView from "@/components/SearchView";
import FavoritesView from "@/components/FavoritesView";
import TagsView from "@/components/TagsView";
import { Globe, Film, BarChart3, ExternalLink, FileText, PenLine, Sparkles, ArrowRight, Lightbulb, BookOpen } from "lucide-react";

// 懒加载重型组件（包含 Tiptap 编辑器）
const DocumentView = dynamic(() => import("@/components/DocumentView"), {
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  ssr: false,
});

export default function KnowledgeBaseApp() {
  const [activeNav, setActiveNav] = useState("kb");
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>();
  const [isNewDoc, setIsNewDoc] = useState(false);
  const [currentKbId, setCurrentKbId] = useState<string>("");
  const [currentKbName, setCurrentKbName] = useState("技术");
  const [showDocDetail, setShowDocDetail] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    setIsNewDoc(false);
    setShowDocDetail(true);
    setMobileSidebarOpen(false);
  };

  const handleNewDoc = () => {
    setSelectedDocId(undefined);
    setIsNewDoc(true);
    setShowDocDetail(true);
    setMobileSidebarOpen(false);
  };

  const handleBackToList = () => {
    setSelectedDocId(undefined);
    setIsNewDoc(false);
    setShowDocDetail(false);
  };

  const handleSelectDocFromSearch = (docId: string) => {
    setSelectedDocId(docId);
    setIsNewDoc(false);
    setShowDocDetail(true);
    setActiveNav("kb");
    setMobileSidebarOpen(false);
  };

  const handleKbSelect = (kbId: string, kbName: string) => {
    setCurrentKbId(kbId);
    setCurrentKbName(kbName);
    setMobileSidebarOpen(false);
  };

  const handleNavChange = (nav: string) => {
    setActiveNav(nav);
    setMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* 移动端遮罩 */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 侧边栏 - 桌面端固定，移动端抽屉 */}
      <div
        className={`
          fixed md:relative inset-y-0 left-0 z-40 transition-transform duration-200
          ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <Sidebar
          activeNav={activeNav}
          onNavChange={handleNavChange}
          onKbSelect={handleKbSelect}
        />
      </div>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden" role="main">
        {/* 顶部工具栏 - 粉丝入口 */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-white border-b border-rule">
          <div className="flex items-center gap-2">
            {/* 移动端汉堡菜单 */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden w-8 h-8 flex items-center justify-center hover:bg-[#f2f3f5] rounded transition-colors"
              aria-label="打开菜单"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <span className="text-xs text-muted hidden sm:inline">工作台</span>
          </div>
          {/* 粉丝页面入口 */}
          <div className="flex items-center gap-1.5 text-xs">
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-accent-soft text-accent-deep rounded-md hover:bg-accent hover:text-white transition-colors font-medium"
            >
              <Globe size={13} />
              <span>粉丝页</span>
              <ExternalLink size={9} className="opacity-60" />
            </a>
            <a
              href="/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-500 rounded-md hover:bg-rose-500 hover:text-white transition-colors font-medium"
            >
              <Film size={13} />
              <span className="hidden sm:inline">视频</span>
            </a>
            <a
              href="/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-purple-500 rounded-md hover:bg-purple-500 hover:text-white transition-colors font-medium"
            >
              <BarChart3 size={13} />
              <span className="hidden sm:inline">数据</span>
            </a>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 flex overflow-hidden">

        {activeNav === "kb" && (
          <>
            {/* 文档列表 */}
            <div className={`${showDocDetail ? "hidden md:block" : "block"} w-full md:w-72`}>
              <DocumentList
                kbName={currentKbName}
                kbId={currentKbId}
                onSelectDoc={handleSelectDoc}
                onNewDoc={handleNewDoc}
                selectedDocId={selectedDocId}
              />
            </div>

            {/* 文档详情 / 编辑器 */}
            {(selectedDocId || isNewDoc) ? (
              <div className={`flex-1 ${showDocDetail ? "block" : "hidden md:block"}`}>
                <DocumentView
                  docId={selectedDocId}
                  onBack={handleBackToList}
                  isNew={isNewDoc}
                  kbId={currentKbId}
                  onToggleSidebar={() => setMobileSidebarOpen(true)}
                />
              </div>
            ) : (
              <div className="hidden md:flex flex-1 flex-col overflow-y-auto bg-gradient-to-b from-[#fafbfc] to-white">
                <div className="max-w-2xl w-full mx-auto px-8 py-10">
                  {/* Hero 区 */}
                  <div className="flex flex-col items-center text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-deep flex items-center justify-center text-white text-2xl font-bold shadow-lg mb-4">
                      桃
                    </div>
                    <h2 className="text-xl font-bold text-ink mb-1.5">开始你的创作</h2>
                    <p className="text-sm text-muted">从左侧选择文档，或通过下方快捷入口开始</p>
                  </div>

                  {/* 快捷操作 */}
                  <div className="grid grid-cols-3 gap-3 mb-10">
                    <button
                      onClick={handleNewDoc}
                      className="group bg-white border border-rule rounded-xl p-4 text-center hover:border-accent/30 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                        <PenLine size={18} className="text-accent-deep" />
                      </div>
                      <div className="text-sm font-medium text-ink">新建文档</div>
                      <div className="text-xs text-muted mt-0.5">开始写作</div>
                    </button>

                    <a
                      href="/blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white border border-rule rounded-xl p-4 text-center hover:border-accent/30 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                        <Globe size={18} className="text-accent-deep" />
                      </div>
                      <div className="text-sm font-medium text-ink">粉丝页</div>
                      <div className="text-xs text-muted mt-0.5">预览公开页</div>
                    </a>

                    <a
                      href="/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white border border-rule rounded-xl p-4 text-center hover:border-accent/30 hover:shadow-md transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                        <BarChart3 size={18} className="text-purple-500" />
                      </div>
                      <div className="text-sm font-medium text-ink">数据看板</div>
                      <div className="text-xs text-muted mt-0.5">查看统计</div>
                    </a>
                  </div>

                  {/* 写作小贴士 */}
                  <div className="bg-white border border-rule rounded-xl p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Lightbulb size={14} className="text-amber-500" />
                      </div>
                      <h3 className="text-sm font-semibold text-ink">写作小贴士</h3>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2 text-xs text-muted leading-relaxed">
                        <span className="text-accent mt-0.5">·</span>
                        <span>输入 <code className="px-1.5 py-0.5 bg-[#f2f3f5] rounded text-[10px] text-ink">/</code> 快速插入标题、列表、引用等</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted leading-relaxed">
                        <span className="text-accent mt-0.5">·</span>
                        <span>在左侧知识库树中拖拽文档可以调整分类和排序</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted leading-relaxed">
                        <span className="text-accent mt-0.5">·</span>
                        <span>右键文档可以快速切换公开/私密、收藏、重命名</span>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-muted leading-relaxed">
                        <span className="text-accent mt-0.5">·</span>
                        <span>写完后点击「公开」按钮，文章会自动同步到粉丝页</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeNav === "notes" && <NotesView />}

        {activeNav === "tags" && <TagsView />}

        {activeNav === "search" && (
          <SearchView onSelectDoc={handleSelectDocFromSearch} />
        )}

        {activeNav === "favorites" && (
          <FavoritesView onSelectDoc={handleSelectDocFromSearch} />
        )}
        </div>
      </main>
    </div>
  );
}
