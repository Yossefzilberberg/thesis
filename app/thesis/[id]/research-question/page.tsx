"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Badge, Button, Card, Input, Label, Textarea } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";

type AIOut = {
  refinedMain: string;
  subQuestions: string[];
  hypotheses: {
    label: string;
    statement: string;
    kind: "null" | "alternative" | "directional" | "non_directional";
    variables: { independent: string[]; dependent: string[]; moderator: string[]; mediator: string[] };
  }[];
  critique: {
    clarity: number;
    originality: number;
    feasibility: number;
    significance: number;
    notes: string[];
  };
  feasibility: "high" | "medium" | "low";
  followUpQuestions: string[];
};

export default function RQPage() {
  const thesis = useThesisStore((s) => s.current);
  const patch = useThesisStore((s) => s.patch);
  const [idea, setIdea] = useState(
    thesis?.chapters.find((c) => c.key === "introduction")?.aiNotes?.[0] ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AIOut | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!thesis) return null;

  async function refine() {
    setBusy(true);
    setErr(null);
    try {
      const out = await callAI<AIOut>({
        stage: "researchQuestion",
        user: `Field: ${thesis!.field}\nDegree level: ${thesis!.degreeLevel}\nParadigm: ${thesis!.paradigm ?? "unset"}\nApproach: ${thesis!.approach ?? "unset"}\nDesign: ${thesis!.design ?? "unset"}\n\nWorking idea:\n${idea}`,
        json: true,
        maxTokens: 3500,
      });
      setResult(out);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not refine");
    } finally {
      setBusy(false);
    }
  }

  async function accept() {
    if (!result) return;
    const main = {
      id: uuid(),
      text: result.refinedMain,
      kind: "main" as const,
      measurable: true,
      feasibility: result.feasibility,
      critique: result.critique,
    };
    const subs = result.subQuestions.map((s) => ({
      id: uuid(),
      text: s,
      kind: "sub" as const,
      measurable: true,
    }));
    const hypotheses = result.hypotheses.map((h) => ({
      id: uuid(),
      label: h.label,
      statement: h.statement,
      kind: h.kind,
      variables: h.variables,
    }));
    await patch({
      researchQuestions: [main, ...subs],
      hypotheses,
    });
    alert("Research question and hypotheses saved.");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Research question</h1>
      <p className="mt-1 text-sm text-ink-600">
        Paste a rough idea, a working question, or a prompt you already have.
        The advisor returns a refined main question, sub-questions, testable
        hypotheses, and a quality score.
      </p>

      <Card className="mt-6">
        <Label>The idea / working question</Label>
        <Textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={5} />
        <div className="mt-3 flex justify-end gap-2">
          <Button onClick={refine} disabled={busy || !idea.trim()}>
            {busy ? "Refining…" : "Refine with advisor"}
          </Button>
        </div>
        {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      </Card>

      {result && (
        <div className="mt-6 space-y-4">
          {!result.refinedMain && result.followUpQuestions.length > 0 && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-ink-900">
                The advisor needs more information
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
                {result.followUpQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </Card>
          )}

          {result.refinedMain && (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-900">Refined research question</h3>
                <Badge>feasibility: {result.feasibility}</Badge>
              </div>
              <p className="mt-2 font-serif text-lg text-ink-900">{result.refinedMain}</p>
              {result.subQuestions.length > 0 && (
                <>
                  <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Sub-questions
                  </div>
                  <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-ink-800">
                    {result.subQuestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </>
              )}
            </Card>
          )}

          {result.hypotheses.length > 0 && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-ink-900">Hypotheses</h3>
              <ul className="space-y-2 text-sm text-ink-800">
                {result.hypotheses.map((h, i) => (
                  <li key={i} className="rounded border border-ink-100 bg-ink-50 p-2">
                    <div className="font-semibold">
                      {h.label} <span className="text-xs text-ink-500">({h.kind.replace("_", " ")})</span>
                    </div>
                    <div>{h.statement}</div>
                    <div className="mt-1 text-xs text-ink-500">
                      IV: {h.variables.independent.join(", ") || "—"} · DV:{" "}
                      {h.variables.dependent.join(", ") || "—"}
                      {h.variables.moderator?.length
                        ? ` · Moderator: ${h.variables.moderator.join(", ")}`
                        : ""}
                      {h.variables.mediator?.length
                        ? ` · Mediator: ${h.variables.mediator.join(", ")}`
                        : ""}
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {result.critique && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-ink-900">Quality critique</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                {(["clarity", "originality", "feasibility", "significance"] as const).map((k) => (
                  <div key={k} className="rounded-md border border-ink-100 bg-ink-50 p-3">
                    <div className="text-xs uppercase text-ink-500">{k}</div>
                    <div className="font-serif text-xl font-semibold text-ink-900">
                      {result.critique[k]}
                      <span className="text-xs text-ink-400">/10</span>
                    </div>
                  </div>
                ))}
              </div>
              {result.critique.notes.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
                  {result.critique.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          {result.refinedMain && (
            <div className="flex justify-end">
              <Button onClick={accept}>Save to thesis</Button>
            </div>
          )}
        </div>
      )}

      {thesis.researchQuestions.length > 0 && (
        <Card className="mt-10">
          <h3 className="mb-2 text-sm font-semibold text-ink-900">Saved research questions</h3>
          <ul className="space-y-2 text-sm text-ink-800">
            {thesis.researchQuestions.map((q) => (
              <li key={q.id}>
                <Badge>{q.kind}</Badge> {q.text}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
