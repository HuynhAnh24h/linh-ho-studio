"use client";

import React, { useState } from "react";
import { SoundKitItem, ComboOffer } from "@/lib/types";
import { Plus, Edit2, Trash2, Headphones, Play, X, Upload, Volume2, Percent } from "lucide-react";
import { drumAudioEngine, PadKey } from "@/lib/audio-engine";

interface AdminKitsProps {
  kits: SoundKitItem[];
  comboOffer: ComboOffer;
  onRefresh: () => void;
}

export function AdminKits({ kits, comboOffer, onRefresh }: AdminKitsProps) {
  const [editingKit, setEditingKit] = useState<SoundKitItem | null>(null);
  const [isKitModalOpen, setIsKitModalOpen] = useState(false);
  const [isComboModalOpen, setIsComboModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState(450000);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(undefined);
  const [sampleCount, setSampleCount] = useState("120 sample");
  const [format, setFormat] = useState("WAV 24-bit");
  const [bpm, setBpm] = useState(100);
  const [samples, setSamples] = useState<Record<string, string>>({});

  // Combo Form State
  const [comboTitle, setComboTitle] = useState(comboOffer.title);
  const [comboPrice, setComboPrice] = useState(comboOffer.price);
  const [comboOriginalPrice, setComboOriginalPrice] = useState(comboOffer.originalPrice);
  const [comboBadge, setComboBadge] = useState(comboOffer.badge);
  const [comboDesc, setComboDesc] = useState(comboOffer.desc);

  const openCreateKit = () => {
    setEditingKit(null);
    setName("");
    setDesc("");
    setPrice(350000);
    setOriginalPrice(undefined);
    setSampleCount("100 sample");
    setFormat("WAV 24-bit");
    setBpm(100);
    setSamples({});
    setIsKitModalOpen(true);
  };

  const openEditKit = (k: SoundKitItem) => {
    setEditingKit(k);
    setName(k.name);
    setDesc(k.desc);
    setPrice(k.price);
    setOriginalPrice(k.originalPrice);
    setSampleCount(k.sampleCount);
    setFormat(k.format);
    setBpm(k.synthConfig.bpm || 100);
    setSamples(k.samples ? { ...k.samples } : {});
    setIsKitModalOpen(true);
  };

  const handleAudioUpload = async (padKey: string, e: React.ChangeEvent<HTMLInputElement>) => {
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
      if (data.success && data.media?.url) {
        setSamples((prev) => ({ ...prev, [padKey]: data.media.url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(null);
    }
  };

  const testPlaySample = (padKey: PadKey, customKit?: SoundKitItem) => {
    const k = customKit || editingKit || kits[0];
    if (k) {
      drumAudioEngine.playSound(padKey, k);
    }
  };

  const handleKitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...(editingKit ? { id: editingKit.id } : {}),
      name,
      desc,
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
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
        bpm: Number(bpm) || 100,
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

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-condensed font-extrabold text-3xl text-[var(--text)]">
            Quản lý Bộ Sampler & Âm thanh
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Tuỳ chỉnh các gói sound kit, cấu hình âm thanh mẫu và gói Combo ưu đãi
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsComboModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-all"
          >
            <Percent className="w-4 h-4" />
            <span>Sửa Combo cả 3 bộ</span>
          </button>

          <button
            onClick={openCreateKit}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm bộ sampler mới</span>
          </button>
        </div>
      </div>

      {/* Kit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kits.map((kit) => (
          <div
            key={kit.id}
            className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <span className="ibox w-10 h-10 rounded-xl">
                <Headphones className="w-5 h-5 text-[var(--brass)]" />
              </span>

              <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                {kit.name}
              </h3>

              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--chip)] text-[var(--text)]">
                  {kit.sampleCount}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--chip)] text-[var(--text)]">
                  {kit.format}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--chip)] text-[var(--text)]">
                  {kit.synthConfig.bpm || 100} BPM
                </span>
              </div>

              <div className="font-condensed font-extrabold text-3xl text-[var(--brass)]">
                {kit.price.toLocaleString("vi-VN")}đ
              </div>

              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                {kit.desc}
              </p>

              {/* Sample test buttons */}
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
                  Thử âm thanh trống:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {padKeys.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => testPlaySample(p, kit)}
                      className="px-2 py-1 rounded bg-[var(--chip)] text-xs font-semibold text-[var(--text)] hover:bg-[var(--brass)] hover:text-black transition-colors"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-[var(--line)] flex justify-end gap-2">
              <button
                onClick={() => openEditKit(kit)}
                className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
                title="Chỉnh sửa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteKit(kit.id)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                title="Xoá sampler"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Kit Edit Modal */}
      {isKitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                {editingKit ? "Chỉnh sửa bộ Sampler" : "Tạo bộ Sampler mới"}
              </h3>
              <button
                onClick={() => setIsKitModalOpen(false)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleKitSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Tên bộ sampler *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rock Acoustic / Hip-Hop Boom Bap..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Mô tả âm thanh
                </label>
                <textarea
                  rows={2}
                  placeholder="Kick dày, snare giòn, hi-hat sáng..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Nhịp độ BPM mẫu
                  </label>
                  <input
                    type="number"
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Số lượng sample
                  </label>
                  <input
                    type="text"
                    value={sampleCount}
                    onChange={(e) => setSampleCount(e.target.value)}
                    placeholder="120 sample"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Định dạng file
                  </label>
                  <input
                    type="text"
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    placeholder="WAV 24-bit"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              {/* Custom Audio Sample Uploads */}
              <div className="space-y-3 pt-3 border-t border-[var(--line)]">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
                    File âm thanh tuỳ chọn (Tuỳ chọn WAV/MP3)
                  </h4>
                  <p className="text-xs text-[var(--muted)]">
                    Nếu để trống, hệ thống sẽ tự động tổng hợp âm thanh bằng Web Audio API. Nếu tải file lên, web sẽ phát file âm thanh thật của bạn!
                  </p>
                </div>

                <div className="space-y-2">
                  {padKeys.map((padKey) => (
                    <div key={padKey} className="flex items-center gap-2 p-2 rounded-xl bg-[var(--bg)] border border-[var(--line)]">
                      <span className="w-16 text-xs font-bold uppercase text-[var(--text)]">
                        {padKey}:
                      </span>
                      <input
                        type="text"
                        placeholder="Link file audio hoặc tải lên..."
                        value={samples[padKey] || ""}
                        onChange={(e) =>
                          setSamples({ ...samples, [padKey]: e.target.value })
                        }
                        className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surface)] text-xs text-[var(--text)] outline-none"
                      />
                      <label className="cursor-pointer px-2.5 py-1.5 rounded-lg bg-[var(--chip)] text-xs font-semibold hover:bg-[var(--brass)] hover:text-black transition-colors flex items-center gap-1">
                        <Upload className="w-3 h-3" />
                        <span>{isUploading === padKey ? "..." : "Tải file"}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => handleAudioUpload(padKey, e)}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => testPlaySample(padKey)}
                        className="p-1.5 rounded-lg bg-[var(--chip)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-black transition-colors"
                        title="Nghe thử"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsKitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line-strong)] text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] shadow-sm"
                >
                  {isSaving ? "Đang lưu..." : "Lưu bộ Sampler"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Combo Offer Edit Modal */}
      {isComboModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                Chỉnh sửa Gói Combo ưu đãi
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
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Tiêu đề gói combo
                </label>
                <input
                  type="text"
                  required
                  value={comboTitle}
                  onChange={(e) => setComboTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Huy hiệu giảm giá (Badge)
                </label>
                <input
                  type="text"
                  value={comboBadge}
                  onChange={(e) => setComboBadge(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Giá bán Combo (VNĐ)
                  </label>
                  <input
                    type="number"
                    required
                    value={comboPrice}
                    onChange={(e) => setComboPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Giá gốc ban đầu (gạch ngang)
                  </label>
                  <input
                    type="number"
                    required
                    value={comboOriginalPrice}
                    onChange={(e) => setComboOriginalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Mô tả ưu đãi
                </label>
                <textarea
                  rows={2}
                  value={comboDesc}
                  onChange={(e) => setComboDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsComboModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line-strong)] text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] shadow-sm"
                >
                  {isSaving ? "Đang lưu..." : "Lưu gói Combo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
