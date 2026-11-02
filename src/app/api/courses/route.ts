import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { CourseItem } from "@/lib/types";

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.courses);
}

export async function POST(req: Request) {
  try {
    const newCourse: Omit<CourseItem, "id"> = await req.json();
    const db = getDatabase();
    const course: CourseItem = {
      ...newCourse,
      id: "course-" + Date.now(),
      order: db.courses.length + 1,
    };
    db.courses.push(course);
    saveDatabase(db);
    return NextResponse.json({ success: true, course });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create course" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const updatedCourse: CourseItem = await req.json();
    const db = getDatabase();
    const index = db.courses.findIndex((c) => c.id === updatedCourse.id);
    if (index === -1) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    db.courses[index] = updatedCourse;
    saveDatabase(db);
    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update course" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing course id" }, { status: 400 });
    }
    const db = getDatabase();
    db.courses = db.courses.filter((c) => c.id !== id);
    saveDatabase(db);
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete course" }, { status: 500 });
  }
}
