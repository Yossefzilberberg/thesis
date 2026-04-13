"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Badge, Button, Card, Textarea } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";

type AIOut = {
  gaps: {
    theme: string;
    category:
      | "empirical"
      | "methodological"
      | "population"
      | "theoretical"
      | "evidence_for_practice"
      | "construct";
    description: string;
    severity: "minor" | "moderate" | "substantial";
    evidenceSources: string[];
    searchTerms: string[];
  }[];
  positioningStatement: string;
  uncertainty: string;
};

export default function GapPage() {
  const thesis = useThesisStore((s) => s.current);
  const patch = useThesisStore((s) => s.patch);
  const [sources, setSources] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<AIOut | null>(null);

  if (!thesis) return null;

  const rq = thesis.researchQuestions.find((r) => r.kind === "main")?.text;

  async function run() {
    if (!rq) return;
    setBusy(true);
    try {
      const res = await callAI<AIOut>({
        stage: "gapAnalysis",
        user: `Research question: ${rq}\nField: ${thesis!.field}\n\nReferences the student has gathered (title — author, year — notes):\n${sources || "[none supplied]"}`,
        json: true,
        maxTokens: 3000,
      });
      setOut(res);
    } finally {
      setBusy(false);
    }
  }

  async function accept() {
    if (!out) return;
    const items = out.gaps.map((g) => ({
      id: uuid(),
      theme: g.theme,
      description: `[${g.category}] ${g.description}`,
      severity: g.severity,
      evidenceSources: g.evidenceSources,
    }));
    await patch({ gapAnalysis: items });
    alert("Gap analysis saved.");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Gap analysis</h1>
      <p className="mt-1 text-sm text-ink-600">
        The advisor classifies gaps into six categories. It will not accept
        &quot;more research is needed on X&quot; as a gap.
      </p>
      {!rq && (
        <Card className="mt-6 border-amber-300 bg-amber-50 text-sm text-amber-900">
          Set a main research question first (
          <a className="underline" href={`/thesis/${thesis.id}/research-question`}>
            Research question
          </a>
          ).
        </Card>
      )}

      {rq && (
        <Card className="mt-6">
          <p className="text-sm text-ink-700">
            <b>RQ:</b> {rq}
          </p>
          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              References you have read (one per line)
            </label>
            <Textarea
              value={sources}
              onChange={(e) => setSources(e.target.value)}
              placeholder={"e.g., Davis (1989) — TAM — core attitudinal model, dated for modern AI tools\nVenkatesh et al. (2003) — UTAUT — extends TAM, still under-tested in…"}
              rows={6}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <Button disabled={busy} onClick={run}>
              {busy ? "Analysing…" : "Run gap analysis"}
            </Button>
          </div>
        </Card>
      )}

      {out && (
        <>
          <Card className="mt-6">
            <h3 className="text-sm font-semibold text-ink-900">Positioning statement</h3>
            <p className="mt-2 text-sm text-ink-800">{out.positioningStatement}</p>
          </Card>
          <div className="mt-4 space-y-3">
            {out.gaps.map((g, i) => (
              <Card key={i}>
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-ink-900">{g.theme}</h4>
                  <div className="flex gap-1">
                    <Badge>{g.category}</Badge>
                    <Badge>{g.severity}</Badge>
                  </div>
                </div>
                <p className="mt-2 text-sm text-ink-800">{g.description}</p>
                {g.searchTerms.length > 0 && (
                  <p className="mt-2 text-xs text-ink-500">
                    Suggested searches: {g.searchTerms.join(" · ")}
                  </p>
                )}
              </Card>
            ))}
          </div>
          {out.uncertainty && (
            <Card className="mt-4 border-amber-300 bg-amber-50 text-sm text-amber-900">
              <b>Unverified knowledge:</b> {out.uncertainty}
            </Card>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={accept}>Save to thesis</Button>
          </div>
        </>
      )}
    </div>
  );
}
