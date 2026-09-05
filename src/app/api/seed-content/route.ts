import { NextResponse } from "next/server";
import { seedContentArchitecture } from "@/lib/seed-content";

export async function POST() {
  try {
    const result = await seedContentArchitecture();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Seed content error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "内容架构初始化失败" },
      { status: 500 }
    );
  }
}
