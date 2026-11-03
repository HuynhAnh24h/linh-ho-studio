"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SiteData, OrderItem, ProfileData } from "@/lib/types";
import {
  LayoutDashboard,
  User,
  GraduationCap,
  Clock,
  Headphones,
  ShoppingBag,
  Image as ImageIcon,
  ExternalLink,
  RotateCcw,
  LogOut,
  Menu,
  X,
  Database,
  Users,
  Music,
  Bell,
  Radio,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { AdminCourses } from "@/components/admin/AdminCourses";
import { AdminStudents } from "@/components/admin/AdminStudents";
import { AdminRooms } from "@/components/admin/AdminRooms";
import { AdminServices } from "@/components/admin/AdminServices";
import { AdminKits } from "@/components/admin/AdminKits";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminMedia } from "@/components/admin/AdminMedia";
import { getSocket } from "@/lib/socket-client";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [data, setData] = useState<SiteData | null>(null);
  const [isNeon, setIsNeon] = useState<boolean>(false);
  const [neonError, setNeonError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Real-time Socket.IO state
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(false);
  const [activeVisitors, setActiveVisitors] = useState<number>(1);
  const [liveToast, setLiveToast] = useState<{
    id: string;
    title: string;
    message: string;
    order?: OrderItem;
  } | null>(null);

  // Check auth session
  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
    // Set admin page to dark theme
    document.documentElement.setAttribute("data-theme", "dark");
  }, []);

  // Fetch full data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/data?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json._system?.isNeon !== undefined) {
          setIsNeon(json._system.isNeon && !json._system.neonError);
        }
        setNeonError(json._system?.neonError || null);
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Audio chime for new notifications
  const playChime = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.15); // A5
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } catch (e) {
      console.warn("Chime audio error:", e);
    }
  }, []);

  // Socket.IO real-time event listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    const socket = getSocket();
    if (!socket || !socket.on) return;

    if (socket.connected) {
      setIsSocketConnected(true);
    }

    const onConnect = () => {
      setIsSocketConnected(true);
    };

    const onDisconnect = () => {
      setIsSocketConnected(false);
    };

    const onClientsCount = (cnt: number) => {
      setActiveVisitors(cnt);
    };

    const onNewOrder = (newOrder: OrderItem) => {
      playChime();
      setData((prev) => {
        if (!prev) return prev;
        const exists = prev.orders?.some((o) => o.id === newOrder.id);
        if (exists) return prev;
        return {
          ...prev,
          orders: [newOrder, ...(prev.orders || [])],
        };
      });

      setLiveToast({
        id: "toast-" + Date.now(),
        title: "🔔 Yêu cầu liên hệ / Đặt lịch mới!",
        message: `${newOrder.customerName} (${newOrder.phone}) vừa đặt: ${newOrder.itemSelected}`,
        order: newOrder,
      });

      setTimeout(() => {
        setLiveToast((current) => (current?.order?.id === newOrder.id ? null : current));
      }, 8000);
    };

    const onOrderUpdated = (updatedOrder: OrderItem) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orders: (prev.orders || []).map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
        };
      });
    };

    const onOrderDeleted = ({ id }: { id: string }) => {
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          orders: (prev.orders || []).filter((o) => o.id !== id),
        };
      });
    };

    const onDataUpdated = () => {
      fetchData();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("clients_count", onClientsCount);
    socket.on("new_order", onNewOrder);
    socket.on("order_updated", onOrderUpdated);
    socket.on("order_deleted", onOrderDeleted);
    socket.on("data_updated", onDataUpdated);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("clients_count", onClientsCount);
      socket.off("new_order", onNewOrder);
      socket.off("order_updated", onOrderUpdated);
      socket.off("order_deleted", onOrderDeleted);
      socket.off("data_updated", onDataUpdated);
    };
  }, [isAuthenticated, playChime, fetchData]);

  const handleLogout = () => {
    sessionStorage.removeItem("admin_auth");
    setIsAuthenticated(false);
  };

  const handleResetData = async () => {
    if (!confirm("Bạn có chắc chắn muốn khôi phục dữ liệu về ban đầu? Dữ liệu mẫu gốc sẽ được nạp lại.")) {
      return;
    }
    try {
      const res = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      if (res.ok) {
        alert("Đã khôi phục dữ liệu ban đầu thành công!");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (updatedProfile: ProfileData) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });
      if (res.ok) {
        fetchData();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderItem["status"]) => {
    try {
      await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, status }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá đơn này?")) return;
    try {
      await fetch(`/api/orders?id=${orderId}`, {
        method: "DELETE",
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  const tabs = [
    { id: "overview", label: "Tổng quan", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "profile", label: "Thông tin & Trang chủ", icon: <User className="w-4 h-4" /> },
    { id: "courses", label: "Khoá học dạy trống", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "students", label: "Hình ảnh học viên", icon: <Users className="w-4 h-4" /> },
    { id: "rooms", label: "Phòng tập & Thiết bị", icon: <Clock className="w-4 h-4" /> },
    { id: "services", label: "Dịch vụ Show & Tiệc", icon: <Music className="w-4 h-4" /> },
    { id: "kits", label: "Bộ Sampler trống", icon: <Headphones className="w-4 h-4" /> },
    {
      id: "orders",
      label: "Đơn hàng & Đặt lịch",
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: data?.orders.filter((o) => o.status === "new").length || 0,
    },
    { id: "media", label: "Thư viện Media", icon: <ImageIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--text)]">
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--line)]">
        <BrandLogo size="sm" />
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--chip)]"
        >
          {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-30 h-screen w-72 bg-[var(--surface)] border-r border-[var(--line)] flex flex-col justify-between p-5 transition-transform duration-200 ${
          isMobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-6">
          {/* Brand with Logo */}
          <div className="pt-2">
            <BrandLogo size="md" />
          </div>

          {/* Database status pill */}
          <div className="px-3 py-2 rounded-xl bg-[var(--chip)] border border-[var(--line)] flex items-center gap-2 text-xs">
            <Database className={`w-3.5 h-3.5 ${isNeon && !neonError ? "text-emerald-400" : "text-amber-400"}`} />
            <span className="font-semibold truncate">
              {isNeon && !neonError ? "Neon PostgreSQL" : neonError ? "Neon Hết Quota (402)" : "CSDL Cục bộ"}
            </span>
          </div>

          {/* Real-time Socket.IO status pill */}
          <div className="px-3 py-2 rounded-xl bg-[var(--chip)] border border-[var(--line)] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="relative flex h-2 w-2 flex-shrink-0">
                {isSocketConnected ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                )}
              </span>
              <span className="font-semibold truncate text-[11px]">
                {isSocketConnected ? "Realtime Socket.IO" : "Socket.IO Đang nối..."}
              </span>
            </div>
            {isSocketConnected && (
              <span className="font-mono text-[10px] text-[var(--brass)] bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--line)] flex-shrink-0" title="Tổng số thiết bị & client đang online">
                {activeVisitors} online
              </span>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileNavOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? "bg-[var(--brass)] text-[#1e1715] font-bold shadow-md"
                      : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </div>
                  {Boolean(tab.badge) && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? "bg-[#1e1715] text-[var(--brass)]" : "bg-red-500 text-white"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="space-y-2 pt-6 border-t border-[var(--line)]">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Xem trang web thật</span>
          </Link>

          <button
            onClick={handleResetData}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-amber-400 hover:bg-[var(--chip)] transition-colors text-left"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục dữ liệu gốc</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 pt-20 lg:pt-10 overflow-y-auto">
        {isLoading || !data ? (
          <div className="h-64 flex items-center justify-center text-sm font-semibold text-[var(--muted)]">
            Đang tải dữ liệu từ cơ sở dữ liệu...
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <AdminOverview
                data={data}
                isNeon={isNeon}
                neonError={neonError}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {activeTab === "profile" && (
              <AdminProfile profile={data.profile} onSaveProfile={handleSaveProfile} />
            )}

            {activeTab === "courses" && (
              <AdminCourses courses={data.courses} onRefresh={fetchData} />
            )}

            {activeTab === "students" && (
              <AdminStudents students={data.studentImages || []} onRefresh={fetchData} />
            )}

            {activeTab === "rooms" && (
              <AdminRooms
                rooms={data.rooms}
                roomPerks={data.roomPerks}
                roomImages={data.roomImages || []}
                onRefresh={fetchData}
              />
            )}

            {activeTab === "services" && (
              <AdminServices services={data.eventServices || []} onRefresh={fetchData} />
            )}

            {activeTab === "kits" && (
              <AdminKits
                kits={data.kits}
                comboOffer={data.comboOffer}
                onRefresh={fetchData}
              />
            )}

            {activeTab === "orders" && (
              <AdminOrders
                orders={data.orders}
                kits={data.kits}
                rooms={data.rooms}
                courses={data.courses}
                services={data.eventServices || []}
                onRefresh={fetchData}
                onUpdateStatus={handleUpdateOrderStatus}
                onDeleteOrder={handleDeleteOrder}
              />
            )}

            {activeTab === "media" && (
              <AdminMedia media={data.media} onRefresh={fetchData} />
            )}
          </>
        )}
      </main>

      {/* Real-time Socket.IO Floating Toast Notification */}
      {liveToast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-fade-in p-4 rounded-2xl bg-[#1e1715]/95 border-2 border-[var(--brass)] shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                <h4 className="font-condensed font-extrabold text-base text-[var(--brass)] uppercase">
                  {liveToast.title}
                </h4>
              </div>
              <p className="text-xs text-white leading-relaxed font-medium">
                {liveToast.message}
              </p>
            </div>
            <button
              onClick={() => setLiveToast(null)}
              className="text-[var(--muted)] hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-mono text-[var(--muted)]">
              Vừa tức thì qua Socket.IO
            </span>
            <button
              onClick={() => {
                setActiveTab("orders");
                setLiveToast(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-[var(--brass)] text-[#1e1715] font-bold text-xs hover:bg-amber-300 transition-colors shadow-sm"
            >
              Xem đơn hàng ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
