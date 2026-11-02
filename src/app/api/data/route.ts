import { NextResponse } from "next/server";
import { getDatabase, saveDatabase, resetDatabase, isNeonConnected } from "@/lib/db";

export async function GET() {
  try {
    const data = await getDatabase();
    return NextResponse.json({
      ...data,
      _system: {
        isNeon: isNeonConnected(),
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.action === "reset") {
      const data = await resetDatabase();
      return NextResponse.json({ success: true, data });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    await saveDatabase(body);
    return NextResponse.json({ success: true, data: body });
  } catch {
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 });
  }
}
