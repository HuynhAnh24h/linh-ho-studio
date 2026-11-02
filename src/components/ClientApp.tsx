"use client";

import React, { useState } from "react";
import { SiteData, CourseItem, RoomItem } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { CoursesSection } from "@/components/CoursesSection";
import { RoomsSection } from "@/components/RoomsSection";
import { SamplerSection } from "@/components/SamplerSection";
import { ShopSection } from "@/components/ShopSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { BookingModal, BookingModalData } from "@/components/BookingModal";

interface ClientAppProps {
  initialData: SiteData;
}

export function ClientApp({ initialData }: ClientAppProps) {
  const [data] = useState<SiteData>(initialData);
  const [preselectedKitId, setPreselectedKitId] = useState<string>("rock");
  const [modalData, setModalData] = useState<BookingModalData>({
    isOpen: false,
    type: "general",
  });

  const handleOpenGeneralBooking = () => {
    setModalData({
      isOpen: true,
      type: "course",
      title: "Đặt lịch học trống",
      itemSelected: "Khoá học trống kèm 1:1",
    });
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

  const handleBookRoom = (room: RoomItem, hours: number, total: number) => {
    setModalData({
      isOpen: true,
      type: "room",
      title: `Đặt phòng tập: ${room.name}`,
      itemSelected: `${room.name} (${hours} giờ)`,
      hours,
      price: total,
    });
  };

  const handleSelectKitToBuy = (kitId: string) => {
    setPreselectedKitId(kitId);
    document.getElementById("mua-sampler")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar brandName={data.profile.name} />

      <main className="flex-1">
        <Hero profile={data.profile} onOpenBookingModal={handleOpenGeneralBooking} />
        <AboutSection profile={data.profile} />
        <CoursesSection courses={data.courses} onSelectCourse={handleSelectCourse} />
        <RoomsSection rooms={data.rooms} roomPerks={data.roomPerks} onBookRoom={handleBookRoom} />
        <SamplerSection kits={data.kits} onSelectKitToBuy={handleSelectKitToBuy} />
        <ShopSection
          kits={data.kits}
          comboOffer={data.comboOffer}
          profile={data.profile}
          preselectedKitId={preselectedKitId}
        />
        <ContactSection profile={data.profile} />
      </main>

      <Footer profile={data.profile} />

      <BookingModal
        modalData={modalData}
        onClose={() => setModalData((prev) => ({ ...prev, isOpen: false }))}
        profile={data.profile}
      />
    </div>
  );
}
