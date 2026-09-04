import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0, // 立即过期
    sameSite: "lax",
  });
  return response;
}
