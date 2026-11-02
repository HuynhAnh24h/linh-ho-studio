import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { EventServiceItem } from "@/lib/types";

export async function GET() {
  const db = await getDatabase();
  return NextResponse.json(db.eventServices || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const newItem: EventServiceItem = {
      id: "srv-" + Date.now(),
      title: body.title || "Dịch vụ biểu diễn mới",
      category: body.category || "band_acoustic",
      price: body.price || "Liên hệ báo giá",
      priceNumber: Number(body.priceNumber) || 0,
      description: body.description || "",
      features: body.features || [],
      imageUrl: body.imageUrl || "",
      order: (db.eventServices?.length || 0) + 1,
    };

    if (!db.eventServices) db.eventServices = [];
    db.eventServices.push(newItem);
    await saveDatabase(db);
    return NextResponse.json({ success: true, item: newItem });
  } catch {
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const updated: EventServiceItem = await req.json();
    const db = await getDatabase();
    if (!db.eventServices) db.eventServices = [];
    const index = db.eventServices.findIndex((s) => s.id === updated.id);
    if (index === -1) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }
    db.eventServices[index] = updated;
    await saveDatabase(db);
    return NextResponse.json({ success: true, item: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
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
    if (!db.eventServices) db.eventServices = [];
    db.eventServices = db.eventServices.filter((s) => s.id !== id);
    await saveDatabase(db);
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
