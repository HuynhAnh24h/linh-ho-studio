"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Drum, Sparkles, Volume2, ArrowRight } from "lucide-react";

export function PageLoader() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [beatCount, setBeatCount] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Check if user already saw loader in this browser session
    const hasLoaded = sessionStorage.getItem("lh_loaded_intro");
    if (hasLoaded) {
      setIsVisible(false);
      return;
    }

    // Step-by-step progress and drum beat count-in: 1, 2, 3, 4
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              setIsVisible(false);
              sessionStorage.setItem("lh_loaded_intro", "true");
            }, 600);
          }, 200);
          return 100;
        }

        const next = prev + 5;
        // Count-in logic
        if (next < 25) setBeatCount(1);
        else if (next < 50) setBeatCount(2);
        else if (next < 75) setBeatCount(3);
        else setBeatCount(4);

        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("lh_loaded_intro", "true");
    }, 400);
  };

  if (!isVisible) return null;

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#1e1715] text-[var(--text)] transition-all duration-700 cursor-pointer ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Concert stage spotlight glow in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[var(--brass)]/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[var(--ember)]/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Center content container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center space-y-6">
        {/* Glowing Logo Frame */}
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-2 border-[var(--brass)]/70 shadow-[0_0_50px_rgba(232,220,190,0.3)] bg-black/60 p-2 flex items-center justify-center group">
          <Image
            src="/logo.png"
            alt="LH Music Studio"
            width={120}
            height={120}
            className="object-contain animate-pulse-glow"
            priority
          />
          {/* Animated corner accents */}
          <span className="absolute top-1.5 left-1.5 w-2 h-2 border-t-2 border-l-2 border-[var(--brass)]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 border-t-2 border-r-2 border-[var(--brass)]" />
          <span className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b-2 border-l-2 border-[var(--brass)]" />
          <span className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b-2 border-r-2 border-[var(--brass)]" />
        </div>

        {/* Brand & Stage Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold uppercase tracking-widest text-[var(--brass)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>LH MUSIC STUDIO</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <h2 className="font-condensed font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
            DRUMMER LINH HỒ
          </h2>
          <p className="text-xs text-[var(--muted)] font-mono">
            Chuẩn bị sân khấu &amp; Không gian âm nhạc
          </p>
        </div>

        {/* Drum Beat Count-in (1 • 2 • 3 • 4) */}
        <div className="flex items-center justify-center gap-3">
          {[1, 2, 3, 4].map((beat) => (
            <div
              key={beat}
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-condensed font-black text-lg transition-all duration-150 ${
                beatCount === beat
                  ? "bg-[var(--brass)] text-black scale-110 shadow-[0_0_20px_rgba(232,220,190,0.8)]"
                  : beat < beatCount
                  ? "bg-[var(--line-strong)]/40 text-[var(--muted)]"
                  : "bg-black/40 text-[var(--muted)]/40 border border-white/5"
              }`}
            >
              {beat}
            </div>
          ))}
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-2">
          <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10 p-[1px]">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-[var(--brass)] to-amber-200 rounded-full transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Drum className="w-3.5 h-3.5 animate-spin" />
              <span>BEAT READY</span>
            </span>
            <span className="text-[var(--brass)] font-bold">{progress}%</span>
          </div>
        </div>

        {/* Quick Skip Button */}
        <button
          onClick={handleSkip}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-[var(--muted)] hover:text-white transition-all"
        >
          <span>Vào sân khấu ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
