import { getDatabase } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PhongTapClient } from "./PhongTapClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PhongTapPage() {
  const data = await getDatabase();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar brandName={data.profile.name} />
      <main className="flex-1">
        <PhongTapClient
          rooms={data.rooms}
          roomPerks={data.roomPerks}
          roomImages={data.roomImages || []}
          profile={data.profile}
        />
      </main>
      <Footer profile={data.profile} />
    </div>
  );
}
