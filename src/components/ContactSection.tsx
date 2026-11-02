"use client";

import React from "react";
import { Phone, MessageCircle, Mail, MapPin } from "lucide-react";
import { ProfileData } from "@/lib/types";

interface ContactSectionProps {
  profile: ProfileData;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const c = profile.contact;
  const cleanPhone = (c.phone || "0900000000").replace(/\s+/g, "");
  const cleanZalo = (c.zalo || "0900000000").replace(/\s+/g, "");

  const contacts = [
    {
      title: "Gọi điện",
      value: c.phone || "0900 000 000",
      href: `tel:${cleanPhone}`,
      icon: <Phone className="w-5 h-5 text-[var(--brass)]" />,
      target: "_self",
    },
    {
      title: "Zalo",
      value: "Nhắn để mua sampler & đặt phòng nhanh nhất",
      href: `https://zalo.me/${cleanZalo}`,
      icon: <MessageCircle className="w-5 h-5 text-[var(--brass)]" />,
      target: "_blank",
    },
    {
      title: "Email",
      value: c.email || "linhho.drummer@example.com",
      href: `mailto:${c.email || "linhho.drummer@example.com"}`,
      icon: <Mail className="w-5 h-5 text-[var(--brass)]" />,
      target: "_self",
    },
    {
      title: "Facebook",
      value: "Theo dõi hoạt động & show diễn",
      href: c.facebook || "https://facebook.com",
      icon: (
        <svg className="w-5 h-5 fill-current text-[var(--brass)]" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      target: "_blank",
    },
    {
      title: "YouTube",
      value: "Video biểu diễn và demo sound thực tế",
      href: c.youtube || "https://youtube.com",
      icon: (
        <svg className="w-5 h-5 fill-current text-[var(--brass)]" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      ),
      target: "_blank",
    },
    {
      title: "Địa chỉ phòng tập",
      value: c.address || "123 Đường Âm Nhạc, Quận 1, TP. Hồ Chí Minh",
      href: `https://maps.google.com/?q=${encodeURIComponent(c.address || "TP. Hồ Chí Minh")}`,
      icon: <MapPin className="w-5 h-5 text-[var(--brass)]" />,
      target: "_blank",
    },
  ];

  return (
    <section id="lien-he" className="py-20 bg-[var(--hero)] border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-10 space-y-3">
          <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
            <span className="ibox w-12 h-12 rounded-2xl">
              <Phone className="w-6 h-6" />
            </span>
            <span>Liên hệ</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-3xl">
            Đặt lịch học, đặt phòng tập hoặc hỏi mua sampler. Tôi phản hồi nhanh nhất trong ngày.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contacts.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              target={item.target}
              rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
              className="flex items-center gap-4 p-5 rounded-2xl bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] text-[var(--text)] transition-all group"
            >
              <span className="ibox w-12 h-12 rounded-xl group-hover:scale-105 transition-transform">
                {item.icon}
              </span>
              <div className="min-w-0">
                <b className="block text-base font-bold text-[var(--text)] group-hover:text-[var(--brass)] transition-colors">
                  {item.title}
                </b>
                <small className="block text-sm text-[var(--muted)] truncate">
                  {item.value}
                </small>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
