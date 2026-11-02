import { getDatabase } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SamplerClient } from "./SamplerClient";

export const metadata = {
  title: "LH Sampler Trống & Sound Packs | LH Music Studio",
  description: "Trải nghiệm máy gõ trống 6-pad online và kho bộ tiếng Sampler drum kit chất lượng cao.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SamplerPage() {
  const data = await getDatabase();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar brandName={data.profile.name} />
      <main className="flex-1 py-6">
        <SamplerClient
          kits={data.kits}
          comboOffer={data.comboOffer}
          profile={data.profile}
        />
      </main>
      <Footer profile={data.profile} />
    </div>
  );
}
