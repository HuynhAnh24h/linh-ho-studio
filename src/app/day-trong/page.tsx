import { getDatabase } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { DayTrongClient } from "./DayTrongClient";

export default async function DayTrongPage() {
  const data = await getDatabase();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--text)]">
      <Navbar brandName={data.profile.name} />
      <main className="flex-1">
        <DayTrongClient
          courses={data.courses}
          studentImages={data.studentImages || []}
          profile={data.profile}
        />
      </main>
      <Footer profile={data.profile} />
    </div>
  );
}
