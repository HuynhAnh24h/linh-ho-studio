"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Drum,
  CalendarCheck,
  ShoppingCart,
  GraduationCap,
  Clock,
  Headphones,
  Sparkles,
  Zap,
  Activity,
  Flame,
  Radio,
} from "lucide-react";
import { ProfileData } from "@/lib/types";
import { drumAudioEngine } from "@/lib/audio-engine";

interface HeroProps {
  profile: ProfileData;
  onOpenBookingModal?: () => void;
}

export function Hero({ profile, onOpenBookingModal }: HeroProps) {
  const [isHit, setIsHit] = useState(false);
  const [hitCount, setHitCount] = useState(0);
  const [lastVelocity, setLastVelocity] = useState<number | null>(null);

  const handleSnareHit = () => {
    drumAudioEngine.playHeroSnare();
    const vel = Math.floor(Math.random() * 15) + 113; // 113-127 high velocity
    setLastVelocity(vel);
    setHitCount((prev) => prev + 1);
    setIsHit(false);
    requestAnimationFrame(() => {
      setIsHit(true);
      setTimeout(() => setIsHit(false), 200);
    });
  };

  const renderTagline = () => {
    const raw = (profile.tagline || "CHƠI HẾT MÌNH TRÊN SÂN KHẤU.\nCHUẨN TỪNG TIẾT TẤU TRONG PHÒNG THU.").trim();
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length >= 2) {
      const line1 = lines[0];
      const line2 = lines.slice(1).join(" ");

      const isDefaultStageLine = line1.toUpperCase().includes("TRÊN SÂN KHẤU");
      const isDefaultStudioLine = line2.toUpperCase().includes("TRONG PHÒNG THU");

      return (
        <h1 className="font-condensed font-black tracking-tight uppercase text-[var(--text)] text-balance">
          {/* Line 1: Sân khấu (Stage) */}
          <span className="block text-4xl sm:text-5xl lg:text-[3.3rem] xl:text-[3.7rem] leading-[1.05]">
            {isDefaultStageLine ? (
              <>
                <span className="inline-block">CHƠI HẾT MÌNH</span>{" "}
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[var(--brass)] via-amber-200 to-[var(--brass)] drop-shadow-[0_0_20px_rgba(232,220,190,0.3)]">
                  TRÊN SÂN KHẤU.
                </span>
              </>
            ) : (
              line1
            )}
          </span>

          {/* Line 2: Phòng thu (Studio) */}
          <span className="block text-3xl sm:text-4xl lg:text-[2.6rem] xl:text-[2.9rem] leading-[1.1] text-[var(--muted)] mt-1.5 sm:mt-2">
            {isDefaultStudioLine ? (
              <>
                <span className="inline-block text-[var(--brass)] font-extrabold">
                  CHUẨN TỪNG TIẾT TẤU
                </span>{" "}
                <span className="inline-block text-[var(--text)]">
                  TRONG PHÒNG THU.
                </span>
              </>
            ) : (
              <span className="text-[var(--brass)]">{line2}</span>
            )}
          </span>
        </h1>
      );
    }

    return (
      <h1 className="font-condensed font-black text-4xl sm:text-5xl lg:text-[3.5rem] tracking-tight leading-[1.04] text-[var(--text)] uppercase text-balance">
        {raw}
      </h1>
    );
  };

  return (
    <section className="relative overflow-hidden bg-[var(--hero)] border-b border-[var(--line)] py-14 md:py-24" id="top">
      {/* Concert stage ambient glow lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[var(--brass)]/10 blur-[130px] rounded-full pointer-events-none -z-0" />
      <div className="absolute bottom-0 left-10 w-[420px] h-[420px] bg-[var(--ember)]/10 blur-[120px] rounded-full pointer-events-none -z-0" />

      {/* Subtle stage grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--brass) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Rockstar Headlines & Persona */}
          <div className="lg:col-span-7 space-y-7">
            {/* Live Status Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/40 border border-[var(--brass)]/30 backdrop-blur-md shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
              </span>
              <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-[var(--brass)]">
                LIVE CONCERT PERFORMER • SOUND ARCHITECT
              </span>
              <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-[var(--muted)]" />
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
                <Radio className="w-3 h-3 text-[var(--brass)] animate-pulse" />
                <span>LH Music Studio</span>
              </span>
            </div>

            {/* Giant Stage Tagline (Balanced & High Impact) */}
            <div className="space-y-4">
              {renderTagline()}

              <p className="text-base sm:text-lg text-[var(--muted)] max-w-2xl leading-relaxed font-normal">
                {profile.bio}
              </p>
            </div>

            {/* Signature Gear & Stage Badges */}
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface)] border border-[var(--line-strong)] text-xs font-semibold text-[var(--text)]">
                <Zap className="w-3.5 h-3.5 text-[var(--brass)]" />
                <span>HPMA Connection 2026 Showcase</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface)] border border-[var(--line-strong)] text-xs font-semibold text-[var(--text)]">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>Roland SPD-30 &amp; SPD-SX PRO</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--surface)] border border-[var(--line-strong)] text-xs font-semibold text-[var(--text)]">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                <span>Acoustic Session &amp; Live Tour</span>
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <button
                onClick={onOpenBookingModal}
                className="group relative inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl font-bold text-base bg-[var(--brass)] text-[#1a1405] hover:bg-amber-300 transition-all shadow-[0_4px_20px_rgba(232,220,190,0.3)] active:translate-y-0.5 cursor-pointer"
              >
                <CalendarCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Đặt lịch học / Ghép Band</span>
              </button>

              <Link
                href="/sampler"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-base bg-[var(--surface)] border-2 border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-all active:translate-y-0.5 shadow-sm"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Nghe thử Sampler</span>
              </Link>

              <Link
                href="/phong-tap"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl font-semibold text-sm border border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--brass)] transition-colors"
              >
                <Clock className="w-4 h-4 text-[var(--brass)]" />
                <span>Phòng tập theo giờ</span>
              </Link>
            </div>

            {/* Quick Specialized Pages Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[var(--line)]/70">
              <span className="text-xs uppercase font-bold tracking-wider text-[var(--muted)] mr-1">
                Lối tắt:
              </span>
              <Link
                href="/day-trong"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-colors"
              >
                <GraduationCap className="w-3.5 h-3.5 text-[var(--brass)]" />
                <span>Khoá dạy trống</span>
              </Link>
              <Link
                href="/phong-tap"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-[var(--brass)]" />
                <span>Phòng tập 6 góc ảnh</span>
              </Link>
              <Link
                href="/sampler"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-colors"
              >
                <Headphones className="w-3.5 h-3.5 text-[var(--brass)]" />
                <span>Kits SPD-30 &amp; Sound Ngoài</span>
              </Link>
              <Link
                href="/lien-he"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--surface)] border border-[var(--line)] text-xs font-semibold text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-colors"
              >
                <Zap className="w-3.5 h-3.5 text-[var(--brass)]" />
                <span>Thuê Band tiệc cưới / Gala</span>
              </Link>
            </div>

            {/* Drummer High-Impact Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-2">
              {profile.stats?.map((stat, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[var(--surface)]/70 border border-[var(--line)] backdrop-blur-sm space-y-1 hover:border-[var(--brass)]/50 transition-colors"
                >
                  <div className="font-condensed font-extrabold text-3xl sm:text-4xl text-[var(--brass)] leading-none tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-medium text-[var(--muted)] leading-tight">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Rockstar Stage Card & Interactive Snare Pad */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center gap-4 py-2">
            {/* Stage Showcase Frame with Metallic Glow */}
            <div
              className={`relative w-full max-w-[430px] aspect-[4/5] rounded-[32px] overflow-hidden border-2 transition-all duration-300 group shadow-[0_15px_45px_rgba(0,0,0,0.5)] ${
                isHit
                  ? "border-amber-400 ring-4 ring-amber-400/40 scale-[0.985]"
                  : "border-[var(--brass)]/70 hover:border-[var(--brass)]"
              }`}
            >
              {/* Actual Concert Photo with Blue Stage Smoke */}
              <Image
                src="/images/profile/linh-ho-live-concert.jpg"
                alt="Linh Hồ Drummer Live Concert Performance"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                priority
                sizes="(max-width: 768px) 100vw, 430px"
              />

              {/* Stage lighting gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/60" />

              {/* Top HUD Badges */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 border border-white/10 text-white backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400">
                    LIVE CONCERT
                  </span>
                </div>

                <div className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-black/60 text-white/80 border border-white/10 backdrop-blur-md">
                  HPMA SHOWCASE
                </div>
              </div>

              {/* Interactive Snare Pad Trigger on Card */}
              <div className="absolute top-16 right-4 z-20">
                <button
                  onClick={handleSnareHit}
                  className={`px-3.5 py-2.5 rounded-2xl backdrop-blur-md border shadow-2xl flex items-center gap-2 transition-all cursor-pointer select-none active:scale-90 ${
                    isHit
                      ? "bg-amber-400 text-black border-amber-300 scale-95 shadow-[0_0_25px_rgba(251,191,36,0.8)]"
                      : "bg-black/70 hover:bg-black/90 text-white border-[var(--brass)]/80 hover:border-amber-300"
                  }`}
                  title="Gõ thử tiếng Snare mộc live"
                >
                  <Drum className={`w-4 h-4 text-amber-400 ${isHit ? "animate-bounce" : ""}`} />
                  <div className="text-left">
                    <div className="text-[11px] font-black uppercase leading-tight">
                      Gõ Snare
                    </div>
                    <div className="text-[9px] font-mono text-amber-300/80">
                      {isHit ? "HIT! 127 VEL" : "Test Live Sound"}
                    </div>
                  </div>
                </button>
              </div>

              {/* Hit velocity notification overlay */}
              {isHit && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 animate-fade-in">
                  <div className="px-5 py-2 rounded-2xl bg-amber-400/90 text-black font-condensed font-black text-2xl uppercase tracking-widest shadow-2xl backdrop-blur-sm border-2 border-white scale-110 transition-transform">
                    💥 RIM SHOT • {lastVelocity} VEL
                  </div>
                </div>
              )}

              {/* Bottom Artist Info & Live Equalizer Bars */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col justify-end space-y-2.5 bg-gradient-to-t from-black via-black/90 to-transparent">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[var(--brass)] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>ARTIST DOSSIER</span>
                  </span>

                  {/* Dynamic Equalizer Waveform */}
                  <div className="flex items-end gap-1 h-4">
                    {[40, 80, 50, 100, 65, 85, 30, 95, 60, 45].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-[var(--brass)] rounded-full transition-all duration-300"
                        style={{
                          height: isHit ? "100%" : `${h}%`,
                          opacity: (i % 2 === 0 ? 0.9 : 0.6),
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h3 className="font-condensed font-extrabold text-3xl sm:text-4xl text-white tracking-tight leading-none">
                    LINH HỒ
                  </h3>
                  <p className="text-xs text-white/80 font-medium">
                    Master Drummer • Music Producer • Founder LH Music Studio
                  </p>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[10px] font-mono text-white/70">
                  <span>RIG: DW SNARE // SPD-SX PRO</span>
                  <span className="text-amber-400 font-bold">
                    {hitCount > 0 ? `${hitCount} HITS` : "CLICK SNARE TO JAM"}
                  </span>
                </div>
              </div>
            </div>

            {/* Hint below card */}
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <Drum className="w-3.5 h-3.5 text-[var(--brass)] animate-spin" />
              <span>
                Bấm nút <b>Gõ Snare</b> để nghe thử lực đánh trực tiếp từ Web Audio Engine
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
