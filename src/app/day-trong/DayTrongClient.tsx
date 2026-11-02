"use client";

import React, { useState } from "react";
import { CourseItem, StudentImageItem, ProfileData } from "@/lib/types";
import { GraduationCap, Check, Sprout, TrendingUp, Award, Music, BookOpen, Users, CalendarCheck, Sparkles, Image as ImageIcon } from "lucide-react";
import { BookingModal, BookingModalData } from "@/components/BookingModal";
import Image from "next/image";

interface DayTrongClientProps {
  courses: CourseItem[];
  studentImages: StudentImageItem[];
  profile: ProfileData;
}

export function DayTrongClient({ courses, studentImages, profile }: DayTrongClientProps) {
  const [modalData, setModalData] = useState<BookingModalData>({
    isOpen: false,
    type: "course",
  });

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case "sprout":
        return <Sprout className="w-6 h-6" />;
      case "trending-up":
        return <TrendingUp className="w-6 h-6" />;
      case "award":
        return <Award className="w-6 h-6" />;
      case "music":
        return <Music className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const handleSelectCourse = (course: CourseItem) => {
    setModalData({
      isOpen: true,
      type: "course",
      title: `Đăng ký: ${course.title}`,
      itemSelected: `${course.title} (${course.price} ${course.unit})`,
      price: course.priceNumber,
    });
  };

  return (
    <div className="space-y-16 py-12 md:py-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 space-y-16">
        {/* Banner */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--chip)] text-xs font-bold text-[var(--brass)] uppercase tracking-wider">
            <GraduationCap className="w-4 h-4" />
            <span>Đào Tạo Trống Chuyên Nghiệp &amp; Căn Bản</span>
          </div>

          <h1 className="font-condensed font-extrabold text-5xl sm:text-7xl text-[var(--text)] tracking-tight leading-[1.05]">
            Học trống 1 kèm 1.<br />
            <span className="text-[var(--brass)]">Giữ nhịp vững chắc</span> sau từng buổi.
          </h1>

          <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed">
            Khoá học được thiết kế cá nhân hoá cho từng học viên: từ người chưa từng chạm dùi cho đến người muốn nâng cao kỹ năng biểu diễn live sân khấu và thu âm studio. Bạn không cần có trống ở nhà, có thể luyện tập bằng pad tập hoặc đến phòng tập của tôi.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() =>
                setModalData({
                  isOpen: true,
                  type: "course",
                  title: "Tư vấn & Đăng ký học trống",
                  itemSelected: "Khoá học trống kèm 1:1",
                })
              }
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] transition-all shadow-md active:translate-y-0.5"
            >
              <CalendarCheck className="w-5 h-5" />
              <span>Đăng ký học thử ngay</span>
            </button>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3">
              <span className="ibox w-12 h-12 rounded-2xl">
                <Sparkles className="w-6 h-6 text-[var(--brass)]" />
              </span>
              <span>Các Khoá Học Trống</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)]">
              Lựa chọn lộ trình phù hợp với mục tiêu và trình độ hiện tại của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all overflow-hidden ${
                  course.isPopular
                    ? "bg-[var(--surface)] border-2 border-[var(--brass)] shadow-xl shadow-[var(--tint)]"
                    : "bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--line-strong)]"
                }`}
              >
                {course.isPopular && (
                  <div className="ribbon">
                    Phổ biến
                  </div>
                )}

                <div className="space-y-4">
                  <span className="ibox w-12 h-12 rounded-xl text-[var(--brass)]">
                    {getIcon(course.iconName)}
                  </span>

                  <h3 className="font-condensed font-bold text-3xl text-[var(--text)] tracking-tight">
                    {course.title}
                  </h3>

                  <div className="font-condensed font-extrabold text-4xl text-[var(--brass)]">
                    {course.price}{" "}
                    <small className="font-normal font-sans text-sm text-[var(--muted)]">
                      {course.unit}
                    </small>
                  </div>

                  <ul className="space-y-3 pt-2 text-sm sm:text-base text-[var(--muted)]">
                    {course.features?.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <Check className="w-4 h-4 text-[var(--brass)] flex-shrink-0 mt-1" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-[var(--line)]">
                  <button
                    onClick={() => handleSelectCourse(course)}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all active:translate-y-0.5 ${
                      course.isPopular
                        ? "bg-[var(--brass)] text-[#1e1715] hover:bg-[var(--brass-2)] shadow-md"
                        : "border border-[var(--line-strong)] text-[var(--text)] hover:border-[var(--brass)] hover:text-[var(--brass)]"
                    }`}
                  >
                    Đăng ký khoá này
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Gallery Section */}
        <div className="space-y-8 pt-8 border-t border-[var(--line)]">
          <div className="space-y-2">
            <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3">
              <span className="ibox w-12 h-12 rounded-2xl">
                <Users className="w-6 h-6 text-[var(--brass)]" />
              </span>
              <span>Hình Ảnh Học Viên &amp; Hoạt Động Lớp Học</span>
            </h2>
            <p className="text-sm sm:text-base text-[var(--muted)]">
              Không khí học tập thực tế và những khoảnh khắc bùng nổ của các bạn học viên tại LH Studio
            </p>
          </div>

          {studentImages.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[var(--surface)] border border-[var(--line)] text-sm text-[var(--muted)]">
              Chưa có hình ảnh học viên nào được tải lên.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {studentImages.map((item) => (
                <div
                  key={item.id}
                  className="group bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] rounded-3xl overflow-hidden shadow-sm transition-all flex flex-col justify-between"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#261e1b]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="font-bold text-sm text-[var(--text)] group-hover:text-[var(--brass)] transition-colors">
                      {item.title}
                    </h4>
                    {item.caption && (
                      <p className="text-xs text-[var(--muted)] line-clamp-2">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BookingModal
        modalData={modalData}
        onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
        profile={profile}
      />
    </div>
  );
}
