"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Headphones,
  Play,
  Square,
  ShoppingCart,
  Package,
  Check,
  X,
  Zap,
  Sliders,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { SoundKitItem } from "@/lib/types";
import { drumAudioEngine, DRUM_PADS, BEAT_PATTERN, PadKey } from "@/lib/audio-engine";

interface InteractivePadModalProps {
  kit: SoundKitItem;
  isOpen: boolean;
  onClose: () => void;
  onSelectToBuy: (kit: SoundKitItem) => void;
}

export function InteractivePadModal({
  kit,
  isOpen,
  onClose,
  onSelectToBuy,
}: InteractivePadModalProps) {
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isPlayingLoop, setIsPlayingLoop] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef<number>(0);

  const isSpd30 = kit.padType === "spd30";

  // Hit pad
  const hitPad = useCallback(
    (padId: PadKey) => {
      drumAudioEngine.playSound(padId, kit);
      setActivePad(padId);
      setTimeout(() => {
        setActivePad((cur) => (cur === padId ? null : cur));
      }, 120);
    },
    [kit]
  );

  // Stop loop
  const stopLoop = useCallback(() => {
    if (loopTimerRef.current) {
      clearInterval(loopTimerRef.current);
      loopTimerRef.current = null;
    }
    setIsPlayingLoop(false);
    setCurrentStep(-1);
    currentStepRef.current = 0;
  }, []);

  // Keyboard shortcut listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.repeat ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === "Escape") {
        onClose();
        return;
      }

      const key = e.key.toUpperCase();
      const pad = DRUM_PADS.find((p) => p.key === key);
      if (pad) {
        e.preventDefault();
        hitPad(pad.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hitPad, onClose]);

  // Toggle beat loop
  const toggleLoop = () => {
    if (isPlayingLoop) {
      stopLoop();
      return;
    }

    setIsPlayingLoop(true);
    currentStepRef.current = 0;

    const bpm = kit.synthConfig?.bpm || 110;
    const intervalMs = 60000 / bpm / 4; // 16th notes

    const tick = () => {
      const step = currentStepRef.current;
      setCurrentStep(step);

      for (const [instrument, steps] of Object.entries(BEAT_PATTERN)) {
        if (steps.includes(step)) {
          const padKey = instrument as PadKey;
          drumAudioEngine.playSound(padKey, kit);
          setActivePad(padKey);
          setTimeout(() => {
            setActivePad((cur) => (cur === padKey ? null : cur));
          }, 100);
        }
      }

      currentStepRef.current = (step + 1) % 16;
    };

    tick();
    loopTimerRef.current = setInterval(tick, intervalMs);
  };

  // Cleanup on close or unmount
  useEffect(() => {
    return () => {
      stopLoop();
    };
  }, [stopLoop]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-5xl my-auto rounded-3xl bg-[var(--surface)] border-2 border-[var(--brass)] p-6 sm:p-9 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={() => {
            stopLoop();
            onClose();
          }}
          className="absolute top-5 right-5 p-2.5 rounded-full bg-[var(--chip)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--line)] transition-colors z-20"
          title="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 space-y-2 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isSpd30
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
              }`}
            >
              {isSpd30 ? "⚡ Roland SPD-30 (Sound Gốc Cân Chỉnh)" : "🎛️ Sound Ngoài (WAV Samples)"}
            </span>

            {kit.badge && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                {kit.badge}
              </span>
            )}
          </div>

          <h2 className="font-condensed font-extrabold text-3xl sm:text-4xl text-[var(--text)] flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[var(--chip)] border border-[var(--line)] flex items-center justify-center text-[var(--brass)] flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </span>
            <span>{kit.name}</span>
          </h2>

          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            Bấm trực tiếp vào từng pad hoặc dùng bàn phím <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-xs border border-[var(--line)]">Q</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-xs border border-[var(--line)]">W</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-xs border border-[var(--line)]">E</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-xs border border-[var(--line)]">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-xs border border-[var(--line)]">S</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-xs border border-[var(--line)]">D</kbd> để cảm nhận độ nảy và chất âm thực tế. Bấm <b>“Phát beat mẫu”</b> để nghe vòng nhịp hoàn chỉnh.
          </p>
        </div>

        {/* 2 Columns: Drum Pads on Left, What's inside on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Drum Pads + Sequencer + Buttons */}
          <div className="lg:col-span-7 space-y-5">
            {/* Description of this kit */}
            <div className="p-3.5 rounded-2xl bg-[var(--bg)] border border-[var(--line)] text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              {kit.desc}
            </div>

            {/* 6 Drum Pads (3x2 Grid) */}
            <div className="grid grid-cols-3 gap-3">
              {DRUM_PADS.map((pad) => {
                const isActive = activePad === pad.id;
                return (
                  <button
                    key={pad.id}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      hitPad(pad.id);
                    }}
                    className={`aspect-[4/3] rounded-2xl border-2 flex flex-col items-center justify-center transition-all select-none cursor-pointer active:scale-95 shadow-sm ${
                      isActive
                        ? "bg-[var(--brass)] border-[var(--brass)] text-[#1e1715] shadow-lg shadow-[var(--brass)]/30 scale-98"
                        : "bg-[var(--chip)] border-[var(--line)] text-[var(--text)] hover:border-[var(--brass)] hover:bg-[var(--brass)]/10"
                    }`}
                  >
                    <span className="font-condensed font-extrabold text-xl sm:text-2xl uppercase tracking-wider">
                      {pad.name}
                    </span>
                    <span className="text-[11px] font-semibold opacity-70 mt-1 font-mono">
                      phím {pad.key}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 16-Step Sequencer LED visualizer */}
            <div className="flex gap-1.5 pt-1">
              {Array.from({ length: 16 }).map((_, stepIdx) => (
                <div
                  key={stepIdx}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    currentStep === stepIdx
                      ? "bg-[var(--brass)] shadow-sm shadow-[var(--brass)] scale-y-125"
                      : "bg-[var(--line)]"
                  }`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={toggleLoop}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
              >
                {isPlayingLoop ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Dừng phát beat</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Phát beat mẫu ({kit.synthConfig?.bpm || 110} BPM)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  stopLoop();
                  onSelectToBuy(kit);
                }}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border-2 border-[var(--brass)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-all shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Mua bộ này ({kit.price.toLocaleString("vi-VN")}đ)</span>
              </button>
            </div>
          </div>

          {/* Right Column: "Trong bộ này có gì?" */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[var(--bg)] border border-[var(--line)] rounded-3xl p-6 space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--line)]">
                <span className="w-10 h-10 rounded-xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--brass)]">
                  <Package className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                    Trong bộ tiếng này có gì?
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    {kit.sampleCount} • {kit.format}
                  </span>
                </div>
              </div>

              {/* Dynamic checklist based on SPD-30 vs Sound Ngoài */}
              <ul className="space-y-3 text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
                {isSpd30 ? (
                  <>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">File Backup SPD-30 (.SVD):</strong> Cắm USB vào máy load 1 phút là xong trọn bộ kit.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Cân chỉnh chuyên sâu:</strong> EQ, Layer, Muffle, Tune, FX được tối ưu cho từng dòng nhạc Việt.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Tối ưu lực gõ:</strong> Tinh chỉnh Sens/Threshold chống nảy tiếng thừa, ghost-note cực mượt.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Hỗ trợ kỹ thuật 1:1:</strong> Kèm video hướng dẫn và hỗ trợ nạp qua Zalo trọn đời.
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Sample WAV 24-bit 44.1kHz:</strong> Chuẩn phòng thu cao cấp, âm thanh sạch và chi tiết.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Nhiều lớp velocity:</strong> Phân tách soft, medium, hard rimshot cho cảm giác đánh sống động.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Master Limiter nén chặt:</strong> Tiếng kick & snare lực căng, không vỡ tiếng trên loa sân khấu.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">100% Royalty-Free:</strong> Thoải mái biểu diễn, thu âm làm nhạc thương mại không giới hạn.
                      </span>
                    </li>
                  </>
                )}

                {/* Additional Kit-specific features */}
                {kit.features && kit.features.length > 0 && (
                  <div className="pt-2 border-t border-[var(--line)] space-y-2">
                    <span className="text-[11px] font-bold uppercase text-[var(--brass)] tracking-wider block">
                      Ưu đãi riêng của bộ này:
                    </span>
                    {kit.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text)]">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--brass)] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </div>
                )}
              </ul>
            </div>

            {/* Compatible Devices */}
            {kit.compatibleDevices && kit.compatibleDevices.length > 0 && (
              <div className="p-4 rounded-2xl bg-[var(--bg)] border border-[var(--line)] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                  Thiết bị tương thích:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {kit.compatibleDevices.map((dev, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--chip)] text-[var(--text)] border border-[var(--line)]"
                    >
                      {dev}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
