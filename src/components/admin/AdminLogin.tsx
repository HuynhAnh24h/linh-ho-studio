"use client";

import React, { useState } from "react";
import { Lock, ArrowRight, AlertCircle } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem("admin_auth", "true");
        onSuccess();
      } else {
        setError(data.error || "Mật khẩu không chính xác");
      }
    } catch {
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)] text-[var(--text)]">
      <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" showText={false} />
          </div>
          <h1 className="font-condensed font-extrabold text-3xl sm:text-4xl text-[var(--brass)] tracking-wide uppercase">
            LH STUDIO ADMIN
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)]">
            Hệ thống quản trị nội dung, khoá học, phòng tập &amp; bộ sampler
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              Mật khẩu Admin
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (mặc định: admin123)"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
              />
              <Lock className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xs text-[var(--muted)] mt-1.5">
              Mật khẩu mặc định: <code className="text-[var(--brass)] font-mono">admin123</code>
            </p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>{isLoading ? "Đang xác thực..." : "Đăng nhập hệ thống"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <a
            href="/"
            className="text-xs text-[var(--muted)] hover:text-[var(--brass)] transition-colors underline"
          >
            ← Quay lại trang chủ xem giao diện
          </a>
        </div>
      </div>
    </div>
  );
}
