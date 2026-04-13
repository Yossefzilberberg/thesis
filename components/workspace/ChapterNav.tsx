"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Thesis } from "@/lib/types";

const TOOLS = [
  { key: "research-question", label: "Research question" },
  { key: "gap-analysis", label: "Gap analysis" },
  { key: "framework", label: "Theoretical framework" },
  { key: "references", label: "References" },
  { key: "methodology", label: "Methodology" },
  { key: "instruments", label: "Instruments" },
  { key: "data", label: "Data & analysis" },
  { key: "defense", label: "Defense simulator" },
  { key: "project", label: "Project plan" },
  { key: "settings", label: "Settings" },
];

export function ChapterNav({ thesis }: { thesis: Thesis }) {
  const pathname = usePathname();
  const sortedChapters = [...thesis.chapters].sort((a, b) => a.order - b.order);

  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-64 overflow-y-auto border-r border-ink-200 bg-white px-3 py-4">
      <div className="px-2 pb-2">
        <div className="truncate font-serif text-sm font-semibold text-ink-900">
          {thesis.title || "Untitled thesis"}
        </div>
        <div className="text-[10px] uppercase tracking-wide text-ink-500">
          {thesis.degreeLevel} · {thesis.field.replace(/_/g, " ")}
        </div>
      </div>

      <div className="mt-2 px-2 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
        Chapters
      </div>
      <ul className="mt-1 space-y-0.5">
        {sortedChapters.map((c) => {
          const href = `/thesis/${thesis.id}/chapter/${c.key}`;
          const active = pathname === href;
          return (
            <li key={c.key}>
              <Link
                href={href}
                className={cn(
                  "block truncate rounded-md px-2 py-1.5 text-sm",
                  active ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100",
                )}
              >
                {c.title}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 px-2 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
        Tools
      </div>
      <ul className="mt-1 space-y-0.5">
        {TOOLS.map((t) => {
          const href = `/thesis/${thesis.id}/${t.key}`;
          const active = pathname === href;
          return (
            <li key={t.key}>
              <Link
                href={href}
                className={cn(
                  "block truncate rounded-md px-2 py-1.5 text-sm",
                  active ? "bg-ink-900 text-white" : "text-ink-700 hover:bg-ink-100",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
