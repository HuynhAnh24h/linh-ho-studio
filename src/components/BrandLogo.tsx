"use client";

import React from "react";
import Image from "next/image";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function BrandLogo({ className = "", size = "md", showText = true }: BrandLogoProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-14 h-14",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeMap[size]} rounded-xl overflow-hidden border border-[#54443e] shadow-md flex-shrink-0 bg-[#261e1b]`}>
        <Image
          src="/logo.png"
          alt="LH Music Studio"
          fill
          sizes="(max-width: 768px) 40px, 56px"
          className="object-cover"
          priority
        />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-condensed font-extrabold text-2xl tracking-wider text-[var(--brass)] leading-none uppercase">
            LH STUDIO
          </span>
          <span className="text-[10px] font-semibold text-[var(--muted)] tracking-widest uppercase mt-0.5">
            Music Studio
          </span>
        </div>
      )}
    </div>
  );
}
