"use client";

import React, { useState } from "react";
import { EventServiceItem, ProfileData } from "@/lib/types";
import { Music2, Drum, Sparkles, Check, Phone, MessageCircle, Mail, MapPin, Send, AlertCircle, Calendar } from "lucide-react";

interface LienHeClientProps {
  eventServices: EventServiceItem[];
  profile: ProfileData;
}

export function LienHeClient({ eventServices, profile }: LienHeClientProps) {
  const c = profile.contact;
  const cleanPhone = (c.phone || "0900000000").replace(/\s+/g, "");
  const cleanZalo = (c.zalo || "0900000000").replace(/\s+/g, "");

  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string>(
    eventServices[0]?.title || "Cho Thuê Band Nhạc Acoustic"
  );
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const contacts = [
    {
      title: "Gọi điện thoại trực tiếp",
      value: c.phone || "0900 000 000",
      href: `tel:${cleanPhone}`,
      icon: <Phone className="w-5 h-5 text-[var(--brass)]" />,
      target: "_self",
    },
    {
      title: "Nhắn Zalo",
      value: "Tư vấn & Báo giá nhanh nhất",
      href: `https://zalo.me/${cleanZalo}`,
      icon: <MessageCircle className="w-5 h-5 text-[var(--brass)]" />,
      target: "_blank",
    },
    {
      title: "Gửi Email",
      value: c.email || "linhho.drummer@example.com",
      href: `mailto:${c.email || "linhho.drummer@example.com"}`,
      icon: <Mail className="w-5 h-5 text-[var(--brass)]" />,
      target: "_self",
    },
    {
      title: "Địa chỉ studio",
      value: c.address || "123 Đường Âm Nhạc, Quận 1, TP. Hồ Chí Minh",
      href: `https://maps.google.com/?q=${encodeURIComponent(c.address || "TP. Hồ Chí Minh")}`,
      icon: <MapPin className="w-5 h-5 text-[var(--brass)]" />,
      target: "_blank",
    },
    {
      title: "Facebook",
      value: "Video show diễn & Tiệc cưới",
      href: c.facebook || "https://facebook.com",
      icon: (
        <svg className="w-5 h-5 fill-current text-[var(--brass)]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      target: "_blank",
    },
    {
      title: "YouTube",
      value: "Video clip biểu diễn live",
      href: c.youtube || "https://youtube.com",
      icon: (
        <svg className="w-5 h-5 fill-current text-[var(--brass)]" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      target: "_blank",
    },
  ];

  const handleSelectService = (title: string) => {
    setSelectedServiceTitle(title);
    document.getElementById("bookingFormSection")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setFeedback({ type: "error", text: "Vui lòng nhập số điện thoại hoặc Zalo để tôi liên hệ." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const fullMessage = `[Đặt Dịch Vụ Sự Kiện]
Dịch vụ: ${selectedServiceTitle}
Khách hàng: ${customerName || "(Chưa điền)"}
SĐT/Zalo: ${phone}
Ngày diễn ra: ${eventDate || "Chưa xác định"}
Địa điểm tổ chức: ${eventLocation || "Chưa xác định"}
Ghi chú thêm: ${notes || "Không"}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || "Khách đặt dịch vụ sự kiện",
          phone: phone.trim(),
          serviceType: "event_band",
          itemSelected: selectedServiceTitle,
          message: fullMessage,
        }),
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          text: "✓ Gửi yêu cầu đặt dịch vụ thành công! Tôi sẽ gọi điện / nhắn Zalo để gửi bảng báo giá chi tiết trong vòng vài giờ.",
        });
        setCustomerName("");
        setPhone("");
        setEventDate("");
        setEventLocation("");
        setNotes("");
      } else {
        setFeedback({ type: "error", text: "Không thể gửi lúc này. Vui lòng bấm Nhắn Zalo để nhắn trực tiếp." });
      }
    } catch {
      setFeedback({ type: "error", text: "Lỗi kết nối. Bạn có thể nhắn qua Zalo bên dưới." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZaloQuick = () => {
    const text = `Chào Linh, mình muốn tư vấn dịch vụ: ${selectedServiceTitle}.
Họ tên: ${customerName || "(chưa điền)"}
SĐT: ${phone || "(chưa điền)"}
Ngày tổ chức: ${eventDate || "Chưa xác định"}
Địa điểm: ${eventLocation || "TP.HCM"}
Ghi chú: ${notes || "Cần báo giá chi tiết"}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    window.open(`https://zalo.me/${cleanZalo}`, "_blank");
  };

  return (
    <div className="space-y-16 py-12 md:py-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 space-y-16">
        {/* Banner */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--chip)] text-xs font-bold text-[var(--brass)] uppercase tracking-wider">
            <Music2 className="w-4 h-4" />
            <span>Dịch Vụ Ban Nhạc Biểu Diễn &amp; Cho Thuê Trống Sự Kiện</span>
          </div>

          <h1 className="font-condensed font-extrabold text-5xl sm:text-7xl text-[var(--text)] tracking-tight leading-[1.05]">
            Thuê Band Acoustic.<br />
            <span className="text-[var(--brass)]">Cho thuê nguyên band</span> tiệc cưới &amp; sự kiện.
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            Đội ngũ nhạc công và ca sĩ chuyên nghiệp với kinh nghiệm biểu diễn hàng trăm sự kiện, tiệc cưới, tiệc hỏi, gala dinner và quán cafe acoustic. Đảm bảo âm thanh chuẩn mực, phong cách cuốn hút và đúng timeline của bạn.
          </p>
        </div>

        {/* Event Services Grid */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3">
              <span className="ibox w-12 h-12 rounded-2xl">
                <Sparkles className="w-6 h-6 text-[var(--brass)]" />
              </span>
              <span>Các Gói Dịch Vụ Biểu Diễn</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)]">
              Lựa chọn đội hình và phong cách âm nhạc phù hợp với quy mô sự kiện của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {eventServices.map((srv) => (
              <div
                key={srv.id}
                className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] rounded-3xl overflow-hidden flex flex-col justify-between transition-all shadow-sm group"
              >
                <div>
                  {srv.imageUrl && (
                    <div className="relative aspect-video w-full overflow-hidden bg-[#261e1b]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={srv.imageUrl}
                        alt={srv.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}

                  <div className="p-6 sm:p-8 space-y-4">
                    <h3 className="font-condensed font-bold text-3xl text-[var(--text)] group-hover:text-[var(--brass)] transition-colors leading-tight">
                      {srv.title}
                    </h3>

                    <div className="font-condensed font-extrabold text-3xl text-[var(--brass)]">
                      {srv.price}
                    </div>

                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {srv.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[var(--line)]">
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
                        Chi tiết dịch vụ bao gồm:
                      </span>
                      <ul className="space-y-2 text-xs sm:text-sm text-[var(--muted)]">
                        {srv.features?.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-[var(--brass)] flex-shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-6 sm:p-8 pt-0">
                  <button
                    onClick={() => handleSelectService(srv.title)}
                    className="w-full py-3 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
                  >
                    Chọn đặt dịch vụ này
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Booking & Inquiry Form */}
        <div id="bookingFormSection" className="bg-[var(--surface)] border-2 border-[var(--brass)] rounded-3xl p-6 sm:p-10 shadow-xl shadow-[var(--tint)] space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--chip)] text-xs font-bold text-[var(--brass)] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" />
              <span>Liên Hệ Báo Giá &amp; Đặt Lịch Biểu Diễn</span>
            </div>
            <h3 className="font-condensed font-extrabold text-3xl sm:text-4xl text-[var(--text)]">
              Gửi thông tin sự kiện của bạn
            </h3>
            <p className="text-sm text-[var(--muted)]">
              Dịch vụ đang chọn: <strong className="text-[var(--brass)]">{selectedServiceTitle}</strong>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Họ và tên của bạn / Đơn vị tổ chức *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn A (Cô dâu / Chú rể)"
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Gói dịch vụ bạn quan tâm
                </label>
                <select
                  value={selectedServiceTitle}
                  onChange={(e) => setSelectedServiceTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                >
                  {eventServices.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.price})
                    </option>
                  ))}
                  <option value="Tư vấn dịch vụ khác">Tư vấn dịch vụ khác...</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Ngày tổ chức dự kiến
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ngày 15/12/2026 (18:00 - 21:00)"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Địa điểm tổ chức sự kiện
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Trung tâm tiệc cưới GEM Center, Q.1 hoặc tiệc tư gia tại Thủ Đức..."
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Yêu cầu thêm về thể loại nhạc hoặc danh sách bài hát
              </label>
              <textarea
                rows={3}
                placeholder="Ví dụ: Mong muốn ban nhạc chơi các bài nhạc trẻ acoustic đón khách, và cô dâu chú rể muốn hát 1 bài cùng ban nhạc..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)] resize-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "Đang gửi..." : "Gửi yêu cầu nhận báo giá ngay"}</span>
              </button>

              <button
                type="button"
                onClick={handleZaloQuick}
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm bg-[#0068ff] text-white hover:bg-[#0055d4] transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn tin Zalo trực tiếp</span>
              </button>
            </div>
          </form>
        </div>

        {/* Direct Contact Cards */}
        <div className="space-y-6 pt-8 border-t border-[var(--line)]">
          <div className="space-y-2">
            <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
              Kênh Liên Hệ Khác
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)]">
              Bạn cũng có thể gọi trực tiếp hoặc ghé thăm studio theo thông tin dưới đây:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contacts.map((item, idx) => (
              <a
                key={idx}
                href={item.href}
                target={item.target}
                rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] text-[var(--text)] transition-all group shadow-sm"
              >
                <span className="ibox w-11 h-11 rounded-xl group-hover:scale-105 transition-transform">
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <b className="block text-sm font-bold text-[var(--text)] group-hover:text-[var(--brass)] transition-colors">
                    {item.title}
                  </b>
                  <small className="block text-xs text-[var(--muted)] truncate">
                    {item.value}
                  </small>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
