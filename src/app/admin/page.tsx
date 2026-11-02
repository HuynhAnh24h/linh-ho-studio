"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SiteData, OrderItem, ProfileData } from "@/lib/types";
import {
  Drum,
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
} from "lucide-react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { AdminCourses } from "@/components/admin/AdminCourses";
import { AdminRooms } from "@/components/admin/AdminRooms";
import { AdminKits } from "@/components/admin/AdminKits";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminMedia } from "@/components/admin/AdminMedia";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [data, setData] = useState<SiteData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Check auth session
  useEffect(() => {
    const auth = sessionStorage.getItem("admin_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch full data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/data");
      if (res.ok) {
        const json: SiteData = await res.json();
        setData(json);
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
    if (!confirm("Bạn có chắc chắn muốn xoá đơn hàng này?")) return;
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
    { id: "rooms", label: "Phòng tập band", icon: <Clock className="w-4 h-4" /> },
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
        <div className="flex items-center gap-2 font-condensed font-bold text-xl text-[var(--text)]">
          <span className="ibox w-8 h-8 rounded-lg">
            <Drum className="w-4 h-4" />
          </span>
          <span>ADMIN PANEL</span>
        </div>
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
          {/* Brand */}
          <div className="flex items-center gap-3 pt-2">
            <span className="ibox w-10 h-10 rounded-xl">
              <Drum className="w-5 h-5 text-[var(--brass)]" />
            </span>
            <div>
              <h1 className="font-condensed font-extrabold text-2xl tracking-wide text-[var(--text)] leading-none">
                DRUMMER ADMIN
              </h1>
              <span className="text-[11px] font-bold text-[var(--brass)] uppercase tracking-wider">
                Hệ thống quản trị
              </span>
            </div>
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
                      ? "bg-[var(--brass)] text-[#1a1405] font-bold shadow-sm"
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
                        isActive ? "bg-[#1a1405] text-[var(--brass)]" : "bg-red-500 text-white"
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
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--muted)] hover:text-amber-500 hover:bg-[var(--chip)] transition-colors text-left"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục dữ liệu gốc</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors text-left"
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
            Đang tải dữ liệu hệ thống...
          </div>
        ) : (
          <>
            {activeTab === "overview" && (
              <AdminOverview
                data={data}
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

            {activeTab === "rooms" && (
              <AdminRooms
                rooms={data.rooms}
                roomPerks={data.roomPerks}
                onRefresh={fetchData}
              />
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
    </div>
  );
}
