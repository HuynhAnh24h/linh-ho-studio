"use client";

import React, { useState } from "react";
import { Phone, MessageCircle, Mail, MapPin, Send, Check, AlertCircle } from "lucide-react";
import { ProfileData } from "@/lib/types";

interface ContactSectionProps {
  profile: ProfileData;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const c = profile.contact;
  const cleanPhone = (c.phone || "0900000000").replace(/\s+/g, "");
  const cleanZalo = (c.zalo || "0900000000").replace(/\s+/g, "");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [topic, setTopic] = useState("Học trống kèm 1:1");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const contacts = [
    {
      title: "Gọi điện thoại",
      value: c.phone || "0900 000 000",
      href: `tel:${cleanPhone}`,
      icon: <Phone className="w-5 h-5 text-[var(--brass)]" />,
      target: "_self",
    },
    {
      title: "Nhắn Zalo",
      value: "Nhắn để mua sampler & đặt lịch nhanh",
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
      value: "Theo dõi hoạt động & show diễn",
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
      value: "Video biểu diễn & demo sampler",
      href: c.youtube || "https://youtube.com",
      icon: (
        <svg className="w-5 h-5 fill-current text-[var(--brass)]" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      target: "_blank",
    },
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setFeedback({ type: "error", text: "Vui lòng nhập số điện thoại hoặc Zalo để tôi phản hồi." });
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    const fullMessage = `[Liên hệ từ website]
Chủ đề: ${topic}
Họ tên: ${name || "(Chưa điền)"}
SĐT/Zalo: ${phone}
Nội dung: ${message || "Cần tư vấn thông tin chi tiết."}`;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim() || "Khách liên hệ",
          phone: phone.trim(),
          serviceType: "course",
          itemSelected: `Liên hệ: ${topic}`,
          message: fullMessage,
        }),
      });

      if (res.ok) {
        setFeedback({
          type: "success",
          text: "✓ Đã gửi tin nhắn thành công! Tôi sẽ liên hệ lại bạn qua SĐT/Zalo trong thời gian sớm nhất.",
        });
        setName("");
        setPhone("");
        setMessage("");
      } else {
        setFeedback({
          type: "error",
          text: "Không thể gửi tin nhắn lúc này. Vui lòng bấm nút 'Nhắn Zalo' để nhắn trực tiếp.",
        });
      }
    } catch {
      setFeedback({
        type: "error",
        text: "Lỗi kết nối. Bạn có thể bấm nút Nhắn Zalo bên dưới để nhắn ngay.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenZaloQuick = () => {
    const text = `Chào bạn, mình tên là ${name || "..."}, SĐT ${phone || "..."}. Mình muốn hỏi về: ${topic}. ${message}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    window.open(`https://zalo.me/${cleanZalo}`, "_blank");
  };

  return (
    <section id="lien-he" className="py-20 bg-[var(--hero)] border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-12 space-y-3">
          <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
            <span className="ibox w-12 h-12 rounded-2xl">
              <Phone className="w-6 h-6" />
            </span>
            <span>Liên hệ & Gửi tin nhắn</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-3xl">
            Đặt lịch học trống, thuê phòng tập hoặc trao đổi hợp tác. Bạn có thể gửi tin nhắn trực tiếp qua form hoặc chọn các kênh kết nối bên dưới.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Interactive Send Message Form */}
          <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="space-y-1">
              <h3 className="font-condensed font-extrabold text-3xl text-[var(--text)] flex items-center gap-2">
                <Send className="w-5 h-5 text-[var(--brass)]" />
                <span>Gửi tin nhắn trực tiếp</span>
              </h3>
              <p className="text-xs sm:text-sm text-[var(--muted)]">
                Điền thông tin và yêu cầu của bạn, tin nhắn sẽ được chuyển thẳng đến tôi
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

            <form onSubmit={handleSendMessage} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                    Họ và tên của bạn
                  </label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Chủ đề bạn quan tâm
                </label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                >
                  <option>Học trống kèm 1:1 (Người mới)</option>
                  <option>Học trống nâng cao / Biểu diễn live</option>
                  <option>Thuê phòng tập band theo giờ</option>
                  <option>Mua bộ Sound Sampler WAV</option>
                  <option>Hợp tác biểu diễn / Thu âm studio</option>
                  <option>Khác...</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Nội dung tin nhắn
                </label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung bạn cần hỗ trợ, thời gian rảnh học, nhu cầu phòng tập..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                  <span>{isSubmitting ? "Đang gửi tin nhắn..." : "Gửi tin nhắn ngay"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenZaloQuick}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm bg-[#0068ff] text-white hover:bg-[#0055d4] transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Nhắn qua Zalo</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Contact Cards Grid */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
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
    </section>
  );
}
