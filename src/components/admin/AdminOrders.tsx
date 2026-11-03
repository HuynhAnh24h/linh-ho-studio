"use client";

import React, { useState, useMemo } from "react";
import { OrderItem, SoundKitItem, RoomItem, CourseItem, EventServiceItem } from "@/lib/types";
import {
  Search,
  Trash2,
  Eye,
  X,
  Phone,
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Plus,
  Download,
  Copy,
  Check,
  Headphones,
  Calendar,
  Sparkles,
  Music,
  GraduationCap,
  RefreshCw,
  Edit3,
  Save,
  Package,
  ArrowUpDown,
  Filter,
  Layers,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

interface AdminOrdersProps {
  orders: OrderItem[];
  kits?: SoundKitItem[];
  rooms?: RoomItem[];
  courses?: CourseItem[];
  services?: EventServiceItem[];
  onRefresh: () => void;
  onUpdateStatus: (id: string, status: OrderItem["status"]) => void;
  onDeleteOrder: (id: string) => void;
}

type OrderViewTab = "sampler" | "booking" | "all";

export function AdminOrders({
  orders,
  kits = [],
  rooms = [],
  courses = [],
  services = [],
  onRefresh,
  onUpdateStatus,
  onDeleteOrder,
}: AdminOrdersProps) {
  // Navigation View Tab: "sampler" (Đơn Sampler) | "booking" (Lịch đặt phòng, học, show) | "all"
  const [currentTab, setCurrentTab] = useState<OrderViewTab>("sampler");

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [bookingTypeFilter, setBookingTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all"); // "all" | "today" | "7days" | "30days"

  // Interactive Modals
  const [viewingOrder, setViewingOrder] = useState<OrderItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);
  const [copiedZaloMsg, setCopiedZaloMsg] = useState(false);

  // Admin notes inside detail modal
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [noteSavedSuccess, setNoteSavedSuccess] = useState(false);

  // New Order / Booking Form State
  const [newOrderType, setNewOrderType] = useState<"sampler" | "room" | "course" | "event_band">("sampler");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newItemSelected, setNewItemSelected] = useState("");
  const [newSoftware, setNewSoftware] = useState("");
  const [newDeviceModel, setNewDeviceModel] = useState("Roland SPD-30 (Octapad)");
  const [newHours, setNewHours] = useState<number>(2);
  const [newRoomSelected, setNewRoomSelected] = useState("");
  const [newBookingDate, setNewBookingDate] = useState("");
  const [newBookingTime, setNewBookingTime] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newAdminNotes, setNewAdminNotes] = useState("");
  const [newPrice, setNewPrice] = useState<number | undefined>(undefined);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Categorize helper
  const isSamplerItem = (order: OrderItem): boolean => {
    if (order.serviceType === "sampler") return true;
    if (["room", "course", "event_band", "thue_trong"].includes(order.serviceType)) return false;
    const txt = (order.itemSelected || "").toLowerCase();
    return txt.includes("sampler") || txt.includes("sound") || txt.includes("pack") || txt.includes("spd") || txt.includes("kit") || txt.includes("tiếng");
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const samplerOrders = orders.filter((o) => isSamplerItem(o));
    const bookingOrders = orders.filter((o) => !isSamplerItem(o));

    const samplerNew = samplerOrders.filter((o) => o.status === "new").length;
    const samplerCompleted = samplerOrders.filter((o) => o.status === "completed").length;

    const bookingNew = bookingOrders.filter((o) => o.status === "new").length;
    const bookingCompleted = bookingOrders.filter((o) => o.status === "completed").length;

    const roomCount = bookingOrders.filter((o) => o.serviceType === "room" || (o.itemSelected || "").toLowerCase().includes("phòng")).length;
    const courseCount = bookingOrders.filter((o) => o.serviceType === "course" || (o.itemSelected || "").toLowerCase().includes("học")).length;
    const showCount = bookingOrders.filter((o) => o.serviceType === "event_band" || o.serviceType === "thue_trong" || (o.itemSelected || "").toLowerCase().includes("band")).length;

    // Estimate revenue from completed sampler orders
    const samplerRevenue = samplerOrders.reduce((sum, o) => {
      if (o.price) return sum + o.price;
      const numMatch = (o.itemSelected || "").match(/(\d{1,3}(?:\.\d{3})+|\d+)\s*(?:đ|vnd|k)/i);
      if (numMatch) {
        let valStr = numMatch[1].replace(/\./g, "");
        let val = parseInt(valStr, 10);
        if (numMatch[0].toLowerCase().includes("k") && val < 1000) val *= 1000;
        return sum + (isNaN(val) ? 450000 : val);
      }
      return sum + (o.status === "completed" ? 450000 : 0);
    }, 0);

    return {
      samplerOrders,
      bookingOrders,
      samplerTotal: samplerOrders.length,
      samplerNew,
      samplerCompleted,
      samplerRevenue,
      bookingTotal: bookingOrders.length,
      bookingNew,
      bookingCompleted,
      roomCount,
      courseCount,
      showCount,
      totalOrders: orders.length,
      totalNew: orders.filter((o) => o.status === "new").length,
    };
  }, [orders]);

  // Filtering based on current active tab and filters
  const filteredList = useMemo(() => {
    return orders.filter((o) => {
      // 1. Tab separation
      const isSampler = isSamplerItem(o);
      if (currentTab === "sampler" && !isSampler) return false;
      if (currentTab === "booking" && isSampler) return false;

      // 2. Search query
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (o.customerName || "").toLowerCase().includes(q);
        const matchPhone = (o.phone || "").includes(q);
        const matchItem = (o.itemSelected || "").toLowerCase().includes(q);
        const matchEmail = (o.email || "").toLowerCase().includes(q);
        const matchMessage = (o.message || "").toLowerCase().includes(q);
        const matchNotes = (o.adminNotes || "").toLowerCase().includes(q);
        const matchRoom = (o.roomSelected || "").toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchItem && !matchEmail && !matchMessage && !matchNotes && !matchRoom) {
          return false;
        }
      }

      // 3. Status filter
      if (statusFilter !== "all" && o.status !== statusFilter) {
        return false;
      }

      // 4. Booking specific sub-type filter
      if (currentTab === "booking" && bookingTypeFilter !== "all") {
        if (bookingTypeFilter === "room" && o.serviceType !== "room") return false;
        if (bookingTypeFilter === "course" && o.serviceType !== "course") return false;
        if (bookingTypeFilter === "event_band" && o.serviceType !== "event_band" && o.serviceType !== "thue_trong") return false;
      }

      // 5. Date filter
      if (dateFilter !== "all") {
        const itemDate = new Date(o.createdAt).getTime();
        const now = Date.now();
        if (dateFilter === "today") {
          const startOfToday = new Date().setHours(0, 0, 0, 0);
          if (itemDate < startOfToday) return false;
        } else if (dateFilter === "7days") {
          if (now - itemDate > 7 * 24 * 60 * 60 * 1000) return false;
        } else if (dateFilter === "30days") {
          if (now - itemDate > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      return true;
    });
  }, [orders, currentTab, searchTerm, statusFilter, bookingTypeFilter, dateFilter]);

  // Clean phone number for links
  const getCleanPhone = (phone: string) => phone.replace(/[^\d+]/g, "");

  // Format currency
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Generate pre-filled Zalo response template
  const getZaloTemplate = (order: OrderItem) => {
    const isSampler = isSamplerItem(order);
    if (isSampler) {
      return `Chào anh/chị ${order.customerName}, em là Linh Hồ (LH Music Studio) đây ạ. Em đã nhận được đơn đặt mua [${order.itemSelected}] của anh/chị.\nEm gửi anh/chị thông tin thanh toán & link tải full bộ tiếng (kèm video hướng dẫn nạp vào Pad/DAW) nhé!`;
    }
    if (order.serviceType === "room") {
      return `Chào anh/chị ${order.customerName}, em là Linh Hồ (LH Music Studio). Em đã nhận được yêu cầu đặt lịch thuê phòng tập [${order.roomSelected || order.itemSelected}] ${order.hours ? `(${order.hours} giờ)` : ""}.\nEm liên hệ để xác nhận khung giờ tập với ban nhạc mình ạ!`;
    }
    if (order.serviceType === "course") {
      return `Chào bạn ${order.customerName}, mình là Linh Hồ (LH Music Studio). Mình đã nhận được thông tin đăng ký khoá học trống [${order.itemSelected}] của bạn.\nMình liên hệ trao đổi chi tiết ca học và xếp lịch kiểm tra trình độ trực tiếp tại phòng tập nhé!`;
    }
    return `Chào anh/chị ${order.customerName}, em là Linh Hồ (LH Music Studio). Em đã nhận được thông tin yêu cầu dịch vụ [${order.itemSelected}]. Em liên hệ gửi báo giá chi tiết và trao đổi với anh/chị ạ!`;
  };

  // Handle open view modal and set admin note
  const handleOpenDetail = (order: OrderItem) => {
    setViewingOrder(order);
    setAdminNoteInput(order.adminNotes || "");
    setNoteSavedSuccess(false);
    setCopiedZaloMsg(false);
  };

  // Save Admin Note via PUT /api/orders
  const handleSaveAdminNote = async () => {
    if (!viewingOrder) return;
    try {
      setIsSavingNote(true);
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: viewingOrder.id,
          adminNotes: adminNoteInput,
        }),
      });
      if (res.ok) {
        setNoteSavedSuccess(true);
        setViewingOrder((prev) => (prev ? { ...prev, adminNotes: adminNoteInput } : prev));
        onRefresh();
        setTimeout(() => setNoteSavedSuccess(false), 2500);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi lưu ghi chú.");
    } finally {
      setIsSavingNote(false);
    }
  };

  // Copy Zalo message template to clipboard
  const handleCopyZaloMessage = (order: OrderItem) => {
    const text = getZaloTemplate(order);
    navigator.clipboard.writeText(text);
    setCopiedZaloMsg(true);
    setTimeout(() => setCopiedZaloMsg(false), 3000);
  };

  // Copy quick order summary
  const handleCopySummary = (order: OrderItem) => {
    const summary = `[LH STUDIO] Khách: ${order.customerName} - SĐT: ${order.phone} - Dịch vụ: ${order.itemSelected} (${order.status.toUpperCase()})`;
    navigator.clipboard.writeText(summary);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  // Export orders to Excel-compatible CSV file (UTF-8 with BOM)
  const handleExportCSV = () => {
    if (filteredList.length === 0) {
      alert("Không có dữ liệu để xuất file!");
      return;
    }

    const headers = [
      "Mã đơn/lịch",
      "Thời gian tạo",
      "Phân loại",
      "Khách hàng",
      "Số điện thoại",
      "Email",
      "Sản phẩm / Dịch vụ",
      "Phòng / Khóa học / DAW",
      "Số giờ",
      "Trạng thái",
      "Nội dung khách gửi",
      "Ghi chú nội bộ Admin",
    ];

    const rows = filteredList.map((o) => {
      const isSampler = isSamplerItem(o);
      const typeLabel = isSampler
        ? "Đơn Sampler"
        : o.serviceType === "room"
        ? "Thuê phòng tập"
        : o.serviceType === "course"
        ? "Khoá học trống"
        : "Dịch vụ Show / Khác";

      const statusLabel =
        o.status === "new"
          ? "Mới (Chờ xử lý)"
          : o.status === "processing"
          ? "Đang xử lý / Chốt lịch"
          : o.status === "completed"
          ? "Hoàn tất"
          : "Đã huỷ";

      const detailInfo = o.roomSelected || o.software || o.deviceModel || "";

      return [
        `"${o.id}"`,
        `"${new Date(o.createdAt).toLocaleString("vi-VN")}"`,
        `"${typeLabel}"`,
        `"${(o.customerName || "").replace(/"/g, '""')}"`,
        `"${o.phone}"`,
        `"${o.email || ""}"`,
        `"${(o.itemSelected || "").replace(/"/g, '""')}"`,
        `"${detailInfo.replace(/"/g, '""')}"`,
        `"${o.hours ? o.hours + ' giờ' : ''}"`,
        `"${statusLabel}"`,
        `"${(o.message || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${(o.adminNotes || "").replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().split("T")[0];
    const prefix = currentTab === "sampler" ? "Don_Sampler" : currentTab === "booking" ? "Dat_Lich" : "Tat_Ca_Don";
    link.setAttribute("href", url);
    link.setAttribute("download", `LH_Studio_${prefix}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Create Manual Order / Booking Modal
  const handleOpenCreateModal = (type: "sampler" | "room" | "course" | "event_band") => {
    setNewOrderType(type);
    setNewCustomerName("");
    setNewPhone("");
    setNewEmail("");
    setNewMessage("");
    setNewAdminNotes("");

    if (type === "sampler") {
      setNewItemSelected(kits[0]?.name || "Bộ Tiếng Đánh Show Tiệc & Sự Kiện (SPD-30)");
      setNewSoftware("Ableton Live / Sound Gốc");
      setNewPrice(kits[0]?.price || 450000);
    } else if (type === "room") {
      setNewRoomSelected(rooms[0]?.name || "Phòng A (Phòng Acoustic & Band nhỏ)");
      setNewItemSelected(rooms[0]?.name || "Thuê phòng tập Band");
      setNewHours(2);
      setNewPrice((rooms[0]?.pricePerHour || 120000) * 2);
    } else if (type === "course") {
      setNewItemSelected(courses[0]?.title || "Khoá học Người mới");
      setNewPrice(courses[0]?.priceNumber || 300000);
    } else {
      setNewItemSelected(services[0]?.title || "Cho Thuê Band Nhạc Acoustic");
      setNewPrice(services[0]?.priceNumber || 0);
    }

    setIsCreateModalOpen(true);
  };

  // Submit manual creation
  const handleSubmitNewOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newPhone.trim()) {
      alert("Vui lòng nhập họ tên và số điện thoại khách hàng!");
      return;
    }

    try {
      setIsSubmittingNew(true);
      const payload: Partial<OrderItem> = {
        customerName: newCustomerName.trim(),
        phone: newPhone.trim(),
        email: newEmail.trim() || undefined,
        serviceType: newOrderType,
        itemSelected: newItemSelected.trim(),
        price: newPrice ? Number(newPrice) : undefined,
        software: newOrderType === "sampler" ? newSoftware.trim() : undefined,
        deviceModel: newOrderType === "sampler" ? newDeviceModel.trim() : undefined,
        hours: newOrderType === "room" ? Number(newHours) : undefined,
        roomSelected: newOrderType === "room" ? newRoomSelected.trim() : undefined,
        bookingDate: newBookingDate.trim() || undefined,
        bookingTime: newBookingTime.trim() || undefined,
        message: newMessage.trim() || "Tạo thủ công bởi Admin",
        adminNotes: newAdminNotes.trim(),
        status: "processing", // Newly created manual orders are usually in progress
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        onRefresh();
      } else {
        alert("Lỗi khi thêm đơn hàng/lịch mới!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối máy chủ.");
    } finally {
      setIsSubmittingNew(false);
    }
  };

  return (
    <div className="space-y-7 animate-fade-in max-w-7xl">
      {/* 1. Header & Primary Management Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-7 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-condensed font-extrabold text-3xl sm:text-4xl text-[var(--text)] tracking-tight">
              Quản lý Đơn hàng &amp; Lịch đặt
            </h2>
            {metrics.totalNew > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-500 border border-red-500/30 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {metrics.totalNew} yêu cầu mới
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--muted)] mt-1">
            Hệ thống phân chia độc lập giữa Đơn mua Bộ Sampler và Lịch đặt Phòng tập / Khóa học / Show
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Quick Refresh */}
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--brass)] text-xs sm:text-sm font-semibold transition-all hover:bg-[var(--chip)]"
            title="Xuất file danh sách đang lọc ra định dạng CSV mở được trong Excel"
          >
            <Download className="w-4 h-4 text-[var(--brass)]" />
            <span>Xuất Excel (CSV)</span>
          </button>

          {/* Manual Create Button */}
          <div className="relative group">
            <button
              onClick={() => handleOpenCreateModal(currentTab === "sampler" ? "sampler" : "room")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tạo đơn / Lịch mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric Cards (Overview Breakdown) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Sampler Orders */}
        <div
          onClick={() => setCurrentTab("sampler")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm relative overflow-hidden group ${
            currentTab === "sampler"
              ? "bg-[var(--surface)] border-[var(--brass)] ring-1 ring-[var(--brass)]/30"
              : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--brass)]/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-[var(--brass)]/10 text-[var(--brass)]">
                <Package className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] block">
                  Đơn Mua Sampler
                </span>
                <span className="font-condensed font-extrabold text-3xl text-[var(--text)]">
                  {metrics.samplerTotal}
                </span>
              </div>
            </div>
            {metrics.samplerNew > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm animate-pulse">
                {metrics.samplerNew} đơn mới
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Đã xử lý hết
              </span>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Hoàn tất: <strong className="text-[var(--text)]">{metrics.samplerCompleted}</strong></span>
            <span>Doanh thu ước tính: <strong className="text-[var(--brass)]">{formatMoney(metrics.samplerRevenue)}</strong></span>
          </div>
        </div>

        {/* Card 2: Bookings (Rooms, Courses, Shows) */}
        <div
          onClick={() => setCurrentTab("booking")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer shadow-sm relative overflow-hidden group ${
            currentTab === "booking"
              ? "bg-[var(--surface)] border-[var(--brass)] ring-1 ring-[var(--brass)]/30"
              : "bg-[var(--surface)] border-[var(--line)] hover:border-[var(--brass)]/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400">
                <Calendar className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] block">
                  Lịch Đặt Phòng &amp; Dịch Vụ
                </span>
                <span className="font-condensed font-extrabold text-3xl text-[var(--text)]">
                  {metrics.bookingTotal}
                </span>
              </div>
            </div>
            {metrics.bookingNew > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500 text-white shadow-sm animate-pulse">
                {metrics.bookingNew} lịch mới
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Đã chốt lịch
              </span>
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Phòng: <strong className="text-[var(--text)]">{metrics.roomCount}</strong></span>
            <span>Học viên: <strong className="text-[var(--text)]">{metrics.courseCount}</strong></span>
            <span>Show/Tiệc: <strong className="text-[var(--text)]">{metrics.showCount}</strong></span>
          </div>
        </div>

        {/* Card 3: Action Needed / Pending Alert */}
        <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--line)] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400">
                <AlertCircle className="w-5 h-5" />
              </span>
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] block">
                  Cần Phản Hồi Ngay
                </span>
                <span className="font-condensed font-extrabold text-3xl text-amber-400">
                  {metrics.totalNew}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setStatusFilter("new");
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              Lọc đơn mới →
            </button>
          </div>
          <p className="mt-4 pt-3 border-t border-[var(--line)] text-xs text-[var(--muted)] leading-relaxed">
            Ưu tiên gọi điện hoặc gửi link Zalo cho khách mới trong vòng 15 phút để chốt lịch &amp; đơn nhanh nhất.
          </p>
        </div>
      </div>

      {/* 3. Sub-Navigation Tabs: Sampler vs Booking vs All */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[var(--line)] pb-2">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-none py-1">
          {/* Tab 1: Đơn Sampler */}
          <button
            onClick={() => {
              setCurrentTab("sampler");
              setBookingTypeFilter("all");
            }}
            className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-condensed font-bold text-base transition-all whitespace-nowrap ${
              currentTab === "sampler"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-md shadow-[var(--brass)]/20"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] border border-[var(--line)]"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Đơn Mua Sampler &amp; Sound Packs</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                currentTab === "sampler"
                  ? "bg-[#1e1715] text-[var(--brass)]"
                  : "bg-[var(--chip)] text-[var(--text)]"
              }`}
            >
              {metrics.samplerTotal}
            </span>
            {metrics.samplerNew > 0 && currentTab !== "sampler" && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {/* Tab 2: Lịch Đặt Chỗ & Đào Tạo */}
          <button
            onClick={() => {
              setCurrentTab("booking");
            }}
            className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl font-condensed font-bold text-base transition-all whitespace-nowrap ${
              currentTab === "booking"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-md shadow-[var(--brass)]/20"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] border border-[var(--line)]"
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Lịch Đặt Phòng &amp; Học Trống &amp; Show</span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                currentTab === "booking"
                  ? "bg-[#1e1715] text-[var(--brass)]"
                  : "bg-[var(--chip)] text-[var(--text)]"
              }`}
            >
              {metrics.bookingTotal}
            </span>
            {metrics.bookingNew > 0 && currentTab !== "booking" && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            )}
          </button>

          {/* Tab 3: Tất Cả */}
          <button
            onClick={() => setCurrentTab("all")}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-2xl font-condensed font-bold text-base transition-all whitespace-nowrap ${
              currentTab === "all"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-md shadow-[var(--brass)]/20"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] border border-[var(--line)]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tất cả ({metrics.totalOrders})</span>
          </button>
        </div>

        <div className="text-xs font-mono text-[var(--muted)] self-end sm:self-center">
          Hiển thị: <strong className="text-[var(--text)]">{filteredList.length}</strong> / {orders.length} mục
        </div>
      </div>

      {/* 4. Intelligent Filters & Search Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 sm:p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder={
              currentTab === "sampler"
                ? "Tìm theo tên khách, SĐT, bộ tiếng, DAW..."
                : currentTab === "booking"
                ? "Tìm theo tên khách/ban nhạc, phòng tập, khóa học..."
                : "Tìm kiếm toàn bộ đơn hàng & lịch hẹn..."
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs sm:text-sm outline-none focus:border-[var(--brass)] transition-colors"
          />
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs sm:text-sm outline-none focus:border-[var(--brass)] font-medium cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="new">🔴 Mới (Chưa xử lý)</option>
            <option value="processing">🟡 Đang xử lý / Chốt lịch</option>
            <option value="completed">🟢 Hoàn tất</option>
            <option value="cancelled">⚪ Đã huỷ</option>
          </select>
        </div>

        {/* Sub-type filter for Bookings */}
        {currentTab === "booking" && (
          <div className="flex items-center gap-1.5">
            <select
              value={bookingTypeFilter}
              onChange={(e) => setBookingTypeFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs sm:text-sm outline-none focus:border-[var(--brass)] font-medium cursor-pointer"
            >
              <option value="all">Tất cả loại lịch</option>
              <option value="room">🥁 Thuê phòng tập Band</option>
              <option value="course">🎓 Đăng ký học trống</option>
              <option value="event_band">🎸 Cho thuê Band &amp; Tiệc</option>
            </select>
          </div>
        )}

        {/* Date Filter */}
        <div className="flex items-center gap-1.5">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs sm:text-sm outline-none focus:border-[var(--brass)] font-medium cursor-pointer"
          >
            <option value="all">Toàn bộ thời gian</option>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
          </select>
        </div>

        {/* Clear Filters */}
        {(searchTerm || statusFilter !== "all" || bookingTypeFilter !== "all" || dateFilter !== "all") && (
          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setBookingTypeFilter("all");
              setDateFilter("all");
            }}
            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            Xoá bộ lọc
          </button>
        )}
      </div>

      {/* 5. Custom Tailored Table Content */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-sm">
        {filteredList.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="ibox w-14 h-14 rounded-2xl mx-auto text-[var(--muted)]">
              {currentTab === "sampler" ? <Package className="w-7 h-7" /> : <Calendar className="w-7 h-7" />}
            </div>
            <div className="font-condensed font-bold text-xl text-[var(--text)]">
              Không tìm thấy {currentTab === "sampler" ? "đơn mua sampler" : currentTab === "booking" ? "lịch hẹn" : "yêu cầu"} nào
            </div>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc chuyển bộ lọc sang &quot;Tất cả trạng thái&quot;.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setBookingTypeFilter("all");
                setDateFilter("all");
              }}
              className="mt-2 px-4 py-2 rounded-xl text-xs font-bold border border-[var(--brass)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-colors"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[var(--chip)] text-xs font-bold uppercase tracking-wider text-[var(--muted)] border-b border-[var(--line)]">
                <tr>
                  <th className="px-5 py-4">Mã &amp; Thời gian</th>
                  <th className="px-5 py-4">Khách hàng &amp; Liên hệ</th>
                  {currentTab === "sampler" ? (
                    <>
                      <th className="px-5 py-4">Bộ Tiếng &amp; Định dạng</th>
                      <th className="px-5 py-4">Thiết bị &amp; DAW</th>
                    </>
                  ) : currentTab === "booking" ? (
                    <>
                      <th className="px-5 py-4">Dịch vụ &amp; Phòng / Khóa</th>
                      <th className="px-5 py-4">Chi tiết lịch &amp; Yêu cầu</th>
                    </>
                  ) : (
                    <>
                      <th className="px-5 py-4">Phân loại &amp; Dịch vụ</th>
                      <th className="px-5 py-4">Chi tiết yêu cầu</th>
                    </>
                  )}
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredList.map((order) => {
                  const isSampler = isSamplerItem(order);
                  const cleanPhone = getCleanPhone(order.phone);

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-[var(--chip)]/60 transition-colors ${
                        order.status === "new" ? "bg-red-500/[0.03]" : ""
                      }`}
                    >
                      {/* 1. ID & Timestamp */}
                      <td className="px-5 py-4 align-top">
                        <div className="flex items-center gap-1.5">
                          {order.status === "new" && (
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                          )}
                          <span className="font-mono text-xs font-bold text-[var(--brass)]">
                            #{order.id.replace("ord-", "").slice(-6)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--muted)] font-mono mt-1">
                          {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] font-mono">
                          {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </td>

                      {/* 2. Customer & Contact */}
                      <td className="px-5 py-4 align-top">
                        <div className="font-bold text-sm text-[var(--text)] flex items-center gap-1.5">
                          <span>{order.customerName}</span>
                        </div>

                        {/* Phone & Zalo */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <a
                            href={`tel:${cleanPhone}`}
                            className="font-mono text-xs font-bold text-[var(--brass)] hover:underline flex items-center gap-1"
                            title="Gọi điện trực tiếp"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>{order.phone}</span>
                          </a>

                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded bg-[#0068ff]/10 text-[#0068ff] hover:bg-[#0068ff] hover:text-white transition-colors"
                            title="Mở chat Zalo với khách"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleCopySummary(order)}
                            className="p-1 rounded text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
                            title="Sao chép tóm tắt đơn"
                          >
                            {copiedOrderId === order.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Email */}
                        {order.email && (
                          <a
                            href={`mailto:${order.email}`}
                            className="font-mono text-[11px] text-[var(--muted)] hover:text-[var(--brass)] flex items-center gap-1 mt-1 truncate max-w-[190px]"
                            title={`Gửi mail cho ${order.email}`}
                          >
                            <Mail className="w-3 h-3 text-[var(--brass)] flex-shrink-0" />
                            <span className="truncate">{order.email}</span>
                          </a>
                        )}
                      </td>

                      {/* 3 & 4. Contextual Content Based on Tab */}
                      {currentTab === "sampler" ? (
                        <>
                          {/* Item & Price */}
                          <td className="px-5 py-4 align-top">
                            <div className="font-semibold text-xs text-[var(--text)] line-clamp-2">
                              {order.itemSelected}
                            </div>
                            {order.deliveryMethod && (
                              <span className="inline-block mt-1 text-[11px] text-[var(--muted)] font-mono">
                                Nhận qua: <strong className="text-[var(--text)]">{order.deliveryMethod}</strong>
                              </span>
                            )}
                          </td>

                          {/* Device & DAW */}
                          <td className="px-5 py-4 align-top">
                            {order.deviceModel ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-[var(--chip)] text-[var(--text)] border border-[var(--line)]">
                                {order.deviceModel}
                              </span>
                            ) : (
                              <span className="text-xs text-[var(--muted)]">Roland SPD-30 / SamplePad</span>
                            )}
                            {order.software && (
                              <div className="text-[11px] text-[var(--muted)] mt-1">
                                DAW: <span className="font-medium text-[var(--text)]">{order.software}</span>
                              </div>
                            )}
                          </td>
                        </>
                      ) : currentTab === "booking" ? (
                        <>
                          {/* Service Type & Room/Course */}
                          <td className="px-5 py-4 align-top">
                            <div className="flex items-center gap-1.5">
                              {order.serviceType === "room" ? (
                                <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                                  <Clock className="w-3.5 h-3.5" />
                                </span>
                              ) : order.serviceType === "course" ? (
                                <span className="p-1 rounded-md bg-amber-500/10 text-amber-400">
                                  <GraduationCap className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="p-1 rounded-md bg-purple-500/10 text-purple-400">
                                  <Music className="w-3.5 h-3.5" />
                                </span>
                              )}
                              <span className="font-bold text-xs text-[var(--text)]">
                                {order.itemSelected}
                              </span>
                            </div>

                            {order.roomSelected && order.roomSelected !== order.itemSelected && (
                              <div className="text-xs text-[var(--brass)] mt-1 font-medium">
                                {order.roomSelected}
                              </div>
                            )}
                          </td>

                          {/* Booking Details & Message */}
                          <td className="px-5 py-4 align-top max-w-xs">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {order.hours && (
                                <span className="px-2 py-0.5 rounded-md bg-[var(--chip)] font-bold text-[var(--brass)] border border-[var(--line)]">
                                  {order.hours} giờ tập
                                </span>
                              )}
                              {order.bookingDate && (
                                <span className="text-[var(--muted)] font-mono text-[11px]">
                                  {order.bookingDate} {order.bookingTime ? `@ ${order.bookingTime}` : ""}
                                </span>
                              )}
                            </div>

                            {order.message && (
                              <div className="mt-1.5 text-xs text-[var(--muted)] line-clamp-2 italic bg-[var(--bg)] p-1.5 rounded-lg border border-[var(--line)]">
                                &quot;{order.message}&quot;
                              </div>
                            )}

                            {order.adminNotes && (
                              <div className="mt-1 text-[11px] text-amber-400 flex items-center gap-1">
                                <Edit3 className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">Ghi chú: {order.adminNotes}</span>
                              </div>
                            )}
                          </td>
                        </>
                      ) : (
                        <>
                          {/* All view */}
                          <td className="px-5 py-4 align-top">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold uppercase ${
                                isSampler
                                  ? "bg-[var(--brass)]/15 text-[var(--brass)]"
                                  : "bg-cyan-500/15 text-cyan-400"
                              }`}
                            >
                              {isSampler ? "Đơn Sampler" : "Lịch dịch vụ"}
                            </span>
                            <div className="font-bold text-xs text-[var(--text)] mt-1">
                              {order.itemSelected}
                            </div>
                          </td>
                          <td className="px-5 py-4 align-top max-w-xs text-xs text-[var(--muted)] line-clamp-2">
                            {order.message || (order.hours ? `${order.hours} giờ` : "Không có ghi chú")}
                          </td>
                        </>
                      )}

                      {/* 5. Status Workflow Select */}
                      <td className="px-5 py-4 align-top">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            onUpdateStatus(order.id, e.target.value as OrderItem["status"])
                          }
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer transition-colors shadow-sm ${
                            order.status === "new"
                              ? "bg-red-500/15 text-red-500 border-red-500/40"
                              : order.status === "processing"
                              ? "bg-amber-500/15 text-amber-400 border-amber-500/40"
                              : order.status === "completed"
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                              : "bg-gray-500/15 text-gray-400 border-gray-500/40"
                          }`}
                        >
                          <option value="new" className="bg-[#1e1715] text-red-400">
                            🔴 Mới (Chờ xử lý)
                          </option>
                          <option value="processing" className="bg-[#1e1715] text-amber-400">
                            🟡 {isSampler ? "Đang gửi file / Hỗ trợ" : "Đã chốt lịch / Đang hẹn"}
                          </option>
                          <option value="completed" className="bg-[#1e1715] text-emerald-400">
                            🟢 {isSampler ? "Đã gửi file & Hoàn tất" : "Đã hoàn thành"}
                          </option>
                          <option value="cancelled" className="bg-[#1e1715] text-gray-400">
                            ⚪ Đã huỷ
                          </option>
                        </select>
                      </td>

                      {/* 6. Row Actions */}
                      <td className="px-5 py-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Zalo Quick Button with Template */}
                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-[#0068ff]/10 text-[#0068ff] hover:bg-[#0068ff] hover:text-white transition-all shadow-sm"
                            title="Mở Zalo nhắn khách"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          {/* View Detail Modal & Admin Notes */}
                          <button
                            onClick={() => handleOpenDetail(order)}
                            className="p-2 rounded-xl text-[var(--text)] bg-[var(--chip)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-all shadow-sm"
                            title="Xem chi tiết & Ghi chú quản trị"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Order */}
                          <button
                            onClick={() => onDeleteOrder(order.id)}
                            className="p-2 rounded-xl text-red-400 hover:text-white hover:bg-red-500 transition-colors"
                            title="Xoá đơn này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Modal View Order Detail & Admin Notes */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-[var(--line)] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                      isSamplerItem(viewingOrder)
                        ? "bg-[var(--brass)]/15 text-[var(--brass)]"
                        : "bg-cyan-500/15 text-cyan-400"
                    }`}
                  >
                    {isSamplerItem(viewingOrder) ? "📦 Đơn Mua Sampler" : "📅 Lịch Đặt Dịch Vụ"}
                  </span>
                  <span className="font-mono text-xs text-[var(--muted)]">
                    #{viewingOrder.id}
                  </span>
                </div>
                <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                  {viewingOrder.customerName} – {viewingOrder.itemSelected}
                </h3>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Contact Bar */}
            <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--line)]">
              <a
                href={`tel:${getCleanPhone(viewingOrder.phone)}`}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[var(--chip)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>Gọi: {viewingOrder.phone}</span>
              </a>

              <a
                href={`https://zalo.me/${getCleanPhone(viewingOrder.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#0068ff] text-white hover:bg-[#0055d4] transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Mở chat Zalo</span>
              </a>

              {viewingOrder.email && (
                <a
                  href={`mailto:${viewingOrder.email}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text)] hover:text-[var(--brass)] hover:bg-[var(--chip)] transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>{viewingOrder.email}</span>
                </a>
              )}

              <button
                onClick={() => handleCopyZaloMessage(viewingOrder)}
                className="inline-flex items-center gap-1.5 ml-auto px-3 py-2 rounded-xl text-xs font-semibold border border-[var(--line-strong)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
                title="Sao chép tin nhắn Zalo soạn sẵn"
              >
                {copiedZaloMsg ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Đã chép tin nhắn Zalo!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Chép tin nhắn mẫu</span>
                  </>
                )}
              </button>
            </div>

            {/* Order/Booking Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] block">
                  Thông tin khách hàng
                </span>
                <div className="text-base font-bold text-[var(--text)]">
                  {viewingOrder.customerName}
                </div>
                <div className="font-mono text-[var(--brass)]">
                  SĐT: {viewingOrder.phone}
                </div>
                {viewingOrder.email && (
                  <div className="font-mono text-[var(--muted)]">
                    Email: {viewingOrder.email}
                  </div>
                )}
                <div className="text-[11px] text-[var(--muted)] font-mono pt-1">
                  Gửi lúc: {new Date(viewingOrder.createdAt).toLocaleString("vi-VN")}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
                <span className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] block">
                  Chi tiết dịch vụ / Gói
                </span>
                <div className="text-base font-bold text-[var(--text)]">
                  {viewingOrder.itemSelected}
                </div>
                {viewingOrder.roomSelected && (
                  <div className="text-xs text-[var(--brass)]">
                    Phòng: <strong>{viewingOrder.roomSelected}</strong>
                  </div>
                )}
                {viewingOrder.hours && (
                  <div className="text-xs text-[var(--muted)]">
                    Thời lượng thuê: <strong>{viewingOrder.hours} giờ</strong>
                  </div>
                )}
                {viewingOrder.software && (
                  <div className="text-xs text-[var(--muted)]">
                    DAW: <strong>{viewingOrder.software}</strong>
                  </div>
                )}
                {viewingOrder.deviceModel && (
                  <div className="text-xs text-[var(--muted)]">
                    Thiết bị: <strong>{viewingOrder.deviceModel}</strong>
                  </div>
                )}
                {viewingOrder.deliveryMethod && (
                  <div className="text-xs text-[var(--muted)]">
                    Hình thức nhận file: <strong>{viewingOrder.deliveryMethod}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Message */}
            {viewingOrder.message && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block">
                  Tin nhắn khách gửi:
                </span>
                <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)] font-mono text-xs text-[var(--text)] whitespace-pre-wrap leading-relaxed">
                  {viewingOrder.message}
                </div>
              </div>
            )}

            {/* Admin Internal Notes (Ghi chú quản trị của Linh Hồ) */}
            <div className="space-y-2 pt-2 border-t border-[var(--line)]">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Ghi chú nội bộ Admin (Chỉ mình bạn thấy)</span>
                </span>
                {noteSavedSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã lưu ghi chú!
                  </span>
                )}
              </div>
              <textarea
                rows={2}
                placeholder="Ví dụ: Đã cọc 200k qua VCB, hẹn thứ 6 đến tập lúc 19h; hoặc Khách nhờ Teamviewer nạp sound..."
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--line-strong)] text-[var(--text)] text-xs sm:text-sm outline-none focus:border-[var(--brass)] transition-colors"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSavingNote}
                  onClick={handleSaveAdminNote}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-colors border border-[var(--line)]"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingNote ? "Đang lưu..." : "Lưu ghi chú nội bộ"}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4 border-t border-[var(--line)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[var(--muted)]">Trạng thái:</span>
                <select
                  value={viewingOrder.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as OrderItem["status"];
                    onUpdateStatus(viewingOrder.id, nextStatus);
                    setViewingOrder({ ...viewingOrder, status: nextStatus });
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)]"
                >
                  <option value="new">🔴 Mới</option>
                  <option value="processing">🟡 Đang xử lý / Đã hẹn</option>
                  <option value="completed">🟢 Hoàn tất</option>
                  <option value="cancelled">⚪ Đã huỷ</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteOrder(viewingOrder.id);
                    setViewingOrder(null);
                  }}
                  className="px-4 py-2.5 rounded-xl font-semibold text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Xoá yêu cầu này
                </button>
                <button
                  type="button"
                  onClick={() => setViewingOrder(null)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--line-strong)] transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Modal Create Manual Order or Booking */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <form
            onSubmit={handleSubmitNewOrder}
            className="w-full max-w-xl bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-[var(--line)] pb-4">
              <div>
                <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                  Tạo đơn hàng / Lịch hẹn mới thủ công
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Ghi nhận đơn khách nhắn Zalo, gọi điện thoại ngoài website
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block">
                Phân loại yêu cầu
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewOrderType("sampler");
                    setNewItemSelected(kits[0]?.name || "Bộ Tiếng Đánh Show Tiệc & Sự Kiện (SPD-30)");
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    newOrderType === "sampler"
                      ? "bg-[var(--brass)] text-[#1e1715] border-[var(--brass)] shadow-sm"
                      : "bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--text)]"
                  }`}
                >
                  📦 Sampler
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewOrderType("room");
                    setNewItemSelected(rooms[0]?.name || "Thuê phòng tập Band");
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    newOrderType === "room"
                      ? "bg-[var(--brass)] text-[#1e1715] border-[var(--brass)] shadow-sm"
                      : "bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--text)]"
                  }`}
                >
                  🥁 Thuê phòng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewOrderType("course");
                    setNewItemSelected(courses[0]?.title || "Khoá học Người mới");
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    newOrderType === "course"
                      ? "bg-[var(--brass)] text-[#1e1715] border-[var(--brass)] shadow-sm"
                      : "bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--text)]"
                  }`}
                >
                  🎓 Học trống
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewOrderType("event_band");
                    setNewItemSelected(services[0]?.title || "Cho Thuê Band Nhạc");
                  }}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-center border ${
                    newOrderType === "event_band"
                      ? "bg-[var(--brass)] text-[#1e1715] border-[var(--brass)] shadow-sm"
                      : "bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--text)]"
                  }`}
                >
                  🎸 Show/Tiệc
                </button>
              </div>
            </div>

            {/* Customer Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[var(--text)] block mb-1">
                  Họ tên khách hàng / Tên Band *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Anh Tuấn / Band 99"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--text)] block mb-1">
                  Số điện thoại / Zalo *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0987654321"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)] font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[var(--text)] block mb-1">
                  Email (tùy chọn)
                </label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>
            </div>

            {/* Item & Specifications */}
            <div className="space-y-4 pt-2 border-t border-[var(--line)]">
              <div>
                <label className="text-xs font-bold text-[var(--text)] block mb-1">
                  {newOrderType === "sampler"
                    ? "Tên bộ Sampler đặt mua *"
                    : newOrderType === "room"
                    ? "Phòng tập cần thuê *"
                    : newOrderType === "course"
                    ? "Khóa học đăng ký *"
                    : "Dịch vụ cần thuê *"}
                </label>

                {newOrderType === "sampler" ? (
                  <select
                    value={newItemSelected}
                    onChange={(e) => setNewItemSelected(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  >
                    {kits.map((k) => (
                      <option key={k.id} value={k.name}>
                        {k.name} – {formatMoney(k.price)}
                      </option>
                    ))}
                    <option value="Combo All-In-One 50 Kits SPD-30">
                      Combo All-In-One 50 Kits SPD-30 (850.000đ)
                    </option>
                    <option value="Custom Kit theo yêu cầu">Custom Kit theo yêu cầu</option>
                  </select>
                ) : newOrderType === "room" ? (
                  <select
                    value={newItemSelected}
                    onChange={(e) => {
                      setNewItemSelected(e.target.value);
                      setNewRoomSelected(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.name}>
                        {r.name} ({r.capacity}) – {formatMoney(r.pricePerHour)}/giờ
                      </option>
                    ))}
                  </select>
                ) : newOrderType === "course" ? (
                  <select
                    value={newItemSelected}
                    onChange={(e) => setNewItemSelected(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title} ({c.price})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newItemSelected}
                    onChange={(e) => setNewItemSelected(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                )}
              </div>

              {/* Dynamic inputs based on type */}
              {newOrderType === "sampler" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text)] block mb-1">
                      Thiết bị dùng
                    </label>
                    <select
                      value={newDeviceModel}
                      onChange={(e) => setNewDeviceModel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs outline-none"
                    >
                      <option value="Roland SPD-30 (Octapad)">Roland SPD-30 (Octapad)</option>
                      <option value="Roland SPD-SX">Roland SPD-SX</option>
                      <option value="Roland SPD-SX PRO">Roland SPD-SX PRO</option>
                      <option value="NUX DP-2000">NUX DP-2000</option>
                      <option value="Avatar HXW">Avatar HXW</option>
                      <option value="Ableton / FL Studio (DAW)">Ableton / FL Studio (DAW)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text)] block mb-1">
                      Giá tiền (VNĐ)
                    </label>
                    <input
                      type="number"
                      placeholder="450000"
                      value={newPrice || ""}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs outline-none font-mono"
                    />
                  </div>
                </div>
              ) : newOrderType === "room" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[var(--text)] block mb-1">
                      Số giờ thuê
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={12}
                      value={newHours}
                      onChange={(e) => setNewHours(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text)] block mb-1">
                      Ngày tập
                    </label>
                    <input
                      type="date"
                      value={newBookingDate}
                      onChange={(e) => setNewBookingDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[var(--text)] block mb-1">
                      Khung giờ (VD: 18h - 20h)
                    </label>
                    <input
                      type="text"
                      placeholder="18h00 - 20h00"
                      value={newBookingTime}
                      onChange={(e) => setNewBookingTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs outline-none"
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="text-xs font-bold text-[var(--text)] block mb-1">
                  Ghi chú yêu cầu của khách
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú thêm từ khách (cần thêm mic, nhạc cụ mang theo, v.v.)..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-amber-400 block mb-1">
                  Ghi chú nội bộ Admin
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Đã nhận cọc 200k, khách quen"
                  value={newAdminNotes}
                  onChange={(e) => setNewAdminNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-xs outline-none focus:border-[var(--brass)]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs border border-[var(--line-strong)] text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={isSubmittingNew}
                className="px-6 py-2.5 rounded-xl font-bold text-xs bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
              >
                {isSubmittingNew ? "Đang lưu..." : "Lưu vào hệ thống"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
