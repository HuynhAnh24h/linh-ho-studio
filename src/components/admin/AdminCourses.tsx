"use client";

import React, { useState } from "react";
import { CourseItem } from "@/lib/types";
import { Plus, Edit2, Trash2, Check, X, GraduationCap, Ribbon } from "lucide-react";

interface AdminCoursesProps {
  courses: CourseItem[];
  onRefresh: () => void;
}

export function AdminCourses({ courses, onRefresh }: AdminCoursesProps) {
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [priceNumber, setPriceNumber] = useState(300000);
  const [unit, setUnit] = useState("/ buổi 60 phút");
  const [iconName, setIconName] = useState("sprout");
  const [isPopular, setIsPopular] = useState(false);
  const [features, setFeatures] = useState<string[]>([""]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle("");
    setPrice("300k");
    setPriceNumber(300000);
    setUnit("/ buổi 60 phút");
    setIconName("sprout");
    setIsPopular(false);
    setFeatures([""]);
    setIsModalOpen(true);
  };

  const openEditModal = (c: CourseItem) => {
    setEditingCourse(c);
    setTitle(c.title);
    setPrice(c.price);
    setPriceNumber(c.priceNumber);
    setUnit(c.unit);
    setIconName(c.iconName || "sprout");
    setIsPopular(!!c.isPopular);
    setFeatures(c.features.length > 0 ? [...c.features] : [""]);
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    setFeatures([...features, ""]);
  };

  const handleFeatureChange = (index: number, val: string) => {
    const updated = [...features];
    updated[index] = val;
    setFeatures(updated);
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const cleanFeatures = features.map((f) => f.trim()).filter((f) => f.length > 0);

    const payload = {
      ...(editingCourse ? { id: editingCourse.id } : {}),
      title,
      price,
      priceNumber: Number(priceNumber),
      unit,
      iconName,
      isPopular,
      features: cleanFeatures,
      order: editingCourse ? editingCourse.order : courses.length + 1,
    };

    try {
      const res = await fetch("/api/courses", {
        method: editingCourse ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsModalOpen(false);
        onRefresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá khoá học này?")) return;
    try {
      const res = await fetch(`/api/courses?id=${id}`, {
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
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-condensed font-extrabold text-3xl text-[var(--text)]">
            Quản lý Khoá học dạy trống
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Thêm mới, sửa đổi lộ trình và giá học phí các khoá học
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khoá học mới</span>
        </button>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className={`relative bg-[var(--surface)] border rounded-2xl p-6 flex flex-col justify-between transition-all ${
              course.isPopular ? "border-[var(--brass)] shadow-md" : "border-[var(--line)]"
            }`}
          >
            {course.isPopular && (
              <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--ember)] text-white flex items-center gap-1">
                <Ribbon className="w-3 h-3" /> Phổ biến
              </span>
            )}

            <div className="space-y-3">
              <span className="ibox w-10 h-10 rounded-xl">
                <GraduationCap className="w-5 h-5 text-[var(--brass)]" />
              </span>

              <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                {course.title}
              </h3>

              <div className="font-condensed font-extrabold text-3xl text-[var(--brass)]">
                {course.price}{" "}
                <small className="font-normal font-sans text-xs text-[var(--muted)]">
                  {course.unit}
                </small>
              </div>

              <ul className="space-y-1.5 text-xs text-[var(--muted)] pt-1">
                {course.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[var(--brass)] flex-shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-5 mt-4 border-t border-[var(--line)] flex justify-end gap-2">
              <button
                onClick={() => openEditModal(course)}
                className="p-2 rounded-lg text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
                title="Chỉnh sửa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(course.id)}
                className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                title="Xoá khoá học"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                {editingCourse ? "Chỉnh sửa khoá học" : "Tạo khoá học mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Tên khoá học *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Người mới / Trung cấp / Chuyên sâu"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Giá hiển thị
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="300k"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Giá số (VNĐ)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="300000"
                    value={priceNumber}
                    onChange={(e) => setPriceNumber(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    placeholder="/ buổi 60 phút"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                    Icon đại diện
                  </label>
                  <select
                    value={iconName}
                    onChange={(e) => setIconName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
                  >
                    <option value="sprout">Mầm cây (Người mới)</option>
                    <option value="trending-up">Xu hướng lên (Trung cấp)</option>
                    <option value="award">Huy chương (Chuyên sâu)</option>
                    <option value="music">Nốt nhạc</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="popularCheck"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="w-4 h-4 accent-[var(--brass)]"
                />
                <label htmlFor="popularCheck" className="text-sm font-semibold text-[var(--text)] cursor-pointer">
                  Đánh dấu ruy-băng &ldquo;Phổ biến&rdquo; (nổi bật)
                </label>
              </div>

              {/* Bullet Features */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Nội dung nổi bật của khoá (dấu tích)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="text-xs font-bold text-[var(--brass)] hover:underline"
                  >
                    + Thêm dòng
                  </button>
                </div>

                {features.map((feat, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nội dung bài học..."
                      value={feat}
                      onChange={(e) => handleFeatureChange(idx, e.target.value)}
                      className="flex-1 px-3 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--line)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--line-strong)] text-[var(--text)] hover:bg-[var(--chip)]"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] shadow-sm"
                >
                  {isSaving ? "Đang lưu..." : "Lưu khoá học"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
