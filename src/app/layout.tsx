import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Drummer Profile – Dạy trống, thuê phòng tập, sampler",
  description: "Drummer chuyên nghiệp, giáo viên dạy trống, chủ phòng tập band cho thuê theo giờ và sản xuất bộ sampler trống chuyên nghiệp.",
  keywords: ["drummer", "dạy trống", "thuê phòng tập", "sampler", "sound kit", "phòng tập band"],
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
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#b8860b] selection:text-white">
        {children}
      </body>
    </html>
  );
}
