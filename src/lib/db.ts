import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { SiteData } from "./types";
import { initialSiteData } from "./initial-data";
import { broadcastSocketEvent } from "./socket-server-emit";

let isTableInitialized = false;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const TMP_FILE = path.join("/tmp", "db.json");

function getDatabaseUrl(): string | null {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NEON_DATABASE_URL ||
    null
  );
}

export function isNeonConnected(): boolean {
  const url = getDatabaseUrl();
  return !!url && (url.startsWith("postgres://") || url.startsWith("postgresql://"));
}

function getNeonClient(): NeonQueryFunction<false, false> | null {
  const url = getDatabaseUrl();
  if (url && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
    try {
      return neon(url);
    } catch (err) {
      console.error("[Neon] Connection initialization error:", err);
      return null;
    }
  }
  return null;
}

async function ensureNeonTable(sql: NeonQueryFunction<false, false>) {
  if (isTableInitialized) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS lh_site_data (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    isTableInitialized = true;
  } catch (err) {
    console.error("[Neon] Error ensuring table:", err);
  }
}

// Ensure directory exists for local fallback
function ensureDirectoryExists(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create directory:", dirPath, err);
  }
}

export async function getDatabase(): Promise<SiteData> {
  const sql = getNeonClient();

  // 1. Neon PostgreSQL as Primary Database (when configured)
  if (sql) {
    try {
      await ensureNeonTable(sql);
      const rows = (await sql`SELECT data FROM lh_site_data WHERE id = 'main' LIMIT 1;`) as { data: SiteData }[];
      if (rows && rows.length > 0 && rows[0].data) {
        return rows[0].data;
      } else {
        // Seed Neon database with initial data
        console.log("[Neon] Seeding initial data into lh_site_data...");
        const seedData: SiteData = JSON.parse(JSON.stringify(initialSiteData));
        await sql`
          INSERT INTO lh_site_data (id, data, updated_at)
          VALUES ('main', ${JSON.stringify(seedData)}::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(seedData)}::jsonb, updated_at = NOW();
        `;
        return seedData;
      }
    } catch (err) {
      console.error("[Neon] Error querying Neon database, falling back to local file:", err);
    }
  }

  // 2. Local data/db.json (Always fresh, zero stale cache)
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed: SiteData = JSON.parse(raw);
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to read from DATA_FILE:", err);
  }

  // 3. Fallback to /tmp/db.json (Serverless environments)
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed: SiteData = JSON.parse(raw);
      return parsed;
    }
  } catch {
    // Ignore tmp error
  }

  // 4. Default initial seed
  const fallbackData: SiteData = JSON.parse(JSON.stringify(initialSiteData));
  await saveDatabase(fallbackData);
  return fallbackData;
}

export async function saveDatabase(data: SiteData): Promise<boolean> {
  const sql = getNeonClient();
  let savedToNeon = false;

  // 1. Save to Neon PostgreSQL
  if (sql) {
    try {
      await ensureNeonTable(sql);
      await sql`
        INSERT INTO lh_site_data (id, data, updated_at)
        VALUES ('main', ${JSON.stringify(data)}::jsonb, NOW())
        ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, updated_at = NOW();
      `;
      savedToNeon = true;
    } catch (err) {
      console.error("[Neon] Error saving to Neon database:", err);
    }
  }

  // 2. Always save to local data/db.json as local mirror / backup
  try {
    ensureDirectoryExists(DATA_DIR);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    try {
      fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch {
      console.warn("Filesystem read-only.", err);
    }
  }

  // 3. Invalidate Next.js cache across entire layout instantly
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    // In dev mode or standalone scripts, ignore if Next cache context is not active
  }

  // 4. Broadcast real-time update to all open admin & client tabs via Socket.IO
  try {
    broadcastSocketEvent("data_updated", { timestamp: Date.now() });
  } catch (err) {
    // Ignore socket error
  }

  return true;
}

export async function resetDatabase(): Promise<SiteData> {
  const freshData: SiteData = JSON.parse(JSON.stringify(initialSiteData));
  await saveDatabase(freshData);
  return freshData;
}
