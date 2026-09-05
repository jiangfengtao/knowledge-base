"use client";

import { useState } from "react";
import { Share2, X, Link as LinkIcon, Check, Twitter, Facebook, MessageCircle, Send } from "lucide-react";

type ShareButtonsProps = {
  url: string;
  title: string;
  description?: string;
};

export default function ShareButtons({ url, title, description = "" }: ShareButtonsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description || title);

  const shareLinks = [
    {
      name: "微信",
      icon: <MessageCircle size={18} />,
      color: "text-green-500",
      bg: "bg-green-50",
      action: () => {
        // 微信分享通过复制链接实现（微信内可直接分享）
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    },
    {
      name: "微博",
      icon: <Send size={18} />,
      color: "text-red-500",
      bg: "bg-red-50",
      action: () => {
        window.open(
          `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedTitle}`,
          "_blank",
          "width=600,height=500"
        );
      },
    },
    {
      name: "Twitter",
      icon: <Twitter size={18} />,
      color: "text-blue-400",
      bg: "bg-blue-50",
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
          "_blank",
          "width=600,height=500"
        );
      },
    },
    {
      name: "Facebook",
      icon: <Facebook size={18} />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank",
          "width=600,height=500"
        );
      },
    },
    {
      name: "复制链接",
      icon: copied ? <Check size={18} /> : <LinkIcon size={18} />,
      color: copied ? "text-green-500" : "text-accent-deep",
      bg: copied ? "bg-green-50" : "bg-accent-soft",
      action: () => {
        navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    },
  ];

  return (
    <>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted hover:text-accent-deep hover:bg-accent-soft rounded-lg transition-colors"
        title="分享文章"
      >
        <Share2 size={15} />
        <span className="hidden sm:inline">分享</span>
      </button>

      {showMenu && (
        <>
          {/* 遮罩 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          {/* 分享菜单 */}
          <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-rule rounded-xl shadow-2xl p-2 min-w-[200px]">
            <div className="flex items-center justify-between px-2 py-1 mb-1 border-b border-rule">
              <span className="text-sm font-medium text-ink">分享到</span>
              <button
                onClick={() => setShowMenu(false)}
                className="p-1 text-muted hover:text-ink rounded transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {shareLinks.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    item.action();
                    if (item.name !== "复制链接" && item.name !== "微信") {
                      setTimeout(() => setShowMenu(false), 300);
                    }
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#f9fafb] transition-colors text-left`}
                >
                  <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className="text-sm text-ink">{item.name}</span>
                  {item.name === "复制链接" && copied && (
                    <span className="text-xs text-green-500 ml-auto">已复制!</span>
                  )}
                </button>
              ))}
            </div>
            {/* 分享链接预览 */}
            {copied && (
              <div className="px-3 py-2 mt-1 border-t border-rule">
                <p className="text-xs text-muted truncate">{fullUrl}</p>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
