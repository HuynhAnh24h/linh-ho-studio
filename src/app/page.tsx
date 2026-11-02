import { getDatabase } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { ProfileGallery } from "@/components/ProfileGallery";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  Headphones,
  Music2,
  ArrowRight,
  Award,
  PlayCircle,
  ShieldCheck,
  Disc3,
  Sliders,
  Radio,
  Sparkles,
  Zap,
} from "lucide-react";

export default async function HomePage() {
  const data = await getDatabase();
  const { profile } = data;

  const gearArsenal = [
    {
      num: "01",
      title: "Dàn Trống Cơ & Snare PDP/DW",
      category: "Acoustic Stage Rig",
      desc: "Snare kích thước chuẩn 14\"x6.5\" cho tiếng crack giòn tan uy lực, kết hợp bộ cymbal Zildjian A Custom & Sabian AAX mang lại dải âm sáng rõ trên mọi sân khấu lớn nhỏ.",
      icon: <Disc3 className="w-6 h-6 text-[var(--brass)]" />,
      tags: ["Snare 14x6.5", "Zildjian Cymbals", "Double Pedal"],
    },
    {
      num: "02",
      title: "Roland SPD-30 & SPD-SX PRO",
      category: "Electronic & Hybrid Rig",
      desc: "Trang bị chuyên biệt 2 hệ sinh thái: Roland SPD-30 sử dụng sound gốc cân chỉnh độc quyền; SPD-SX, SX PRO, NUX và Avatar sử dụng sound ngoài WAV 24-bit nạp trực tiếp.",
      icon: <Sliders className="w-6 h-6 text-amber-400" />,
      tags: ["SPD-30 Sound Gốc", "SPD-SX PRO WAV", "NUX & Avatar"],
    },
    {
      num: "03",
      title: "LH Music Studio & Control Room",
      category: "Studio & Recording",
      desc: "Phòng cách âm và tán âm tiêu chuẩn cao cấp, hệ thống kiểm âm Yamaha HS, bàn mixer chuyên dụng và micro thu trống Shure SM57 / Beta 52A tái hiện âm thanh trung thực nhất.",
      icon: <Radio className="w-6 h-6 text-emerald-400" />,
      tags: ["Yamaha HS", "Soundproof Room", "Multi-Mic Setup"],
    },
    {
      num: "04",
      title: "In-Ear Monitor & Click Track Live",
      category: "Live Sync System",
      desc: "Hệ thống tai nghe kiểm âm in-ear đồng bộ click track và backing tracks multitrack, đảm bảo độ chính xác tuyệt đối từng mili-giây cho ca sĩ và toàn bộ ban nhạc.",
      icon: <Zap className="w-6 h-6 text-blue-400" />,
      tags: ["In-Ear Monitor", "Click Track Sync", "Multitrack Live"],
    },
  ];

  const quickNavCards = [
    {
      num: "01",
      title: "Đào tạo & Dạy trống thực chiến",
      desc: "Khoá học 1 kèm 1 từ cơ bản đến biểu diễn live sân khấu. Phương pháp trực quan, vào bài ngay, có thư viện hình ảnh học viên thực tế.",
      href: "/day-trong",
      icon: <GraduationCap className="w-6 h-6 text-[var(--brass)]" />,
      cta: "Xem khoá học & học viên",
    },
    {
      num: "02",
      title: "Phòng tập band & Studio tiêu chuẩn",
      desc: "Phòng cách âm chất lượng cao, dàn trống acoustic, ampli guitar/bass, micro, đàn phím và bảng tính giá thuê tự động theo giờ.",
      href: "/phong-tap",
      icon: <Clock className="w-6 h-6 text-[var(--brass)]" />,
      cta: "Xem 6 góc ảnh & đặt phòng",
    },
    {
      num: "03",
      title: "Bộ Sampler SPD-30 & Sound Packs",
      desc: "Phân loại rõ ràng 2 mục: Roland SPD-30 sound gốc và SPD-SX / NUX / Avatar sound ngoài WAV 24-bit. Nghe thử pad tương tác trực tiếp.",
      href: "/sampler",
      icon: <Headphones className="w-6 h-6 text-[var(--brass)]" />,
      cta: "Nghe thử & mua sound kit",
    },
    {
      num: "04",
      title: "Dịch vụ Band nhạc & Thuê trống",
      desc: "Cho thuê ban nhạc Acoustic, thuê trống sự kiện và ban nhạc Full-Band phục vụ tiệc cưới hỏi, gala dinner, khai trương sang trọng.",
      href: "/lien-he",
      icon: <Music2 className="w-6 h-6 text-[var(--brass)]" />,
      cta: "Xem dịch vụ & nhận báo giá",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar brandName={profile.name} />

      <main className="flex-1">
        {/* 1. Hero Section: Concert Lighting, Equalizer, Interactive Snare */}
        <Hero profile={profile} />

        {/* 2. In-depth About & VIP Artist Dossier */}
        <AboutSection profile={profile} />

        {/* 3. Real Stage & Studio Photo Gallery (HPMA 2026, Concerts, Studio) */}
        <ProfileGallery />

        {/* 4. Gear Arsenal / Vũ Khí Sân Khấu & Phòng Thu */}
        <section className="py-20 md:py-28 border-b border-[var(--line)] bg-[var(--hero)] relative overflow-hidden">
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--brass)]/5 blur-[150px] rounded-full pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[var(--brass)]/15 text-[var(--brass)] border border-[var(--brass)]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Vũ Khí Sân Khấu &amp; Phòng Thu</span>
                </div>
                <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text)] tracking-tight leading-none">
                  Stage &amp; Studio Gear Rig
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[var(--muted)] max-w-md">
                Bộ trang thiết bị được tuyển chọn và tinh chỉnh khắt khe nhằm đảm bảo độ tin cậy tuyệt đối trên sân khấu lớn và chất lượng âm thanh đỉnh cao trong phòng thu.
              </p>
            </div>

            {/* Gear Rig Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gearArsenal.map((gear, idx) => (
                <div
                  key={idx}
                  className="group relative bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)]/70 rounded-3xl p-7 sm:p-8 transition-all hover:shadow-[0_10px_35px_rgba(0,0,0,0.3)] flex flex-col justify-between overflow-hidden"
                >
                  {/* Huge ghost number */}
                  <span className="absolute top-3 right-6 font-condensed font-black text-7xl text-[var(--line)]/40 pointer-events-none group-hover:text-[var(--brass)]/20 transition-colors select-none">
                    {gear.num}
                  </span>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <span className="ibox w-12 h-12 rounded-2xl group-hover:scale-110 transition-transform">
                        {gear.icon}
                      </span>
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--brass)] bg-[var(--hero)] px-3 py-1 rounded-full border border-[var(--line)]">
                        {gear.category}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)] group-hover:text-[var(--brass)] transition-colors">
                        {gear.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {gear.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-[var(--line)] flex flex-wrap gap-2 relative z-10">
                    {gear.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2.5 py-1 rounded-lg bg-[var(--hero)] text-[11px] font-mono font-semibold text-[var(--text)] border border-[var(--line)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Drummer Career Highlights & Philosophy */}
        <section className="py-20 md:py-24 bg-[var(--surface)] border-b border-[var(--line)]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="relative bg-[var(--hero)] border border-[var(--line)] hover:border-[var(--brass)]/50 p-7 sm:p-8 rounded-3xl space-y-3.5 transition-all">
                <span className="ibox w-12 h-12 rounded-2xl">
                  <Award className="w-6 h-6 text-[var(--brass)]" />
                </span>
                <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                  10+ Năm Thực Chiến Sân Khấu
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Lưu diễn cùng hàng chục ban nhạc rock, indie và pop qua các sân khấu lớn nhỏ, phòng trà và sự kiện âm nhạc quy mô (HPMA Connection Showcase).
                </p>
              </div>

              <div className="relative bg-[var(--hero)] border border-[var(--line)] hover:border-[var(--brass)]/50 p-7 sm:p-8 rounded-3xl space-y-3.5 transition-all">
                <span className="ibox w-12 h-12 rounded-2xl">
                  <PlayCircle className="w-6 h-6 text-amber-400" />
                </span>
                <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                  Thu Âm &amp; Sound Design
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Trực tiếp thu âm track trống mộc cho các sản phẩm âm nhạc, đồng thời thiết kế và phát hành các bộ sound sampler độc quyền cho cộng đồng drummer và producer.
                </p>
              </div>

              <div className="relative bg-[var(--hero)] border border-[var(--line)] hover:border-[var(--brass)]/50 p-7 sm:p-8 rounded-3xl space-y-3.5 transition-all">
                <span className="ibox w-12 h-12 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </span>
                <h3 className="font-condensed font-extrabold text-2xl text-[var(--text)]">
                  Đào Tạo Thực Chiến &amp; Sự Kiện
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Phương pháp dạy thực tiễn 1 kèm 1, không lý thuyết rườm rà. Kết hợp cung cấp ban nhạc biểu diễn tiệc cưới hỏi, sự kiện cao cấp cho doanh nghiệp.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Explore Specialized Pages (Dạy Trống, Phòng Tập, Sampler, Liên Hệ) */}
        <section className="py-20 md:py-28 border-b border-[var(--line)] bg-[var(--hero)]">
          <div className="max-w-6xl mx-auto px-4 space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[var(--brass)]/15 text-[var(--brass)] border border-[var(--brass)]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Hệ Sinh Thái LH Music Studio</span>
                </div>
                <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[var(--text)] tracking-tight leading-none">
                  Dịch Vụ &amp; Hoạt Động Chuyên Nghiệp
                </h2>
              </div>
              <p className="text-sm sm:text-base text-[var(--muted)] max-w-md">
                Khám phá các trang chuyên biệt để xem chi tiết học phí, hình ảnh phòng tập, bộ sound kit hoặc đặt lịch thuê ban nhạc sự kiện.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickNavCards.map((card, idx) => (
                <Link
                  key={idx}
                  href={card.href}
                  className="group relative bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all hover:scale-[1.01] hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                  {/* Ghost index number */}
                  <span className="absolute top-4 right-6 font-condensed font-black text-6xl text-[var(--line)]/40 pointer-events-none group-hover:text-[var(--brass)]/20 transition-colors select-none">
                    {card.num}
                  </span>

                  <div className="space-y-4 relative z-10">
                    <span className="ibox w-14 h-14 rounded-2xl group-hover:scale-105 transition-transform">
                      {card.icon}
                    </span>
                    <h3 className="font-condensed font-extrabold text-2xl sm:text-3xl text-[var(--text)] group-hover:text-[var(--brass)] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[var(--line)] flex items-center justify-between text-xs font-mono font-bold text-[var(--brass)] uppercase tracking-wider relative z-10">
                    <span>{card.cta}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer profile={profile} />
    </div>
  );
}
