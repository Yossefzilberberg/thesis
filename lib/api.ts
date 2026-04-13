// Thin typed wrapper around /api/ai and /api/citations endpoints.

import type { CitationStyle, Reference } from "./types";
import type { StageKey } from "./ai";

export async function callAI<T = string>(opts: {
  stage: StageKey;
  user: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  useFast?: boolean;
}): Promise<T> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(opts),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "AI call failed");
  return (opts.json ? data.data : data.text) as T;
}

export async function formatReference(ref: Reference, style: CitationStyle) {
  const res = await fetch("/api/citations/format", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode: "reference", ref, style }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Citation format failed");
  return data.text as string;
}

export async function formatInText(
  ref: Reference,
  style: CitationStyle,
  opts?: { locator?: string; suppressAuthor?: boolean; prefix?: string; suffix?: string },
) {
  const res = await fetch("/api/citations/format", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode: "intext", ref, style, ...(opts ?? {}) }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Citation format failed");
  return data.text as string;
}

export async function formatBibliography(refs: Reference[], style: CitationStyle) {
  const res = await fetch("/api/citations/format", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ mode: "bibliography", refs, style }),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Bibliography format failed");
  return data.lines as string[];
}
