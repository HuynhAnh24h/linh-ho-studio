"use client";

import React, { useState } from "react";
import { SoundKitItem, ComboOffer } from "@/lib/types";
import {
  Plus,
  Edit2,
  Trash2,
  Headphones,
  Play,
  Pause,
  X,
  Upload,
  Volume2,
  Percent,
  Sliders,
  Zap,
  Check,
  Link as LinkIcon,
  Layers,
  Sparkles,
} from "lucide-react";
import { drumAudioEngine, PadKey } from "@/lib/audio-engine";

interface AdminKitsProps {
  kits: SoundKitItem[];
  comboOffer: ComboOffer;
  onRefresh: () => void;
}

const COMMON_DEVICES = [
  "Roland SPD-30 (Octapad)",
  "Roland SPD-SX",
  "Roland SPD-SX PRO",
  "NUX DP-2000",
  "Avatar HXW",
  "Donner Drum Pad",
  "Alesis SamplePad",
];

export function AdminKits({ kits, comboOffer, onRefresh }: AdminKitsProps) {
  const [activeTab, setActiveTab] = useState<"spd30" | "sample_pad" | "combo">("sample_pad");
  const [editingKit, setEditingKit] = useState<SoundKitItem | null>(null);
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Audio preview state
  const [playingKitId, setPlayingKitId] = useState<string | null>(null);
  const [activeAudioObj, setActiveAudioObj] = useState<HTMLAudioElement | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [padType, setPadType] = useState<"spd30" | "sample_pad">("sample_pad");
  const [category, setCategory] = useState("vinahouse_edm");
  const [compatibleDevices, setCompatibleDevices] = useState<string[]>([]);
  const [price, setPrice] = useState(450000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [sampleCount, setSampleCount] = useState("120 sample");
  const [format, setFormat] = useState("WAV 24-bit 44.1kHz");
  const [badge, setBadge] = useState("");
  const [demoAudioUrl, setDemoAudioUrl] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [bpm, setBpm] = useState(110);
  const [samples, setSamples] = useState<Record<string, string>>({});

  // Combo Form State
  const [comboTitle, setComboTitle] = useState(comboOffer.title);
  const [comboPrice, setComboPrice] = useState(comboOffer.price);
  const [comboOriginalPrice, setComboOriginalPrice] = useState(comboOffer.originalPrice);
  const [comboBadge, setComboBadge] = useState(comboOffer.badge);
  const [comboDesc, setComboDesc] = useState(comboOffer.desc);

  // Sync comboOffer prop changes
  React.useEffect(() => {
    setComboTitle(comboOffer.title);
    setComboPrice(comboOffer.price);
    setComboOriginalPrice(comboOffer.originalPrice);
    setComboBadge(comboOffer.badge);
    setComboDesc(comboOffer.desc);
  }, [comboOffer]);

  const openCreateKit = (presetPadType?: "spd30" | "sample_pad") => {
    const targetType = (presetPadType || activeTab) === "spd30" ? "spd30" : "sample_pad";
    setEditingKit(null);
    setPadType(targetType);
    setName(targetType === "spd30" ? "Bộ Tiếng SPD-30 Cài Đặt Sẵn" : "Bộ Tiếng Sound Ngoài WAV");
    setDesc("");
    setCategory(targetType === "spd30" ? "spd30_preset" : "vinahouse_edm");
    setCompatibleDevices(
      targetType === "spd30"
        ? ["Roland SPD-30 (Octapad)"]
        : ["Roland SPD-SX", "Roland SPD-SX PRO", "NUX DP-2000", "Avatar HXW"]
    );
    setPrice(targetType === "spd30" ? 450000 : 490000);
    setOriginalPrice(650000);
    setSampleCount(targetType === "spd30" ? "50 User Kits" : "160 WAV Samples + 12 Kits");
    setFormat(targetType === "spd30" ? "File Backup SPD-30 (.SVD)" : "WAV 24-bit 44.1kHz");
    setBadge(targetType === "spd30" ? "Bán Chạy Nhất" : "Hot Show");
    setDemoAudioUrl("");
    setDownloadUrl("");
    setFeaturesText(
      targetType === "spd30"
        ? "Cân chỉnh tỉ mỉ từng thông số EQ, Layer, Muffle, Tune\nCó file Backup cắm USB load 1 phút là xong\nHướng dẫn nạp chi tiết qua Zalo"
        : "Định dạng WAV 24-bit 44.1kHz chuẩn phòng thu\nKick & Snare nén căng qua Master Limiter\nBao gồm video hướng dẫn nạp vào Pad"
    );
    setBpm(110);
    setSamples({});
    setIsKitModalOpen(true);
  };

  const openEditKit = (k: SoundKitItem) => {
    setEditingKit(k);
    setName(k.name);
    setDesc(k.desc);
    setPadType(k.padType || "sample_pad");
    setCategory(k.category || "pop_ballad");
    setCompatibleDevices(k.compatibleDevices || []);
    setPrice(k.price);
    setOriginalPrice(k.originalPrice);
    setSampleCount(k.sampleCount);
    setFormat(k.format);
    setBadge(k.badge || "");
    setDemoAudioUrl(k.demoAudioUrl || "");
    setDownloadUrl(k.downloadUrl || "");
    setFeaturesText(k.features ? k.features.join("\n") : "");
    setBpm(k.synthConfig?.bpm || 110);
    setSamples(k.samples ? { ...k.samples } : {});
    setIsKitModalOpen(true);
  };

  const toggleDeviceSelection = (device: string) => {
    if (compatibleDevices.includes(device)) {
      setCompatibleDevices(compatibleDevices.filter((d) => d !== device));
    } else {
      setCompatibleDevices([...compatibleDevices, device]);
    }
  };

  const handleDemoAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading("demo");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", `${name || "Kit"} - Demo Audio`);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const audioUrl = data.url || data.media?.url;
      if (audioUrl) {
        setDemoAudioUrl(audioUrl);
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải tệp âm thanh demo!");
    } finally {
      setIsUploading(null);
    }
  };

  const handlePadAudioUpload = async (padKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(padKey);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", `${name || "Kit"} - ${padKey.toUpperCase()}`);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const audioUrl = data.url || data.media?.url;
      if (audioUrl) {
        setSamples((prev) => ({ ...prev, [padKey]: audioUrl }));
      } else {
        alert("Không thể lưu file âm thanh. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải tệp âm thanh pad!");
    } finally {
      setIsUploading(null);
    }
  };

  const testPlaySample = (padKey: PadKey, customKit?: SoundKitItem) => {
    if (customKit) {
      drumAudioEngine.playSound(padKey, customKit);
      return;
    }

    const currentFormKit: SoundKitItem = {
      id: editingKit ? editingKit.id : "preview",
      name: name || "Preview",
      desc: desc || "",
      padType,
      category,
      compatibleDevices,
      price: Number(price) || 0,
      sampleCount,
      format,
      samples,
      synthConfig: {
        kick: editingKit?.synthConfig?.kick || [150, 45, 0.45],
        snare: editingKit?.synthConfig?.snare || [190, 0.22],
        hat: editingKit?.synthConfig?.hat || [0.05, 0.35],
        tom: editingKit?.synthConfig?.tom || 1,
        crash: editingKit?.synthConfig?.crash || 1.6,
        lp: editingKit?.synthConfig?.lp || 18000,
        bpm: Number(bpm) || 110,
      },
      order: 0,
    };
    drumAudioEngine.playSound(padKey, currentFormKit);
  };

  const togglePlayDemo = (kit: SoundKitItem) => {
    if (playingKitId === kit.id) {
      if (activeAudioObj) {
        activeAudioObj.pause();
        setActiveAudioObj(null);
      }
      setPlayingKitId(null);
      return;
    }

    if (activeAudioObj) {
      activeAudioObj.pause();
    }

    if (kit.demoAudioUrl) {
      const audio = new Audio(kit.demoAudioUrl);
      setActiveAudioObj(audio);
      setPlayingKitId(kit.id);
      audio.play().catch(() => {});
      audio.onended = () => {
        setPlayingKitId(null);
        setActiveAudioObj(null);
      };
    } else {
      // test pad sound
      testPlaySample("snare", kit);
    }
  };

  const handleKitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Vui lòng nhập tên bộ tiếng!");
      return;
    }

    setIsSaving(true);

    const featuresArray = featuresText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      ...(editingKit ? { id: editingKit.id } : {}),
      name: name.trim(),
      desc: desc.trim(),
      padType,
      category,
      compatibleDevices,
      price: Number(price) || 0,
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      sampleCount: sampleCount.trim(),
      format: format.trim(),
      badge: badge.trim(),
      demoAudioUrl: demoAudioUrl.trim(),
      downloadUrl: downloadUrl.trim(),
      features: featuresArray,
      samples,
      synthConfig: {
        kick: editingKit?.synthConfig?.kick || [150, 45, 0.45],
        snare: editingKit?.synthConfig?.snare || [190, 0.22],
        hat: editingKit?.synthConfig?.hat || [0.05, 0.35],
        tom: editingKit?.synthConfig?.tom || 1,
        crash: editingKit?.synthConfig?.crash || 1.6,
        lp: editingKit?.synthConfig?.lp || 18000,
        bpm: Number(bpm) || 110,
      },
      order: editingKit ? editingKit.order : kits.length + 1,
    };

    try {
      const res = await fetch("/api/kits", {
        method: editingKit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsKitModalOpen(false);
        onRefresh();
      } else {
        alert("Lưu thất bại!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKit = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá bộ sampler này?")) return;
    try {
      const res = await fetch(`/api/kits?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch("/api/kits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "combo",
          combo: {
            title: comboTitle,
            price: Number(comboPrice),
            originalPrice: Number(comboOriginalPrice),
            badge: comboBadge,
            desc: comboDesc,
          },
        }),
      });

      if (res.ok) {
        setIsComboModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const padKeys: PadKey[] = ["kick", "snare", "hat", "tom", "clap", "crash"];

  // Filter kits for display
  const spd30Kits = kits.filter((k) => k.padType === "spd30");
  const samplePadKits = kits.filter((k) => k.padType !== "spd30");
  const displayedKits = activeTab === "spd30" ? spd30Kits : samplePadKits;

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 sm:p-7 rounded-3xl bg-[var(--surface)] border border-[var(--line)]">
        <div>
          <h2 className="font-condensed font-extrabold text-2xl sm:text-3xl text-[var(--text)] flex items-center gap-3">
            <Headphones className="w-7 h-7 text-[var(--brass)]" />
            <span>Quản lý Bộ Sampler & Sound Packs</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Phân định rõ ràng: <b>Roland SPD-30 (Sound gốc)</b> và <b>Hệ sinh thái Sound Ngoài (SPD-SX, NUX, Avatar...)</b>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsComboModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-[var(--line)] text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-all"
          >
            <Percent className="w-4 h-4 text-amber-400" />
            <span>Sửa Gói Combo</span>
          </button>

          <button
            onClick={() => openCreateKit(activeTab === "spd30" ? "spd30" : "sample_pad")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sound Pack Mới</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex items-center gap-3 border-b border-[var(--line)] pb-3">
        <button
          onClick={() => setActiveTab("sample_pad")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "sample_pad"
              ? "bg-[var(--brass)] text-[#1e1715] shadow-md"
              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Sound Ngoài (SPD-SX, NUX, Avatar...)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-black/20 font-mono">
            {samplePadKits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("spd30")}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "spd30"
              ? "bg-[var(--brass)] text-[#1e1715] shadow-md"
              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>Roland SPD-30 (Sound Gốc)</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-black/20 font-mono">
            {spd30Kits.length}
          </span>
        </button>
      </div>

      {/* Info Notice per category */}
      {activeTab === "spd30" ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
          <Zap className="w-4 h-4 flex-shrink-0" />
          <span>
            <b>Lưu ý SPD-30:</b> Roland SPD-30 không nạp file sample âm thanh ngoài được mà dùng chip tiếng gốc của hãng. Các bộ tiếng ở đây là các File Backup (.SVD) chứa các User Kit đã được cân chỉnh EQ, Layer, Tune, FX sẵn cho anh em chỉ cần cắm USB vào load chơi.
          </span>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
          <Sliders className="w-4 h-4 flex-shrink-0" />
          <span>
            <b>Lưu ý Sound Ngoài:</b> Roland SPD-SX, SPD-SX PRO, NUX DP-2000, Avatar HXW, Donner... đều dùng chung định dạng WAV chuẩn 24-bit 44.1kHz. Bạn có thể phân loại theo thể loại (Vinahouse, Pop Ballad, Gõ Acoustic...) và gắn kèm Drive Link để gửi khách.
          </span>
        </div>
      )}

      {/* Kit Cards Grid */}
      {displayedKits.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] text-sm">
          Chưa có bộ tiếng nào trong danh mục này. Hãy bấm "Thêm Sound Pack Mới" để tạo!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedKits.map((kit) => {
            const isPlaying = playingKitId === kit.id;
            return (
              <div
                key={kit.id}
                className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)]/50 transition-all p-5 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          kit.padType === "spd30"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {kit.padType === "spd30" ? "SPD-30 (Gốc)" : "Sound Ngoài (WAV)"}
                      </span>
                      {kit.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300">
                          {kit.badge}
                        </span>
                      )}
                    </div>

                    {/* Play Demo Button */}
                    <button
                      onClick={() => togglePlayDemo(kit)}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                        isPlaying
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-[var(--chip)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[#1e1715]"
                      }`}
                      title={kit.demoAudioUrl ? "Nghe file demo" : "Thử tiếng snare"}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <h3 className="font-condensed font-bold text-xl text-[var(--text)] line-clamp-1">
                    {kit.name}
                  </h3>

                  <div className="flex items-baseline gap-2">
                    <span className="font-condensed font-extrabold text-2xl text-[var(--brass)]">
                      {kit.price.toLocaleString("vi-VN")}đ
                    </span>
                    {kit.originalPrice && (
                      <s className="text-xs text-[var(--muted)]">
                        {kit.originalPrice.toLocaleString("vi-VN")}đ
                      </s>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-[var(--chip)] text-[var(--text)] text-[11px]">
                      {kit.sampleCount}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--chip)] text-[var(--text)] text-[11px]">
                      {kit.format}
                    </span>
                  </div>

                  {kit.compatibleDevices && kit.compatibleDevices.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {kit.compatibleDevices.map((d, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg)] border border-[var(--line)] text-[var(--muted)]">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                    {kit.desc}
                  </p>

                  {kit.downloadUrl && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      <span className="truncate">Đã gắn link tải Google Drive</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-[var(--line)] flex justify-end gap-2">
                  <button
                    onClick={() => openEditKit(kit)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--brass)] hover:bg-[var(--chip)] transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteKit(kit.id)}
                    className="p-2 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Xoá"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Kit Modal: Add / Edit */}
      {isKitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-2xl my-8 bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--line)]">
              <div>
                <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                  {editingKit ? "Chỉnh sửa Sound Pack" : "Thêm Sound Pack Mới"}
                </h3>
                <span className="text-xs text-[var(--muted)]">
                  Thiết lập thông tin, phân loại dòng máy và file demo âm thanh
                </span>
              </div>
              <button
                onClick={() => setIsKitModalOpen(false)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleKitSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1.5">
                  Loại Thiết Bị & Hệ Sinh Thái Sound *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPadType("sample_pad");
                      if (!editingKit) {
                        setFormat("WAV 24-bit 44.1kHz");
                        setCompatibleDevices(["Roland SPD-SX", "Roland SPD-SX PRO", "NUX DP-2000", "Avatar HXW"]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 text-center transition-all ${
                      padType === "sample_pad"
                        ? "border-[var(--brass)] bg-[var(--brass)]/10 text-[var(--text)]"
                        : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--chip)]"
                    }`}
                  >
                    <Sliders className="w-5 h-5 text-blue-400" />
                    <span>Sound Ngoài (SPD-SX, NUX, Avatar...)</span>
                    <span className="text-[10px] text-[var(--muted)] font-normal">Nhận file âm thanh WAV ngoài</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPadType("spd30");
                      if (!editingKit) {
                        setFormat("File Backup SPD-30 (.SVD)");
                        setCompatibleDevices(["Roland SPD-30 (Octapad)"]);
                      }
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 text-center transition-all ${
                      padType === "spd30"
                        ? "border-[var(--brass)] bg-[var(--brass)]/10 text-[var(--text)]"
                        : "border-[var(--line)] text-[var(--muted)] hover:bg-[var(--chip)]"
                    }`}
                  >
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Roland SPD-30 (Sound Gốc)</span>
                    <span className="text-[10px] text-[var(--muted)] font-normal">File backup kit căn chỉnh thông số</span>
                  </button>
                </div>
              </div>

              {/* Name & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Tên bộ tiếng *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bộ Tiếng Vinahouse Party EDM"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Badge nổi bật
                  </label>
                  <input
                    type="text"
                    placeholder="Bán Chạy Nhất, Cực Cháy..."
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Devices checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Thể loại âm nhạc
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)] focus:outline-none"
                  >
                    {padType === "spd30" ? (
                      <>
                        <option value="spd30_preset">SPD-30: Preset Đi Show Đám Tiệc</option>
                        <option value="thanh_ca">SPD-30: Thánh Ca Phụng Vụ</option>
                        <option value="rock_pop">SPD-30: Pop Ballad & Rock</option>
                        <option value="other">SPD-30: Khác</option>
                      </>
                    ) : (
                      <>
                        <option value="vinahouse_edm">Vinahouse / EDM / Remix</option>
                        <option value="pop_ballad">Pop Ballad / Nhạc Trẻ Studio</option>
                        <option value="acoustic_percussion">Acoustic / Gõ Latin / Cajon</option>
                        <option value="show_all">Mega Pack: All-in-One Đi Tour</option>
                        <option value="rock_funk">Rock / Funk / Metal</option>
                        <option value="thanh_ca">Thánh Ca & Worship</option>
                        <option value="other">Thể loại khác</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Số lượng tiếng & Định dạng
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="160 WAV Samples"
                      value={sampleCount}
                      onChange={(e) => setSampleCount(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-xs focus:border-[var(--brass)] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="WAV 24-bit"
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-xs focus:border-[var(--brass)] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Compatible Devices Checklist */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1.5">
                  Dòng Máy Pad Tương Thích (chọn các dòng tương thích)
                </label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_DEVICES.map((dev) => {
                    const isSelected = compatibleDevices.includes(dev);
                    return (
                      <button
                        type="button"
                        key={dev}
                        onClick={() => toggleDeviceSelection(dev)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          isSelected
                            ? "bg-[var(--brass)] text-[#1e1715] border-[var(--brass)] font-bold"
                            : "bg-[var(--bg)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--text)]"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {dev}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Giá bán (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="450000"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Giá gốc gạch ngang (tuỳ chọn)
                  </label>
                  <input
                    type="number"
                    placeholder="650000"
                    value={originalPrice || ""}
                    onChange={(e) => setOriginalPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Audio Demo & Download Drive Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    File Âm Thanh Demo (để khách nghe thử)
                  </label>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="https://... hoặc tải lên"
                      value={demoAudioUrl}
                      onChange={(e) => setDemoAudioUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-xs focus:border-[var(--brass)] focus:outline-none"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--line)] transition-colors border border-[var(--line)]">
                      <Upload className="w-3.5 h-3.5 text-[var(--brass)]" />
                      <span>{isUploading === "demo" ? "Đang tải audio..." : "Tải tệp MP3 / WAV demo"}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleDemoAudioUpload}
                        disabled={isUploading === "demo"}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Link Tải File (Google Drive / Fshare)
                  </label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-xs focus:border-[var(--brass)] focus:outline-none"
                  />
                  <span className="text-[10px] text-[var(--muted)] mt-1 block">
                    Lưu trữ link tải để dễ dàng copy gửi khách khi có đơn hàng.
                  </span>
                </div>
              </div>

              {/* 6 Pad Audio Sounds Upload Section */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[var(--bg)] border border-[var(--line)] space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-sm text-[var(--text)] flex items-center gap-2">
                      <Volume2 className="w-4 h-4 text-[var(--brass)]" />
                      <span>Cài Đặt Âm Thanh 6 Pad Cho Bộ Này (Kick, Snare, Hat, Tom, Clap, Crash)</span>
                    </h4>
                    <p className="text-xs text-[var(--muted)]">
                      Tải file WAV/MP3 riêng cho từng ô pad để khách hàng gõ thử cảm nhận và phát beat mẫu trên website.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--muted)] font-bold">Tốc độ BPM:</span>
                    <input
                      type="number"
                      value={bpm}
                      onChange={(e) => setBpm(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg bg-[var(--surface)] border border-[var(--line)] text-center font-bold text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { id: "kick" as PadKey, name: "Kick (Trống Bass)", key: "Q" },
                    { id: "snare" as PadKey, name: "Snare (Trống Con)", key: "W" },
                    { id: "hat" as PadKey, name: "Hi-Hat (Chũm Chọe)", key: "E" },
                    { id: "tom" as PadKey, name: "Tom (Trống Trung)", key: "A" },
                    { id: "clap" as PadKey, name: "Clap (Vỗ Tay / Rim)", key: "S" },
                    { id: "crash" as PadKey, name: "Crash (Chũm Chọe Vang)", key: "D" },
                  ].map((pad) => {
                    const hasAudio = Boolean(samples[pad.id]);
                    const isUp = isUploading === pad.id;

                    return (
                      <div
                        key={pad.id}
                        className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--line)] space-y-2 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[var(--text)] uppercase tracking-wider flex items-center gap-1.5">
                            <span>{pad.name}</span>
                            <span className="text-[10px] text-[var(--muted)] font-mono">({pad.key})</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => testPlaySample(pad.id)}
                            className="p-1.5 rounded-lg bg-[var(--chip)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-colors"
                            title="Nghe thử âm thanh pad này"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={`truncate ${hasAudio ? "text-emerald-400 font-semibold" : "text-[var(--muted)]"}`}>
                              {hasAudio ? "✓ Đã nạp file WAV riêng" : "Âm thanh synth giả lập"}
                            </span>
                            {hasAudio && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newSamples = { ...samples };
                                  delete newSamples[pad.id];
                                  setSamples(newSamples);
                                }}
                                className="text-red-400 hover:underline text-[10px]"
                              >
                                Gỡ file
                              </button>
                            )}
                          </div>

                          <label className="w-full cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--line)] transition-colors border border-[var(--line)]">
                            <Upload className="w-3 h-3 text-[var(--brass)]" />
                            <span>{isUp ? "Đang tải..." : hasAudio ? "Thay file khác" : "Tải file âm thanh"}</span>
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handlePadAudioUpload(pad.id, e)}
                              disabled={isUp}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description & Key Features */}
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                  Mô tả phong cách âm thanh
                </label>
                <textarea
                  rows={2}
                  placeholder="Mô tả chất âm, độ nén, sự phù hợp với các dòng nhạc..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                  Đặc điểm nổi bật (mỗi dòng 1 gạch đầu dòng)
                </label>
                <textarea
                  rows={3}
                  placeholder="Cân chỉnh sẵn EQ cho từng tiếng&#10;Kèm video hướng dẫn nạp chi tiết&#10;Hỗ trợ Ultraviewer miễn phí"
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-xs font-mono focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsKitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line)] text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] shadow-sm"
                >
                  {isSaving ? "Đang lưu..." : "Lưu Sound Pack"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Combo Modal */}
      {isComboModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--line)]">
              <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                Cấu hình Gói Combo Ưu Đãi
              </h3>
              <button
                onClick={() => setIsComboModalOpen(false)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleComboSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                  Tiêu đề gói combo *
                </label>
                <input
                  type="text"
                  required
                  value={comboTitle}
                  onChange={(e) => setComboTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Giá bán combo (VNĐ) *
                  </label>
                  <input
                    type="number"
                    required
                    value={comboPrice}
                    onChange={(e) => setComboPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                    Giá gốc
                  </label>
                  <input
                    type="number"
                    value={comboOriginalPrice}
                    onChange={(e) => setComboOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                  Badge giảm giá
                </label>
                <input
                  type="text"
                  value={comboBadge}
                  onChange={(e) => setComboBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-[var(--muted)] mb-1">
                  Mô tả ưu đãi
                </label>
                <textarea
                  rows={3}
                  value={comboDesc}
                  onChange={(e) => setComboDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm focus:border-[var(--brass)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsComboModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line)] text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] shadow-sm"
                >
                  {isSaving ? "Đang lưu..." : "Cập nhật Combo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
