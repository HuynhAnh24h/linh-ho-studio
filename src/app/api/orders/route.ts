import { NextResponse } from "next/server";
import { getDatabase, saveDatabase } from "@/lib/db";
import { OrderItem } from "@/lib/types";
import { broadcastSocketEvent } from "@/lib/socket-server-emit";
import { sendContactNotificationEmail } from "@/lib/mail";

export async function GET() {
  const db = await getDatabase();
  return NextResponse.json(db.orders || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = await getDatabase();

    const newOrder: OrderItem = {
      id: "ord-" + Date.now(),
      customerName: body.customerName || "Khách hàng",
      phone: body.phone || "",
      email: body.email ? String(body.email).trim() : undefined,
      serviceType: body.serviceType || "sampler",
      itemSelected: body.itemSelected || "Liên hệ dịch vụ",
      price: body.price !== undefined ? Number(body.price) : undefined,
      software: body.software || "",
      deviceModel: body.deviceModel || "",
      deliveryMethod: body.deliveryMethod || "",
      bookingDate: body.bookingDate || "",
      bookingTime: body.bookingTime || "",
      hours: body.hours !== undefined ? Number(body.hours) : undefined,
      roomSelected: body.roomSelected || "",
      message: body.message || "",
      adminNotes: body.adminNotes || "",
      status: (body.status as OrderItem["status"]) || "new",
      createdAt: body.createdAt || new Date().toISOString(),
    };

    if (!db.orders) {
      db.orders = [];
    }
    db.orders.unshift(newOrder);
    await saveDatabase(db);

    // 1. Real-time broadcast via Socket.IO
    broadcastSocketEvent("new_order", newOrder);
    broadcastSocketEvent("notification", {
      id: "notif-" + Date.now(),
      type: "new_order",
      title: "🔔 Yêu cầu liên hệ mới!",
      message: `${newOrder.customerName} (${newOrder.phone}) vừa gửi: ${newOrder.itemSelected}`,
      order: newOrder,
      timestamp: new Date().toISOString(),
    });

    // 2. Email notification via Nodemailer (non-blocking)
    const hostUrl = req.headers.get("origin") || req.headers.get("host") || "http://localhost:3000";
    sendContactNotificationEmail({
      order: newOrder,
      toEmail: db.profile?.contact?.email,
      hostUrl: hostUrl.startsWith("http") ? hostUrl : `http://${hostUrl}`,
    }).catch((mErr) => {
      console.warn("[Orders API] Email notification background error:", mErr);
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (err: any) {
    console.error("[Orders API] Error creating order:", err);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const db = await getDatabase();
    const index = db.orders.findIndex((o) => o.id === body.id);
    if (index === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    db.orders[index] = {
      ...db.orders[index],
      ...body,
    };
    await saveDatabase(db);

    // Real-time broadcast status change
    broadcastSocketEvent("order_updated", db.orders[index]);

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
    const db = await getDatabase();
    db.orders = db.orders.filter((o) => o.id !== id);
    await saveDatabase(db);

    // Real-time broadcast deletion
    broadcastSocketEvent("order_deleted", { id });

    return NextResponse.json({ success: true, id });
  } catch {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
