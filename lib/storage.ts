// Persistence layer. IndexedDB when running in the browser (via Dexie),
// with a localStorage fallback so the app still works in SSR-only contexts
// or privacy-mode browsers that block IndexedDB.

import Dexie, { type Table } from "dexie";
import type { Thesis } from "./types";

class ThesisDB extends Dexie {
  theses!: Table<Thesis, string>;
  constructor() {
    super("thesis-forge");
    this.version(1).stores({
      theses: "id, updatedAt, title",
    });
  }
}

let db: ThesisDB | null = null;
function getDb() {
  if (typeof window === "undefined") return null;
  if (!db) db = new ThesisDB();
  return db;
}

const LS_KEY = "thesis-forge:theses";

function readLS(): Thesis[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Thesis[]) : [];
  } catch {
    return [];
  }
}

function writeLS(items: Thesis[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export async function listTheses(): Promise<Thesis[]> {
  const d = getDb();
  if (!d) return readLS();
  try {
    const rows = await d.theses.orderBy("updatedAt").reverse().toArray();
    if (rows.length === 0) {
      const ls = readLS();
      if (ls.length) {
        await d.theses.bulkPut(ls);
        return ls;
      }
    }
    return rows;
  } catch {
    return readLS();
  }
}

export async function getThesis(id: string): Promise<Thesis | undefined> {
  const d = getDb();
  if (!d) return readLS().find((t) => t.id === id);
  try {
    return await d.theses.get(id);
  } catch {
    return readLS().find((t) => t.id === id);
  }
}

export async function saveThesis(thesis: Thesis): Promise<void> {
  const updated = { ...thesis, updatedAt: new Date().toISOString() };
  const d = getDb();
  if (d) {
    try {
      await d.theses.put(updated);
    } catch {
      // fall through to LS
    }
  }
  const all = readLS();
  const next = [updated, ...all.filter((t) => t.id !== updated.id)];
  writeLS(next);
}

export async function deleteThesis(id: string): Promise<void> {
  const d = getDb();
  if (d) {
    try {
      await d.theses.delete(id);
    } catch {
      /* ignore */
    }
  }
  writeLS(readLS().filter((t) => t.id !== id));
}

export async function exportThesis(id: string): Promise<string> {
  const t = await getThesis(id);
  if (!t) throw new Error("Thesis not found");
  return JSON.stringify(t, null, 2);
}

export async function importThesis(json: string): Promise<Thesis> {
  const parsed = JSON.parse(json) as Thesis;
  if (!parsed.id || !parsed.chapters) throw new Error("Invalid thesis file");
  await saveThesis(parsed);
  return parsed;
}
