"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RoomItem, RoomPerk, RoomImageItem } from "@/lib/types";
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  Check,
  X,
  ShieldCheck,
  Image as ImageIcon,
  Upload,
} from "lucide-react";

interface AdminRoomsProps {
  rooms: RoomItem[];
  roomPerks: RoomPerk[];
  roomImages?: RoomImageItem[];
  onRefresh: () => void;
}

export function AdminRooms({ rooms, roomPerks, roomImages = [], onRefresh }: AdminRoomsProps) {
  const [activeSubTab, setActiveSubTab] = useState<"rooms" | "perks" | "images">("rooms");
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isPerkModalOpen, setIsPerkModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Room Form
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pricePerHour, setPricePerHour] = useState(120000);
  const [description, setDescription] = useState("");

  // Perk Form
  const [perkTitle, setPerkTitle] = useState("");
  const [perkIcon, setPerkIcon] = useState("drum");

  // Room Image Form
  const [imageTitle, setImageTitle] = useState("");
  const [imageCategory, setImageCategory] = useState("phong-tap");
  const [imageUrl, setImageUrl] = useState("");

  const openCreateRoom = () => {
    setEditingRoom(null);
    setName("Phòng ");
    setCapacity("4-6 người");
    setPricePerHour(150000);
    setDescription("");
    setIsRoomModalOpen(true);
  };

  const openEditRoom = (r: RoomItem) => {
    setEditingRoom(r);
    setName(r.name);
    setCapacity(r.capacity);
    setPricePerHour(r.pricePerHour);
    setDescription(r.description || "");
    setIsRoomModalOpen(true);
  };

  const handleRoomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...(editingRoom ? { id: editingRoom.id } : {}),
      name,
      capacity,
      pricePerHour: Number(pricePerHour),
      description,
      order: editingRoom ? editingRoom.order : rooms.length + 1,
    };

    try {
      const res = await fetch("/api/rooms", {
        method: editingRoom ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsRoomModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá phòng này?")) return;
    try {
      const res = await fetch(`/api/rooms?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddPerk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perkTitle.trim()) return;

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "perk",
          title: perkTitle.trim(),
          iconName: perkIcon,
        }),
      });
      if (res.ok) {
        setPerkTitle("");
        setIsPerkModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePerk = async (id: string) => {
    try {
      const res = await fetch(`/api/rooms?id=${id}&type=perk`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Image Upload & CRUD
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setImageUrl(item.url || item.media?.url || "");
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

  const handleAddRoomImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageTitle.trim() || !imageUrl.trim()) {
      alert("Vui lòng nhập tên ảnh và tải ảnh lên!");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/room-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: imageTitle.trim(),
          category: imageCategory,
          imageUrl: imageUrl.trim(),
        }),
      });

      if (res.ok) {
        setImageTitle("");
        setImageUrl("");
        setIsImageModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoomImage = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá ảnh này?")) return;
    try {
      const res = await fetch(`/api/room-images?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)]">
        <div>
          <h2 className="font-condensed font-extrabold text-2xl sm:text-3xl text-[var(--text)] flex items-center gap-3">
            <Clock className="w-7 h-7 text-[var(--brass)]" />
            <span>Quản lý Phòng tập & Tiện ích Studio</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Thiết lập danh sách phòng tập, đơn giá mỗi giờ, trang thiết bị và album ảnh phòng tại trang <b>/phong-tap</b>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeSubTab === "rooms" && (
            <button
              onClick={openCreateRoom}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm phòng tập mới</span>
            </button>
          )}
          {activeSubTab === "perks" && (
            <button
              onClick={() => setIsPerkModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm tiện ích</span>
            </button>
          )}
          {activeSubTab === "images" && (
            <button
              onClick={() => {
                setImageTitle("Không gian phòng tập");
                setImageCategory("phong-tap");
                setImageUrl("");
                setIsImageModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm ảnh phòng</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--line)] pb-3">
        <button
          onClick={() => setActiveSubTab("rooms")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === "rooms"
              ? "bg-[var(--brass)] text-[#1e1715] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
          }`}
        >
          Danh sách Phòng ({rooms.length})
        </button>
        <button
          onClick={() => setActiveSubTab("perks")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === "perks"
              ? "bg-[var(--brass)] text-[#1e1715] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
          }`}
        >
          Trang bị & Tiện ích ({roomPerks.length})
        </button>
        <button
          onClick={() => setActiveSubTab("images")}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeSubTab === "images"
              ? "bg-[var(--brass)] text-[#1e1715] shadow-sm"
              : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
          }`}
        >
          Hình ảnh phòng tập ({roomImages.length})
        </button>
      </div>

      {/* Tab 1: Room list */}
      {activeSubTab === "rooms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="w-10 h-10 rounded-xl bg-[var(--chip)] border border-[var(--line)] flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[var(--brass)]" />
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--chip)] text-[var(--text)]">
                    {room.capacity}
                  </span>
                </div>

                <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                  {room.name}
                </h3>

                <div className="font-condensed font-extrabold text-3xl text-[var(--brass)]">
                  {room.pricePerHour.toLocaleString("vi-VN")}đ{" "}
                  <small className="font-normal font-sans text-xs text-[var(--muted)]">
                    / giờ
                  </small>
                </div>

                {room.description && (
                  <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                    {room.description}
                  </p>
                )}
              </div>

              <div className="pt-5 mt-4 border-t border-[var(--line)] flex justify-end gap-2">
                <button
                  onClick={() => openEditRoom(room)}
                  className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
                  title="Chỉnh sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteRoom(room.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Xoá phòng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Rehearsal Studio Perks */}
      {activeSubTab === "perks" && (
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-6">
          <div>
            <h3 className="font-condensed font-bold text-2xl text-[var(--text)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brass)]" />
              <span>Tiện ích & Trang thiết bị phòng tập</span>
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Hiển thị trong danh sách cam kết chất lượng tại trang Phòng tập
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {roomPerks.map((perk) => (
              <div
                key={perk.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm"
              >
                <span className="font-medium text-[var(--text)] truncate pr-2">
                  {perk.title}
                </span>
                <button
                  onClick={() => handleDeletePerk(perk.id)}
                  className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Room Images Gallery */}
      {activeSubTab === "images" && (
        <div className="space-y-6">
          {(!roomImages || roomImages.length === 0) ? (
            <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] text-sm">
              Chưa có hình ảnh phòng tập nào. Bấm "Thêm ảnh phòng" để đăng tải ảnh đầu tiên!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {roomImages.map((img) => (
                <div
                  key={img.id}
                  className="group rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden shadow-sm hover:border-[var(--brass)]/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] bg-black/40 overflow-hidden">
                      <Image
                        src={img.imageUrl}
                        alt={img.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-[var(--text)] line-clamp-1">{img.title}</h4>
                      <span className="text-xs text-[var(--muted)] capitalize">{img.category}</span>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex justify-end">
                    <button
                      onClick={() => handleDeleteRoomImage(img.id)}
                      className="p-2 rounded-lg text-[var(--muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Xoá ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                {editingRoom ? "Chỉnh sửa phòng tập" : "Thêm phòng tập mới"}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRoomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Tên phòng
                </label>
                <input
                  type="text"
                  required
                  placeholder="Phòng A / Phòng VIP..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Sức chứa
                </label>
                <input
                  type="text"
                  required
                  placeholder="4 người / 8 người..."
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Giá mỗi giờ (VNĐ)
                </label>
                <input
                  type="number"
                  required
                  placeholder="120000"
                  value={pricePerHour}
                  onChange={(e) => setPricePerHour(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Mô tả trang bị phòng
                </label>
                <textarea
                  rows={2}
                  placeholder="Trang bị dàn âm thanh full-band, monitor cao cấp..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line)] text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] shadow-sm"
                >
                  {isSaving ? "Đang lưu..." : "Lưu phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Perk Modal */}
      {isPerkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                Thêm tiện ích / thiết bị
              </h3>
              <button
                onClick={() => setIsPerkModalOpen(false)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPerk} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Tiêu đề tiện ích *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trống Tama Starclassic..."
                  value={perkTitle}
                  onChange={(e) => setPerkTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Icon
                </label>
                <select
                  value={perkIcon}
                  onChange={(e) => setPerkIcon(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                >
                  <option value="drum">Trống (drum)</option>
                  <option value="speaker">Loa / Ampli (speaker)</option>
                  <option value="mic">Microphone (mic)</option>
                  <option value="snowflake">Máy lạnh (snowflake)</option>
                  <option value="clock">Thời gian (clock)</option>
                  <option value="percent">Giảm giá (percent)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsPerkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line)] text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] shadow-sm"
                >
                  Thêm tiện ích
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Room Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                Thêm ảnh không gian phòng tập
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRoomImage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Tiêu đề ảnh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phòng tập A - Dàn Tama Starclassic"
                  value={imageTitle}
                  onChange={(e) => setImageTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Đường dẫn URL ảnh hoặc Tải lên
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="https://... hoặc /uploads/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--line)] transition-colors border border-[var(--line)]">
                      <Upload className="w-3.5 h-3.5 text-[var(--brass)]" />
                      <span>{isUploading ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileUpload}
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

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsImageModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line)] text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] shadow-sm"
                >
                  {isSaving ? "Đang lưu..." : "Lưu ảnh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
