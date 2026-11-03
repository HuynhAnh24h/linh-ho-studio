import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { SiteData } from "./types";
import { initialSiteData } from "./initial-data";
import { broadcastSocketEvent } from "./socket-server-emit";

let isTableInitialized = false;
let memoryData: SiteData | null = null;
let lastNeonError: string | null = null;

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

export function getNeonError(): string | null {
  return lastNeonError;
}

function getNeonClient(): NeonQueryFunction<false, false> | null {
  const url = getDatabaseUrl();
  if (url && (url.startsWith("postgres://") || url.startsWith("postgresql://"))) {
    try {
      return neon(url);
    } catch (err: any) {
      lastNeonError = err?.message || String(err);
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
  } catch (err: any) {
    console.error("[Neon] Error ensuring table:", err);
    throw err;
  }
}

// Ensure directory exists for local fallback
function ensureDirectoryExists(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    // Ignore in read-only environment
  }
}

export async function getDatabase(): Promise<SiteData> {
  const sql = getNeonClient();

  // 1. Neon PostgreSQL as Primary Database (when configured)
  if (sql) {
    try {
      await ensureNeonTable(sql);
      const rows = (await sql`SELECT data FROM lh_site_data WHERE id = 'main' LIMIT 1;`) as { data: SiteData }[];
      lastNeonError = null;

      if (rows && rows.length > 0 && rows[0].data) {
        const d = rows[0].data;
        if (!d.orders || d.orders.length === 0) {
          d.orders = initialSiteData.orders || [];
          try {
            await sql`
              UPDATE lh_site_data SET data = ${JSON.stringify(d)}::jsonb, updated_at = NOW() WHERE id = 'main';
            `;
          } catch {}
        }
        memoryData = JSON.parse(JSON.stringify(d));
        return d;
      } else {
        // Seed Neon database with initial data
        console.log("[Neon] Seeding initial data into lh_site_data...");
        const seedData: SiteData = JSON.parse(JSON.stringify(initialSiteData));
        await sql`
          INSERT INTO lh_site_data (id, data, updated_at)
          VALUES ('main', ${JSON.stringify(seedData)}::jsonb, NOW())
          ON CONFLICT (id) DO UPDATE SET data = ${JSON.stringify(seedData)}::jsonb, updated_at = NOW();
        `;
        memoryData = JSON.parse(JSON.stringify(seedData));
        return seedData;
      }
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("402") || msg.toLowerCase().includes("quota")) {
        lastNeonError = "Database Neon đã hết hạn ngạch miễn phí (HTTP 402 Quota Exceeded). Cần tạo database mới trên neon.tech để lưu dữ liệu vĩnh viễn!";
      } else {
        lastNeonError = msg;
      }
      console.error("[Neon] Error querying Neon database, falling back to local/tmp:", lastNeonError);
    }
  }

  // 2. Memory cache (for active serverless lambdas)
  if (memoryData) {
    return memoryData;
  }

  // 3. Fallback to /tmp/db.json (Serverless environments: check if tmp is newer)
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      const parsed: SiteData = JSON.parse(raw);
      memoryData = parsed;
      return parsed;
    }
  } catch (err) {
    // ignore
  }

  // 4. Local data/db.json (Git repository / Build time file)
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed: SiteData = JSON.parse(raw);
      if (!parsed.orders || parsed.orders.length === 0) {
        parsed.orders = initialSiteData.orders || [];
      }
      if (!parsed.media) parsed.media = [];
      memoryData = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to read from DATA_FILE:", err);
  }

  // 5. Default initial seed
  const fallbackData: SiteData = JSON.parse(JSON.stringify(initialSiteData));
  memoryData = fallbackData;
  await saveDatabase(fallbackData);
  return fallbackData;
}

export async function saveDatabase(data: SiteData): Promise<boolean> {
  const sql = getNeonClient();
  let savedToNeon = false;

  // Update memory cache immediately
  memoryData = JSON.parse(JSON.stringify(data));

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
      lastNeonError = null;
    } catch (err: any) {
      const msg = err?.message || String(err);
      if (msg.includes("402") || msg.toLowerCase().includes("quota")) {
        lastNeonError = "Database Neon đã hết hạn ngạch miễn phí (HTTP 402 Quota Exceeded). Cần tạo database mới trên neon.tech để lưu dữ liệu vĩnh viễn!";
      } else {
        lastNeonError = msg;
      }
      console.error("[Neon] Error saving to Neon database:", lastNeonError);
    }
  }

  // 2. Always write to /tmp/db.json (Works on Vercel Serverless containers)
  try {
    fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Ignore tmp error
  }

  // 3. Save to local data/db.json if writable (local development)
  try {
    ensureDirectoryExists(DATA_DIR);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    // Expected on Vercel Read-Only filesystem
  }

  // 4. Invalidate Next.js cache across entire layout instantly
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    // Ignore cache error in non-request contexts
  }

  // 5. Broadcast real-time update to all open admin & client tabs via Socket.IO
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
