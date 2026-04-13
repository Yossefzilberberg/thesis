"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Shell } from "@/components/layout/Shell";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { deleteThesis } from "@/lib/storage";
import { formatDate, truncate } from "@/lib/utils";

export default function DashboardPage() {
  const { thesesIndex, refreshIndex, isHydrated } = useThesisStore();

  useEffect(() => {
    void refreshIndex();
  }, [refreshIndex]);

  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-ink-900">Your theses</h1>
            <p className="mt-1 text-sm text-ink-600">
              All drafts are stored locally in your browser. Export anytime.
            </p>
          </div>
          <Link href="/new">
            <Button>+ New thesis</Button>
          </Link>
        </div>

        {!isHydrated ? (
          <p className="text-sm text-ink-500">Loading…</p>
        ) : thesesIndex.length === 0 ? (
          <Card className="text-center">
            <p className="text-sm text-ink-600">
              You don&apos;t have any theses yet. Start by creating one — the
              advisor will walk you through the research question first.
            </p>
            <Link href="/new" className="mt-4 inline-block">
              <Button>Start a new thesis</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {thesesIndex.map((t) => (
              <Card key={t.id} className="flex flex-col justify-between">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge>{t.degreeLevel.toUpperCase()}</Badge>
                    <Badge>{t.field.replace(/_/g, " ")}</Badge>
                    <Badge>{t.citationStyle.toUpperCase()}</Badge>
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-ink-900">
                    {truncate(t.title || "Untitled thesis", 60)}
                  </h3>
                  <p className="mt-2 text-xs text-ink-500">
                    Updated {formatDate(t.updatedAt)} · {t.researchQuestions.length} RQ ·{" "}
                    {t.references.length} refs
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Link href={`/thesis/${t.id}`}>
                    <Button size="sm">Open</Button>
                  </Link>
                  <button
                    type="button"
                    className="text-xs text-ink-500 hover:text-red-600"
                    onClick={async () => {
                      if (!confirm(`Delete "${t.title}"? This cannot be undone.`)) return;
                      await deleteThesis(t.id);
                      await refreshIndex();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
