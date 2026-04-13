"use client";

import { create } from "zustand";
import type { Chapter, ChapterKey, Reference, Thesis } from "./types";
import { getThesis, listTheses, saveThesis } from "./storage";

type State = {
  thesesIndex: Thesis[];
  current?: Thesis;
  isHydrated: boolean;
  isSaving: boolean;
  refreshIndex: () => Promise<void>;
  load: (id: string) => Promise<void>;
  setCurrent: (t: Thesis) => void;
  patch: (patch: Partial<Thesis>) => Promise<void>;
  updateChapter: (key: ChapterKey, patch: Partial<Chapter>) => Promise<void>;
  addReference: (ref: Reference) => Promise<void>;
  upsertReference: (ref: Reference) => Promise<void>;
  removeReference: (id: string) => Promise<void>;
};

export const useThesisStore = create<State>((set, get) => ({
  thesesIndex: [],
  current: undefined,
  isHydrated: false,
  isSaving: false,

  async refreshIndex() {
    const list = await listTheses();
    set({ thesesIndex: list, isHydrated: true });
  },

  async load(id) {
    const t = await getThesis(id);
    if (t) set({ current: t });
  },

  setCurrent(t) {
    set({ current: t });
  },

  async patch(patch) {
    const current = get().current;
    if (!current) return;
    const next = { ...current, ...patch } as Thesis;
    set({ current: next, isSaving: true });
    await saveThesis(next);
    set({ isSaving: false });
    await get().refreshIndex();
  },

  async updateChapter(key, patch) {
    const current = get().current;
    if (!current) return;
    const chapters = current.chapters.map((c) =>
      c.key === key ? { ...c, ...patch, lastEditedAt: new Date().toISOString() } : c,
    );
    await get().patch({ chapters });
  },

  async addReference(ref) {
    const current = get().current;
    if (!current) return;
    if (current.references.some((r) => r.id === ref.id)) return;
    await get().patch({ references: [...current.references, ref] });
  },

  async upsertReference(ref) {
    const current = get().current;
    if (!current) return;
    const existing = current.references.findIndex((r) => r.id === ref.id);
    const references =
      existing >= 0
        ? current.references.map((r, i) => (i === existing ? ref : r))
        : [...current.references, ref];
    await get().patch({ references });
  },

  async removeReference(id) {
    const current = get().current;
    if (!current) return;
    await get().patch({ references: current.references.filter((r) => r.id !== id) });
  },
}));
