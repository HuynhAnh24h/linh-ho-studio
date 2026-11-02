"use client";

import React, { useState } from "react";
import { MediaItem } from "@/lib/types";
import { Upload, Trash2, Copy, Check, Headphones, Image as ImageIcon, Plus, Link as LinkIcon, Volume2 } from "lucide-react";

interface AdminMediaProps {
  media: MediaItem[];
  onRefresh: () => void;
}

export function AdminMedia({ media = [], onRefresh }: AdminMediaProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isAddUrlOpen, setIsAddUrlOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState<"image" | "audio">("audio");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("name", file.name);

      try {
        await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
      } catch (err) {
        console.error("Upload error:", err);
      }
    }

    setIsUploading(false);
    onRefresh();
  };

  const handleAddDirectUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    try {
      await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.trim() || "Media File",
          url: urlInput.trim(),
          type: typeInput,
        }),
      });

      setUrlInput("");
      setNameInput("");
      setIsAddUrlOpen(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xoá file này?")) return;
    try {
      const res = await fetch(`/api/media?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = (item: MediaItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(item.url).then(() => {
        setCopiedId(item.id);
        setTimeout(() => setCopiedId(null), 2500);
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-condensed font-extrabold text-3xl text-[var(--text)]">
            Thư viện Media (Hình ảnh & Âm thanh)
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Lưu trữ trực tiếp các file ảnh và mẫu trống WAV/MP3 để gắn vào sound kit hoặc tiểu sử
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsAddUrlOpen(!isAddUrlOpen)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-all"
          >
            <LinkIcon className="w-4 h-4" />
            <span>Thêm link online</span>
          </button>

          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm">
            <Upload className="w-4 h-4" />
            <span>{isUploading ? "Đang tải lên..." : "Tải file lên"}</span>
            <input
              type="file"
              multiple
              accept="image/*,audio/*,.wav,.mp3"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Direct URL Form */}
      {isAddUrlOpen && (
        <form onSubmit={handleAddDirectUrl} className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--line)] space-y-4">
          <h4 className="font-condensed font-bold text-xl text-[var(--text)]">
            Thêm media từ đường dẫn (URL)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Tên file
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Demo Snare Hit"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Link URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://example.com/audio.mp3"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Loại file
              </label>
              <select
                value={typeInput}
                onChange={(e) => setTypeInput(e.target.value as "image" | "audio")}
                className="w-full px-3.5 py-2 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none"
              >
                <option value="audio">🎵 File Âm thanh (Audio / WAV / MP3)</option>
                <option value="image">🖼️ File Hình ảnh (Image / PNG / JPG)</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddUrlOpen(false)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--muted)] hover:bg-[var(--chip)]"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)]"
            >
              Lưu link
            </button>
          </div>
        </form>
      )}

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--surface)] border border-[var(--line)] space-y-3">
          <div className="inline-grid place-items-center w-14 h-14 rounded-2xl bg-[var(--tint)] text-[var(--brass)] mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="font-condensed font-bold text-2xl text-[var(--text)]">
            Thư viện đang trống
          </h4>
          <p className="text-sm text-[var(--muted)] max-w-sm mx-auto">
            Bấm &ldquo;Tải file lên&rdquo; ở trên để tải một vài hình ảnh đại diện hoặc file âm thanh trống WAV/MP3.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {media.map((item) => (
            <div
              key={item.id}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-[var(--line-strong)] transition-all"
            >
              {/* Media Preview */}
              <div>
                {item.type === "image" ? (
                  <div className="w-full aspect-video rounded-xl overflow-hidden bg-[var(--bg)] border border-[var(--line)] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
                      <Volume2 className="w-4 h-4" />
                      <span>Audio Track</span>
                    </div>
                    <audio
                      src={item.url}
                      controls
                      className="w-full h-8 accent-[var(--brass)]"
                    />
                  </div>
                )}

                <div className="pt-3">
                  <h4 className="font-bold text-sm text-[var(--text)] truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] mt-0.5">
                    <span className="capitalize">{item.type}</span>
                    <span>•</span>
                    <span>{formatBytes(item.size)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between">
                <button
                  onClick={() => handleCopyLink(item)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    copiedId === item.id
                      ? "bg-emerald-600 text-white"
                      : "bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--brass)] hover:text-black"
                  }`}
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Đã chép link</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép link</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Xoá file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
