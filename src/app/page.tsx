import { getDatabase } from "@/lib/db";
import { ClientApp } from "@/components/ClientApp";

export default async function Home() {
  const initialData = await getDatabase();

  return <ClientApp initialData={initialData} />;
}
