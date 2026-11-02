import { getDatabase } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { AboutSection } from "@/components/AboutSection";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { GraduationCap, Clock, Headphones, Music2, ArrowRight, Award, PlayCircle, ShieldCheck } from "lucide-react";

export default async function HomePage() {
  const data = await getDatabase();
  const { profile } = data;

  const quickNavCards = [
    {
      title: "Đào tạo & Dạy trống",
      desc: "Khoá học 1 kèm 1 từ cơ bản đến biểu diễn live sân khấu cùng thư viện hình ảnh học viên thực tế.",
      href: "/day-trong",
      icon: <GraduationCap className="w-6 h-6 text-[var(--brass)]" />,
      cta: "Xem khoá học & học viên",
    },
    {
      title: "Phòng tập band & Studio",
      desc: "Phòng cách âm tiêu chuẩn, dàn trống acoustic, ampli guitar/bass và công cụ tính giá thuê theo giờ.",
      href: "/phong-tap",
      icon: <Clock className="w-6 h-6 text-[var(--brass)]" />,
      cta: "Xem phòng tập & đặt lịch",
    },
    {
      title: "Bộ Sampler & Sound Pack",
      desc: "Máy đánh trống tương tác 6 pad, 16-step sequencer và các gói sound sample WAV 24-bit phòng thu.",
      href: "/sampler",
      icon: <Headphones className="w-6 h-6 text-[var(--brass)]" />,
      cta: "Nghe thử & mua sound kit",
    },
    {
      title: "Dịch vụ Band nhạc & Sự kiện",
      desc: "Cho thuê ban nhạc Acoustic, thuê trống sự kiện và ban nhạc Full-Band phục vụ tiệc cưới hỏi, gala.",
      href: "/lien-he",
      icon: <Music2 className="w-6 h-6 text-[var(--brass)]" />,
      cta: "Xem dịch vụ & báo giá",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar brandName={profile.name} />

      <main className="flex-1">
        {/* Hero Section */}
        <Hero profile={profile} />

        {/* In-depth About & Profile Section */}
        <AboutSection profile={profile} />

        {/* Drummer Career Highlights & Philosophy */}
        <section className="py-20 bg-[var(--hero)] border-b border-[var(--line)]">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 rounded-3xl space-y-3">
                <span className="ibox w-12 h-12 rounded-2xl">
                  <Award className="w-6 h-6 text-[var(--brass)]" />
                </span>
                <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                  10+ Năm Thực Chiến
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Lưu diễn cùng hàng chục ban nhạc rock, indie và pop qua các sân khấu lớn nhỏ, phòng trà và sự kiện âm nhạc toàn quốc.
                </p>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 rounded-3xl space-y-3">
                <span className="ibox w-12 h-12 rounded-2xl">
                  <PlayCircle className="w-6 h-6 text-[var(--brass)]" />
                </span>
                <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                  Thu Âm &amp; Sản Xuất Sound
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Trực tiếp thu âm track trống mộc cho các sản phẩm âm nhạc, đồng thời tự xử lý và phát hành các bộ sampler độc quyền cho producer.
                </p>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--line)] p-6 sm:p-8 rounded-3xl space-y-3">
                <span className="ibox w-12 h-12 rounded-2xl">
                  <ShieldCheck className="w-6 h-6 text-[var(--brass)]" />
                </span>
                <h3 className="font-condensed font-bold text-2xl text-[var(--text)]">
                  Đào Tạo &amp; Truyền Cảm Hứng
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">
                  Phương pháp dạy thực tiễn, không lý thuyết rườm rà. Giúp học viên giữ vững nhịp phách và tự tin làm chủ bộ trống sau vài buổi học.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Specialized Pages */}
        <section className="py-20 border-b border-[var(--line)]">
          <div className="max-w-6xl mx-auto px-4 space-y-10">
            <div className="space-y-2">
              <h2 className="font-condensed font-extrabold text-4xl sm:text-5xl text-[var(--text)]">
                Dịch vụ &amp; Hoạt động tại LH Studio
              </h2>
              <p className="text-base text-[var(--muted)] max-w-2xl">
                Khám phá các trang chuyên biệt để xem chi tiết học phí, hình ảnh phòng tập, bộ sound kit hoặc đặt lịch thuê ban nhạc sự kiện.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickNavCards.map((card, idx) => (
                <Link
                  key={idx}
                  href={card.href}
                  className="group bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--brass)] rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all hover:scale-[1.01] shadow-sm"
                >
                  <div className="space-y-4">
                    <span className="ibox w-12 h-12 rounded-2xl group-hover:scale-105 transition-transform">
                      {card.icon}
                    </span>
                    <h3 className="font-condensed font-bold text-2xl text-[var(--text)] group-hover:text-[var(--brass)] transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-4 border-t border-[var(--line)] flex items-center justify-between text-xs font-bold text-[var(--brass)] uppercase tracking-wider">
                    <span>{card.cta}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
