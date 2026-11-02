import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getDatabase, saveDatabase } from "@/lib/db";
import { MediaItem } from "@/lib/types";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

function ensureUploadsDir() {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create uploads directory:", err);
  }
}

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.media || []);
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. Direct JSON (for adding URL or base64 directly)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const db = getDatabase();
      const mediaItem: MediaItem = {
        id: "media-" + Date.now(),
        name: body.name || "Media File",
        type: body.type || (body.url?.includes(".mp3") || body.url?.includes(".wav") ? "audio" : "image"),
        url: body.url,
        size: body.size || 0,
        createdAt: new Date().toISOString(),
      };
      if (!db.media) db.media = [];
      db.media.unshift(mediaItem);
      saveDatabase(db);
      return NextResponse.json({ success: true, media: mediaItem });
    }

    // 2. FormData file upload
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const customName = formData.get("name") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const mime = file.type;
    const isAudio = mime.startsWith("audio/") || file.name.endsWith(".mp3") || file.name.endsWith(".wav") || file.name.endsWith(".ogg");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file locally if possible for clean URL
    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    let fileUrl = "";

    try {
      ensureUploadsDir();
      const filePath = path.join(UPLOADS_DIR, safeName);
      fs.writeFileSync(filePath, buffer);
      fileUrl = `/uploads/${safeName}`;
    } catch {
      // In serverless / read-only filesystem (Vercel), store as Base64 Data URL directly in database!
      const base64 = buffer.toString("base64");
      fileUrl = `data:${mime || (isAudio ? "audio/wav" : "image/jpeg")};base64,${base64}`;
    }

    const db = getDatabase();
    const mediaItem: MediaItem = {
      id: "media-" + Date.now(),
      name: customName || file.name,
      type: isAudio ? "audio" : "image",
      url: fileUrl,
      size: file.size,
      createdAt: new Date().toISOString(),
    };

    if (!db.media) db.media = [];
    db.media.unshift(mediaItem);
    saveDatabase(db);

    return NextResponse.json({ success: true, media: mediaItem });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to process file upload" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing media id" }, { status: 400 });
    }
    const db = getDatabase();
    const item = (db.media || []).find((m) => m.id === id);

    // If local file, attempt to delete
    if (item && item.url.startsWith("/uploads/")) {
      try {
        const filePath = path.join(process.cwd(), "public", item.url);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // Ignore file delete error
      }
    }

    db.media = (db.media || []).filter((m) => m.id !== id);
    saveDatabase(db);
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
