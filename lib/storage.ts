// Persistence layer. When Supabase is configured and the user is signed
// in, the cloud is the source of truth. Otherwise, we fall back to
// IndexedDB (Dexie) with localStorage as a last resort so the app still
// works in local dev and privacy-mode browsers.

import Dexie, { type Table } from "dexie";
import type { Thesis } from "./types";
import { getSupabaseBrowser, isSupabaseConfigured } from "./supabase/client";

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

// ---------------- Supabase helpers ----------------

type CloudRow = {
  id: string;
  user_id: string;
  title: string;
  data: Thesis;
  updated_at: string;
  created_at: string;
};

async function supabaseSession() {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabaseBrowser();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  return { supabase, userId: data.user.id };
}

async function cloudList(): Promise<Thesis[] | null> {
  const s = await supabaseSession();
  if (!s) return null;
  const { data, error } = await s.supabase
    .from("theses")
    .select("data, updated_at")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("Supabase list failed:", error.message);
    return null;
  }
  return (data ?? []).map((r: { data: Thesis }) => r.data);
}

async function cloudGet(id: string): Promise<Thesis | null> {
  const s = await supabaseSession();
  if (!s) return null;
  const { data, error } = await s.supabase.from("theses").select("data").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return (data as { data: Thesis }).data;
}

async function cloudUpsert(thesis: Thesis): Promise<boolean> {
  const s = await supabaseSession();
  if (!s) return false;
  const row = {
    id: thesis.id,
    user_id: s.userId,
    title: thesis.title || "Untitled Thesis",
    data: thesis,
    updated_at: new Date().toISOString(),
  };
  const { error } = await s.supabase.from("theses").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("Supabase upsert failed:", error.message);
    return false;
  }
  return true;
}

async function cloudDelete(id: string): Promise<boolean> {
  const s = await supabaseSession();
  if (!s) return false;
  const { error } = await s.supabase.from("theses").delete().eq("id", id);
  if (error) {
    console.error("Supabase delete failed:", error.message);
    return false;
  }
  return true;
}

// ---------------- Public API ----------------

export async function listTheses(): Promise<Thesis[]> {
  const cloud = await cloudList();
  if (cloud) return cloud;

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
  const cloud = await cloudGet(id);
  if (cloud) return cloud;

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

  // Try cloud first. If that succeeds, we still write to IndexedDB for
  // offline reads and quick navigation.
  const cloudOk = await cloudUpsert(updated);

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

  if (!cloudOk && isSupabaseConfigured()) {
    // Surface a soft warning but don't throw — local save already happened.
    console.warn("Thesis saved locally; cloud sync failed (check connection / auth).");
  }
}

export async function deleteThesis(id: string): Promise<void> {
  await cloudDelete(id);

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

// ---------------- Migration helpers ----------------

// Pull every local thesis and push it to the cloud. Useful the first
// time a user signs in after the cloud upgrade. Returns the number of
// theses uploaded.
export async function migrateLocalToCloud(): Promise<number> {
  const s = await supabaseSession();
  if (!s) return 0;
  const local: Thesis[] = [];
  const d = getDb();
  if (d) {
    try {
      local.push(...(await d.theses.toArray()));
    } catch {
      /* ignore */
    }
  }
  for (const t of readLS()) {
    if (!local.some((x) => x.id === t.id)) local.push(t);
  }
  let uploaded = 0;
  for (const thesis of local) {
    const ok = await cloudUpsert(thesis);
    if (ok) uploaded += 1;
  }
  return uploaded;
}

export async function countLocalTheses(): Promise<number> {
  let n = 0;
  const d = getDb();
  if (d) {
    try {
      n = await d.theses.count();
    } catch {
      /* ignore */
    }
  }
  if (!n) n = readLS().length;
  return n;
}
