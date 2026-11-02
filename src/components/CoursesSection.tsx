"use client";

import React from "react";
import { GraduationCap, Check, Sprout, TrendingUp, Award, Music, BookOpen } from "lucide-react";
import { CourseItem } from "@/lib/types";

interface CoursesSectionProps {
  courses: CourseItem[];
  onSelectCourse: (course: CourseItem) => void;
}

export function CoursesSection({ courses, onSelectCourse }: CoursesSectionProps) {
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

  return (
    <section id="day-trong" className="py-20 bg-[var(--hero)] border-b border-[var(--line)]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <div className="mb-10 space-y-3">
          <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)] flex items-center gap-3.5 leading-none">
            <span className="ibox w-12 h-12 rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </span>
            <span>Học trống</span>
          </h2>
          <p className="text-base sm:text-lg text-[var(--muted)] max-w-3xl">
            Học 1 kèm 1, bạn có thể học tại phòng của tôi hoặc học online. Không cần có trống ở nhà, bạn có thể bắt đầu bằng pad tập.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-200 overflow-hidden ${
                course.isPopular
                  ? "bg-[var(--surface)] border-2 border-[var(--brass)] shadow-lg shadow-[var(--tint)]"
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

                <ul className="space-y-2.5 pt-2 text-sm sm:text-base text-[var(--muted)]">
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
                  onClick={() => onSelectCourse(course)}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all active:translate-y-0.5 ${
                    course.isPopular
                      ? "bg-[var(--brass)] text-[#1a1405] hover:bg-[var(--brass-2)]"
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
    </section>
  );
}
