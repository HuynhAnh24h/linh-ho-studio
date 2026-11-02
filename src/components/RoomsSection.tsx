"use client";

import React, { useState } from "react";
import { Clock, Drum, Speaker, Mic, Snowflake, Percent, CalendarCheck } from "lucide-react";
import { RoomItem, RoomPerk } from "@/lib/types";

interface RoomsSectionProps {
  rooms: RoomItem[];
  roomPerks: RoomPerk[];
  onBookRoom: (room: RoomItem, hours: number, total: number) => void;
}

export function RoomsSection({ rooms, roomPerks, onBookRoom }: RoomsSectionProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || "");
  const [hours, setHours] = useState<number>(2);

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  const getPerkIcon = (iconName: string) => {
    switch (iconName) {
      case "drum":
        return <Drum className="w-5 h-5 text-[var(--brass)]" />;
      case "speaker":
        return <Speaker className="w-5 h-5 text-[var(--brass)]" />;
      case "mic":
        return <Mic className="w-5 h-5 text-[var(--brass)]" />;
      case "snowflake":
        return <Snowflake className="w-5 h-5 text-[var(--brass)]" />;
      case "percent":
        return <Percent className="w-5 h-5 text-[var(--brass)]" />;
      default:
        return <Clock className="w-5 h-5 text-[var(--brass)]" />;
    }
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    let t = selectedRoom.pricePerHour * hours;
    if (hours >= 4) {
      t = t * 0.9;
    }
    return Math.round(t);
  };

  const isDiscounted = hours >= 4;
  const totalAmount = calculateTotal();

  return (
    <section id="phong-tap" className="py-20 border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Room info & Perks */}
          <div className="lg:col-span-6 space-y-6">
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
              <span className="ibox w-12 h-12 rounded-2xl">
                <Clock className="w-6 h-6" />
              </span>
              <span>Thuê phòng tập</span>
            </h2>

            <p className="text-base sm:text-lg text-[var(--muted)]">
              Phòng cách âm, có sẵn bộ trống, ampli, mic và loa monitor. Thuê theo giờ, đặt trước hoặc đến là vào tập.
            </p>

            {/* Perks grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {roomPerks?.map((perk) => (
                <div
                  key={perk.id}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-sm font-medium text-[var(--text)]"
                >
                  <span className="ibox w-9 h-9 rounded-lg flex-shrink-0">
                    {getPerkIcon(perk.iconName)}
                  </span>
                  <span>{perk.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Calculator Box */}
          <div className="lg:col-span-6">
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                Ước tính giá thuê phòng
              </h3>

              {/* Room select */}
              <div className="space-y-2">
                <label htmlFor="roomSelect" className="block text-sm font-bold text-[var(--text)]">
                  Chọn phòng
                </label>
                <select
                  id="roomSelect"
                  value={selectedRoom?.id}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--line-strong)] bg-[var(--bg)] text-[var(--text)] focus:border-[var(--brass)] outline-none transition-colors text-base"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}, {r.capacity}, {r.pricePerHour.toLocaleString("vi-VN")}đ/giờ
                    </option>
                  ))}
                </select>
                {selectedRoom?.description && (
                  <p className="text-xs text-[var(--muted)]">{selectedRoom.description}</p>
                )}
              </div>

              {/* Hours slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-bold text-[var(--text)]">
                  <label htmlFor="hoursSlider">Số giờ thuê:</label>
                  <span className="font-condensed text-xl text-[var(--brass)]">{hours} giờ</span>
                </div>
                <input
                  id="hoursSlider"
                  type="range"
                  min="1"
                  max="8"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full accent-[var(--brass)] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-[var(--muted)]">
                  <span>1 giờ</span>
                  <span>4 giờ (giảm 10%)</span>
                  <span>8 giờ</span>
                </div>
              </div>

              {/* Discount hint & Total */}
              <div className="pt-2 border-t border-[var(--line)]">
                <p className="text-xs font-semibold min-h-[20px] text-[var(--muted)]">
                  {isDiscounted ? (
                    <span className="text-[var(--brass)] flex items-center gap-1">
                      <Percent className="w-3.5 h-3.5 inline" /> Đã áp dụng giảm 10% khi thuê từ 4 giờ!
                    </span>
                  ) : (
                    "Thuê từ 4 giờ trở lên để được giảm 10%"
                  )}
                </p>

                <div className="font-condensed font-extrabold text-5xl sm:text-6xl text-[var(--brass)] mt-1">
                  {totalAmount.toLocaleString("vi-VN")}đ
                </div>
              </div>

              {/* Book Button */}
              <button
                onClick={() => onBookRoom(selectedRoom, hours, totalAmount)}
                className="w-full py-3.5 rounded-xl font-bold text-base bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)] transition-all flex items-center justify-center gap-2 shadow-sm active:translate-y-0.5"
              >
                <CalendarCheck className="w-5 h-5" />
                <span>Đặt phòng tập ngay</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
