import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { SoundKitItem, ComboOffer } from "@/lib/types";

export async function GET() {
  const db = getDatabase();
  return NextResponse.json({
    kits: db.kits,
    comboOffer: db.comboOffer,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newKit: SoundKitItem = {
      id: body.id || "kit-" + Date.now(),
      name: body.name,
      desc: body.desc || "",
      price: Number(body.price) || 350000,
      originalPrice: body.originalPrice ? Number(body.originalPrice) : undefined,
      sampleCount: body.sampleCount || "100 sample",
      format: body.format || "WAV 24-bit",
      coverUrl: body.coverUrl || "",
      iconName: body.iconName || "drum",
      samples: body.samples || {},
      synthConfig: body.synthConfig || {
        kick: [120, 40, 0.5],
        snare: [180, 0.2],
        hat: [0.04, 0.3],
        tom: 1,
        crash: 1.5,
        lp: 18000,
        bpm: 110,
      },
      order: db.kits.length + 1,
    };

    db.kits.push(newKit);
    saveDatabase(db);
    return NextResponse.json({ success: true, kit: newKit });
  } catch {
    return NextResponse.json({ error: "Failed to create sound kit" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    if (body.type === "combo") {
      db.comboOffer = body.combo as ComboOffer;
      saveDatabase(db);
      return NextResponse.json({ success: true, comboOffer: db.comboOffer });
    }

    const updatedKit: SoundKitItem = body;
    const index = db.kits.findIndex((k) => k.id === updatedKit.id);
    if (index === -1) {
      return NextResponse.json({ error: "Kit not found" }, { status: 404 });
    }
    db.kits[index] = updatedKit;
    saveDatabase(db);
    return NextResponse.json({ success: true, kit: updatedKit });
  } catch {
    return NextResponse.json({ error: "Failed to update sound kit" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing kit id" }, { status: 400 });
    }
    const db = getDatabase();
    db.kits = db.kits.filter((k) => k.id !== id);
    saveDatabase(db);
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete sound kit" }, { status: 500 });
  }
}
