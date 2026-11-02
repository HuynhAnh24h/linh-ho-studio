"use client";

import React, { useState } from "react";
import { RoomItem, RoomPerk, RoomImageItem, ProfileData } from "@/lib/types";
import { Clock, Drum, Speaker, Mic, Snowflake, Percent, CalendarCheck, Send, Check, AlertCircle, Sparkles, MessageCircle } from "lucide-react";

interface PhongTapClientProps {
  rooms: RoomItem[];
  roomPerks: RoomPerk[];
  roomImages: RoomImageItem[];
  profile: ProfileData;
}

export function PhongTapClient({ rooms, roomPerks, roomImages, profile }: PhongTapClientProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || "");
  const [hours, setHours] = useState<number>(2);

  // Booking Form State
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case "drum":
        return <Drum className="w-5 h-5 text-[var(--brass)]" />;
      case "speaker":
        return <Speaker className="w-5 h-5 text-[var(--brass)]" />;
      case "mic":
        return <Mic className="w-5 h-5 text-[var(--brass)]" />;
      case "snowflake":
        return <Snowflake className="w-5 h-5 text-[var(--brass)]" />;
      case "percent":
        return <Percent className="w-5 h-5 text-[var(--brass)]" />;
      default:
        return <Clock className="w-5 h-5 text-[var(--brass)]" />;
    }
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    let t = selectedRoom.pricePerHour * hours;
    if (hours >= 4) {
      t = t * 0.9;
    }
    return Math.round(t);
  };

  const isDiscounted = hours >= 4;
  const totalAmount = calculateTotal();

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setFeedback({ type: "error", text: "Vui lòng nhập số điện thoại hoặc Zalo." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const message = `Đặt phòng: ${selectedRoom?.name} (${hours} giờ - ${totalAmount.toLocaleString("vi-VN")}đ).
Thời gian mong muốn: ${bookingTime || "Linh hoạt"}.
Ghi chú: ${notes || "Không"}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || "Khách đặt phòng",
          phone: phone.trim(),
          serviceType: "room",
          itemSelected: `${selectedRoom?.name} (${hours} giờ)`,
          hours,
          roomSelected: selectedRoom?.name,
          message,
        }),
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          text: "✓ Đã gửi yêu cầu đặt phòng thành công! Tôi sẽ liên hệ xác nhận lịch ngay cho bạn.",
        });
        setCustomerName("");
        setPhone("");
        setBookingTime("");
        setNotes("");
      } else {
        setFeedback({ type: "error", text: "Không thể gửi lúc này. Vui lòng bấm Nhắn Zalo để đặt nhanh." });
      }
    } catch {
      setFeedback({ type: "error", text: "Lỗi kết nối máy chủ." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZaloQuick = () => {
    const text = `Chào bạn, mình muốn đặt phòng tập: ${selectedRoom?.name} (${hours} giờ).
Tên: ${customerName || "(chưa điền)"}
SĐT: ${phone || "(chưa điền)"}
Thời gian: ${bookingTime || "Linh hoạt"}
Ghi chú: ${notes || "Không"}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    const cleanZalo = (profile.contact.zalo || "0900000000").replace(/\s+/g, "");
    window.open(`https://zalo.me/${cleanZalo}`, "_blank");
  };

  return (
    <div className="space-y-16 py-12 md:py-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 space-y-16">
        {/* Banner */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--chip)] text-xs font-bold text-[var(--brass)] uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Phòng Tập Band &amp; Studio Thu Âm Chuyên Nghiệp</span>
          </div>

          <h1 className="font-condensed font-extrabold text-5xl sm:text-7xl text-[var(--text)] tracking-tight leading-[1.05]">
            Phòng tập cách âm chuẩn.<br />
            <span className="text-[var(--brass)]">Đầy đủ nhạc cụ cao cấp</span> cho band.
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            LH Studio cung cấp không gian tập luyện lý tưởng cho ban nhạc, nghệ sĩ độc lập và nhóm học viên: dàn trống acoustic Yamaha/Tama, ampli guitar/bass công suất lớn, micro Shure, loa monitor và máy lạnh 24/7.
          </p>
        </div>

        {/* Room Gallery: Hình ảnh phòng tập & đồ đạc */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3">
              <span className="ibox w-12 h-12 rounded-2xl">
                <Sparkles className="w-6 h-6 text-[var(--brass)]" />
              </span>
              <span>Hình Ảnh Phòng Tập &amp; Trang Thiết Bị</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)]">
              Hình ảnh thực tế không gian phòng tập, dàn trống và hệ thống ampli loa tại LH Studio
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roomImages.map((img) => (
              <div
                key={img.id}
                className="group bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] rounded-3xl overflow-hidden shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#261e1b]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.imageUrl}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-sm text-[var(--text)] group-hover:text-[var(--brass)] transition-colors">
                    {img.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Perks & Calculator Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-8 border-t border-[var(--line)]">
          {/* Left Column: Room info & Perks */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
              <span className="ibox w-12 h-12 rounded-2xl">
                <Drum className="w-6 h-6" />
              </span>
              <span>Tiện Nghi Phòng Tập</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--muted)]">
              Được bảo trì định kỳ, thay mặt trống và vệ sinh sạch sẽ sau mỗi ca tập để ban nhạc luôn có trải nghiệm âm thanh tuyệt hảo.
            </p>

            {/* Perks grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {roomPerks?.map((perk) => (
                <div
                  key={perk.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-sm font-medium text-[var(--text)]"
                >
                  <span className="ibox w-9 h-9 rounded-lg flex-shrink-0">
                    {getPerkIcon(perk.iconName)}
                  </span>
                  <span>{perk.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Calculator Box */}
          <div className="lg:col-span-6">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                Ước tính giá thuê phòng
              </h3>

              {/* Room select */}
              <div className="space-y-2">
                <label htmlFor="roomSelect" className="block text-sm font-bold text-[var(--text)]">
                  Chọn phòng tập
                </label>
                <select
                  id="roomSelect"
                  value={selectedRoom?.id}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--brass)] outline-none transition-colors text-base"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} - {r.capacity} ({r.pricePerHour.toLocaleString("vi-VN")}đ/giờ)
                    </option>
                  ))}
                </select>
                {selectedRoom?.description && (
                  <p className="text-xs text-[var(--muted)]">{selectedRoom.description}</p>
                )}
              </div>

              {/* Hours slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-[var(--text)]">
                  <label htmlFor="hoursSlider">Số giờ thuê:</label>
                  <span className="font-condensed text-2xl text-[var(--brass)]">{hours} giờ</span>
                </div>
                <input
                  id="hoursSlider"
                  type="range"
                  min="1"
                  max="8"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full accent-[var(--brass)] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>1 giờ</span>
                  <span>4 giờ (giảm 10%)</span>
                  <span>8 giờ</span>
                </div>
              </div>

              {/* Discount hint & Total */}
              <div className="pt-2 border-t border-[var(--line)]">
                <p className="text-xs font-semibold min-h-[20px] text-[var(--muted)]">
                  {isDiscounted ? (
                    <span className="text-[var(--brass)] flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 inline" /> Đã giảm ngay 10% cho thuê từ 4 giờ!
                    </span>
                  ) : (
                    "Thuê từ 4 giờ trở lên để nhận ưu đãi giảm 10%"
                  )}
                </p>

                <div className="font-condensed font-extrabold text-5xl sm:text-6xl text-[var(--brass)] mt-1">
                  {totalAmount.toLocaleString("vi-VN")}đ
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact / Đặt phòng ngay tại đây */}
        <div className="bg-[var(--surface)] border-2 border-[var(--brass)] rounded-3xl p-6 sm:p-10 shadow-xl shadow-[var(--tint)] space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--chip)] text-xs font-bold text-[var(--brass)] uppercase tracking-wider">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Đặt Phòng Nhanh</span>
            </div>
            <h3 className="font-condensed font-extrabold text-3xl sm:text-4xl text-[var(--text)]">
              Gửi thông tin đặt lịch phòng tập tại đây
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Phòng đang chọn: <strong className="text-[var(--brass)]">{selectedRoom?.name}</strong> • Số giờ: <strong className="text-[var(--brass)]">{hours} giờ</strong> ({totalAmount.toLocaleString("vi-VN")}đ)
            </p>
          </div>

          {feedback && (
            <div
              className={`p-4 rounded-xl text-sm flex items-start gap-2.5 ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/10 text-red-400 border border-red-500/30"
              }`}
            >
              {feedback.type === "success" ? (
                <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Tên của bạn / Tên Band
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Band The Rockers"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Số điện thoại / Zalo *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="09xx xxx xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Thời gian tập dự kiến
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tối nay 19h - 21h"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Yêu cầu thêm (Số lượng người, nhạc cụ mang theo...)
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Band em có 5 người, cần thêm 2 mic hát và chân cắm keyboard..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)] resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Đang gửi yêu cầu..." : "Xác nhận đặt phòng ngay"}</span>
              </button>

              <button
                type="button"
                onClick={handleZaloQuick}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-[#0068ff] text-white hover:bg-[#0055d4] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo xác nhận phòng</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
