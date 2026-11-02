"use client";

import React, { useState, useEffect } from "react";
import { X, CalendarCheck, Check, MessageCircle } from "lucide-react";
import { ProfileData } from "@/lib/types";

export interface BookingModalData {
  isOpen: boolean;
  type: "course" | "room" | "general";
  title?: string;
  itemSelected?: string;
  hours?: number;
  price?: number;
}

interface BookingModalProps {
  modalData: BookingModalData;
  onClose: () => void;
  profile: ProfileData;
}

export function BookingModal({ modalData, onClose, profile }: BookingModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [datetime, setDatetime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (modalData.isOpen) {
      setName("");
      setPhone("");
      setDatetime("");
      setNotes("");
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [modalData.isOpen]);

  if (!modalData.isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsSubmitting(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim() || "Khách đặt lịch",
          phone: phone.trim(),
          serviceType: modalData.type,
          itemSelected: modalData.itemSelected || modalData.title || "Dịch vụ",
          hours: modalData.hours,
          message: `Thời gian dự kiến: ${datetime || "Linh hoạt"}. Ghi chú: ${notes || "Không"}`,
        }),
      });
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenZalo = () => {
    const text = `Chào bạn, mình muốn đăng ký: ${modalData.itemSelected || modalData.title || "học trống / phòng tập"}.
Tên: ${name || "(chưa điền)"}
SĐT: ${phone || "(chưa điền)"}
Thời gian: ${datetime || "Linh hoạt"}
Ghi chú: ${notes || "Không"}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    const cleanZalo = (profile.contact.zalo || "0900000000").replace(/\s+/g, "");
    window.open(`https://zalo.me/${cleanZalo}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--chip)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[var(--brass)] font-condensed font-bold text-sm uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4" />
            <span>Đặt lịch & Tư vấn</span>
          </div>
          <h3 className="font-condensed font-extrabold text-3xl text-[var(--text)]">
            {modalData.title || "Đăng ký dịch vụ"}
          </h3>
          {modalData.itemSelected && (
            <div className="text-sm font-semibold text-[var(--brass)]">
              {modalData.itemSelected} {modalData.price ? `• ${modalData.price.toLocaleString("vi-VN")}đ` : ""}
            </div>
          )}
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-condensed font-bold text-2xl text-[var(--text)]">
              Gửi yêu cầu thành công!
            </h4>
            <p className="text-sm text-[var(--muted)] max-w-xs mx-auto">
              Cảm ơn bạn. Tôi đã nhận được thông tin và sẽ liên hệ lại qua SĐT/Zalo trong thời gian sớm nhất.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Họ và tên của bạn
              </label>
              <input
                type="text"
                placeholder="Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Số điện thoại / Zalo *
              </label>
              <input
                type="tel"
                required
                placeholder="09xx xxx xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Thời gian bạn mong muốn
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Tối thứ 3 và thứ 5 (19h - 20h)"
                value={datetime}
                onChange={(e) => setDatetime(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                Ghi chú thêm (kinh nghiệm chơi nhạc, nhu cầu...)
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Em chưa từng cầm dùi bao giờ, muốn học từ đầu..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--brass)] resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-bold text-sm bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmitting ? "Đang gửi..." : "Xác nhận gửi yêu cầu"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenZalo}
                className="px-4 py-3 rounded-xl font-semibold text-sm bg-[#0068ff] text-white hover:bg-[#0055d4] transition-all flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Nhắn Zalo</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
