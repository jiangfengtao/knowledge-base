"use client";

import { useState, useEffect, useRef } from "react";
import {
  Star,
  Share2,
  MoreHorizontal,
  Clock,
  User,
  Edit3,
  Eye,
  ArrowLeft,
  Save,
  Globe,
  Lock,
  Trash2,
  PanelLeft,
  Video,
  Mic,
  X,
  Clock3,
  Play,
  Pause,
  Square,
  Upload,
} from "lucide-react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { sanitizeHtml } from "@/lib/sanitize";
import DocOutline from "./DocOutline";

const TiptapEditor = dynamic(() => import("./TiptapEditor"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-[#f2f3f5] rounded w-1/3 mb-4" />
      <div className="h-4 bg-[#f2f3f5] rounded w-full mb-2" />
      <div className="h-4 bg-[#f2f3f5] rounded w-5/6 mb-2" />
      <div className="h-4 bg-[#f2f3f5] rounded w-4/6 mb-2" />
    </div>
  ),
});

type DocViewProps = {
  docId?: string;
  onBack?: () => void;
  isNew?: boolean;
  kbId?: string;
  onToggleSidebar?: () => void;
  onSaved?: (newDocId: string) => void;
};

export default function DocumentView({ docId, onBack, isNew, kbId, onToggleSidebar, onSaved }: DocViewProps) {
  const [mode, setMode] = useState<"view" | "edit">(isNew ? "edit" : "view");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [visibility, setVisibility] = useState("private");
  const [wordCount, setWordCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // 移动端编辑模式下的预览切换
  const [mobilePreview, setMobilePreview] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  // 视频相关
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState("");
  const [videoDuration, setVideoDuration] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [showVideoPanel, setShowVideoPanel] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  // 音频相关
  const [audioUrl, setAudioUrl] = useState("");
  const [audioTitle, setAudioTitle] = useState("");
  const [audioDuration, setAudioDuration] = useState("");
  const [isAudio, setIsAudio] = useState(false);
  const [showAudioPanel, setShowAudioPanel] = useState(false);
  const [savingAudio, setSavingAudio] = useState(false);
  // 录音相关
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载文档内容
  useEffect(() => {
    if (isNew) {
      setTitle("无标题文档");
      setContent("");
      setLoading(false);
      return;
    }

    if (!docId) return;

    const loadDoc = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/documents/${docId}`);
        const data = await res.json();
        if (data.data) {
          setTitle(data.data.title);
          setContent(data.data.content);
          setIsFavorite(data.data.isFavorite);
          setVisibility(data.data.visibility || "private");
          setWordCount(data.data.wordCount);
          setUpdatedAt(new Date(data.data.lastModifiedAt));
          setVideoUrl(data.data.videoUrl || "");
          setVideoThumbnail(data.data.videoThumbnail || "");
          setVideoDuration(data.data.videoDuration || "");
          setIsVideo(data.data.isVideo || false);
          setAudioUrl(data.data.audioUrl || "");
          setAudioTitle(data.data.audioTitle || "");
          setAudioDuration(data.data.audioDuration || "");
          setIsAudio(data.data.isAudio || false);
        }
      } catch (e) {
        console.error("Load doc error:", e);
      } finally {
        setLoading(false);
      }
    };

    loadDoc();
  }, [docId, isNew]);

  const handleContentChange = (html: string, text: string) => {
    setContent(html);
    setWordCount(text.length);
  };

  // 保存文档
  const handleSave = async () => {
    if (saving) return;
    setSaving(true);

    try {
      // 提取纯文本
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || "";

      if (isNew && kbId) {
        // 新建文档
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title || "无标题文档",
            content,
            plainText,
            knowledgeBaseId: kbId,
          }),
        });
        const data = await res.json();
        if (data.data) {
          // 切换到查看模式
          setMode("view");
          setMobilePreview(false);
          setUpdatedAt(new Date(data.data.lastModifiedAt));
          // 通知父组件文档已保存，更新 isNew 状态
          if (onSaved && data.data.id) {
            onSaved(data.data.id);
          }
        }
      } else if (docId) {
        // 更新文档
        const res = await fetch(`/api/documents/${docId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            plainText,
          }),
        });
        const data = await res.json();
        if (data.data) {
          setMode("view");
          setMobilePreview(false);
          setUpdatedAt(new Date(data.data.lastModifiedAt));
        }
      }
    } catch (e) {
      console.error("Save doc error:", e);
    } finally {
      setSaving(false);
    }
  };

  // 保存视频设置
  const handleSaveVideo = async () => {
    if (!docId || savingVideo) return;
    setSavingVideo(true);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: videoUrl || null,
          videoThumbnail: videoThumbnail || null,
          videoDuration: videoDuration || null,
          isVideo,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setShowVideoPanel(false);
      }
    } catch (e) {
      console.error("Save video error:", e);
    } finally {
      setSavingVideo(false);
    }
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioUrl(base64data);
          // 计算时长
          const audio = new Audio(base64data);
          audio.onloadedmetadata = () => {
            const dur = Math.floor(audio.duration);
            const mins = Math.floor(dur / 60);
            const secs = dur % 60;
            setAudioDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
          };
        };
        reader.readAsDataURL(audioBlob);
        // 停止所有轨道
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 计时器
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (e) {
      console.error("录音失败:", e);
      alert("无法访问麦克风，请检查浏览器权限设置");
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // 格式化录音时间
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // 处理文件上传
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（20MB以内建议用base64，更大的建议用URL方式）
    if (file.size > 20 * 1024 * 1024) {
      alert("音频文件过大（超过20MB），建议先上传到云存储后使用链接方式");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64data = reader.result as string;
      setAudioUrl(base64data);
      // 计算时长
      const audio = new Audio(base64data);
      audio.onloadedmetadata = () => {
        const dur = Math.floor(audio.duration);
        const mins = Math.floor(dur / 60);
        const secs = dur % 60;
        setAudioDuration(`${mins}:${secs.toString().padStart(2, "0")}`);
      };
    };
    reader.readAsDataURL(file);
  };

  // 保存音频设置
  const handleSaveAudio = async () => {
    if (!docId || savingAudio) return;
    setSavingAudio(true);
    try {
      const res = await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl: audioUrl || null,
          audioTitle: audioTitle || null,
          audioDuration: audioDuration || null,
          isAudio,
        }),
      });
      const data = await res.json();
      if (data.data) {
        setShowAudioPanel(false);
      }
    } catch (e) {
      console.error("Save audio error:", e);
    } finally {
      setSavingAudio(false);
    }
  };

  // 切换收藏
  const toggleFavorite = async () => {
    if (!docId) return;

    try {
      await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
      setIsFavorite(!isFavorite);
    } catch (e) {
      console.error("Toggle favorite error:", e);
    }
  };

  // 切换公开/私密
  const togglePublic = async () => {
    if (!docId) return;

    const newVis = visibility === "private" ? "public" : "private";
    try {
      await fetch(`/api/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visibility: newVis }),
      });
      setVisibility(newVis);
    } catch (e) {
      console.error("Toggle visibility error:", e);
    }
  };

  // 删除文档
  const handleDelete = async () => {
    if (!docId) return;

    if (!confirm("确定要删除这篇文档吗？删除后可在回收站找到。")) return;

    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      onBack?.();
    } catch (e) {
      console.error("Delete doc error:", e);
      alert("删除失败");
    }
  };

  // 标题聚焦时滚动到可视区域
  const handleTitleFocus = () => {
    // 延迟一下，确保键盘弹出后再滚动
    setTimeout(() => {
      titleInputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-muted text-sm">加载中...</div>
      </div>
    );
  }

  const isEditing = mode === "edit" && !mobilePreview;

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 sm:py-3 border-b border-rule gap-2">
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* 移动端侧边栏切换按钮 */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="sm:hidden p-2.5 hover:bg-[#f2f3f5] rounded transition-colors"
              aria-label="切换侧边栏"
            >
              <PanelLeft size={18} className="text-muted" />
            </button>
          )}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 sm:p-1.5 hover:bg-[#f2f3f5] rounded transition-colors min-w-11 min-h-11 sm:min-w-0 sm:min-h-0 flex items-center justify-center"
              aria-label="返回"
            >
              <ArrowLeft size={18} className="text-muted" />
            </button>
          )}
          <div className="text-sm text-muted ml-1">
            {mode === "view" ? "阅读模式" : mobilePreview ? "预览模式" : "编辑模式"}
          </div>
        </div>

        {/* 工具栏 - 桌面端 */}
        <div className="hidden sm:flex items-center gap-1">
          {mode === "edit" ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-base bg-accent text-white hover:bg-accent-2 rounded-lg transition-colors disabled:opacity-50 font-medium"
            >
              <Save size={17} />
              <span>{saving ? "保存中..." : "保存"}</span>
            </button>
          ) : (
            <button
              onClick={() => setMode("edit")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-ink hover:bg-[#f2f3f5] rounded transition-colors"
            >
              <Edit3 size={15} />
              <span>编辑</span>
            </button>
          )}

          {!isNew && (
            <>
              <button
                onClick={togglePublic}
                className={`flex items-center gap-2 px-4 py-2 text-base font-medium rounded-lg transition-all border-2 ${
                  visibility === "public"
                    ? "bg-green-50 text-green-600 border-green-400 hover:bg-green-100"
                    : visibility === "members"
                    ? "bg-amber-50 text-amber-600 border-amber-400 hover:bg-amber-100"
                    : "bg-red-50 text-red-600 border-red-400 hover:bg-red-100"
                }`}
                title={visibility !== "private" ? "已公开，点击设为私密" : "点击公开文章"}
              >
                {visibility !== "private" ? <Globe size={18} /> : <Lock size={18} />}
                <span>
                  {visibility === "public" ? "公开" : visibility === "members" ? "会员" : "私密"}
                </span>
              </button>

              <button
                onClick={toggleFavorite}
                className={`p-2 rounded transition-colors ${
                  isFavorite ? "text-yellow-500" : "text-muted hover:bg-[#f2f3f5]"
                }`}
                aria-label={isFavorite ? "取消收藏" : "收藏"}
              >
                <Star size={20} className={isFavorite ? "fill-current" : ""} />
              </button>
            </>
          )}

          {!isNew && (
            <button
              onClick={() => setShowVideoPanel(true)}
              className={`flex items-center gap-2 px-3 py-2 text-base rounded-lg transition-colors ${
                isVideo
                  ? "bg-accent-soft text-accent-deep font-medium"
                  : "text-muted hover:bg-[#f2f3f5]"
              }`}
              title="视频设置"
              aria-label="视频设置"
            >
              <Video size={18} />
              <span>视频</span>
            </button>
          )}

          {!isNew && (
            <button
              onClick={() => setShowAudioPanel(true)}
              className={`flex items-center gap-2 px-3 py-2 text-base rounded-lg transition-colors ${
                isAudio
                  ? "bg-purple-100 text-purple-600 font-medium"
                  : "text-muted hover:bg-[#f2f3f5]"
              }`}
              title="音频设置"
              aria-label="音频设置"
            >
              <Mic size={18} />
              <span>音频</span>
            </button>
          )}

          <button
            className="p-2 text-muted hover:bg-[#f2f3f5] rounded transition-colors"
            aria-label="分享"
          >
            <Share2 size={20} />
          </button>

          {!isNew && (
            <button
              onClick={handleDelete}
              className="p-2 text-muted hover:bg-red-50 hover:text-red-500 rounded transition-colors"
              title="删除文档"
              aria-label="删除文档"
            >
              <Trash2 size={20} />
            </button>
          )}

          <button
            className="p-2 text-muted hover:bg-[#f2f3f5] rounded transition-colors"
            aria-label="更多"
          >
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* 移动端右侧操作按钮 */}
        <div className="flex sm:hidden items-center gap-1">
          {mode === "edit" && (
            <button
              onClick={() => setMobilePreview(!mobilePreview)}
              className={`p-2.5 rounded transition-colors min-w-11 min-h-11 flex items-center justify-center ${
                mobilePreview
                  ? "bg-accent-soft text-accent-deep"
                  : "text-muted hover:bg-[#f2f3f5]"
              }`}
              aria-label={mobilePreview ? "返回编辑" : "预览"}
              title={mobilePreview ? "返回编辑" : "预览"}
            >
              <Eye size={18} />
            </button>
          )}
          {mode === "view" && (
            <button
              onClick={() => setMode("edit")}
              className="p-2.5 text-ink hover:bg-[#f2f3f5] rounded transition-colors min-w-11 min-h-11 flex items-center justify-center"
              aria-label="编辑"
            >
              <Edit3 size={18} />
            </button>
          )}
          {!isNew && (
            <button
              onClick={togglePublic}
              className={`p-2.5 rounded transition-colors min-w-11 min-h-11 flex items-center justify-center ${
                visibility === "public"
                  ? "bg-green-50 text-green-600"
                  : visibility === "members"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-red-50 text-red-600"
              }`}
              title={visibility !== "private" ? "已公开，点击设为私密" : "点击公开文章"}
              aria-label={visibility !== "private" ? "已公开" : "私密"}
            >
              {visibility !== "private" ? <Globe size={18} /> : <Lock size={18} />}
            </button>
          )}
          {!isNew && (
            <button
              onClick={() => setShowVideoPanel(true)}
              className={`p-2.5 rounded transition-colors min-w-11 min-h-11 flex items-center justify-center ${
                isVideo ? "bg-accent-soft text-accent-deep" : "text-muted hover:bg-[#f2f3f5]"
              }`}
              aria-label="视频设置"
            >
              <Video size={18} />
            </button>
          )}
          {!isNew && (
            <button
              onClick={() => setShowAudioPanel(true)}
              className={`p-2.5 rounded transition-colors min-w-11 min-h-11 flex items-center justify-center ${
                isAudio ? "bg-purple-100 text-purple-600" : "text-muted hover:bg-[#f2f3f5]"
              }`}
              aria-label="音频设置"
            >
              <Mic size={18} />
            </button>
          )}
          <button
            className="p-2.5 text-muted hover:bg-[#f2f3f5] rounded transition-colors min-w-11 min-h-11 flex items-center justify-center"
            aria-label="更多"
          >
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* 移动端编辑模式下底部工具栏要留出空间 */}
        <div className={`max-w-3xl mx-auto px-4 sm:px-8 py-4 sm:py-8 ${isEditing ? "pb-24 md:pb-8" : ""}`}>
          {/* 标题 */}
          {mode === "edit" && !mobilePreview ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={handleTitleFocus}
              placeholder="输入文档标题..."
              className="w-full text-3xl sm:text-3xl font-semibold text-ink outline-none border-none bg-transparent mb-4 placeholder:text-muted/50"
            />
          ) : (
            <h1 className="text-3xl sm:text-4xl font-semibold text-ink mb-3">{title}</h1>
          )}

          {/* 元信息 - 移动端简化显示 */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted mb-6 sm:mb-8 pb-3 sm:pb-4 border-b border-rule">
            <span className="flex items-center gap-1">
              <User size={14} />
              <span className="hidden sm:inline">我</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              <span className="sm:hidden">{dayjs(updatedAt).format("MM-DD")}</span>
              <span className="hidden sm:inline">最后更新于 {dayjs(updatedAt).format("YYYY-MM-DD HH:mm")}</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {wordCount} 字
            </span>
            {/* 阅读时间 */}
            {wordCount > 0 && (
              <span className="flex items-center gap-1 text-muted/70">
                <Clock3 size={12} />
                约 {Math.max(1, Math.ceil(wordCount / 300))} 分钟阅读
              </span>
            )}
            {isVideo && (
              <span className="flex items-center gap-1 text-accent-deep bg-accent-soft px-2 py-0.5 rounded-full">
                <Video size={12} />
                <span>视频文章</span>
                {videoDuration && (
                  <span className="text-accent-deep/70">· {videoDuration}</span>
                )}
              </span>
            )}
            {isAudio && (
              <span className="flex items-center gap-1 text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                <Mic size={12} />
                <span>音频文章</span>
                {audioDuration && (
                  <span className="text-purple-600/70">· {audioDuration}</span>
                )}
              </span>
            )}
          </div>

          {/* 视频播放器 */}
          {isVideo && videoUrl && !isEditing && (
            <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden bg-black aspect-video">
              <video
                src={videoUrl}
                poster={videoThumbnail || undefined}
                controls
                className="w-full h-full object-contain"
              >
                您的浏览器不支持视频播放。
              </video>
            </div>
          )}

          {/* 音频播放器 */}
          {isAudio && audioUrl && !isEditing && (
            <div className="mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mic size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink truncate">
                      {audioTitle || title}
                    </h3>
                    <p className="text-sm text-purple-600">
                      {audioDuration ? `时长 ${audioDuration}` : "音频内容"}
                    </p>
                  </div>
                </div>
                <audio
                  src={audioUrl}
                  controls
                  className="w-full"
                  preload="metadata"
                >
                  您的浏览器不支持音频播放。
                </audio>
              </div>
            </div>
          )}

          {/* 正文内容 */}
          {isEditing ? (
            <TiptapEditor
              content={content}
              placeholder="开始写作，按 / 唤起更多功能..."
              onChange={handleContentChange}
              editable
              docTitle={title}
            />
          ) : (
            <div
              className="doc-content text-ink"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }}
            />
          )}
        </div>
      </div>
      </div>

      {/* 右侧大纲面板 - 仅大屏幕显示 */}
      <aside className="hidden xl:flex w-56 border-l border-rule flex-shrink-0 overflow-hidden bg-[#fafbfc]">
        <DocOutline content={content} editable={isEditing} />
      </aside>

      {/* 移动端保存按钮 - 固定在底部工具栏右侧（与编辑器工具栏整合，编辑器已自带底部工具栏） */}
      {/* 这里额外加一个保存悬浮按钮，在编辑模式的移动端显示 */}
      {mode === "edit" && !mobilePreview && (
        <button
          onClick={handleSave}
          disabled={saving}
          className="md:hidden fixed bottom-20 right-4 z-40 w-12 h-12 bg-accent text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform disabled:opacity-50"
          aria-label="保存"
        >
          <Save size={20} />
        </button>
      )}

      {/* 视频设置面板 */}
      {showVideoPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
              <h3 className="text-base font-semibold text-ink">视频设置</h3>
              <button
                onClick={() => setShowVideoPanel(false)}
                className="p-1.5 text-muted hover:bg-[#f2f3f5] rounded transition-colors"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  视频地址
                </label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-3 py-2 text-sm border border-rule rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
                <p className="text-xs text-muted mt-1">支持 mp4 等视频链接</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  视频封面图（可选）
                </label>
                <input
                  type="text"
                  value={videoThumbnail}
                  onChange={(e) => setVideoThumbnail(e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                  className="w-full px-3 py-2 text-sm border border-rule rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  视频时长（可选）
                </label>
                <input
                  type="text"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  placeholder="如 12:30"
                  className="w-full px-3 py-2 text-sm border border-rule rounded-lg focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-ink">设为视频内容</span>
                <button
                  onClick={() => setIsVideo(!isVideo)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isVideo ? "bg-accent" : "bg-[#e5e7eb]"
                  }`}
                  role="switch"
                  aria-checked={isVideo}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      isVideo ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-rule bg-[#fafbfc]">
              <button
                onClick={() => setShowVideoPanel(false)}
                className="px-4 py-2 text-sm text-muted hover:bg-[#f2f3f5] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveVideo}
                disabled={savingVideo}
                className="px-4 py-2 text-sm bg-accent text-white hover:bg-accent-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {savingVideo ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 音频设置面板 */}
      {showAudioPanel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-rule">
              <h3 className="text-base font-semibold text-ink">音频设置</h3>
              <button
                onClick={() => setShowAudioPanel(false)}
                className="p-1.5 text-muted hover:bg-[#f2f3f5] rounded transition-colors"
                aria-label="关闭"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* 录音区域 */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <p className="text-sm font-medium text-ink mb-3">🎙️ 直接录音</p>
                {isRecording ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-red-500">
                      <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="font-mono text-lg font-semibold">
                        {formatRecordingTime(recordingTime)}
                      </span>
                    </div>
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <Square size={16} />
                      <span>结束录音</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                    >
                      <Mic size={18} />
                      <span>开始录音</span>
                    </button>
                    <span className="text-xs text-muted">支持浏览器直接录音</span>
                  </div>
                )}
                {audioUrl && !isRecording && (
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <p className="text-xs text-muted mb-2">录音预览：</p>
                    <audio src={audioUrl} controls className="w-full h-8" />
                  </div>
                )}
              </div>

              {/* 上传文件 */}
              <div>
                <label className="block text-sm font-medium text-ink mb-2">
                  上传音频文件
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-rule rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-muted hover:text-purple-600"
                >
                  <Upload size={18} />
                  <span>选择音频文件（mp3/wav/m4a 等，20MB以内）</span>
                </button>
              </div>

              {/* 分隔线 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-rule" />
                <span className="text-xs text-muted">或使用音频链接</span>
                <div className="flex-1 h-px bg-rule" />
              </div>

              {/* 音频地址 */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  音频地址
                </label>
                <input
                  type="text"
                  value={audioUrl.startsWith("data:") ? "" : audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full px-3 py-2 text-sm border border-rule rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                />
                <p className="text-xs text-muted mt-1">支持 mp3、m4a、wav 等音频链接</p>
              </div>

              {/* 音频标题 */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  音频标题（可选）
                </label>
                <input
                  type="text"
                  value={audioTitle}
                  onChange={(e) => setAudioTitle(e.target.value)}
                  placeholder="如：第1期 · 聊聊我的成长经历"
                  className="w-full px-3 py-2 text-sm border border-rule rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                />
              </div>

              {/* 音频时长 */}
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">
                  音频时长（可选）
                </label>
                <input
                  type="text"
                  value={audioDuration}
                  onChange={(e) => setAudioDuration(e.target.value)}
                  placeholder="如 05:30"
                  className="w-full px-3 py-2 text-sm border border-rule rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                />
                <p className="text-xs text-muted mt-1">录音或上传后会自动识别时长</p>
              </div>

              {/* 设为音频内容开关 */}
              <div className="flex items-center justify-between py-1">
                <span className="text-sm font-medium text-ink">设为音频文章</span>
                <button
                  onClick={() => setIsAudio(!isAudio)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    isAudio ? "bg-purple-500" : "bg-[#e5e7eb]"
                  }`}
                  role="switch"
                  aria-checked={isAudio}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform"
                    style={{
                      transform: isAudio
                        ? "translateX(22px)"
                        : "translateX(2px)",
                    }}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-rule bg-[#fafbfc]">
              <button
                onClick={() => setShowAudioPanel(false)}
                className="px-4 py-2 text-sm text-muted hover:bg-[#f2f3f5] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleSaveAudio}
                disabled={savingAudio}
                className="px-4 py-2 text-sm bg-purple-500 text-white hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50"
              >
                {savingAudio ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
