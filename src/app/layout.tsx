import type { Metadata } from "next";
import "./globals.css";
import { BackgroundMusic } from "@/components/BackgroundMusic";
import { PageLoader } from "@/components/PageLoader";
import { RealtimeDataSync } from "@/components/RealtimeDataSync";

export const metadata: Metadata = {
  title: "Linh Hồ – Drummer & LH Music Studio",
  description: "Drummer chuyên nghiệp, đào tạo dạy trống thực chiến, phòng tập band tiêu chuẩn và sản xuất bộ sound sampler Roland SPD-30 & SPD-SX Pro.",
  keywords: ["drummer linh hồ", "lh music studio", "dạy trống", "thuê phòng tập", "sampler spd-30", "sound pack", "ban nhạc tiệc cưới"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#b8860b] selection:text-white relative">
        <PageLoader />
        <RealtimeDataSync />
        {children}
        <BackgroundMusic />
      </body>
    </html>
  );
}
