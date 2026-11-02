import { getDatabase } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { LienHeClient } from "./LienHeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LienHePage() {
  const data = await getDatabase();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar brandName={data.profile.name} />
      <main className="flex-1">
        <LienHeClient
          eventServices={data.eventServices || []}
          profile={data.profile}
        />
      </main>
      <Footer profile={data.profile} />
    </div>
  );
}
