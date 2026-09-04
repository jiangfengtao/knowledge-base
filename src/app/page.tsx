"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KnowledgeBaseApp from "@/components/KnowledgeBaseApp";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.replace("/login");
    } else {
      setChecking(false);
    }
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6f7]">
        <div className="text-center">
          <Loader2 size={32} className="animate-spin text-accent mx-auto mb-2" />
          <p className="text-sm text-muted">加载中...</p>
        </div>
      </div>
    );
  }

  return <KnowledgeBaseApp />;
}
