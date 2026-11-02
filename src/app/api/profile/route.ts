import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { ProfileData } from "@/lib/types";

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.profile);
}

export async function PUT(req: Request) {
  try {
    const updatedProfile: ProfileData = await req.json();
    const db = getDatabase();
    db.profile = {
      ...db.profile,
      ...updatedProfile,
    };
    saveDatabase(db);
    return NextResponse.json({ success: true, profile: db.profile });
  } catch {
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
