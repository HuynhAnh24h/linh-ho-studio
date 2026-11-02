import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { StudentImageItem } from "@/lib/types";

export async function GET() {
  const db = await getDatabase();
  return NextResponse.json(db.studentImages || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const newItem: StudentImageItem = {
      id: "stu-" + Date.now(),
      title: body.title || "Hình ảnh học viên",
      caption: body.caption || "",
      imageUrl: body.imageUrl || "",
    };

    if (!db.studentImages) db.studentImages = [];
    db.studentImages.unshift(newItem);
    await saveDatabase(db);
    return NextResponse.json({ success: true, item: newItem });
  } catch {
    return NextResponse.json({ error: "Failed to create student image" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const updated: StudentImageItem = await req.json();
    const db = await getDatabase();
    if (!db.studentImages) db.studentImages = [];
    const index = db.studentImages.findIndex((s) => s.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    db.studentImages[index] = updated;
    await saveDatabase(db);
    return NextResponse.json({ success: true, item: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update student image" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const db = await getDatabase();
    if (!db.studentImages) db.studentImages = [];
    db.studentImages = db.studentImages.filter((s) => s.id !== id);
    await saveDatabase(db);
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete student image" }, { status: 500 });
  }
}
