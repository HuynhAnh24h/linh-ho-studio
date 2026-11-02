"use client";

import React from "react";
import Image from "next/image";
import { UserRound, Music, Mic, Sparkles } from "lucide-react";
import { ProfileData } from "@/lib/types";

interface AboutSectionProps {
  profile: ProfileData;
}

export function AboutSection({ profile }: AboutSectionProps) {
  return (
    <section id="gioi-thieu" className="py-20 border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Title & Portrait Card */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
              <span className="ibox w-12 h-12 rounded-2xl">
                <UserRound className="w-6 h-6 text-[var(--brass)]" />
              </span>
              <span>Giới thiệu</span>
            </h2>

            {profile.avatarUrl && (
              <div className="mt-4 rounded-3xl overflow-hidden border-2 border-[var(--brass)]/40 shadow-2xl relative aspect-[3/4] max-w-[340px] group">
                <Image
                  src={profile.avatarUrl}
                  alt={profile.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 340px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--brass)]">
                    Drummer • Producer
                  </span>
                  <h3 className="font-condensed font-extrabold text-2xl text-white">
                    {profile.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1">
                    Founder LH Music Studio
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Text */}
          <div className="md:col-span-7 space-y-5 text-base sm:text-lg text-[var(--muted)] leading-relaxed pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[var(--brass)]/15 text-[var(--brass)] border border-[var(--brass)]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tiểu sử & Phong cách</span>
            </div>

            <p>{profile.aboutText1}</p>
            <p>{profile.aboutText2}</p>

            {/* Badges */}
            <div className="space-y-2 pt-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] block">
                Dòng nhạc & Kỹ năng sở trường:
              </span>
              <div className="flex flex-wrap gap-2">
                {profile.genres?.map((genre, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[var(--chip)] text-sm font-medium text-[var(--text)] border border-[var(--line)]"
                  >
                    {genre.toLowerCase().includes("thu âm") ? (
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
