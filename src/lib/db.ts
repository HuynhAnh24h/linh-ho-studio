import fs from "fs";
import path from "path";
import { SiteData } from "./types";
import { initialSiteData } from "./initial-data";

// In-memory cache for fast read/writes across serverless invocations
let memoryData: SiteData | null = null;

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const TMP_FILE = path.join("/tmp", "db.json");

function ensureDirectoryExists(dirPath: string) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  } catch (err) {
    console.warn("Could not create directory:", dirPath, err);
  }
}

export function getDatabase(): SiteData {
  if (memoryData) {
    return memoryData;
  }

  // 1. Try reading from data/db.json
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      memoryData = JSON.parse(raw);
      return memoryData!;
    }
  } catch (err) {
    console.warn("Failed to read from DATA_FILE:", err);
  }

  // 2. Try reading from /tmp/db.json (Vercel serverless writable path)
  try {
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      memoryData = JSON.parse(raw);
      return memoryData!;
    }
  } catch {
    // Ignore /tmp error
  }

  // 3. Fallback to initial seed data and attempt to persist
  memoryData = JSON.parse(JSON.stringify(initialSiteData));
  saveDatabase(memoryData!);
  return memoryData!;
}

export function saveDatabase(data: SiteData): boolean {
  memoryData = data;

  // Try writing to data/db.json
  try {
    ensureDirectoryExists(DATA_DIR);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    // If standard path is read-only (e.g. Vercel deployment), try /tmp
    try {
      fs.writeFileSync(TMP_FILE, JSON.stringify(data, null, 2), "utf-8");
      return true;
    } catch {
      console.warn("Filesystem is read-only. Data kept in memory.", err);
      return true;
    }
  }
}

export function resetDatabase(): SiteData {
  memoryData = JSON.parse(JSON.stringify(initialSiteData));
  saveDatabase(memoryData!);
  return memoryData!;
}
