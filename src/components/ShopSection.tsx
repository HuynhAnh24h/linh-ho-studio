"use client";

import React, { useState, useEffect } from "react";
import { ShoppingCart, Disc3, Zap, Drum, MessageCircle, Mail, Copy, Check, Percent } from "lucide-react";
import { SoundKitItem, ComboOffer, ProfileData } from "@/lib/types";

interface ShopSectionProps {
  kits: SoundKitItem[];
  comboOffer: ComboOffer;
  profile: ProfileData;
  preselectedKitId?: string;
}

export function ShopSection({ kits, comboOffer, profile, preselectedKitId }: ShopSectionProps) {
  const [selectedKitId, setSelectedKitId] = useState<string>(preselectedKitId || kits[0]?.id || "rock");
  const [customerName, setCustomerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [software, setSoftware] = useState<string>("Ableton Live");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedKitId) {
      setSelectedKitId(preselectedKitId);
    }
  }, [preselectedKitId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Find selected kit details or combo
  const getSelectedDetails = () => {
    if (selectedKitId === "combo") {
      return {
        name: comboOffer.title,
        priceStr: `${comboOffer.price.toLocaleString("vi-VN")}đ`,
      };
    }
    const found = kits.find((k) => k.id === selectedKitId) || kits[0];
    return {
      name: found ? found.name : "Sampler Pack",
      priceStr: found ? `${found.price.toLocaleString("vi-VN")}đ` : "450.000đ",
    };
  };

  const selectedDetails = getSelectedDetails();

  const generatedMessage = `Chào bạn, mình muốn mua bộ sampler: ${selectedDetails.name} (${selectedDetails.priceStr}).
Phần mềm: ${software}.
Tên: ${customerName.trim() || "(chưa điền)"}
SĐT/Zalo: ${phone.trim() || "(chưa điền)"}
Bạn gửi mình thông tin thanh toán nhé.`;

  const recordOrder = async () => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || "Khách mua sampler",
          phone: phone.trim(),
          serviceType: "sampler",
          itemSelected: `${selectedDetails.name} (${selectedDetails.priceStr})`,
          software,
          message: generatedMessage,
        }),
      });
    } catch (e) {
      console.error("Order save error:", e);
    }
  };

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(generatedMessage).then(() => {
        showToast("✓ Đã sao chép nội dung tin nhắn!");
      });
    } else {
      showToast("Vui lòng chọn và sao chép ở ô bên dưới.");
    }
  };

  const handleZaloClick = async () => {
    setIsSubmitting(true);
    await recordOrder();
    setIsSubmitting(false);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(generatedMessage).catch(() => {});
    }

    showToast("✓ Đã sao chép tin nhắn, đang chuyển sang Zalo...");
    const cleanZalo = (profile.contact.zalo || "0900000000").replace(/\s+/g, "");
    window.open(`https://zalo.me/${cleanZalo}`, "_blank");
  };

  const handleEmailClick = async () => {
    setIsSubmitting(true);
    await recordOrder();
    setIsSubmitting(false);

    const email = profile.contact.email || "drummer@example.com";
    const mailto = `mailto:${email}?subject=${encodeURIComponent(
      `Mua sampler ${selectedDetails.name}`
    )}&body=${encodeURIComponent(generatedMessage)}`;
    window.location.href = mailto;
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast("⚠️ Vui lòng nhập số điện thoại hoặc Zalo để tôi liên hệ lại.");
      return;
    }
    setIsSubmitting(true);
    await recordOrder();
    setIsSubmitting(false);
    showToast("🎉 Đã gửi đơn thành công! Tôi sẽ liên hệ bạn trong ngày.");
  };

  const getKitIcon = (iconName?: string) => {
    switch (iconName) {
      case "disc-3":
        return <Disc3 className="w-6 h-6 text-[var(--brass)]" />;
      case "zap":
        return <Zap className="w-6 h-6 text-[var(--brass)]" />;
      default:
        return <Drum className="w-6 h-6 text-[var(--brass)]" />;
    }
  };

  const selectAndScroll = (id: string) => {
    setSelectedKitId(id);
    document.getElementById("orderForm")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="mua-sampler" className="py-20 border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-10 space-y-3">
          <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
            <span className="ibox w-12 h-12 rounded-2xl">
              <ShoppingCart className="w-6 h-6" />
            </span>
            <span>Mua bộ sampler</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-3xl">
            Chọn bộ bạn thích, điền thông tin, rồi gửi tin nhắn cho tôi qua Zalo hoặc email. Tôi sẽ gửi link tải trực tiếp ngay sau khi nhận thanh toán.
          </p>
        </div>

        {/* Individual Kit Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {kits.map((kit) => (
            <div
              key={kit.id}
              className="bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-strong)] rounded-2xl p-6 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3">
                <span className="ibox w-11 h-11 rounded-xl">
                  {getKitIcon(kit.iconName)}
                </span>

                <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                  {kit.name}
                </h3>

                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--chip)] text-[var(--text)]">
                    {kit.sampleCount}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--chip)] text-[var(--text)]">
                    {kit.format}
                  </span>
                </div>

                <div className="font-condensed font-extrabold text-4xl text-[var(--brass)] pt-1">
                  {kit.price.toLocaleString("vi-VN")}đ
                </div>

                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  {kit.desc}
                </p>
              </div>

              <div className="pt-6 mt-4 border-t border-[var(--line)]">
                <button
                  onClick={() => selectAndScroll(kit.id)}
                  className="w-full py-2.5 rounded-xl font-bold text-sm border-2 border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Chọn bộ này</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Combo Deal & Interactive Order Form Card */}
        <div className="bg-[var(--surface)] border-2 border-[var(--brass)] rounded-3xl p-6 sm:p-10 shadow-lg shadow-[var(--tint)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Combo Info */}
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[var(--ember)] text-white">
                <Percent className="w-3.5 h-3.5" />
                <span>{comboOffer.badge}</span>
              </span>

              <h3 className="font-condensed font-extrabold text-4xl text-[var(--text)]">
                {comboOffer.title}
              </h3>

              <div className="font-condensed font-extrabold text-5xl text-[var(--brass)] flex items-baseline gap-3">
                <span>{comboOffer.price.toLocaleString("vi-VN")}đ</span>
                {comboOffer.originalPrice && (
                  <s className="text-xl font-normal font-sans text-[var(--muted)]">
                    {comboOffer.originalPrice.toLocaleString("vi-VN")}đ
                  </s>
                )}
              </div>

              <p className="text-base text-[var(--muted)] leading-relaxed">
                {comboOffer.desc}
              </p>

              <button
                onClick={() => selectAndScroll("combo")}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Chọn trọn bộ combo</span>
              </button>
            </div>

            {/* Right: Interactive Order Form */}
            <div className="lg:col-span-7">
              <form id="orderForm" onSubmit={handleDirectSubmit} className="bg-[var(--bg)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                      Tên của bạn
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--brass)] text-sm"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--brass)] text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                      Bộ sampler muốn mua
                    </label>
                    <select
                      value={selectedKitId}
                      onChange={(e) => setSelectedKitId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--brass)] text-sm"
                    >
                      {kits.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.name} ({k.price.toLocaleString("vi-VN")}đ)
                        </option>
                      ))}
                      <option value="combo">
                        {comboOffer.title} ({comboOffer.price.toLocaleString("vi-VN")}đ)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                      Phần mềm bạn dùng
                    </label>
                    <select
                      value={software}
                      onChange={(e) => setSoftware(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--text)] outline-none focus:border-[var(--brass)] text-sm"
                    >
                      <option>Ableton Live</option>
                      <option>FL Studio</option>
                      <option>Logic Pro</option>
                      <option>Studio One</option>
                      <option>Cubase / Nuendo</option>
                      <option>Reaper</option>
                      <option>Khác</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                    Nội dung tin nhắn tự tạo
                  </label>
                  <textarea
                    rows={4}
                    readOnly
                    value={generatedMessage}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] font-mono text-xs outline-none select-all resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSubmitting ? "Đang gửi..." : "Gửi đơn hàng"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleZaloClick}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-[#0068ff] text-white hover:bg-[#0055d4] transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Gửi qua Zalo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleEmailClick}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)]"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Gửi Email</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)]"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Sao chép</span>
                  </button>
                </div>

                {/* Toast feedback */}
                {toastMessage && (
                  <div className="text-sm font-semibold text-[var(--brass)] animate-fade-in pt-1">
                    {toastMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
