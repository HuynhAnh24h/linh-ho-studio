import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { OrderItem } from "@/lib/types";

export async function GET() {
  const db = getDatabase();
  return NextResponse.json(db.orders || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();

    const newOrder: OrderItem = {
      id: "ord-" + Date.now(),
      customerName: body.customerName || "Khách hàng",
      phone: body.phone || "",
      serviceType: body.serviceType || "sampler",
      itemSelected: body.itemSelected || "Sampler",
      software: body.software || "",
      hours: body.hours,
      roomSelected: body.roomSelected,
      message: body.message || "",
      status: "new",
      createdAt: new Date().toISOString(),
    };

    if (!db.orders) {
      db.orders = [];
    }
    db.orders.unshift(newOrder);
    saveDatabase(db);
    return NextResponse.json({ success: true, order: newOrder });
  } catch {
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = getDatabase();
    const index = db.orders.findIndex((o) => o.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    db.orders[index] = {
      ...db.orders[index],
      ...body,
    };
    saveDatabase(db);
    return NextResponse.json({ success: true, order: db.orders[index] });
  } catch {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing order id" }, { status: 400 });
    }
    const db = getDatabase();
    db.orders = db.orders.filter((o) => o.id !== id);
    saveDatabase(db);
    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
