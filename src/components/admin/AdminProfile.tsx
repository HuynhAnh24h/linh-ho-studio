"use client";

import React, { useState } from "react";
import { ProfileData, StatItem } from "@/lib/types";
import { Save, Plus, Trash2, Check, Upload, UserRound } from "lucide-react";

interface AdminProfileProps {
  profile: ProfileData;
  onSaveProfile: (profile: ProfileData) => Promise<boolean>;
}

export function AdminProfile({ profile: initialProfile, onSaveProfile }: AdminProfileProps) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [stats, setStats] = useState<StatItem[]>(initialProfile.stats || []);
  const [genresInput, setGenresInput] = useState<string>((initialProfile.genres || []).join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleStatChange = (idx: number, field: "value" | "label", val: string) => {
    const updated = [...stats];
    updated[idx][field] = val;
    setStats(updated);
  };

  const handleAddStat = () => {
    setStats([...stats, { value: "5+", label: "kinh nghiệm mới" }]);
  };

  const handleRemoveStat = (idx: number) => {
    setStats(stats.filter((_, i) => i !== idx));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", "Avatar " + profile.name);

    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.media?.url) {
        setProfile((prev) => ({ ...prev, avatarUrl: data.media.url }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setIsSuccess(false);

    const genresList = genresInput
      .split(",")
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    const updatedProfile: ProfileData = {
      ...profile,
      stats,
      genres: genresList,
    };

    const ok = await onSaveProfile(updatedProfile);
    setIsSaving(false);
    if (ok) {
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-condensed font-extrabold text-3xl text-[var(--text)]">
            Thông tin cá nhân & Trang chủ
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Tuỳ chỉnh tên thương hiệu, tiểu sử, thể loại nhạc và thông tin liên hệ
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
        >
          {isSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? "Đang lưu..." : isSuccess ? "Đã lưu thành công!" : "Lưu thay đổi"}</span>
        </button>
      </div>

      {/* Basic Profile */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-6">
        <h3 className="font-condensed font-bold text-2xl text-[var(--text)] flex items-center gap-2">
          <UserRound className="w-5 h-5 text-[var(--brass)]" />
          <span>Thông tin chính</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Họ và tên / Nghệ danh
            </label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Ảnh đại diện (Avatar)
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={profile.avatarUrl}
                onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
                placeholder="Nhập link ảnh hoặc bấm tải lên..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
              />
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[var(--chip)] text-xs font-bold text-[var(--text)] hover:bg-[var(--brass)] hover:text-black transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? "..." : "Tải ảnh"}</span>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
            Slogan tiêu đề Hero (xuống dòng bằng Enter)
          </label>
          <textarea
            rows={2}
            value={profile.tagline}
            onChange={(e) => setProfile({ ...profile, tagline: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
            Mô tả ngắn gọn ở Hero
          </label>
          <textarea
            rows={2}
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Đoạn giới thiệu 1 (Giới thiệu bản thân)
            </label>
            <textarea
              rows={3}
              value={profile.aboutText1}
              onChange={(e) => setProfile({ ...profile, aboutText1: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Đoạn giới thiệu 2 (Mục tiêu & Phòng tập & Sampler)
            </label>
            <textarea
              rows={3}
              value={profile.aboutText2}
              onChange={(e) => setProfile({ ...profile, aboutText2: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
            Các thể loại nhạc & kỹ năng (cách nhau bằng dấu phẩy)
          </label>
          <input
            type="text"
            value={genresInput}
            onChange={(e) => setGenresInput(e.target.value)}
            placeholder="Rock, Pop, Jazz, Funk, Lo-fi, Thu âm studio"
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
          />
        </div>
      </div>

      {/* Stats items */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
            Số liệu thống kê (Stats ở trang chủ)
          </h3>
          <button
            type="button"
            onClick={handleAddStat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--chip)] text-xs font-bold text-[var(--text)] hover:bg-[var(--brass)] hover:text-black transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm số liệu</span>
          </button>
        </div>

        <div className="space-y-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Giá trị (ví dụ: 10+)"
                value={stat.value}
                onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                className="w-32 px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm font-bold font-condensed"
              />
              <input
                type="text"
                placeholder="Nhãn mô tả (ví dụ: năm chơi trống)"
                value={stat.label}
                onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm"
              />
              <button
                type="button"
                onClick={() => handleRemoveStat(idx)}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Details */}
      <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 space-y-5">
        <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
          Thông tin liên hệ & Kênh truyền thông
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Số điện thoại hiển thị
            </label>
            <input
              type="text"
              value={profile.contact.phone}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  contact: { ...profile.contact, phone: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Số Zalo (dùng để tạo link zalo.me/...)
            </label>
            <input
              type="text"
              value={profile.contact.zalo}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  contact: { ...profile.contact, zalo: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Địa chỉ Email
            </label>
            <input
              type="email"
              value={profile.contact.email}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  contact: { ...profile.contact, email: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Link Facebook
            </label>
            <input
              type="text"
              value={profile.contact.facebook}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  contact: { ...profile.contact, facebook: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Link kênh YouTube
            </label>
            <input
              type="text"
              value={profile.contact.youtube}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  contact: { ...profile.contact, youtube: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Địa chỉ phòng tập
            </label>
            <input
              type="text"
              value={profile.contact.address}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  contact: { ...profile.contact, address: e.target.value },
                })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
