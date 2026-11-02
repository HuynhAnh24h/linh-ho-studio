import { NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({ success: true, token: "authenticated-" + Date.now() });
    }
    return NextResponse.json({ error: "Mật khẩu không chính xác" }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi xác thực" }, { status: 500 });
  }
}
