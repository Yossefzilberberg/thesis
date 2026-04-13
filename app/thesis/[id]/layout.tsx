"use client";

import { useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { Shell } from "@/components/layout/Shell";
import { ChapterNav } from "@/components/workspace/ChapterNav";
import { useThesisStore } from "@/lib/store";

export default function ThesisLayout({ children }: { children: React.ReactNode }) {
  const params = useParams<{ id: string }>();
  const { current, load, refreshIndex, isHydrated } = useThesisStore();

  useEffect(() => {
    void refreshIndex();
    if (params?.id) void load(params.id);
  }, [params?.id, load, refreshIndex]);

  if (isHydrated && !current && params?.id) {
    // Might still be loading; show a quiet state instead of 404-ing.
    return (
      <Shell>
        <div className="mx-auto max-w-2xl px-6 py-20 text-center text-sm text-ink-500">
          Loading thesis…
        </div>
      </Shell>
    );
  }
  if (!current) {
    return (
      <Shell>
        <div className="mx-auto max-w-2xl px-6 py-20 text-center text-sm text-ink-500">
          Loading thesis…
        </div>
      </Shell>
    );
  }
  if (current.id !== params?.id) return notFound();

  return (
    <Shell>
      <div className="flex">
        <ChapterNav thesis={current} />
        <div className="flex-1">{children}</div>
      </div>
    </Shell>
  );
}
