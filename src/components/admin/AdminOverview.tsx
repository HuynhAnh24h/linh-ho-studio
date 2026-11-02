"use client";

import React from "react";
import { SiteData, OrderItem } from "@/lib/types";
import { ShoppingBag, GraduationCap, Clock, Headphones, Image as ImageIcon, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

interface AdminOverviewProps {
  data: SiteData;
  onNavigateTab: (tabId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderItem["status"]) => void;
}

export function AdminOverview({ data, onNavigateTab, onUpdateOrderStatus }: AdminOverviewProps) {
  const newOrdersCount = data.orders.filter((o) => o.status === "new").length;

  const stats = [
    {
      label: "Đơn đặt hàng & Lịch hẹn",
      value: data.orders.length,
      badge: newOrdersCount > 0 ? `${newOrdersCount} đơn mới` : undefined,
      badgeColor: "bg-red-500 text-white",
      icon: <ShoppingBag className="w-5 h-5 text-[var(--brass)]" />,
      tab: "orders",
    },
    {
      label: "Khoá học trống",
      value: data.courses.length,
      icon: <GraduationCap className="w-5 h-5 text-[var(--brass)]" />,
      tab: "courses",
    },
    {
      label: "Phòng tập band",
      value: data.rooms.length,
      icon: <Clock className="w-5 h-5 text-[var(--brass)]" />,
      tab: "rooms",
    },
    {
      label: "Bộ Sampler trống",
      value: data.kits.length,
      icon: <Headphones className="w-5 h-5 text-[var(--brass)]" />,
      tab: "kits",
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)]">
        <div>
          <h2 className="font-condensed font-extrabold text-3xl text-[var(--text)]">
            Xin chào, {data.profile.name} 👋
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Đây là trung tâm quản trị toàn bộ nội dung, khoá học, phòng tập và các bộ sound sampler.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Xem trang web thật</span>
        </a>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            onClick={() => onNavigateTab(s.tab)}
            className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] cursor-pointer transition-all hover:scale-[1.02] space-y-3"
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
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
              Đơn đặt hàng & Đặt lịch gần đây
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
                      {order.itemSelected}
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
                            ? "bg-red-500/10 text-red-500 border border-red-500/20"
                            : order.status === "processing"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
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
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)]"
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
