"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Sparkles,
  PenLine,
  Wand2,
  Maximize2,
  Minimize2,
  Languages,
  List,
  Lightbulb,
  ChevronDown,
  Loader2,
  Check,
  X,
  RefreshCw,
  Edit3,
} from "lucide-react";

type AIToolbarProps = {
  editor: any;
  docTitle?: string;
  onInsert?: (content: string) => void;
};

type ActionType =
  | "continue"
  | "polish"
  | "expand"
  | "summarize"
  | "translate_zh"
  | "translate_en"
  | "outline"
  | "brainstorm"
  | "rewrite"
  | "explain"
  | "custom";

const actions = [
  { id: "continue", label: "AI 续写", icon: <PenLine size={15} /> },
  { id: "polish", label: "AI 润色", icon: <Wand2 size={15} /> },
  { id: "expand", label: "AI 扩写", icon: <Maximize2 size={15} /> },
  { id: "summarize", label: "AI 缩写", icon: <Minimize2 size={15} /> },
  { id: "rewrite", label: "AI 重写", icon: <RefreshCw size={15} /> },
  { id: "translate_zh", label: "译成中文", icon: <Languages size={15} /> },
  { id: "translate_en", label: "译成英文", icon: <Languages size={15} /> },
  { id: "explain", label: "解释说明", icon: <Lightbulb size={15} /> },
  { id: "outline", label: "生成大纲", icon: <List size={15} /> },
  { id: "brainstorm", label: "头脑风暴", icon: <Lightbulb size={15} /> },
];

export default function AIToolbar({ editor, docTitle = "", onInsert }: AIToolbarProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType | null>(null);
  const [hasSelection, setHasSelection] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (resultRef.current) {
      resultRef.current.scrollTop = resultRef.current.scrollHeight;
    }
  }, [result]);

  // 关闭菜单（点击外部）
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (showMenu && !target.closest("[data-ai-menu]")) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const handleAction = async (actionId: string, customPromptText?: string) => {
    if (!editor) return;

    const selectedText = editor.state.selection.content().toString();
    const allText = editor.state.doc.textContent;

    setHasSelection(!!selectedText);
    const content = selectedText || allText.slice(-500);

    if (!content && actionId !== "outline" && actionId !== "brainstorm" && actionId !== "custom") {
      alert("请先选中要处理的文字");
      return;
    }

    setShowMenu(false);
    setShowCustomInput(false);
    setLoading(true);
    setCurrentAction(actionId as ActionType);
    setResult("");
    setShowResult(true);

    try {
      const res = await fetch("/api/ai/write-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: actionId,
          content,
          context: actionId === "custom" ? customPromptText : allText.slice(-1000),
          title: docTitle,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        setResult("出错了：" + (errData.error || "请求失败"));
        setLoading(false);
        return;
      }

      // 读取 SSE 流
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                setResult((prev) => prev + parsed.content);
              }
              if (parsed.error) {
                setResult((prev) => prev + "\n[错误] " + parsed.error);
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (e: any) {
      setResult("网络错误：" + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (!result || !editor) return;

    // 如果有选中文本且是替换类操作，替换选中内容；否则插入到光标
    editor.chain().focus().insertContent(result).run();
    setShowResult(false);
    setResult("");
    onInsert?.(result);
  };

  const handleClose = () => {
    setShowResult(false);
    setResult("");
    setCurrentAction(null);
  };

  const handleRetry = () => {
    if (currentAction) {
      handleAction(currentAction);
    }
  };

  return (
    <div className="relative" data-ai-menu>
      {/* AI 按钮 */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-sm bg-gradient-to-r from-accent to-accent-2 text-white rounded hover:opacity-90 transition-opacity"
        title="AI 写作助手"
      >
        <Sparkles size={15} />
        <span className="hidden sm:inline">AI 助手</span>
        <ChevronDown size={14} />
      </button>

      {/* 下拉菜单 */}
      {showMenu && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-rule rounded-lg shadow-lg py-1 z-50 max-h-[400px] overflow-y-auto">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleAction(action.id)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-accent-soft hover:text-accent-deep transition-colors text-left"
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
          {/* 分割线 */}
          <div className="h-px bg-rule my-1" />
          {/* 自定义指令 */}
          <button
            onClick={() => {
              setShowCustomInput(true);
              setShowMenu(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-accent-soft hover:text-accent-deep transition-colors text-left"
          >
            <Edit3 size={15} />
            <span>自定义指令</span>
          </button>
        </div>
      )}

      {/* 自定义指令输入 */}
      {showCustomInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Edit3 size={18} className="text-accent" />
              <h3 className="font-medium text-ink">自定义 AI 指令</h3>
            </div>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：把这段文字改写成更正式的商务口吻"
              className="w-full h-24 px-3 py-2 border border-rule rounded-lg text-sm outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCustomInput(false);
                  setCustomPrompt("");
                }}
                className="px-3 py-1.5 text-sm text-muted hover:bg-[#f2f3f5] rounded transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!customPrompt.trim()) {
                    alert("请输入指令");
                    return;
                  }
                  handleAction("custom", customPrompt);
                  setCustomPrompt("");
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent text-white hover:bg-accent-2 rounded transition-colors"
              >
                <Sparkles size={15} />
                <span>执行</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 结果弹窗 */}
      {showResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            {/* 标题栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-rule">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-accent" />
                <span className="font-medium text-ink">
                  {actions.find((a) => a.id === currentAction)?.label || "AI 结果"}
                </span>
                {loading && (
                  <span className="text-xs text-muted flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" />
                    生成中...
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!loading && result && (
                  <button
                    onClick={handleRetry}
                    className="p-1 hover:bg-[#f2f3f5] rounded transition-colors"
                    title="重新生成"
                  >
                    <RefreshCw size={16} className="text-muted" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-[#f2f3f5] rounded transition-colors"
                >
                  <X size={18} className="text-muted" />
                </button>
              </div>
            </div>

            {/* 内容区 */}
            <div
              ref={resultRef}
              className="flex-1 overflow-y-auto p-4"
            >
              {loading && !result ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 size={32} className="text-accent animate-spin mb-3" />
                  <p className="text-sm text-muted">AI 正在思考中...</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none prose-headings:text-ink prose-p:text-ink prose-li:text-ink prose-code:bg-[#f2f3f5] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {result || ""}
                  </ReactMarkdown>
                </div>
              )}
            </div>

            {/* 底部操作 */}
            {!loading && result && (
              <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-rule bg-[#fafbfc] rounded-b-xl">
                <button
                  onClick={handleClose}
                  className="px-3 py-1.5 text-sm text-muted hover:bg-[#f2f3f5] rounded transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleInsert}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-accent text-white hover:bg-accent-2 rounded transition-colors"
                >
                  <Check size={15} />
                  <span>{hasSelection ? "替换选中内容" : "插入到文档"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
