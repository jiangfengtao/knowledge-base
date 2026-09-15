"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import DocumentList from "@/components/DocumentList";
import NotesView from "@/components/NotesView";
import SearchView from "@/components/SearchView";
import FavoritesView from "@/components/FavoritesView";
import TagsView from "@/components/TagsView";
import { Globe, Film, BarChart3, ExternalLink, FileText, PenLine, Sparkles, ArrowRight, Lightbulb, BookOpen, Settings, Video, Mic, TrendingUp, Clock, Plus } from "lucide-react";

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
  const [newDocType, setNewDocType] = useState<"article" | "video" | "audio">("article");
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

  const handleNewDoc = (type: "article" | "video" | "audio" = "article") => {
    setSelectedDocId(undefined);
    setIsNewDoc(true);
    setNewDocType(type);
    setShowDocDetail(true);
    setMobileSidebarOpen(false);
    // 切换到对应的导航视图
    if (type === "article") setActiveNav("articles");
    else if (type === "video") setActiveNav("videos");
    else if (type === "audio") setActiveNav("audios");
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
    <div className="flex h-screen overflow-hidden bg-bg" style={{ height: "100vh" }}>
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
      <main className="flex-1 flex flex-col overflow-hidden min-h-0" role="main">
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
            <a
              href="/settings"
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-600 hover:text-white transition-colors font-medium"
            >
              <Settings size={13} />
              <span className="hidden sm:inline">设置</span>
            </a>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 flex overflow-hidden min-h-0">

        {activeNav === "kb" && (
          <div className="flex-1 overflow-hidden bg-[#fafafa]">
            <div className="h-full overflow-y-auto">
              <div className="max-w-4xl w-full mx-auto px-8 py-10">
                {/* 顶部：欢迎 + 快捷入口 */}
                <div className="flex items-start justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-bold text-ink mb-1">你好，开始创作吧 👋</h2>
                    <p className="text-sm text-muted">管理你的内容，随时记录灵感</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href="/blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-ink hover:bg-white rounded-lg transition-colors border border-transparent hover:border-rule"
                    >
                      <Globe size={15} />
                      <span>粉丝页</span>
                    </a>
                    <button
                      onClick={() => handleNewDoc("article")}
                      className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-2 transition-colors shadow-sm"
                    >
                      <PenLine size={15} />
                      写文章
                    </button>
                  </div>
                </div>

                {/* 数据统计卡片 */}
                <div className="grid grid-cols-4 gap-3 mb-10">
                  <div className="bg-white rounded-xl p-4 border border-rule/60 hover:border-rule transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-md bg-accent-soft flex items-center justify-center">
                        <FileText size={14} className="text-accent-deep" />
                      </div>
                      <span className="text-sm text-muted">文章</span>
                    </div>
                    <div className="text-2xl font-bold text-ink">12</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-rule/60 hover:border-rule transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-md bg-rose-50 flex items-center justify-center">
                        <Video size={14} className="text-rose-500" />
                      </div>
                      <span className="text-sm text-muted">视频</span>
                    </div>
                    <div className="text-2xl font-bold text-ink">8</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-rule/60 hover:border-rule transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-md bg-purple-50 flex items-center justify-center">
                        <Mic size={14} className="text-purple-500" />
                      </div>
                      <span className="text-sm text-muted">音频</span>
                    </div>
                    <div className="text-2xl font-bold text-ink">5</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-rule/60 hover:border-rule transition-colors">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-md bg-green-50 flex items-center justify-center">
                        <TrendingUp size={14} className="text-green-500" />
                      </div>
                      <span className="text-sm text-muted">粉丝</span>
                    </div>
                    <div className="text-2xl font-bold text-ink">567</div>
                  </div>
                </div>

                {/* 最近内容 - 卡片式展示 */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-ink">最近更新</h3>
                    <button
                      onClick={() => setActiveNav("articles")}
                      className="text-sm text-accent hover:text-accent-deep flex items-center gap-1"
                    >
                      查看全部
                      <ArrowRight size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-xl p-5 border border-rule/60 hover:border-accent/40 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-accent-soft text-accent-deep rounded-md font-medium">
                          <FileText size={10} />
                          文章
                        </span>
                        <span className="text-xs text-muted">2 小时前</span>
                      </div>
                      <h4 className="text-base font-medium text-ink mb-2 group-hover:text-accent-deep transition-colors line-clamp-1">
                        如何高效管理你的知识库
                      </h4>
                      <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                        一个好的知识库体系可以让你的学习效率翻倍，分享我的三层分类法和标签管理技巧...
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-rule/60 hover:border-rose-200 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-rose-50 text-rose-500 rounded-md font-medium">
                          <Video size={10} />
                          视频
                        </span>
                        <span className="text-xs text-muted">昨天</span>
                      </div>
                      <h4 className="text-base font-medium text-ink mb-2 group-hover:text-rose-500 transition-colors line-clamp-1">
                        知识库使用教程完整版
                      </h4>
                      <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                        从零开始搭建你的个人知识库，包含文档管理、标签体系、公开分享等完整功能演示...
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-rule/60 hover:border-accent/40 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-50 text-green-600 rounded-md font-medium">
                          <Globe size={10} />
                          已公开
                        </span>
                        <span className="text-xs text-muted">3 天前</span>
                      </div>
                      <h4 className="text-base font-medium text-ink mb-2 group-hover:text-accent-deep transition-colors line-clamp-1">
                        2026 年个人成长方法论
                      </h4>
                      <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                        经过三年的实践和迭代，我总结出了适合普通人的成长方法论，包含学习、工作、生活三个维度...
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-rule/60 hover:border-purple-200 hover:shadow-sm transition-all cursor-pointer group">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-purple-50 text-purple-500 rounded-md font-medium">
                          <Mic size={10} />
                          音频
                        </span>
                        <span className="text-xs text-muted">5 天前</span>
                      </div>
                      <h4 className="text-base font-medium text-ink mb-2 group-hover:text-purple-500 transition-colors line-clamp-1">
                        晨间冥想引导 · 第 5 期
                      </h4>
                      <p className="text-sm text-muted line-clamp-2 leading-relaxed">
                        10 分钟晨间冥想，帮助你开启充满能量的一天，找回内心的平静与专注...
                      </p>
                    </div>
                  </div>
                </div>

                {/* 快捷操作入口 */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleNewDoc("article")}
                    className="bg-white rounded-xl p-5 border border-rule/60 hover:border-accent/40 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-accent-soft flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <PenLine size={16} className="text-accent-deep" />
                    </div>
                    <h4 className="text-sm font-semibold text-ink mb-1">写新文章</h4>
                    <p className="text-xs text-muted">记录你的想法和思考</p>
                  </button>
                  <button
                    onClick={() => handleNewDoc("video")}
                    className="bg-white rounded-xl p-5 border border-rule/60 hover:border-rose-200 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-rose-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Video size={16} className="text-rose-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-ink mb-1">创建视频脚本</h4>
                    <p className="text-xs text-muted">写视频文案和脚本</p>
                  </button>
                  <button
                    onClick={() => handleNewDoc("audio")}
                    className="bg-white rounded-xl p-5 border border-rule/60 hover:border-purple-200 hover:shadow-sm transition-all text-left group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Mic size={16} className="text-purple-500" />
                    </div>
                    <h4 className="text-sm font-semibold text-ink mb-1">录制播客</h4>
                    <p className="text-xs text-muted">录音或上传音频内容</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}


        {activeNav === "notes" && <NotesView />}

        {activeNav === "tags" && <TagsView />}

        {/* 文章列表 */}
        {activeNav === "articles" && (
          <>
            <div className={`${showDocDetail ? "hidden md:block" : "block"} w-full md:w-72`}>
              <DocumentList
                kbName={currentKbName}
                kbId={currentKbId}
                onSelectDoc={handleSelectDoc}
                onNewDoc={handleNewDoc}
                selectedDocId={selectedDocId}
                initialFilterType="article"
              />
            </div>
            {(selectedDocId || isNewDoc) ? (
              <div className={`flex-1 flex flex-col min-h-0 ${showDocDetail ? "flex" : "hidden md:flex"}`}>
                <DocumentView
                  docId={selectedDocId}
                  onBack={handleBackToList}
                  isNew={isNewDoc}
                  kbId={currentKbId}
                  initialType={newDocType}
                  onToggleSidebar={() => setMobileSidebarOpen(true)}
                  onSaved={(newDocId) => {
                    setIsNewDoc(false);
                    setSelectedDocId(newDocId);
                  }}
                />
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center bg-[#f7f8fa]">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-accent-soft flex items-center justify-center mx-auto mb-3">
                    <FileText size={24} className="text-accent-deep" />
                  </div>
                  <h3 className="text-base font-medium text-ink mb-1">文章</h3>
                  <p className="text-sm text-muted mb-4">从左侧选择一篇文章开始编辑</p>
                  <button
                    onClick={() => handleNewDoc("article")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-2 transition-colors"
                  >
                    <Plus size={14} />
                    新建文章
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 视频列表 */}
        {activeNav === "videos" && (
          <>
            <div className={`${showDocDetail ? "hidden md:block" : "block"} w-full md:w-72`}>
              <DocumentList
                kbName={currentKbName}
                kbId={currentKbId}
                onSelectDoc={handleSelectDoc}
                onNewDoc={handleNewDoc}
                selectedDocId={selectedDocId}
                initialFilterType="video"
              />
            </div>
            {(selectedDocId || isNewDoc) ? (
              <div className={`flex-1 flex flex-col min-h-0 ${showDocDetail ? "flex" : "hidden md:flex"}`}>
                <DocumentView
                  docId={selectedDocId}
                  onBack={handleBackToList}
                  isNew={isNewDoc}
                  kbId={currentKbId}
                  initialType={newDocType}
                  onToggleSidebar={() => setMobileSidebarOpen(true)}
                  onSaved={(newDocId) => {
                    setIsNewDoc(false);
                    setSelectedDocId(newDocId);
                  }}
                />
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center bg-[#f7f8fa]">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-3">
                    <Video size={24} className="text-rose-500" />
                  </div>
                  <h3 className="text-base font-medium text-ink mb-1">视频</h3>
                  <p className="text-sm text-muted mb-4">从左侧选择一个视频脚本开始编辑</p>
                  <button
                    onClick={() => handleNewDoc("video")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
                  >
                    <Plus size={14} />
                    新建视频
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* 音频列表 */}
        {activeNav === "audios" && (
          <>
            <div className={`${showDocDetail ? "hidden md:block" : "block"} w-full md:w-72`}>
              <DocumentList
                kbName={currentKbName}
                kbId={currentKbId}
                onSelectDoc={handleSelectDoc}
                onNewDoc={handleNewDoc}
                selectedDocId={selectedDocId}
                initialFilterType="audio"
              />
            </div>
            {(selectedDocId || isNewDoc) ? (
              <div className={`flex-1 flex flex-col min-h-0 ${showDocDetail ? "flex" : "hidden md:flex"}`}>
                <DocumentView
                  docId={selectedDocId}
                  onBack={handleBackToList}
                  isNew={isNewDoc}
                  kbId={currentKbId}
                  initialType={newDocType}
                  onToggleSidebar={() => setMobileSidebarOpen(true)}
                  onSaved={(newDocId) => {
                    setIsNewDoc(false);
                    setSelectedDocId(newDocId);
                  }}
                />
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center bg-[#f7f8fa]">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-3">
                    <Mic size={24} className="text-purple-500" />
                  </div>
                  <h3 className="text-base font-medium text-ink mb-1">音频</h3>
                  <p className="text-sm text-muted mb-4">从左侧选择一个音频脚本开始编辑</p>
                  <button
                    onClick={() => handleNewDoc("audio")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors"
                  >
                    <Plus size={14} />
                    新建音频
                  </button>
                </div>
              </div>
            )}
          </>
        )}

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
