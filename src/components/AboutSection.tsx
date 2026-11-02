"use client";

import React from "react";
import { UserRound, Music, Mic } from "lucide-react";
import { ProfileData } from "@/lib/types";

interface AboutSectionProps {
  profile: ProfileData;
}

export function AboutSection({ profile }: AboutSectionProps) {
  return (
    <section id="gioi-thieu" className="py-20 border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Title */}
          <div className="md:col-span-4 space-y-4">
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
              <span className="ibox w-12 h-12 rounded-2xl">
                <UserRound className="w-6 h-6" />
              </span>
              <span>Giới thiệu</span>
            </h2>

            {profile.avatarUrl && (
              <div className="mt-4 rounded-2xl overflow-hidden border border-[var(--line)] max-w-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-auto object-cover aspect-square"
                />
              </div>
            )}
          </div>

          {/* Right Text */}
          <div className="md:col-span-8 space-y-4 text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            <p>{profile.aboutText1}</p>
            <p>{profile.aboutText2}</p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 pt-3">
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
    </section>
  );
}
