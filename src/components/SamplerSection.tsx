"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Headphones, Play, Square, ShoppingCart, Package, Check } from "lucide-react";
import { SoundKitItem } from "@/lib/types";
import { drumAudioEngine, DRUM_PADS, BEAT_PATTERN, PadKey } from "@/lib/audio-engine";

interface SamplerSectionProps {
  kits: SoundKitItem[];
  onSelectKitToBuy: (kitId: string) => void;
}

export function SamplerSection({ kits, onSelectKitToBuy }: SamplerSectionProps) {
  const [activeKitIndex, setActiveKitIndex] = useState<number>(0);
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isPlayingLoop, setIsPlayingLoop] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);

  const loopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentStepRef = useRef<number>(0);

  const activeKit = kits[activeKitIndex] || kits[0];

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
  const handleKitSelect = (index: number) => {
    setActiveKitIndex(index);
    const newKit = kits[index];
    if (newKit) {
      drumAudioEngine.setLowpassFilter(newKit.synthConfig.lp);
      drumAudioEngine.playSound("snare", newKit);
    }
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

    const bpm = activeKit.synthConfig.bpm || 100;
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

  return (
    <section id="sampler" className="py-20 bg-[var(--hero)] border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-8 space-y-3">
          <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
            <span className="ibox w-12 h-12 rounded-2xl">
              <Headphones className="w-6 h-6" />
            </span>
            <span>Nghe thử sampler</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-3xl leading-relaxed">
            Chọn một bộ, rồi bấm pad hoặc dùng phím <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">Q</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">W</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">E</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">A</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">S</kbd> <kbd className="px-1.5 py-0.5 rounded bg-[var(--chip)] font-mono text-sm border border-[var(--line)]">D</kbd> để nghe. Bấm “Phát beat mẫu” để nghe bộ đó chạy một vòng nhịp.
          </p>
        </div>

        {/* Sampler Machine & What's inside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Drum Machine Box */}
          <div className="lg:col-span-7 space-y-5">
            {/* Kit Selection Buttons */}
            <div className="flex flex-wrap gap-2.5">
              {kits.map((k, idx) => (
                <button
                  key={k.id}
                  onClick={() => handleKitSelect(idx)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all cursor-pointer ${
                    activeKitIndex === idx
                      ? "bg-[var(--brass)] border-[var(--brass)] text-[#1a1405]"
                      : "border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)]"
                  }`}
                >
                  {k.name}
                </button>
              ))}
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-[var(--muted)] min-h-[44px]">
              {activeKit?.desc}
            </p>

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
                    <span>Phát beat mẫu</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onSelectKitToBuy(activeKit.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm border-2 border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)] transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Mua bộ này ({activeKit.price.toLocaleString("vi-VN")}đ)</span>
              </button>
            </div>
          </div>

          {/* Right Column: "Trong mỗi bộ có gì" */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center gap-3">
                <span className="ibox w-11 h-11 rounded-xl">
                  <Package className="w-5 h-5 text-[var(--brass)]" />
                </span>
                <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                  Trong mỗi bộ sampler có gì?
                </h3>
              </div>

              <ul className="space-y-3.5 text-sm sm:text-base text-[var(--muted)]">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--brass)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[var(--text)]">Sample WAV 24-bit / 48kHz</strong> chất lượng phòng thu chuyên nghiệp.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--brass)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[var(--text)]">Nhiều lớp velocity</strong> riêng biệt cho từng tiếng trống (soft, medium, hard rimshot).
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--brass)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[var(--text)]">Preset sẵn</strong> kéo thả trực tiếp cho Ableton Live, FL Studio, Logic Pro, Studio One.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-[var(--brass)] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[var(--text)]">100% Royalty-Free:</strong> sử dụng thương mại không giới hạn, không cần chia sẻ doanh thu.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
