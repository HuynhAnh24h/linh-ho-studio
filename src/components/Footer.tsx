"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { ProfileData } from "@/lib/types";

interface FooterProps {
  profile: ProfileData;
}

export function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] py-8 bg-[var(--surface)] text-[var(--muted)] text-sm">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © {currentYear} {profile.name}. Drummer, giáo viên dạy trống, phòng tập band.
        </div>

        <div className="flex items-center gap-4">
          <span>Hotline / Zalo: <strong className="text-[var(--text)]">{profile.contact.phone}</strong></span>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--brass)] transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
