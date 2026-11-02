"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Camera, Sparkles, X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

export interface GalleryPhoto {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  url: string;
  aspect?: string;
}

const PROFILE_PHOTOS: GalleryPhoto[] = [
  {
    id: "p1",
    title: "HPMA Connection Showcase 2026",
    subtitle: "Biểu diễn dàn trống Acoustic chuyên nghiệp trên sân khấu lớn",
    tag: "Live Showcase",
    url: "/images/profile/linh-ho-hpma-showcase.jpg",
  },
  {
    id: "p2",
    title: "Live Concert Sân Khấu",
    subtitle: "Cháy hết mình cùng ban nhạc trong từng nhịp phách",
    tag: "Concert Tour",
    url: "/images/profile/linh-ho-live-concert.jpg",
  },
  {
    id: "p3",
    title: "LH Music Studio & Control Room",
    subtitle: "Sáng tạo và cân chỉnh các bộ sound sampler pad độc quyền",
    tag: "Studio & Pad",
    url: "/images/profile/linh-ho-studio-pad.jpg",
  },
  {
    id: "p4",
    title: "Chân dung Drummer Linh Hồ",
    subtitle: "Phong cách cá tính, đam mê bất tận với bộ môn trống",
    tag: "Portrait",
    url: "/images/profile/linh-ho-portrait.jpg",
  },
  {
    id: "p5",
    title: "Nghệ Thuật & Phong Cách Biểu Diễn",
    subtitle: "Tự tin làm chủ sân khấu và truyền lửa cảm xúc",
    tag: "Street & Style",
    url: "/images/profile/linh-ho-full-body.jpg",
  },
];

export function ProfileGallery() {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const selectedPhoto = selectedPhotoIndex !== null ? PROFILE_PHOTOS[selectedPhotoIndex] : null;

  const nextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((selectedPhotoIndex + 1) % PROFILE_PHOTOS.length);
  };

  const prevPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex(
      (selectedPhotoIndex - 1 + PROFILE_PHOTOS.length) % PROFILE_PHOTOS.length
    );
  };

  return (
    <section className="py-20 border-b border-[var(--line)] bg-[var(--surface)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--brass)]/15 text-[var(--brass)] border border-[var(--brass)]/30">
              <Camera className="w-3.5 h-3.5" />
              <span>Hình Ảnh Thực Tế</span>
            </div>
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)]">
              Khoảnh Khắc Sân Khấu &amp; Studio
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-xl">
              Những hình ảnh thực chiến từ các tour diễn live, sân khấu showcase quy mô lớn đến không gian làm việc tại LH Music Studio.
            </p>
          </div>

          <div className="text-xs font-semibold text-[var(--muted)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--brass)]" />
            <span>Bấm vào ảnh để xem độ phân giải cao</span>
          </div>
        </div>

        {/* Dynamic Bento Photo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Item 1: Large Showcase Photo (Col 7) */}
          <div
            onClick={() => setSelectedPhotoIndex(0)}
            className="md:col-span-7 group relative aspect-[16/10] rounded-3xl overflow-hidden cursor-pointer border border-[var(--line)] hover:border-[var(--brass)] shadow-md transition-all"
          >
            <Image
              src={PROFILE_PHOTOS[0].url}
              alt={PROFILE_PHOTOS[0].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--brass)] text-[#1e1715] mb-2 self-start">
                {PROFILE_PHOTOS[0].tag}
              </span>
              <h3 className="font-condensed font-bold text-2xl text-white">
                {PROFILE_PHOTOS[0].title}
              </h3>
              <p className="text-xs text-white/80 line-clamp-1 mt-1">
                {PROFILE_PHOTOS[0].subtitle}
              </p>
            </div>
            <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Item 2: Live Concert close-up (Col 5) */}
          <div
            onClick={() => setSelectedPhotoIndex(1)}
            className="md:col-span-5 group relative aspect-[4/3] md:aspect-auto rounded-3xl overflow-hidden cursor-pointer border border-[var(--line)] hover:border-[var(--brass)] shadow-md transition-all"
          >
            <Image
              src={PROFILE_PHOTOS[1].url}
              alt={PROFILE_PHOTOS[1].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500 text-white mb-2 self-start">
                {PROFILE_PHOTOS[1].tag}
              </span>
              <h3 className="font-condensed font-bold text-2xl text-white">
                {PROFILE_PHOTOS[1].title}
              </h3>
              <p className="text-xs text-white/80 line-clamp-1 mt-1">
                {PROFILE_PHOTOS[1].subtitle}
              </p>
            </div>
            <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Maximize2 className="w-4 h-4" />
            </div>
          </div>

          {/* Item 3: Studio & Pad (Col 4) */}
          <div
            onClick={() => setSelectedPhotoIndex(2)}
            className="md:col-span-4 group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer border border-[var(--line)] hover:border-[var(--brass)] shadow-md transition-all"
          >
            <Image
              src={PROFILE_PHOTOS[2].url}
              alt={PROFILE_PHOTOS[2].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white mb-1.5 self-start">
                {PROFILE_PHOTOS[2].tag}
              </span>
              <h3 className="font-condensed font-bold text-xl text-white">
                {PROFILE_PHOTOS[2].title}
              </h3>
              <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                {PROFILE_PHOTOS[2].subtitle}
              </p>
            </div>
          </div>

          {/* Item 4: Portrait with Snare (Col 4) */}
          <div
            onClick={() => setSelectedPhotoIndex(3)}
            className="md:col-span-4 group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer border border-[var(--line)] hover:border-[var(--brass)] shadow-md transition-all"
          >
            <Image
              src={PROFILE_PHOTOS[3].url}
              alt={PROFILE_PHOTOS[3].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--brass)] text-[#1e1715] mb-1.5 self-start">
                {PROFILE_PHOTOS[3].tag}
              </span>
              <h3 className="font-condensed font-bold text-xl text-white">
                {PROFILE_PHOTOS[3].title}
              </h3>
              <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                {PROFILE_PHOTOS[3].subtitle}
              </p>
            </div>
          </div>

          {/* Item 5: Full body streetwear fashion (Col 4) */}
          <div
            onClick={() => setSelectedPhotoIndex(4)}
            className="md:col-span-4 group relative aspect-[4/3] rounded-3xl overflow-hidden cursor-pointer border border-[var(--line)] hover:border-[var(--brass)] shadow-md transition-all"
          >
            <Image
              src={PROFILE_PHOTOS[4].url}
              alt={PROFILE_PHOTOS[4].title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500 text-white mb-1.5 self-start">
                {PROFILE_PHOTOS[4].tag}
              </span>
              <h3 className="font-condensed font-bold text-xl text-white">
                {PROFILE_PHOTOS[4].title}
              </h3>
              <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                {PROFILE_PHOTOS[4].subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhotoIndex(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPhotoIndex(null);
            }}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20 hidden sm:block"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors z-20 hidden sm:block"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full max-h-[90vh] flex flex-col items-center justify-center"
          >
            <div className="relative w-full aspect-[16/10] max-h-[75vh] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <div className="mt-4 text-center space-y-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--brass)] text-[#1e1715]">
                {selectedPhoto.tag}
              </span>
              <h3 className="font-condensed font-bold text-2xl text-white">
                {selectedPhoto.title}
              </h3>
              <p className="text-sm text-white/80">{selectedPhoto.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
