"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Film, User, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * 移动端底部导航栏 - 参考语雀/Notion的移动端导航模式
 * 底部固定导航 + 顶部滚动时隐藏的返回按钮
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 滚动检测 - 返回顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: "/blog", label: "首页", icon: Home },
    { href: "/videos", label: "视频", icon: Film },
    { href: "/timeline", label: "时间线", icon: Search, match: "/timeline" },
    { href: "/about", label: "关于", icon: User },
  ];

  const isActive = (href: string, match?: string) => {
    if (match) return pathname === match;
    if (href === "/blog") return pathname === "/blog" || pathname.startsWith("/blog/post");
    return pathname === href;
  };

  return (
    <>
      {/* 底部导航栏 - 仅移动端显示 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-rule">
        <div className="flex items-center justify-around px-2 py-1.5" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  active ? "text-accent-deep" : "text-muted"
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 返回顶部按钮 */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="md:hidden fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full bg-accent text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
          aria-label="返回顶部"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </>
  );
}

/**
 * 移动端顶部返回按钮 - 嵌入到页面顶部导航中
 * 使用方式：<MobileBackButton fallbackUrl="/blog" />
 */
export function MobileBackButton({ fallbackUrl = "/blog" }: { fallbackUrl?: string }) {
  const router = useRouter();

  const handleBack = () => {
    // 优先使用浏览器历史返回
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="md:hidden flex items-center gap-1 text-sm text-muted hover:text-ink transition-colors"
      aria-label="返回"
    >
      <ArrowLeft size={18} />
    </button>
  );
}
