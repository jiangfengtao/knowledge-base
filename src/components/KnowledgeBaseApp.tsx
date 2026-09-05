"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import DocumentList from "@/components/DocumentList";
import NotesView from "@/components/NotesView";
import SearchView from "@/components/SearchView";
import FavoritesView from "@/components/FavoritesView";
import TagsView from "@/components/TagsView";

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
      <main className="flex-1 flex overflow-hidden" role="main">
        {/* 移动端汉堡菜单 */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="fixed top-3 left-3 z-20 md:hidden w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-md border border-rule"
          aria-label="打开菜单"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

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
                />
              </div>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center bg-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-ink mb-2">
                    选择一篇文档开始阅读
                  </h3>
                  <p className="text-sm text-muted">
                    或者点击「新建」创建一篇新文档
                  </p>
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
      </main>
    </div>
  );
}
