"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Badge, Button, Card, Textarea } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";

type AIOut = {
  selectedTheories: { name: string; originators: string[]; whyRelevant: string; limitations: string }[];
  integrationLogic: string;
  conceptualModel: {
    constructs: { name: string; definition: string; role: "IV" | "DV" | "mediator" | "moderator" | "control" }[];
    propositions: string[];
  };
  asciiDiagram: string;
  openQuestions: string[];
};

export default function FrameworkPage() {
  const thesis = useThesisStore((s) => s.current);
  const patch = useThesisStore((s) => s.patch);
  const [candidates, setCandidates] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<AIOut | null>(null);

  if (!thesis) return null;
  const rq = thesis.researchQuestions.find((r) => r.kind === "main")?.text;

  async function run() {
    setBusy(true);
    try {
      const res = await callAI<AIOut>({
        stage: "theoreticalFramework",
        user: `RQ: ${rq ?? "not set"}\nField: ${thesis!.field}\n\nCandidate theories the student wants to consider:\n${candidates || "[none — suggest]"}\n`,
        json: true,
        maxTokens: 3500,
      });
      setOut(res);
    } finally {
      setBusy(false);
    }
  }

  async function accept() {
    if (!out) return;
    await patch({
      constructs: out.conceptualModel.constructs.map((c) => ({
        id: uuid(),
        name: c.name,
        definition: c.definition,
        operationalization: `Role: ${c.role}`,
      })),
    });
    alert("Framework constructs saved.");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Theoretical framework</h1>
      <p className="mt-1 text-sm text-ink-600">
        Pick or propose theories; the advisor integrates them into a coherent
        conceptual model with propositions and an ASCII diagram you can paste
        into the framework chapter.
      </p>

      <Card className="mt-6">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
          Candidate theories (optional — leave blank for suggestions)
        </label>
        <Textarea
          rows={5}
          value={candidates}
          onChange={(e) => setCandidates(e.target.value)}
          placeholder={"e.g., Social Cognitive Theory (Bandura 1986)\nElaboration Likelihood Model (Petty & Cacioppo 1986)\nUTAUT (Venkatesh et al. 2003)"}
        />
        <div className="mt-3 flex justify-end">
          <Button disabled={busy} onClick={run}>
            {busy ? "Thinking…" : "Build framework"}
          </Button>
        </div>
      </Card>

      {out && (
        <div className="mt-6 space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Selected theories</h3>
            <ul className="mt-2 space-y-3 text-sm text-ink-800">
              {out.selectedTheories.map((t, i) => (
                <li key={i} className="rounded border border-ink-100 bg-ink-50 p-3">
                  <div className="font-semibold">
                    {t.name}{" "}
                    <span className="text-xs text-ink-500">
                      ({t.originators.join(", ")})
                    </span>
                  </div>
                  <div className="mt-1 text-ink-700">Why: {t.whyRelevant}</div>
                  <div className="mt-1 text-xs text-ink-500">Limits: {t.limitations}</div>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Integration logic</h3>
            <p className="mt-2 text-sm text-ink-800">{out.integrationLogic}</p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Constructs</h3>
            <ul className="mt-2 space-y-2 text-sm text-ink-800">
              {out.conceptualModel.constructs.map((c, i) => (
                <li key={i}>
                  <Badge>{c.role}</Badge> <b>{c.name}</b> — {c.definition}
                </li>
              ))}
            </ul>
            <h3 className="mt-4 text-sm font-semibold text-ink-900">Propositions</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-ink-800">
              {out.conceptualModel.propositions.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Diagram</h3>
            <pre className="mt-2 overflow-x-auto rounded bg-ink-900 p-3 text-xs text-ink-50">
              {out.asciiDiagram}
            </pre>
          </Card>

          {out.openQuestions.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-ink-900">Open questions</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-700">
                {out.openQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={accept}>Save constructs</Button>
          </div>
        </div>
      )}
    </div>
  );
}
