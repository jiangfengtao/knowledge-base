import { NextResponse } from "next/server";
import { seedSamplePosts } from "@/lib/seed";

export async function POST() {
  try {
    const result = await seedSamplePosts();
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "初始化失败" },
      { status: 500 }
    );
  }
}
