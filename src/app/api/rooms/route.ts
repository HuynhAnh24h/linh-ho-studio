import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { RoomItem, RoomPerk } from "@/lib/types";

export async function GET() {
  const db = await getDatabase();
  return NextResponse.json({
    rooms: db.rooms,
    roomPerks: db.roomPerks,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    if (body.type === "perk") {
      const newPerk: RoomPerk = {
        id: "perk-" + Date.now(),
        title: body.title,
        iconName: body.iconName || "check",
      };
      db.roomPerks.push(newPerk);
      await saveDatabase(db);
      return NextResponse.json({ success: true, perk: newPerk });
    }

    const newRoom: RoomItem = {
      id: "room-" + Date.now(),
      name: body.name,
      capacity: body.capacity,
      pricePerHour: Number(body.pricePerHour) || 120000,
      description: body.description || "",
      order: db.rooms.length + 1,
    };
    db.rooms.push(newRoom);
    await saveDatabase(db);
    return NextResponse.json({ success: true, room: newRoom });
  } catch {
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    if (body.type === "perks_update") {
      db.roomPerks = body.perks;
      await saveDatabase(db);
      return NextResponse.json({ success: true, perks: db.roomPerks });
    }

    const updatedRoom: RoomItem = body;
    const index = db.rooms.findIndex((r) => r.id === updatedRoom.id);
    if (index === -1) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    db.rooms[index] = updatedRoom;
    await saveDatabase(db);
    return NextResponse.json({ success: true, room: updatedRoom });
  } catch {
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const isPerk = searchParams.get("type") === "perk";

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const db = await getDatabase();
    if (isPerk) {
      db.roomPerks = db.roomPerks.filter((p) => p.id !== id);
    } else {
      db.rooms = db.rooms.filter((r) => r.id !== id);
    }
    await saveDatabase(db);
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
