"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Volume2, VolumeX, Play, Pause, Disc, Music, Sparkles } from "lucide-react";

export function BackgroundMusic() {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSamplerPage, setIsSamplerPage] = useState(false);
  const [hasStartedOnce, setHasStartedOnce] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Keep track of whether music was playing before navigating to sampler
  const wasPlayingRef = useRef(false);

  const isSampler = pathname ? pathname.startsWith("/sampler") : false;

  useEffect(() => {
    setIsSamplerPage(isSampler);

    const audio = audioRef.current;
    if (!audio) return;

    if (isSampler) {
      // Pause immediately when entering /sampler
      if (!audio.paused) {
        wasPlayingRef.current = true;
        audio.pause();
        setIsPlaying(false);
      }
    } else {
      // Leaving /sampler: resume if it was playing before or if already started
      if (wasPlayingRef.current && audio.paused) {
        audio.play().then(() => {
          setIsPlaying(true);
        }).catch(() => {});
      }
    }
  }, [pathname, isSampler]);

  // Initial autoplay attempt & user interaction listener
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.4; // Pleasant background volume

    // If already on /sampler, do not attempt autoplay
    if (isSampler) return;

    const tryPlay = () => {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasStartedOnce(true);
          wasPlayingRef.current = true;
        })
        .catch(() => {
          // Browser prevented autoplay without user interaction.
          // Listen for the first user interaction anywhere on the window.
          const handleFirstInteraction = () => {
            if (!audioRef.current || (pathname && pathname.startsWith("/sampler"))) return;
            audioRef.current
              .play()
              .then(() => {
                setIsPlaying(true);
                setHasStartedOnce(true);
                wasPlayingRef.current = true;
              })
              .catch(() => {});
            window.removeEventListener("click", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
            window.removeEventListener("touchstart", handleFirstInteraction);
          };

          window.addEventListener("click", handleFirstInteraction, { once: true });
          window.addEventListener("keydown", handleFirstInteraction, { once: true });
          window.addEventListener("touchstart", handleFirstInteraction, { once: true });
        });
    };

    tryPlay();
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      wasPlayingRef.current = false;
    } else {
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasStartedOnce(true);
          wasPlayingRef.current = true;
        })
        .catch((err) => {
          console.warn("[BGM] Play error:", err);
        });
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  // If on sampler page, display subtle indicator or hide
  if (isSamplerPage) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1e1715]/85 border border-[var(--line)] text-xs text-[var(--muted)] backdrop-blur-md shadow-lg">
          <VolumeX className="w-3.5 h-3.5 text-[var(--muted)]" />
          <span className="font-mono text-[11px]">Nhạc nền tắt trên trang Sampler</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hidden HTML5 Audio Element */}
      <audio ref={audioRef} src="/audio/bgm.mp3" loop preload="auto" />

      {/* Floating BGM Player Controller */}
      <div className="fixed bottom-5 right-5 z-40 transition-all duration-300">
        {isMinimized ? (
          /* Minimized Disc Pill */
          <button
            onClick={() => setIsMinimized(false)}
            className="group flex items-center gap-2.5 p-2.5 sm:px-3 sm:py-2 rounded-full bg-[#1e1715]/90 border border-[var(--brass)]/60 text-[var(--brass)] shadow-[0_8px_25px_rgba(0,0,0,0.5)] backdrop-blur-md hover:scale-105 transition-all cursor-pointer"
            title="Mở thanh điều khiển nhạc nền"
          >
            <Disc className={`w-5 h-5 ${isPlaying ? "animate-spin-slow text-amber-400" : "text-[var(--brass)]"}`} />
            <span className="hidden sm:inline font-condensed font-bold text-xs uppercase tracking-wider">
              {isPlaying ? "Music ON" : "Music OFF"}
            </span>
          </button>
        ) : (
          /* Expanded Sleek Controller Card */
          <div className="flex items-center gap-3 p-2.5 pr-3.5 rounded-2xl bg-[#1e1715]/95 border border-[var(--brass)]/50 text-[var(--text)] shadow-[0_12px_35px_rgba(0,0,0,0.6)] backdrop-blur-md ring-1 ring-white/5 transition-all">
            {/* Spinning Disc / Album Art Icon */}
            <div
              onClick={togglePlay}
              className="relative w-10 h-10 rounded-xl bg-black/60 border border-[var(--brass)]/40 flex items-center justify-center cursor-pointer hover:border-amber-300 transition-colors group overflow-hidden"
              title={isPlaying ? "Bấm để tạm dừng" : "Bấm để phát nhạc"}
            >
              <Disc
                className={`w-6 h-6 text-[var(--brass)] ${
                  isPlaying ? "animate-spin-slow text-amber-400" : "opacity-80"
                }`}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                {isPlaying ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-white ml-0.5" />
                )}
              </div>
            </div>

            {/* Track Info & Animated EQ Bars */}
            <div className="flex flex-col min-w-[130px] sm:min-w-[160px]">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-condensed font-extrabold uppercase tracking-wide text-white truncate max-w-[120px]">
                  Linh Hồ • Stage BGM
                </span>
                {/* Dancing Equalizer */}
                {isPlaying && !isMuted ? (
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-amber-400 rounded-full animate-[eqBounce_0.8s_ease-in-out_infinite]" />
                    <span className="w-0.5 bg-[var(--brass)] rounded-full animate-[eqBounce_1.1s_ease-in-out_infinite_0.2s]" />
                    <span className="w-0.5 bg-amber-300 rounded-full animate-[eqBounce_0.7s_ease-in-out_infinite_0.4s]" />
                    <span className="w-0.5 bg-[var(--brass)] rounded-full animate-[eqBounce_0.9s_ease-in-out_infinite_0.1s]" />
                  </div>
                ) : (
                  <span className="text-[9px] font-mono uppercase text-[var(--muted)]">
                    PAUSED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] font-mono">
                <Sparkles className="w-2.5 h-2.5 text-[var(--brass)]" />
                <span>Nhạc nền tự động</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 border-l border-white/10 pl-2">
              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--brass)] transition-colors cursor-pointer"
                title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {/* Mute / Unmute */}
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--brass)] transition-colors cursor-pointer"
                title={isMuted ? "Bật âm thanh" : "Tắt tiếng"}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Minimize */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 text-[10px] text-[var(--muted)] hover:text-white transition-colors cursor-pointer ml-0.5"
                title="Thu nhỏ"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
