import { getDatabase } from "@/lib/db";
import { ClientApp } from "@/components/ClientApp";

export default function Home() {
  const initialData = getDatabase();

  return <ClientApp initialData={initialData} />;
}
