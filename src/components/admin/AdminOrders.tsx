"use client";

import React, { useState } from "react";
import { OrderItem } from "@/lib/types";
import { Search, Trash2, Eye, X, Phone, MessageCircle, AlertCircle, CheckCircle, Clock, Mail } from "lucide-react";

interface AdminOrdersProps {
  orders: OrderItem[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: OrderItem["status"]) => void;
  onDeleteOrder: (id: string) => void;
}

export function AdminOrders({ orders, onRefresh, onUpdateStatus, onDeleteOrder }: AdminOrdersProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.phone.includes(searchTerm) ||
      o.itemSelected.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const matchesService = serviceFilter === "all" || o.serviceType === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-condensed font-extrabold text-3xl text-[var(--text)]">
            Đơn đặt hàng & Yêu cầu đặt lịch ({orders.length})
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Quản lý khách mua bộ sampler trống, học viên đăng ký học và lịch thuê phòng tập
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại, sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs sm:text-sm outline-none focus:border-[var(--brass)]"
          />
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs sm:text-sm outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="new">🔴 Đơn mới</option>
          <option value="processing">🟡 Đang xử lý</option>
          <option value="completed">🟢 Hoàn tất</option>
          <option value="cancelled">⚪ Đã huỷ</option>
        </select>

        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs sm:text-sm outline-none"
        >
          <option value="all">Tất cả loại dịch vụ</option>
          <option value="sampler">Mua sampler</option>
          <option value="room">Thuê phòng tập</option>
          <option value="course">Khoá học trống</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--muted)]">
            Không tìm thấy đơn đặt hàng nào phù hợp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--chip)] text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3.5">Khách hàng</th>
                  <th className="px-5 py-3.5">Liên hệ</th>
                  <th className="px-5 py-3.5">Dịch vụ</th>
                  <th className="px-5 py-3.5">Thời gian gửi</th>
                  <th className="px-5 py-3.5">Trạng thái</th>
                  <th className="px-5 py-3.5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[var(--chip)]/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-[var(--text)]">
                      {order.customerName}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${order.phone.replace(/\s+/g, "")}`}
                          className="font-mono text-xs font-bold text-[var(--brass)] hover:underline flex items-center gap-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.phone}</span>
                        </a>
                        <a
                          href={`https://zalo.me/${order.phone.replace(/\s+/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-[#0068ff] hover:bg-blue-500/10"
                          title="Nhắn Zalo"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      </div>
                      {order.email && (
                        <a
                          href={`mailto:${order.email}`}
                          className="font-mono text-[11px] text-[var(--muted)] hover:text-[var(--brass)] flex items-center gap-1 mt-1 truncate max-w-[170px]"
                          title={`Gửi mail cho ${order.email}`}
                        >
                          <Mail className="w-3 h-3 text-[var(--brass)] flex-shrink-0" />
                          <span className="truncate">{order.email}</span>
                        </a>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-xs text-[var(--text)]">
                        {order.itemSelected}
                      </div>
                      {order.software && (
                        <div className="text-xs text-[var(--muted)]">
                          DAW: {order.software}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-[var(--muted)]">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          onUpdateStatus(order.id, e.target.value as OrderItem["status"])
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-bold border outline-none cursor-pointer ${
                          order.status === "new"
                            ? "bg-red-500/10 text-red-500 border-red-500/30"
                            : order.status === "processing"
                            ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                            : order.status === "completed"
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                            : "bg-gray-500/10 text-gray-500 border-gray-500/30"
                        }`}
                      >
                        <option value="new">Mới</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn tất</option>
                        <option value="cancelled">Đã huỷ</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-1.5 rounded-lg text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteOrder(order.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Xoá đơn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Order Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                Chi tiết đơn hàng #{viewingOrder.id}
              </h3>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm divide-y divide-[var(--line)]">
              <div className="grid grid-cols-2 gap-4 pb-3">
                <div>
                  <span className="text-xs text-[var(--muted)] block">Khách hàng</span>
                  <strong className="text-base text-[var(--text)]">{viewingOrder.customerName}</strong>
                </div>
                <div>
                  <span className="text-xs text-[var(--muted)] block">Số điện thoại / Zalo</span>
                  <strong className="text-base text-[var(--brass)]">{viewingOrder.phone}</strong>
                </div>
                {viewingOrder.email && (
                  <div className="col-span-2">
                    <span className="text-xs text-[var(--muted)] block">Email liên hệ</span>
                    <a href={`mailto:${viewingOrder.email}`} className="text-sm font-mono text-[var(--brass)] hover:underline flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{viewingOrder.email}</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-3 pb-3 space-y-2">
                <div>
                  <span className="text-xs text-[var(--muted)] block">Sản phẩm / Dịch vụ</span>
                  <span className="font-bold text-[var(--text)]">{viewingOrder.itemSelected}</span>
                </div>
                {viewingOrder.software && (
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Phần mềm DAW</span>
                    <span className="text-[var(--text)]">{viewingOrder.software}</span>
                  </div>
                )}
                {viewingOrder.hours && (
                  <div>
                    <span className="text-xs text-[var(--muted)] block">Số giờ thuê</span>
                    <span className="text-[var(--text)]">{viewingOrder.hours} giờ</span>
                  </div>
                )}
              </div>

              {viewingOrder.message && (
                <div className="pt-3">
                  <span className="text-xs text-[var(--muted)] block mb-1">Nội dung tin nhắn khách gửi:</span>
                  <div className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--line)] font-mono text-xs text-[var(--text)] whitespace-pre-wrap">
                    {viewingOrder.message}
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-between text-xs text-[var(--muted)]">
                <span>
                  Thời gian: {new Date(viewingOrder.createdAt).toLocaleString("vi-VN")}
                </span>
                <span className="font-bold text-[var(--brass)] uppercase">
                  Trạng thái: {viewingOrder.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
              <a
                href={`https://zalo.me/${viewingOrder.phone.replace(/\s+/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl font-bold text-sm bg-[#0068ff] text-white hover:bg-[#0055d4] flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mở chat Zalo với khách</span>
              </a>
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-2.5 rounded-xl font-semibold text-sm border border-[var(--line-strong)] text-[var(--text)] hover:bg-[var(--chip)]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
