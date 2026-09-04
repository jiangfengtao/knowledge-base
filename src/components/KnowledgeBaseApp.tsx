"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import DocumentList from "@/components/DocumentList";
import DocumentView from "@/components/DocumentView";
import NotesView from "@/components/NotesView";
import SearchView from "@/components/SearchView";
import FavoritesView from "@/components/FavoritesView";
import TagsView from "@/components/TagsView";

export default function KnowledgeBaseApp() {
  const [activeNav, setActiveNav] = useState("kb");
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>();
  const [isNewDoc, setIsNewDoc] = useState(false);
  const [currentKbId, setCurrentKbId] = useState<string>("");
  const [currentKbName, setCurrentKbName] = useState("技术");
  const [showDocDetail, setShowDocDetail] = useState(false); // 移动端控制显示列表还是详情

  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    setIsNewDoc(false);
    setShowDocDetail(true);
  };

  const handleNewDoc = () => {
    setSelectedDocId(undefined);
    setIsNewDoc(true);
    setShowDocDetail(true);
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
  };

  const handleKbSelect = (kbId: string, kbName: string) => {
    setCurrentKbId(kbId);
    setCurrentKbName(kbName);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      {/* 侧边栏 */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        onKbSelect={handleKbSelect}
      />

      {/* 主内容区 */}
      <main className="flex-1 flex overflow-hidden">
        {activeNav === "kb" && (
          <>
            {/* 文档列表 - 移动端只在没选文档时显示 */}
            <div className={`${showDocDetail ? "hidden md:block" : "block"} w-72 md:w-72`}>
              <DocumentList
                kbName={currentKbName}
                kbId={currentKbId}
                onSelectDoc={handleSelectDoc}
                onNewDoc={handleNewDoc}
                selectedDocId={selectedDocId}
              />
            </div>

            {/* 文档详情 / 编辑器 - 移动端选中后全屏显示 */}
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
              // 空状态 - 桌面端显示
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
