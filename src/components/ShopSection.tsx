"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  Disc3,
  Zap,
  Drum,
  MessageCircle,
  Copy,
  Check,
  Percent,
  Play,
  Pause,
  Sliders,
  ShieldCheck,
  Download,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Send,
  HelpCircle,
  Headphones,
} from "lucide-react";
import { SoundKitItem, ComboOffer, ProfileData } from "@/lib/types";
import { drumAudioEngine } from "@/lib/audio-engine";
import { InteractivePadModal } from "@/components/InteractivePadModal";

interface ShopSectionProps {
  kits: SoundKitItem[];
  comboOffer: ComboOffer;
  profile: ProfileData;
  preselectedKitId?: string;
}

export function ShopSection({ kits, comboOffer, profile, preselectedKitId }: ShopSectionProps) {
  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<"all" | "spd30" | "sample_pad">("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedDeviceFilter, setSelectedDeviceFilter] = useState<string>("all");

  // Modal testing kit on 6-pad
  const [testingKit, setTestingKit] = useState<SoundKitItem | null>(null);

  // Playing preview state
  const [playingKitId, setPlayingKitId] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Modal checkout state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [selectedKit, setSelectedKit] = useState<SoundKitItem | "combo" | null>(null);
  const [customerName, setCustomerName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [deviceModel, setDeviceModel] = useState<string>("Roland SPD-30");
  const [deliveryMethod, setDeliveryMethod] = useState<string>("Zalo (Gửi file trực tiếp)");
  const [note, setNote] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (preselectedKitId) {
      if (preselectedKitId === "combo") {
        setSelectedKit("combo");
        setIsOrderModalOpen(true);
      } else {
        const found = kits.find((k) => k.id === preselectedKitId);
        if (found) {
          setSelectedKit(found);
          // Set active tab accordingly
          if (found.padType === "spd30") {
            setActiveTab("spd30");
          } else {
            setActiveTab("sample_pad");
          }
        }
      }
    }
  }, [preselectedKitId, kits]);

  // Audio Preview Handling
  const stopAudioPreview = () => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
    }
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
    setPlayingKitId(null);
  };

  const handleTogglePlayPreview = (kit: SoundKitItem) => {
    if (playingKitId === kit.id) {
      stopAudioPreview();
      return;
    }

    stopAudioPreview();
    setPlayingKitId(kit.id);

    if (kit.demoAudioUrl) {
      // Play real audio file if present
      const audio = new Audio(kit.demoAudioUrl);
      audioPreviewRef.current = audio;
      audio.play().catch(() => {
        playSynthPattern(kit);
      });
      audio.onended = () => {
        setPlayingKitId(null);
      };
    } else {
      // Play Web Audio drum rhythm demo
      playSynthPattern(kit);
    }
  };

  const playSynthPattern = (kit: SoundKitItem) => {
    let step = 0;
    const bpm = kit.synthConfig?.bpm || 110;
    const intervalMs = (60 / bpm / 4) * 1000;

    synthIntervalRef.current = setInterval(() => {
      // 16-step mini rhythm
      if (step === 0 || step === 8 || step === 10) {
        drumAudioEngine.playSound("kick", kit);
      }
      if (step === 4 || step === 12) {
        drumAudioEngine.playSound("snare", kit);
      }
      if (step % 2 === 0) {
        drumAudioEngine.playSound("hat", kit);
      }
      if (step === 14) {
        drumAudioEngine.playSound("tom", kit);
      }

      step = (step + 1) % 16;
    }, intervalMs);

    // Stop after 8 bars automatically
    setTimeout(() => {
      if (playingKitId === kit.id) {
        stopAudioPreview();
      }
    }, 12000);
  };

  useEffect(() => {
    return () => {
      stopAudioPreview();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Filtered kits
  const filteredKits = kits.filter((kit) => {
    // 1. Tab filter
    if (activeTab === "spd30" && kit.padType !== "spd30") return false;
    if (activeTab === "sample_pad" && kit.padType === "spd30") return false;

    // 2. Genre filter (only relevant for sample_pad or when searching all)
    if (selectedGenre !== "all" && kit.category !== selectedGenre) {
      return false;
    }

    // 3. Device filter
    if (selectedDeviceFilter !== "all") {
      const match = kit.compatibleDevices?.some((dev) =>
        dev.toLowerCase().includes(selectedDeviceFilter.toLowerCase())
      );
      if (!match) return false;
    }

    return true;
  });

  const getKitIcon = (iconName?: string) => {
    switch (iconName) {
      case "disc-3":
        return <Disc3 className="w-5 h-5 text-[var(--brass)]" />;
      case "zap":
        return <Zap className="w-5 h-5 text-[var(--brass)]" />;
      default:
        return <Drum className="w-5 h-5 text-[var(--brass)]" />;
    }
  };

  const openOrderModal = (item: SoundKitItem | "combo") => {
    setSelectedKit(item);
    if (item === "combo") {
      setDeviceModel("Roland SPD-SX / SPD-30");
    } else if (item.padType === "spd30") {
      setDeviceModel("Roland SPD-30 (Octapad)");
    } else {
      setDeviceModel("Roland SPD-SX");
    }
    setIsOrderModalOpen(true);
  };

  const getSelectedKitName = () => {
    if (!selectedKit) return "";
    if (selectedKit === "combo") return comboOffer.title;
    return selectedKit.name;
  };

  const getSelectedKitPrice = () => {
    if (!selectedKit) return 0;
    if (selectedKit === "combo") return comboOffer.price;
    return selectedKit.price;
  };

  const generatedMessage = `Chào LH Music Studio, mình muốn mua bộ tiếng: ${getSelectedKitName()} (${getSelectedKitPrice().toLocaleString("vi-VN")}đ).
- Thiết bị đang dùng: ${deviceModel}
- Họ tên: ${customerName.trim() || "(chưa điền)"}
- SĐT / Zalo: ${phone.trim() || "(chưa điền)"}
- Nhận file qua: ${deliveryMethod}
${note.trim() ? `- Ghi chú: ${note.trim()}` : ""}
Gửi mình thông tin thanh toán & link tải nhé!`;

  const recordOrder = async () => {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim() || "Khách mua Sound Kit",
          phone: phone.trim(),
          serviceType: "sampler",
          itemSelected: `${getSelectedKitName()} (${getSelectedKitPrice().toLocaleString("vi-VN")}đ)`,
          deviceModel,
          deliveryMethod,
          message: generatedMessage,
        }),
      });
    } catch (e) {
      console.error("Order save error:", e);
    }
  };

  const handleCopyMessage = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(generatedMessage).then(() => {
        showToast("✓ Đã sao chép nội dung tin nhắn đặt mua!");
      });
    }
  };

  const handleZaloSubmit = async () => {
    if (!phone.trim()) {
      showToast("⚠️ Vui lòng điền số điện thoại hoặc Zalo để studio hỗ trợ gửi file!");
      return;
    }
    setIsSubmitting(true);
    await recordOrder();
    setIsSubmitting(false);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(generatedMessage).catch(() => {});
    }

    const cleanZalo = (profile.contact.zalo || profile.contact.phone || "0900000000").replace(/\s+/g, "");
    showToast("✓ Đã tạo đơn! Đang mở Zalo để gửi file ngay cho bạn...");
    window.open(`https://zalo.me/${cleanZalo}`, "_blank");
    setIsOrderModalOpen(false);
  };

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      showToast("⚠️ Vui lòng nhập số điện thoại hoặc Zalo.");
      return;
    }
    setIsSubmitting(true);
    await recordOrder();
    setIsSubmitting(false);
    showToast("🎉 Đã gửi đơn thành công! LH Studio sẽ gửi link tải qua Zalo/SĐT cho bạn trong ít phút.");
    setIsOrderModalOpen(false);
  };

  return (
    <section id="mua-sampler" className="py-16 sm:py-24 border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl bg-[var(--surface)] text-[var(--text)] border-2 border-[var(--brass)] shadow-2xl animate-fade-in text-sm font-bold flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[var(--brass)]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--brass)]/15 text-[var(--brass)] border border-[var(--brass)]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kho Sound Chuẩn Show & Phòng Thu</span>
          </div>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text)]">
            Bộ Tiếng Sampler & Sound Packs
          </h2>
          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed">
            Phân loại rõ ràng theo từng dòng thiết bị: <b>Roland SPD-30 (Sound Gốc Cân Chỉnh)</b> và <b>Các dòng nạp Sound Ngoài (WAV Samples: SPD-SX, SPD-SX PRO, NUX, Avatar...)</b>.
          </p>
        </div>

        {/* Primary Classification Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => {
              setActiveTab("all");
              setSelectedGenre("all");
              setSelectedDeviceFilter("all");
            }}
            className={`px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center gap-2.5 ${
              activeTab === "all"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-lg shadow-[var(--brass)]/20 scale-105"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tất Cả Sound Packs</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-mono">
              {kits.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("spd30");
              setSelectedGenre("all");
              setSelectedDeviceFilter("all");
            }}
            className={`px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center gap-2.5 ${
              activeTab === "spd30"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-lg shadow-[var(--brass)]/20 scale-105"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Roland SPD-30 (Sound Gốc)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-mono">
              {kits.filter((k) => k.padType === "spd30").length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("sample_pad");
              setSelectedGenre("all");
              setSelectedDeviceFilter("all");
            }}
            className={`px-6 py-3 rounded-2xl font-bold text-sm sm:text-base transition-all flex items-center gap-2.5 ${
              activeTab === "sample_pad"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-lg shadow-[var(--brass)]/20 scale-105"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]"
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Sound Ngoài (SPD-SX, NUX, Avatar...)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/20 font-mono">
              {kits.filter((k) => k.padType !== "spd30").length}
            </span>
          </button>
        </div>

        {/* Informative Guidance Banner based on selection */}
        {activeTab === "spd30" && (
          <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-amber-500/40 mb-10 shadow-sm animate-fade-in flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-base sm:text-lg">
                <Zap className="w-5 h-5" />
                <span>Chuyên Mục: Roland SPD-30 (Octapad) - Sound Gốc & Backup Kit</span>
              </div>
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                Roland SPD-30 sử dụng chip xử lý âm thanh gốc bên trong máy. LH Studio đã căn chỉnh tỉ mỉ từng thông số EQ, Muffle, Tune, Layer, Ambience và FX cho từng thể loại nhạc Việt. <b>Bạn chỉ cần cắm USB vào load file Backup (.SVD) là có ngay 50 bộ kit đi show chuẩn chỉnh!</b>
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold whitespace-nowrap">
              ✓ Nạp qua USB 1 phút
            </div>
          </div>
        )}

        {activeTab === "sample_pad" && (
          <div className="space-y-6 mb-10 animate-fade-in">
            <div className="p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-blue-500/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
              <div className="space-y-1.5 max-w-3xl">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-base sm:text-lg">
                  <Sliders className="w-5 h-5" />
                  <span>Hệ Sinh Thái Sound Ngoài (WAV Samples: SPD-SX, SX PRO, NUX, Avatar...)</span>
                </div>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                  Các dòng Pad này nhận trực tiếp file âm thanh ngoài qua chuẩn <b>WAV 24-bit 44.1kHz</b>. Bộ sample được nén và xử lý âm lượng qua Master Limiter cho lực đánh cực căng, tiếng sáng, không lo bị méo tiếng hay lọt tạp âm.
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold whitespace-nowrap">
                ✓ Định dạng WAV Chuẩn Cao Cấp
              </div>
            </div>

            {/* Sub-Filters for Genres and Devices */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--surface)] border border-[var(--line)]">
              {/* Thể loại */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[var(--muted)] uppercase mr-1">Thể loại:</span>
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "vinahouse_edm", label: "Vinahouse / EDM" },
                  { id: "pop_ballad", label: "Pop Ballad" },
                  { id: "acoustic_percussion", label: "Acoustic / Gõ Latin" },
                  { id: "show_all", label: "Đi Tour All-in-One" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
                      selectedGenre === g.id
                        ? "bg-[var(--brass)] text-[#1e1715] font-bold"
                        : "bg-[var(--chip)] text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>

              {/* Dòng máy */}
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-[var(--muted)] uppercase">Thiết bị:</span>
                <select
                  value={selectedDeviceFilter}
                  onChange={(e) => setSelectedDeviceFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-xs text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                >
                  <option value="all">Tất cả các dòng Pad</option>
                  <option value="SPD-SX">Roland SPD-SX</option>
                  <option value="SPD-SX PRO">Roland SPD-SX PRO</option>
                  <option value="NUX">NUX DP-2000</option>
                  <option value="Avatar">Avatar HXW</option>
                  <option value="Donner">Donner</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Product Cards Grid */}
        {filteredKits.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)]">
            Không tìm thấy bộ sound nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
            {filteredKits.map((kit) => {
              const isPlaying = playingKitId === kit.id;
              const isSpd30 = kit.padType === "spd30";

              return (
                <div
                  key={kit.id}
                  className="group rounded-3xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)]/70 transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-[var(--brass)]/5 relative overflow-hidden"
                >
                  {/* Decorative background accent */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--brass)]/5 rounded-full blur-2xl group-hover:bg-[var(--brass)]/10 transition-colors pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* Header Tags & Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isSpd30
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          }`}
                        >
                          {isSpd30 ? "Roland SPD-30 (Sound Gốc)" : "Sound Ngoài (WAV Samples)"}
                        </span>

                        {kit.badge && (
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            {kit.badge}
                          </span>
                        )}
                      </div>

                      <span className="w-10 h-10 rounded-xl bg-[var(--chip)] border border-[var(--line)] flex items-center justify-center flex-shrink-0">
                        {getKitIcon(kit.iconName)}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)] leading-snug group-hover:text-[var(--brass)] transition-colors">
                      {kit.name}
                    </h3>

                    {/* Format & Samples badges */}
                    <div className="flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--chip)] text-[var(--text)] border border-[var(--line)]">
                        {kit.sampleCount}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-[var(--chip)] text-[var(--text)] border border-[var(--line)]">
                        {kit.format}
                      </span>
                    </div>

                    {/* Compatible devices list */}
                    {kit.compatibleDevices && kit.compatibleDevices.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold uppercase text-[var(--muted)] tracking-wider">
                          Dòng máy tương thích:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {kit.compatibleDevices.map((dev, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]"
                            >
                              {dev}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
                      {kit.desc}
                    </p>

                    {/* Key features checklist */}
                    {kit.features && kit.features.length > 0 && (
                      <div className="pt-2 border-t border-[var(--line)]/50 space-y-1.5">
                        {kit.features.slice(0, 3).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-[var(--text)]">
                            <Check className="w-3.5 h-3.5 text-[var(--brass)] flex-shrink-0" />
                            <span className="truncate">{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                    {/* Card Bottom: Price & Actions */}
                    <div className="pt-6 mt-6 border-t border-[var(--line)] space-y-4 relative z-10">
                      <div className="flex items-baseline justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[11px] uppercase tracking-wider text-[var(--muted)] font-semibold block">
                            Giá trọn gói:
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="font-condensed font-extrabold text-3xl sm:text-4xl text-[var(--brass)]">
                              {kit.price.toLocaleString("vi-VN")}đ
                            </span>
                            {kit.originalPrice && (
                              <s className="text-xs text-[var(--muted)] font-mono">
                                {kit.originalPrice.toLocaleString("vi-VN")}đ
                              </s>
                            )}
                          </div>
                        </div>

                        {/* Audio Demo Preview Button */}
                        <button
                          onClick={() => handleTogglePlayPreview(kit)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isPlaying
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--brass)] hover:text-[#1e1715]"
                          }`}
                          title="Nghe thử tiếng demo nhanh"
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="w-3.5 h-3.5" />
                              <span>Dừng</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 text-[var(--brass)]" />
                              <span>Nghe audio</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* 2 Primary Buttons: Interactive Pad Testing & Direct Buy */}
                      <div className="space-y-2">
                        <button
                          onClick={() => setTestingKit(kit)}
                          className="w-full py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm border-2 border-[var(--brass)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-all flex items-center justify-center gap-2 shadow-sm group-hover:border-[var(--brass-2)]"
                        >
                          <Headphones className="w-4 h-4" />
                          <span>Gõ & Cảm nhận bộ này (Q, W, E, A, S, D)</span>
                        </button>

                        <button
                          onClick={() => openOrderModal(kit)}
                          className="w-full py-2.5 px-3 rounded-2xl font-bold text-xs sm:text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Đặt mua bộ này</span>
                        </button>
                      </div>
                    </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Combo Deal Card */}
        <div className="rounded-3xl bg-[var(--surface)] border-2 border-[var(--brass)] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[var(--brass)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            <div className="lg:col-span-7 space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Percent className="w-3.5 h-3.5" />
                <span>{comboOffer.badge}</span>
              </span>

              <h3 className="font-condensed font-extrabold text-3xl sm:text-5xl text-[var(--text)]">
                {comboOffer.title}
              </h3>

              <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-xl">
                {comboOffer.desc}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <ShieldCheck className="w-4 h-4 text-[var(--brass)]" />
                  <span>Bao trọn sound SPD-30 & Sound Ngoài</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <Download className="w-4 h-4 text-[var(--brass)]" />
                  <span>Tải trọn đời qua Google Drive</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text)]">
                  <Sparkles className="w-4 h-4 text-[var(--brass)]" />
                  <span>Hỗ trợ nạp sound Ultraviewer 1:1</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col items-start lg:items-end justify-center space-y-4 lg:border-l lg:border-[var(--line)] lg:pl-8">
              <div className="space-y-1 text-left lg:text-right">
                <span className="text-xs uppercase font-bold text-[var(--muted)]">
                  Giá ưu đãi trọn gói:
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--brass)]">
                    {comboOffer.price.toLocaleString("vi-VN")}đ
                  </span>
                  {comboOffer.originalPrice && (
                    <s className="text-base text-[var(--muted)]">
                      {comboOffer.originalPrice.toLocaleString("vi-VN")}đ
                    </s>
                  )}
                </div>
              </div>

              <button
                onClick={() => openOrderModal("combo")}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-base bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Mua trọn bộ Combo ngay</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Đặt Mua Sound Pack */}
        {isOrderModalOpen && selectedKit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="w-full max-w-xl my-8 rounded-3xl bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="absolute top-5 right-5 p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-xs font-bold text-[var(--brass)] uppercase tracking-wider">
                  Xác nhận đặt mua Sound Pack
                </span>
                <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl text-[var(--text)]">
                  {getSelectedKitName()}
                </h3>
                <div className="font-condensed font-bold text-2xl text-[var(--brass)]">
                  {getSelectedKitPrice().toLocaleString("vi-VN")}đ
                </div>
              </div>

              <form onSubmit={handleDirectSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                      Họ và tên của bạn *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                      Số điện thoại / Zalo *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 xxx xxx"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                      Dòng Pad bạn đang dùng *
                    </label>
                    <select
                      value={deviceModel}
                      onChange={(e) => setDeviceModel(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                    >
                      <option value="Roland SPD-30 (Octapad)">Roland SPD-30 (Octapad)</option>
                      <option value="Roland SPD-SX">Roland SPD-SX</option>
                      <option value="Roland SPD-SX PRO">Roland SPD-SX PRO</option>
                      <option value="NUX DP-2000">NUX DP-2000</option>
                      <option value="Avatar HXW">Avatar HXW</option>
                      <option value="Donner Drum Pad">Donner Drum Pad</option>
                      <option value="Alesis SamplePad">Alesis SamplePad</option>
                      <option value="DAW (FL Studio / Ableton / Logic)">Dùng trên máy tính (DAW)</option>
                      <option value="Khác">Dòng khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                      Hình thức nhận file
                    </label>
                    <select
                      value={deliveryMethod}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                    >
                      <option value="Zalo (Gửi file trực tiếp)">Gửi file trực tiếp qua Zalo</option>
                      <option value="Link Google Drive tốc độ cao">Link Google Drive tốc độ cao</option>
                      <option value="Email">Gửi qua Email</option>
                      <option value="USB (Ship tận nơi)">Copy vào USB (Ship tận nơi)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                    Ghi chú / Yêu cầu thêm (tuỳ chọn)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Ví dụ: Hướng dẫn mình cách nạp vào NUX DP-2000 nhé"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>

                {/* Previews Message */}
                <div className="p-3.5 rounded-xl bg-[var(--chip)] border border-[var(--line)] space-y-2">
                  <div className="flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="font-bold">Nội dung gửi studio:</span>
                    <button
                      type="button"
                      onClick={handleCopyMessage}
                      className="inline-flex items-center gap-1 text-[var(--brass)] hover:underline"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </button>
                  </div>
                  <p className="text-xs font-mono text-[var(--text)] whitespace-pre-line leading-relaxed">
                    {generatedMessage}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleZaloSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:flex-1 py-3 rounded-xl font-bold text-sm bg-[#0068ff] text-white hover:bg-[#0055d4] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Gửi đơn & Nhận file qua Zalo</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? "Đang gửi..." : "Gửi đơn hàng"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Interactive Pad Testing for EACH Kit */}
        {testingKit && (
          <InteractivePadModal
            kit={testingKit}
            isOpen={Boolean(testingKit)}
            onClose={() => setTestingKit(null)}
            onSelectToBuy={(k) => {
              setTestingKit(null);
              openOrderModal(k);
            }}
          />
        )}
      </div>
    </section>
  );
}
