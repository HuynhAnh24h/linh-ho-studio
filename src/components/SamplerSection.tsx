"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Headphones, Play, Square, ShoppingCart, Package, Check, Zap, Sliders, Sparkles } from "lucide-react";
import { SoundKitItem } from "@/lib/types";
import { drumAudioEngine, DRUM_PADS, BEAT_PATTERN, PadKey } from "@/lib/audio-engine";

interface SamplerSectionProps {
  kits: SoundKitItem[];
  onSelectKitToBuy: (kitId: string) => void;
}

export function SamplerSection({ kits, onSelectKitToBuy }: SamplerSectionProps) {
  const [activeCategoryTab, setActiveCategoryTab] = useState<"all" | "spd30" | "sample_pad">("all");
  const [activeKitId, setActiveKitId] = useState<string>(kits[0]?.id || "");
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isPlayingLoop, setIsPlayingLoop] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef<number>(0);

  // Filter kits for the pills
  const visibleKits = kits.filter((k) => {
    if (activeCategoryTab === "spd30") return k.padType === "spd30";
    if (activeCategoryTab === "sample_pad") return k.padType !== "spd30";
    return true;
  });

  // Ensure active kit is valid
  const activeKit = kits.find((k) => k.id === activeKitId) || visibleKits[0] || kits[0];

  // Hit a pad
  const hitPad = useCallback(
    (padId: PadKey) => {
      if (!activeKit) return;
      drumAudioEngine.playSound(padId, activeKit);
      setActivePad(padId);
      setTimeout(() => {
        setActivePad((current) => (current === padId ? null : current));
      }, 120);
    },
    [activeKit]
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
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in form inputs
      if (
        e.repeat ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
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
  }, [hitPad]);

  // Handle kit change
  const handleKitSelect = (kit: SoundKitItem) => {
    setActiveKitId(kit.id);
    drumAudioEngine.setLowpassFilter(kit.synthConfig.lp);
    drumAudioEngine.playSound("snare", kit);
    if (isPlayingLoop) {
      stopLoop();
    }
  };

  // 16-step sequencer loop
  const toggleLoop = () => {
    if (isPlayingLoop) {
      stopLoop();
      return;
    }

    if (!activeKit) return;
    setIsPlayingLoop(true);
    currentStepRef.current = 0;

    const bpm = activeKit.synthConfig.bpm || 110;
    const intervalMs = (60000 / bpm) / 4; // 16th notes

    const tick = () => {
      const step = currentStepRef.current;
      setCurrentStep(step);

      // Play pattern notes
      for (const [instrument, steps] of Object.entries(BEAT_PATTERN)) {
        if (steps.includes(step)) {
          const padKey = instrument as PadKey;
          drumAudioEngine.playSound(padKey, activeKit);
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

  // Cleanup loop on unmount
  useEffect(() => {
    return () => {
      if (loopTimerRef.current) {
        clearInterval(loopTimerRef.current);
      }
    };
  }, []);

  const isSpd30 = activeKit?.padType === "spd30";

  return (
    <section id="sampler" className="py-20 bg-[var(--hero)] border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--brass)]/15 text-[var(--brass)] border border-[var(--brass)]/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phòng Máy Gõ Trống Trực Tuyến</span>
          </div>
          <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
            <span className="w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--line)] flex items-center justify-center text-[var(--brass)] flex-shrink-0">
              <Headphones className="w-6 h-6" />
            </span>
            <span>Nghe & Gõ thử sampler</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-3xl leading-relaxed">
            Chọn một bộ tiếng, rồi bấm trực tiếp vào pad hoặc dùng phím <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">Q</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">W</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">E</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">S</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">D</kbd> để cảm nhận độ nảy và uy lực. Bấm <b>“Phát beat mẫu”</b> để nghe bộ đó chạy một vòng nhịp hoàn chỉnh.
          </p>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={() => setActiveCategoryTab("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeCategoryTab === "all"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-md"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]"
            }`}
          >
            Tất Cả ({kits.length})
          </button>
          <button
            onClick={() => {
              setActiveCategoryTab("spd30");
              const firstSpd = kits.find((k) => k.padType === "spd30");
              if (firstSpd) setActiveKitId(firstSpd.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeCategoryTab === "spd30"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-md"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Roland SPD-30 ({kits.filter((k) => k.padType === "spd30").length})</span>
          </button>
          <button
            onClick={() => {
              setActiveCategoryTab("sample_pad");
              const firstExt = kits.find((k) => k.padType !== "spd30");
              if (firstExt) setActiveKitId(firstExt.id);
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeCategoryTab === "sample_pad"
                ? "bg-[var(--brass)] text-[#1e1715] shadow-md"
                : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--line)]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Sound Ngoài: SPD-SX, NUX, Avatar ({kits.filter((k) => k.padType !== "spd30").length})</span>
          </button>
        </div>

        {/* Sampler Machine & What's inside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Drum Machine Box */}
          <div className="lg:col-span-7 space-y-5">
            {/* Kit Selection Buttons */}
            <div className="flex flex-wrap gap-2.5">
              {visibleKits.map((k) => (
                <button
                  key={k.id}
                  onClick={() => handleKitSelect(k)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border-2 transition-all cursor-pointer ${
                    activeKit?.id === k.id
                      ? "bg-[var(--brass)] border-[var(--brass)] text-[#1a1405] font-bold shadow-md"
                      : "border-[var(--line)] text-[var(--text)] hover:border-[var(--brass)] bg-[var(--surface)]"
                  }`}
                >
                  {k.name}
                </button>
              ))}
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    isSpd30 ? "bg-amber-500/20 text-amber-300" : "bg-blue-500/20 text-blue-300"
                  }`}
                >
                  {isSpd30 ? "Roland SPD-30 (Sound Gốc Cài Đặt)" : "Sound Ngoài (WAV Samples)"}
                </span>
                <span className="text-xs font-semibold text-[var(--text)]">
                  {activeKit?.sampleCount} • {activeKit?.format}
                </span>
              </div>
              <p>{activeKit?.desc}</p>
            </div>

            {/* Drum Pads 3x2 */}
            <div className="grid grid-cols-3 gap-3 max-w-[540px]">
              {DRUM_PADS.map((pad) => (
                <button
                  key={pad.id}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    hitPad(pad.id);
                  }}
                  className={`drum-pad ${activePad === pad.id ? "active" : ""}`}
                >
                  <span>{pad.name}</span>
                  <small className="font-sans text-xs font-semibold opacity-75 mt-0.5">
                    phím {pad.key}
                  </small>
                </button>
              ))}
            </div>

            {/* 16-Step Sequencer LED visualizer */}
            <div className="flex gap-1.5 pt-2 max-w-[540px]">
              {Array.from({ length: 16 }).map((_, stepIdx) => (
                <div
                  key={stepIdx}
                  className={`step-led ${currentStep === stepIdx ? "active" : ""}`}
                />
              ))}
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={toggleLoop}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm active:translate-y-0.5"
              >
                {isPlayingLoop ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Dừng phát beat</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Phát beat mẫu ({activeKit?.synthConfig?.bpm || 110} BPM)</span>
                  </>
                )}
              </button>

              {activeKit && (
                <button
                  onClick={() => onSelectKitToBuy(activeKit.id)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-[var(--brass)] text-[var(--brass)] hover:bg-[var(--brass)] hover:text-[#1a1405] transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Mua bộ này ({activeKit.price.toLocaleString("vi-VN")}đ)</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: "Trong mỗi bộ có gì" */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <span className="ibox w-11 h-11 rounded-xl">
                  <Package className="w-5 h-5 text-[var(--brass)]" />
                </span>
                <div>
                  <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                    Trong mỗi bộ sampler có gì?
                  </h3>
                  <span className="text-xs text-[var(--muted)]">
                    {isSpd30 ? "Đặc quyền bộ tiếng Roland SPD-30" : "Hệ sinh thái Sound Ngoài (WAV Samples)"}
                  </span>
                </div>
              </div>

              <ul className="space-y-3.5 text-xs sm:text-sm text-[var(--muted)]">
                {isSpd30 ? (
                  <>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">File Backup SPD-30 (.SVD) độc quyền:</strong> Cắm USB vào máy Roland SPD-30 load 1 phút là xong toàn bộ 25-50 user kit.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Cân chỉnh chuyên sâu chi tiết:</strong> Từng thông số EQ, Layer, Muffle, Tune, Ambience, FX được tinh chỉnh cho lực đánh dày, sáng, nổi bật trên dàn âm thanh sân khấu.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Tối ưu lực gõ & chống nảy tiếng:</strong> Căn chỉnh Sens/Threshold để khi đánh mạnh không bị rè, ghost-note mượt mà.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Hỗ trợ kỹ thuật 1:1 trọn đời:</strong> Video hướng dẫn chi tiết và hỗ trợ qua Zalo nếu gặp bất kỳ khó khăn nào.
                      </span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Sample WAV 24-bit / 44.1kHz - 48kHz:</strong> Chất lượng phòng thu cao cấp, thu trực tiếp từ dàn trống cơ Yamaha, Ludwig xịn.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Nhiều lớp velocity chân thực:</strong> Phân tách độ mạnh nhẹ (soft, medium, hard rimshot) cho cảm giác chơi sống động như trống thật.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Xử lý Master Limiter & Compressor:</strong> Kick & Snare nén chặt, âm lượng to, tiếng không vỡ hay méo khi đẩy âm lượng lớn trên loa sân khấu.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-[var(--text)]">Tương thích toàn diện:</strong> Roland SPD-SX, SPD-SX PRO, NUX DP-2000, Avatar HXW, Donner và phần mềm máy tính (FL Studio, Ableton, Logic).
                      </span>
                    </li>
                  </>
                )}

                {/* Specific kit features if present */}
                {activeKit?.features && activeKit.features.length > 0 && (
                  <div className="pt-2 border-t border-[var(--line)] space-y-2">
                    <span className="text-[11px] font-bold uppercase text-[var(--brass)] tracking-wider block">
                      Ưu đãi riêng của bộ này:
                    </span>
                    {activeKit.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-[var(--text)]">
                        <Sparkles className="w-3.5 h-3.5 text-[var(--brass)] flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
