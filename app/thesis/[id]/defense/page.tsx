"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Badge, Button, Card, Select } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";
import type { DefenseQuestion } from "@/lib/types";

type AIOut = {
  questions: {
    question: string;
    angle: DefenseQuestion["angle"];
    difficulty: 1 | 2 | 3 | 4 | 5;
    whyThisMatters: string;
    modelAnswer: string;
  }[];
};

export default function DefensePage() {
  const thesis = useThesisStore((s) => s.current);
  const patch = useThesisStore((s) => s.patch);
  const [count, setCount] = useState(8);
  const [difficulty, setDifficulty] = useState(4);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<AIOut | null>(null);

  if (!thesis) return null;
  const rq = thesis.researchQuestions.find((r) => r.kind === "main")?.text;

  async function run() {
    setBusy(true);
    try {
      const summary = `
Research question: ${rq ?? "not set"}
Field: ${thesis!.field}
Degree: ${thesis!.degreeLevel}
Design: ${thesis!.design}
Approach: ${thesis!.approach}
Constructs: ${thesis!.constructs.map((c) => c.name).join(", ") || "none"}
Hypotheses: ${thesis!.hypotheses.map((h) => h.label + ": " + h.statement).join("; ") || "none"}
Gaps identified: ${thesis!.gapAnalysis.map((g) => g.theme).join("; ") || "none"}
Instruments: ${thesis!.instruments.map((i) => i.title).join("; ") || "none"}
Reference count: ${thesis!.references.length}
`.trim();
      const res = await callAI<AIOut>({
        stage: "defense",
        user: `Number of questions: ${count}. Average difficulty: ${difficulty}/5.\n\nThesis summary:\n${summary}`,
        json: true,
        maxTokens: 4000,
      });
      setOut(res);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!out) return;
    const bank: DefenseQuestion[] = out.questions.map((q) => ({
      id: uuid(),
      question: q.question,
      angle: q.angle,
      difficulty: q.difficulty,
      suggestedResponse: q.modelAnswer,
    }));
    await patch({ defenseBank: bank });
    alert("Defense bank saved.");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Defense simulator</h1>
      <p className="mt-1 text-sm text-ink-600">
        A mock committee that targets the weakest part of your thesis. Answers
        follow the restate → direct answer → evidence → limit template.
      </p>

      <Card className="mt-6">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Number of questions
            </label>
            <Select value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[5, 8, 12, 16, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Difficulty
            </label>
            <Select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))}>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n} / 5
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button disabled={busy} onClick={run} className="w-full">
              {busy ? "Preparing…" : "Generate defense bank"}
            </Button>
          </div>
        </div>
      </Card>

      {out && (
        <>
          <div className="mt-6 space-y-3">
            {out.questions.map((q, i) => (
              <Card key={i}>
                <div className="mb-1 flex items-center gap-2">
                  <Badge>{q.angle.replace(/_/g, " ")}</Badge>
                  <Badge>difficulty {q.difficulty}</Badge>
                </div>
                <h3 className="font-serif text-base text-ink-900">{q.question}</h3>
                <p className="mt-1 text-xs text-ink-500">{q.whyThisMatters}</p>
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-accent-700">Model answer</summary>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-ink-800">{q.modelAnswer}</div>
                </details>
              </Card>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={save}>Save bank to thesis</Button>
          </div>
        </>
      )}

      {thesis.defenseBank.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-2 font-serif text-lg font-semibold text-ink-900">
            Saved defense bank ({thesis.defenseBank.length})
          </h2>
        </div>
      )}
    </div>
  );
}
