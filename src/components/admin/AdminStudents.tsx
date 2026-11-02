"use client";

import React, { useState } from "react";
import Image from "next/image";
import { StudentImageItem } from "@/lib/types";
import { Plus, Edit2, Trash2, GraduationCap, X, Check, Upload, Image as ImageIcon } from "lucide-react";

interface AdminStudentsProps {
  students: StudentImageItem[];
  onRefresh: () => void;
}

export function AdminStudents({ students, onRefresh }: AdminStudentsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StudentImageItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle("Học viên LH Studio");
    setCaption("Lớp trống cơ bản & nâng cao");
    setImageUrl("https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=800&q=80");
    setIsModalOpen(true);
  };

  const openEditModal = (item: StudentImageItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setCaption(item.caption || "");
    setImageUrl(item.imageUrl);
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
    if (!title.trim() || !imageUrl.trim()) {
      alert("Vui lòng nhập tên tiêu đề và hình ảnh!");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...(editingItem ? { id: editingItem.id } : {}),
        title: title.trim(),
        caption: caption.trim(),
        imageUrl: imageUrl.trim(),
      };

      const res = await fetch("/api/students", {
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
    if (!confirm("Bạn có chắc chắn muốn xoá ảnh học viên này?")) return;
    try {
      const res = await fetch(`/api/students?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl bg-[var(--surface)] border border-[var(--line)]">
        <div>
          <h2 className="font-condensed font-extrabold text-2xl sm:text-3xl text-[var(--text)] flex items-center gap-3">
            <GraduationCap className="w-7 h-7 text-[var(--brass)]" />
            <span>Quản lý Hình ảnh Học viên Dạy trống</span>
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Hình ảnh được hiển thị trực tiếp trên trang <b>/day-trong</b> để phụ huynh và học viên theo dõi không gian học tập.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm ảnh học viên</span>
        </button>
      </div>

      {/* Grid of Student Images */}
      {(!students || students.length === 0) ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-[var(--muted)] text-sm">
          Chưa có hình ảnh học viên nào. Hãy bấm "Thêm ảnh học viên" để tạo mục đầu tiên!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl bg-[var(--surface)] border border-[var(--line)] overflow-hidden shadow-sm hover:border-[var(--brass)]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="font-bold text-base text-[var(--text)] line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-[var(--muted)] line-clamp-2">{item.caption || "Chưa có mô tả"}</p>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-[var(--line)]/50 mt-2 flex items-center justify-end gap-2">
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl bg-[var(--surface)] border border-[var(--line)] p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="font-bold text-lg text-[var(--text)]">
                {editingItem ? "Chỉnh sửa ảnh học viên" : "Thêm ảnh học viên mới"}
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
                  Tiêu đề / Tên học viên
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ví dụ: Học viên Minh Nhật"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                  Mô tả / Lời nhắn
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ví dụ: Hoàn thành khoá học trống 3 tháng, tự tin chơi solo"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-1">
                  Đường dẫn URL ảnh (hoặc tải tệp lên)
                </label>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://... hoặc /uploads/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--line)] text-sm text-[var(--text)] focus:border-[var(--brass)] focus:outline-none"
                    required
                  />

                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--line)] transition-colors border border-[var(--line)]">
                      <Upload className="w-3.5 h-3.5 text-[var(--brass)]" />
                      <span>{isUploading ? "Đang tải ảnh..." : "Chọn ảnh từ máy tính"}</span>
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
                  <span>{isSaving ? "Đang lưu..." : editingItem ? "Lưu thay đổi" : "Thêm ảnh"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
