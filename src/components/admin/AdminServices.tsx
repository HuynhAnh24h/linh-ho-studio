"use client";

import React, { useState } from "react";
import Image from "next/image";
import { EventServiceItem } from "@/lib/types";
import {
  Plus,
  Edit2,
  Trash2,
  Music,
  X,
  Check,
  Upload,
  Sparkles,
  DollarSign,
  Tag,
  ListPlus,
} from "lucide-react";

interface AdminServicesProps {
  services: EventServiceItem[];
  onRefresh: () => void;
}

export function AdminServices({ services, onRefresh }: AdminServicesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EventServiceItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventServiceItem["category"]>("band_acoustic");
  const [price, setPrice] = useState("");
  const [priceNumber, setPriceNumber] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [featuresText, setFeaturesText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("");
    setCategory("band_acoustic");
    setPrice("Liên hệ báo giá");
    setPriceNumber(0);
    setDescription("");
    setFeaturesText("Trang thiết bị chuyên nghiệp\nÂm thanh ánh sáng chuẩn chỉnh\nĐội ngũ biểu diễn giàu kinh nghiệm");
    setImageUrl("https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80");
    setIsModalOpen(true);
  };

  const openEditModal = (item: EventServiceItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCategory(item.category);
    setPrice(item.price);
    setPriceNumber(item.priceNumber || 0);
    setDescription(item.description || "");
    setFeaturesText(item.features ? item.features.join("\n") : "");
    setImageUrl(item.imageUrl || "");
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const item = await res.json();
        setImageUrl(item.url);
      } else {
        alert("Tải lên thất bại. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi tải tệp tin lên server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Vui lòng nhập tên dịch vụ!");
      return;
    }

    try {
      setIsSaving(true);
      const featuresArray = featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const payload = {
        ...(editingItem ? { id: editingItem.id } : {}),
        title: title.trim(),
        category,
        price: price.trim() || "Liên hệ báo giá",
        priceNumber: Number(priceNumber) || 0,
        description: description.trim(),
        features: featuresArray,
        imageUrl: imageUrl.trim(),
      };

      const res = await fetch("/api/services", {
        method: editingItem ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      } else {
        alert("Lưu thất bại, vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá dịch vụ này?")) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "band_acoustic":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300">Band Acoustic</span>;
      case "thue_trong":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300">Thuê Dàn Trống</span>;
      case "full_band_tiec":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300">Band Tiệc Cưới Hỏi</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-500/20 text-gray-300">Dịch Vụ Khác</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)]">
        <div>
          <h2 className="font-condensed font-extrabold text-2xl sm:text-3xl text-[var(--text)] flex items-center gap-3">
            <Music className="w-7 h-7 text-[var(--brass)]" />
            <span>Quản lý Dịch vụ Biểu diễn & Sự kiện</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Quản lý các gói: Thuê Band Acoustic, Thuê dàn trống biểu diễn, Full Band tiệc cưới hỏi... hiển thị tại trang <b>/lien-he</b>.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm dịch vụ mới</span>
        </button>
      </div>

      {/* Grid of Services */}
      {(!services || services.length === 0) ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] text-sm">
          Chưa có dịch vụ nào. Hãy bấm "Thêm dịch vụ mới" để tạo!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden shadow-sm hover:border-[var(--brass)]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] bg-black/40 overflow-hidden">
                  <Image
                    src={item.imageUrl || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"}
                    alt={item.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute top-3 left-3">
                    {getCategoryBadge(item.category)}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-bold text-lg text-[var(--text)]">{item.title}</h3>
                  </div>

                  <div className="text-sm font-extrabold text-[var(--brass)]">
                    {item.price}
                  </div>

                  <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
                    {item.description || "Chưa có mô tả chi tiết."}
                  </p>

                  {item.features && item.features.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[var(--line)]/50">
                      {item.features.map((feat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[var(--text)]">
                          <Check className="w-3.5 h-3.5 text-[var(--brass)] flex-shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 border-t border-[var(--line)] flex items-center justify-end gap-2 bg-[var(--surface)]/50">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--brass)] hover:bg-[var(--chip)] transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Xoá"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl my-8 rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="font-bold text-lg text-[var(--text)]">
                {editingItem ? "Chỉnh sửa dịch vụ biểu diễn" : "Thêm dịch vụ biểu diễn mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                  Tên dịch vụ
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Cho thuê Band Acoustic Acoustic Event"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                    Phân loại
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as EventServiceItem["category"])}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                  >
                    <option value="band_acoustic">Band Acoustic</option>
                    <option value="thue_trong">Cho thuê dàn trống</option>
                    <option value="full_band_tiec">Band tiệc cưới & hỏi</option>
                    <option value="khac">Dịch vụ khác</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                    Mức giá hiển thị
                  </label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ví dụ: Từ 4.000.000đ / show"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                  Mô tả chi tiết
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Mô tả phong cách biểu diễn, phù hợp với sự kiện nào..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1 flex items-center justify-between">
                  <span>Các đặc điểm nổi bật (mỗi dòng 1 gạch đầu dòng)</span>
                  <ListPlus className="w-3.5 h-3.5 text-[var(--brass)]" />
                </label>
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={4}
                  placeholder={"Ban nhạc 3-4 thành viên (Vocal, Guitar, Cajon/Trống)\nBao trọn gói hệ thống âm thanh vừa và nhỏ\nĐến sớm setup trước 1-2 tiếng"}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm font-mono text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                  Hình ảnh dịch vụ
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... hoặc /uploads/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                  />

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--line)] transition-colors border border-[var(--line)]">
                      <Upload className="w-3.5 h-3.5 text-[var(--brass)]" />
                      <span>{isUploading ? "Đang tải..." : "Tải ảnh từ máy"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {imageUrl && (
                  <div className="mt-3 relative aspect-video rounded-xl overflow-hidden border border-[var(--line)] bg-black/40">
                    <Image
                      src={imageUrl}
                      alt="Xem trước"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] disabled:opacity-50 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSaving ? "Đang lưu..." : editingItem ? "Lưu thay đổi" : "Thêm dịch vụ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
