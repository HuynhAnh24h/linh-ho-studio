"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Moon, Sun, Menu, X, ShieldAlert } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

interface NavbarProps {
  brandName?: string;
}

export function Navbar({ brandName = "LH STUDIO" }: NavbarProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      // Default to dark theme matching LH Studio aesthetic
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  const navLinks = [
    { href: "#gioi-thieu", label: "Giới thiệu" },
    { href: "#day-trong", label: "Dạy trống" },
    { href: "#phong-tap", label: "Phòng tập" },
    { href: "#sampler", label: "Sampler" },
    { href: "#mua-sampler", label: "Mua sampler" },
    { href: "#lien-he", label: "Liên hệ" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b border-[var(--line)] bg-[var(--navbg)] transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand with Logo image */}
        <Link href="#top" className="hover:opacity-90 transition-opacity">
          <BrandLogo size="md" />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Đổi giao diện Sáng / Tối"
            className="p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
          >
            {theme === "dark" ? <Sun className="w-5 h-5 text-[var(--brass)]" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Admin shortcut */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--chip)] text-[var(--text)] hover:bg-[var(--brass)] hover:text-[#1e1715] transition-colors"
            title="Trang quản trị Admin"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Admin</span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 md:hidden rounded-lg text-[var(--text)] hover:bg-[var(--chip)]"
            aria-label="Mở menu"
          >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-[var(--line)] bg-[var(--surface)] px-4 py-4 space-y-2">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className="block px-3 py-2 rounded-lg font-medium text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
            >
              {item.label}
            </a>
          ))}
          <div className="pt-2 border-t border-[var(--line)]">
            <Link
              href="/admin"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-[var(--brass)] hover:bg-[var(--chip)]"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Quản trị viên (Admin)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
