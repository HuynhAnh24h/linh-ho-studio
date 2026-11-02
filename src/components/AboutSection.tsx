"use client";

import React from "react";
import Image from "next/image";
import {
  UserRound,
  Music,
  Mic,
  Sparkles,
  Zap,
  Target,
  Flame,
  Sliders,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { ProfileData } from "@/lib/types";

interface AboutSectionProps {
  profile: ProfileData;
}

export function AboutSection({ profile }: AboutSectionProps) {
  const performanceSkills = [
    {
      title: "Độ Chuẩn Nhịp (Timing & Click Track)",
      desc: "Khóa chặt tempo cùng click track và hệ thống multitrack backing tracks khi biểu diễn live sân khấu lớn.",
      icon: <Target className="w-5 h-5 text-[var(--brass)]" />,
      rating: "100%",
    },
    {
      title: "Năng Lượng & Bản Lĩnh Sân Khấu",
      desc: "Làm chủ không gian, truyền lửa cho ban nhạc và khán giả qua từng cú Kick uy lực và fill dồn dập.",
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      rating: "MAX",
    },
    {
      title: "Hệ Sinh Thái Sampler Điện Tử",
      desc: "Chuyên sâu cân chỉnh sound gốc Roland SPD-30 và nạp sound ngoài 24-bit cho SPD-SX, SX PRO, NUX, Avatar.",
      icon: <Sliders className="w-5 h-5 text-emerald-400" />,
      rating: "PRO",
    },
    {
      title: "Đào Tạo Thực Chiến 1 Kèm 1",
      desc: "Phương pháp tư duy trực quan, giúp học viên loại bỏ rào cản sợ sai, vào bài và ghép ban nhạc sớm nhất.",
      icon: <Zap className="w-5 h-5 text-blue-400" />,
      rating: "THỰC HÀNH",
    },
  ];

  return (
    <section id="gioi-thieu" className="relative py-20 md:py-28 border-b border-[var(--line)] bg-[var(--surface)] overflow-hidden">
      {/* Background ambient accents */}
      <div className="absolute top-10 left-0 w-96 h-96 bg-[var(--brass)]/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-[var(--ember)]/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--brass)]/15 text-[var(--brass)] border border-[var(--brass)]/30">
              <UserRound className="w-3.5 h-3.5" />
              <span>Hồ Sơ Nghệ Sĩ // Artist Dossier</span>
            </div>
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text)] tracking-tight leading-none">
              Bản Lĩnh Sân Khấu &amp; Đam Mê Bất Tận
            </h2>
          </div>
          <p className="text-sm sm:text-base text-[var(--muted)] max-w-md">
            Khám phá hành trình hơn 1 thập kỷ đắm chìm trong tiếng trống của Linh Hồ và triết lý xây dựng thương hiệu LH Music Studio.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Rockstar Backstage VIP Laminate Pass */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[360px] rounded-3xl overflow-hidden border-2 border-[var(--brass)]/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-black group">
              {/* Lanyard Hole Clip Graphic */}
              <div className="h-6 bg-neutral-900 border-b border-white/10 flex items-center justify-center">
                <div className="w-12 h-2 rounded-full bg-neutral-700/80 border border-white/20" />
              </div>

              {/* Top VIP Label Bar */}
              <div className="px-5 py-2.5 bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 border-b border-[var(--brass)]/30 flex items-center justify-between text-[11px] font-mono font-bold tracking-widest text-[var(--brass)] uppercase">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  VIP ARTIST PASS
                </span>
                <span>2026 EDITION</span>
              </div>

              {/* Portrait Photo */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <Image
                  src={profile.avatarUrl || "/images/profile/linh-ho-portrait.jpg"}
                  alt={profile.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 360px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                {/* Badge on Photo */}
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[var(--brass)] text-black font-mono">
                    HEAD DRUMMER // PRODUCER
                  </span>
                  <h3 className="font-condensed font-extrabold text-3xl text-white tracking-wide">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-white/80 font-medium">
                    Founder of LH Music Studio • TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              {/* Bottom VIP Pass Barcode & Security Strip */}
              <div className="p-4 bg-neutral-950 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted)]">
                  <span>ACCESS: ALL-STAGE // BACKSTAGE</span>
                  <span className="text-emerald-400 font-bold">STATUS: ACTIVE</span>
                </div>
                {/* Barcode Graphic with Laser Scanner Animation */}
                <div className="relative h-7 flex items-center justify-between opacity-85 overflow-hidden bg-black/40 px-1 rounded-sm">
                  {/* Red/Amber Scanning Laser Beam */}
                  <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-laser-scan pointer-events-none z-10" />
                  {Array.from({ length: 36 }).map((_, i) => (
                    <span
                      key={i}
                      className="bg-white/85 h-full"
                      style={{
                        width: i % 3 === 0 ? "3px" : i % 2 === 0 ? "1px" : "2px",
                      }}
                    />
                  ))}
                </div>
                <div className="text-center text-[9px] font-mono tracking-widest text-[var(--muted)] uppercase">
                  LH-STUDIO-ID // 84-938-123-456
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs font-semibold text-[var(--muted)] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Nghệ sĩ biểu diễn &amp; Nhà sản xuất âm thanh đã xác thực</span>
            </div>
          </div>

          {/* Right Column: Drummer Manifesto & Performance Radar */}
          <div className="lg:col-span-7 space-y-6 pt-2">
            {/* Drummer Manifesto Box */}
            <div className="relative p-6 sm:p-7 rounded-3xl bg-[var(--hero)] border border-[var(--brass)]/30 shadow-md space-y-3">
              <div className="text-3xl text-[var(--brass)] font-serif leading-none opacity-60">
                “
              </div>
              <p className="font-condensed font-bold text-2xl sm:text-3xl text-[var(--text)] leading-snug tracking-tight">
                {profile.aboutText1}
              </p>
              <div className="text-xs font-mono font-bold tracking-wider text-[var(--brass)] uppercase pt-1">
                — Triết lý nhịp điệu của Linh Hồ
              </div>
            </div>

            {/* In-depth Authentic Bio */}
            <div className="space-y-4 text-base sm:text-lg text-[var(--muted)] leading-relaxed">
              <p>{profile.aboutText2}</p>
            </div>

            {/* Performance Skills & Specs Matrix */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--brass)] block">
                NĂNG LỰC &amp; ĐẶC TÍNH NGHỆ SĨ:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {performanceSkills.map((skill, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[var(--hero)] border border-[var(--line)] hover:border-[var(--brass)]/60 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {skill.icon}
                        <h4 className="font-condensed font-bold text-base text-[var(--text)]">
                          {skill.title}
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[var(--surface)] text-[var(--brass)] border border-[var(--line)]">
                        {skill.rating}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--muted)] leading-relaxed">
                      {skill.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Genres & Expertise Tags */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[var(--muted)] block">
                DÒNG NHẠC &amp; MÔI TRƯỜNG THỰC CHIẾN:
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.genres?.map((genre, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--chip)] text-xs font-semibold text-[var(--text)] border border-[var(--line-strong)] hover:border-[var(--brass)] transition-colors"
                  >
                    {genre.toLowerCase().includes("thu âm") || genre.toLowerCase().includes("wav") ? (
                      <Mic className="w-3.5 h-3.5 text-[var(--brass)]" />
                    ) : (
                      <Music className="w-3.5 h-3.5 text-[var(--brass)]" />
                    )}
                    <span>{genre}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
