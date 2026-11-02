import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { RoomImageItem } from "@/lib/types";

export async function GET() {
  const db = await getDatabase();
  return NextResponse.json(db.roomImages || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const newItem: RoomImageItem = {
      id: "rm-img-" + Date.now(),
      title: body.title || "Hình ảnh phòng tập",
      category: body.category || "phong-tap",
      imageUrl: body.imageUrl || "",
    };

    if (!db.roomImages) db.roomImages = [];
    db.roomImages.unshift(newItem);
    await saveDatabase(db);
    return NextResponse.json({ success: true, item: newItem });
  } catch {
    return NextResponse.json({ error: "Failed to create room image" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const updated: RoomImageItem = await req.json();
    const db = await getDatabase();
    if (!db.roomImages) db.roomImages = [];
    const index = db.roomImages.findIndex((r) => r.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    db.roomImages[index] = updated;
    await saveDatabase(db);
    return NextResponse.json({ success: true, item: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update room image" }, { status: 500 });
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
    if (!db.roomImages) db.roomImages = [];
    db.roomImages = db.roomImages.filter((r) => r.id !== id);
    await saveDatabase(db);
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete room image" }, { status: 500 });
  }
}
