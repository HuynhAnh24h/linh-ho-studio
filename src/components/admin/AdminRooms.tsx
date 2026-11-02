"use client";

import React, { useState } from "react";
import { RoomItem, RoomPerk } from "@/lib/types";
import { Plus, Edit2, Trash2, Clock, Check, X, ShieldCheck } from "lucide-react";

interface AdminRoomsProps {
  rooms: RoomItem[];
  roomPerks: RoomPerk[];
  onRefresh: () => void;
}

export function AdminRooms({ rooms, roomPerks, onRefresh }: AdminRoomsProps) {
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isPerkModalOpen, setIsPerkModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Room Form
  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState("");
  const [pricePerHour, setPricePerHour] = useState(120000);
  const [description, setDescription] = useState("");

  // Perk Form
  const [perkTitle, setPerkTitle] = useState("");
  const [perkIcon, setPerkIcon] = useState("drum");

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

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-condensed font-extrabold text-3xl text-[var(--text)]">
            Quản lý Phòng tập & Tiện ích Studio
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Thiết lập danh sách phòng tập, đơn giá mỗi giờ và các trang thiết bị tiện nghi
          </p>
        </div>

        <button
          onClick={openCreateRoom}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm phòng tập mới</span>
        </button>
      </div>

      {/* Room list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="ibox w-10 h-10 rounded-xl">
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

      {/* Rehearsal Studio Perks */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-condensed font-bold text-2xl text-[var(--text)] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--brass)]" />
              <span>Tiện ích & Trang thiết bị phòng tập</span>
            </h3>
            <p className="text-xs text-[var(--muted)]">
              Hiển thị ở cột bên trái mục Thuê phòng tập
            </p>
          </div>

          <button
            onClick={() => setIsPerkModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[var(--chip)] text-xs font-bold text-[var(--text)] hover:bg-[var(--brass)] hover:text-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm tiện ích</span>
          </button>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line-strong)] text-[var(--text)] hover:bg-[var(--chip)]"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Icon
                </label>
                <select
                  value={perkIcon}
                  onChange={(e) => setPerkIcon(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
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
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line-strong)] text-[var(--text)] hover:bg-[var(--chip)]"
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
    </div>
  );
}
