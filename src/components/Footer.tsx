"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { ProfileData } from "@/lib/types";
import { BrandLogo } from "@/components/BrandLogo";

interface FooterProps {
  profile: ProfileData;
}

export function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] py-10 bg-[var(--surface)] text-[var(--muted)] text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
        <BrandLogo size="sm" />

        <div className="text-center sm:text-left text-xs sm:text-sm">
          © {currentYear} {profile.name} (LH Music Studio). Drummer, đào tạo trống &amp; phòng tập band.
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs">
            Hotline: <strong className="text-[var(--brass)]">{profile.contact.phone}</strong>
          </span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[var(--chip)] text-[var(--muted)] hover:text-[var(--brass)] transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
