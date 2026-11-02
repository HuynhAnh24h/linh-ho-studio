"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Drum, CalendarCheck, ShoppingCart, GraduationCap, Clock, Headphones, Sparkles } from "lucide-react";
import { ProfileData } from "@/lib/types";
import { drumAudioEngine } from "@/lib/audio-engine";

interface HeroProps {
  profile: ProfileData;
  onOpenBookingModal?: () => void;
}

export function Hero({ profile, onOpenBookingModal }: HeroProps) {
  const [isHit, setIsHit] = useState(false);

  const handleSnareHit = () => {
    drumAudioEngine.playHeroSnare();
    setIsHit(false);
    requestAnimationFrame(() => {
      setIsHit(true);
      setTimeout(() => setIsHit(false), 160);
    });
  };

  return (
    <section className="bg-[var(--hero)] border-b border-[var(--line)] py-12 md:py-20" id="top">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Intro */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="font-condensed font-extrabold text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.02] text-[var(--text)] whitespace-pre-line">
              {profile.tagline || "Tôi đánh trống.\nBạn giữ nhịp."}
            </h1>

            <p className="text-lg text-[var(--muted)] max-w-2xl leading-relaxed">
              {profile.bio}
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={onOpenBookingModal}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Đặt lịch học</span>
              </button>

              <a
                href="/sampler"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-base border-2 border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-all active:translate-y-0.5"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Mua sampler</span>
              </a>
            </div>

            {/* Quick links */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <a
                href="/day-trong"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:border-[var(--brass)] transition-colors"
              >
                <GraduationCap className="w-4 h-4 text-[var(--brass)]" />
                <span>Dạy trống</span>
              </a>
              <a
                href="/phong-tap"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:border-[var(--brass)] transition-colors"
              >
                <Clock className="w-4 h-4 text-[var(--brass)]" />
                <span>Thuê phòng theo giờ</span>
              </a>
              <a
                href="/sampler"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--surface)] border border-[var(--line)] text-sm font-medium text-[var(--text)] hover:border-[var(--brass)] transition-colors"
              >
                <Headphones className="w-4 h-4 text-[var(--brass)]" />
                <span>Kho sampler</span>
              </a>
            </div>

            {/* Drummer Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {profile.stats?.map((stat, idx) => (
                <div key={idx} className="space-y-0.5">
                  <div className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--brass)] leading-none">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-[var(--muted)]">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Artist Spotlight Card & Interactive Snare Button */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-4 py-4">
            <div className="relative w-full max-w-[420px] aspect-[4/3] sm:aspect-[1/1] rounded-3xl overflow-hidden border-2 border-[var(--brass)]/60 shadow-2xl group">
              <Image
                src="/images/profile/linh-ho-live-concert.jpg"
                alt="Drummer Linh Hồ Live Concert Performance"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
                sizes="(max-width: 768px) 100vw, 420px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent flex flex-col justify-end p-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brass)] mb-1">
                  Live Performance
                </span>
                <div className="font-condensed font-extrabold text-3xl text-white">
                  Linh Hồ
                </div>
                <div className="text-xs text-white/80">
                  Drummer &amp; Founder LH Music Studio
                </div>
              </div>

              {/* Floating interactive drum trigger badge */}
              <button
                onClick={handleSnareHit}
                className={`absolute top-4 right-4 px-4 py-2.5 rounded-2xl bg-[var(--brass)] text-[#1e1715] font-bold text-xs shadow-xl flex items-center gap-2 transition-transform cursor-pointer active:scale-90 ${
                  isHit ? "scale-90 bg-amber-400" : "hover:scale-105"
                }`}
                title="Bấm để gõ thử tiếng Snare Live"
              >
                <Drum className="w-4 h-4 animate-pulse" />
                <span>Gõ Snare</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--brass)]" />
              <span>Bấm nút <b>Gõ Snare</b> để nghe thử lực đánh trực tiếp</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
