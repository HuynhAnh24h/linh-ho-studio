"use client";

import React from "react";
import { SiteData, OrderItem } from "@/lib/types";
import { ShoppingBag, GraduationCap, Clock, Headphones, Image as ImageIcon, ExternalLink, AlertCircle, CheckCircle, Database, Music, Users, Package, Calendar } from "lucide-react";

interface AdminOverviewProps {
  data: SiteData;
  isNeon?: boolean;
  onNavigateTab: (tabId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderItem["status"]) => void;
}

export function AdminOverview({ data, isNeon, onNavigateTab, onUpdateOrderStatus }: AdminOverviewProps) {
  const isSamplerOrder = (o: OrderItem) => {
    if (o.serviceType === "sampler") return true;
    if (["room", "course", "event_band", "thue_trong"].includes(o.serviceType)) return false;
    const txt = (o.itemSelected || "").toLowerCase();
    return txt.includes("sampler") || txt.includes("sound") || txt.includes("pack") || txt.includes("spd") || txt.includes("kit");
  };

  const samplerOrders = data.orders.filter(isSamplerOrder);
  const bookingOrders = data.orders.filter((o) => !isSamplerOrder(o));

  const newSamplerCount = samplerOrders.filter((o) => o.status === "new").length;
  const newBookingCount = bookingOrders.filter((o) => o.status === "new").length;

  const stats = [
    {
      label: "Đơn Mua Sampler",
      value: samplerOrders.length,
      badge: newSamplerCount > 0 ? `${newSamplerCount} đơn mới` : undefined,
      badgeColor: "bg-red-500 text-white animate-pulse",
      icon: <Package className="w-5 h-5 text-[var(--brass)]" />,
      tab: "orders",
    },
    {
      label: "Lịch Đặt Phòng & Dịch Vụ",
      value: bookingOrders.length,
      badge: newBookingCount > 0 ? `${newBookingCount} lịch mới` : undefined,
      badgeColor: "bg-red-500 text-white animate-pulse",
      icon: <Calendar className="w-5 h-5 text-cyan-400" />,
      tab: "orders",
    },
    {
      label: "Khoá học dạy trống",
      value: data.courses.length,
      icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
      tab: "courses",
    },
    {
      label: "Phòng tập band",
      value: data.rooms.length,
      icon: <Clock className="w-5 h-5 text-cyan-400" />,
      tab: "rooms",
    },
    {
      label: "Bộ Sampler trống",
      value: data.kits.length,
      icon: <Headphones className="w-5 h-5 text-[var(--brass)]" />,
      tab: "kits",
    },
    {
      label: "Dịch vụ Show & Tiệc",
      value: data.eventServices?.length || 0,
      icon: <Music className="w-5 h-5 text-purple-400" />,
      tab: "services",
    },
    {
      label: "Hình ảnh học viên",
      value: data.studentImages?.length || 0,
      icon: <Users className="w-5 h-5 text-[var(--brass)]" />,
      tab: "students",
    },
    {
      label: "File Media (Ảnh & Audio)",
      value: data.media?.length || 0,
      icon: <ImageIcon className="w-5 h-5 text-[var(--brass)]" />,
      tab: "media",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="font-condensed font-extrabold text-3xl sm:text-4xl text-[var(--text)]">
              LH Music Studio
            </h2>
            {isNeon ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Database className="w-3.5 h-3.5" /> Neon PostgreSQL: Đã kết nối
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                <Database className="w-3.5 h-3.5" /> CSDL Cục bộ (Sẵn sàng gắn Neon)
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--muted)]">
            Chào mừng bạn đến với trung tâm quản trị toàn diện LH Music Studio.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-sm flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Xem trang web thật</span>
        </a>
      </div>

      {/* Neon Database Guide card if not connected */}
      {!isNeon && (
        <div className="p-5 rounded-2xl bg-[var(--surface)] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <span>Kết nối Neon Serverless PostgreSQL</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Để dữ liệu được đồng bộ vĩnh viễn trên cloud khi deploy Vercel, hãy dán connection string của Neon vào file <code className="text-[var(--brass)] font-mono">.env.local</code>: <code className="text-xs font-mono bg-[var(--chip)] px-1.5 py-0.5 rounded">DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require</code>
            </p>
          </div>
          <a
            href="https://neon.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold border border-[var(--brass)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-colors flex-shrink-0"
          >
            Lấy link tại Neon.tech →
          </a>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            onClick={() => onNavigateTab(s.tab)}
            className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] cursor-pointer transition-all hover:scale-[1.02] space-y-3 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <span className="ibox w-10 h-10 rounded-xl">{s.icon}</span>
              {s.badge && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.badgeColor}`}>
                  {s.badge}
                </span>
              )}
            </div>
            <div>
              <div className="font-condensed font-extrabold text-4xl text-[var(--text)]">
                {s.value}
              </div>
              <div className="text-xs font-medium text-[var(--muted)] mt-0.5">
                {s.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
              Đơn đặt hàng &amp; Tin nhắn liên hệ mới
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Xem và xử lý các yêu cầu mới nhất từ học viên và khách mua sampler
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("orders")}
            className="text-xs font-bold text-[var(--brass)] hover:underline"
          >
            Xem tất cả đơn →
          </button>
        </div>

        {data.orders.length === 0 ? (
          <div className="py-12 text-center text-[var(--muted)] text-sm">
            Chưa có đơn đặt hàng nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[var(--line)] text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="pb-3">Khách hàng</th>
                  <th className="pb-3">Số điện thoại</th>
                  <th className="pb-3">Dịch vụ / Gói chọn</th>
                  <th className="pb-3">Thời gian</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {data.orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--chip)] transition-colors">
                    <td className="py-3.5 font-bold text-[var(--text)]">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 font-mono text-xs text-[var(--brass)]">
                      <a href={`tel:${order.phone.replace(/\s+/g, "")}`} className="hover:underline">
                        {order.phone}
                      </a>
                    </td>
                    <td className="py-3.5 text-xs text-[var(--text)]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isSamplerOrder(order)
                              ? "bg-[var(--brass)]/15 text-[var(--brass)]"
                              : "bg-cyan-500/15 text-cyan-400"
                          }`}
                        >
                          {isSamplerOrder(order) ? "Sampler" : "Đặt lịch"}
                        </span>
                        <span className="font-medium truncate max-w-[220px]">{order.itemSelected}</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs text-[var(--muted)]">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          order.status === "new"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : order.status === "processing"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {order.status === "new" ? (
                          <>
                            <AlertCircle className="w-3 h-3" /> Mới
                          </>
                        ) : order.status === "processing" ? (
                          "Đang xử lý"
                        ) : (
                          <>
                            <CheckCircle className="w-3 h-3" /> Hoàn thành
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {order.status === "new" && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, "processing")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)]"
                        >
                          Xử lý
                        </button>
                      )}
                      {order.status === "processing" && (
                        <button
                          onClick={() => onUpdateOrderStatus(order.id, "completed")}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Hoàn tất
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
