"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Badge, Button, Card, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";

type Hypo = {
  label: string;
  statement: string;
  kind: "null" | "alternative" | "directional" | "non_directional";
  variables: { independent: string[]; dependent: string[]; moderator: string[]; mediator: string[] };
};

type AIOut = {
  refinedMain: string;
  subQuestions: string[];
  hypotheses: Hypo[];
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

// Editable working state that mirrors AIOut but lets the user tweak
// anything the advisor produced before saving.
type Draft = {
  refinedMain: string;
  subQuestions: string[];
  hypotheses: Hypo[];
  critique: AIOut["critique"];
  feasibility: AIOut["feasibility"];
  followUpQuestions: string[];
};

function toDraft(out: AIOut): Draft {
  return {
    refinedMain: out.refinedMain,
    subQuestions: [...out.subQuestions],
    hypotheses: out.hypotheses.map((h) => ({
      ...h,
      variables: {
        independent: [...(h.variables.independent ?? [])],
        dependent: [...(h.variables.dependent ?? [])],
        moderator: [...(h.variables.moderator ?? [])],
        mediator: [...(h.variables.mediator ?? [])],
      },
    })),
    critique: { ...out.critique, notes: [...out.critique.notes] },
    feasibility: out.feasibility,
    followUpQuestions: [...out.followUpQuestions],
  };
}

export default function RQPage() {
  const thesis = useThesisStore((s) => s.current);
  const patch = useThesisStore((s) => s.patch);
  const [idea, setIdea] = useState(
    thesis?.chapters.find((c) => c.key === "introduction")?.aiNotes?.[0] ?? "",
  );
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [history, setHistory] = useState<Draft[]>([]);
  const [err, setErr] = useState<string | null>(null);

  if (!thesis) return null;

  async function refine(extraInstruction?: string) {
    setBusy(true);
    setErr(null);
    try {
      const priorBlock = draft?.refinedMain
        ? `\n\nPrior attempt the advisor produced (revise this, don't repeat it):\n${draft.refinedMain}`
        : "";
      const feedbackBlock = extraInstruction ? `\n\nStudent feedback for this revision:\n${extraInstruction}` : "";
      const out = await callAI<AIOut>({
        stage: "researchQuestion",
        user: `Field: ${thesis!.field}\nDegree level: ${thesis!.degreeLevel}\nParadigm: ${thesis!.paradigm ?? "unset"}\nApproach: ${thesis!.approach ?? "unset"}\nDesign: ${thesis!.design ?? "unset"}\n\nWorking idea:\n${idea}${priorBlock}${feedbackBlock}`,
        json: true,
        maxTokens: 3500,
      });
      if (draft) setHistory((h) => [draft, ...h].slice(0, 5));
      setDraft(toDraft(out));
      setFeedback("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not refine");
    } finally {
      setBusy(false);
    }
  }

  function reject() {
    if (!confirm("Discard the advisor's suggestion? You can edit your idea and try again.")) return;
    if (draft) setHistory((h) => [draft, ...h].slice(0, 5));
    setDraft(null);
    setFeedback("");
  }

  async function save() {
    if (!draft || !draft.refinedMain.trim()) return;
    const main = {
      id: uuid(),
      text: draft.refinedMain.trim(),
      kind: "main" as const,
      measurable: true,
      feasibility: draft.feasibility,
      critique: draft.critique,
    };
    const subs = draft.subQuestions
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({
        id: uuid(),
        text: s,
        kind: "sub" as const,
        measurable: true,
      }));
    const hypotheses = draft.hypotheses
      .filter((h) => h.statement.trim())
      .map((h) => ({
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

  // ----- editors for sub-questions and hypotheses -----

  function updateSub(i: number, value: string) {
    if (!draft) return;
    const next = [...draft.subQuestions];
    next[i] = value;
    setDraft({ ...draft, subQuestions: next });
  }
  function removeSub(i: number) {
    if (!draft) return;
    setDraft({ ...draft, subQuestions: draft.subQuestions.filter((_, idx) => idx !== i) });
  }
  function addSub() {
    if (!draft) return;
    setDraft({ ...draft, subQuestions: [...draft.subQuestions, ""] });
  }

  function updateHypo(i: number, patch: Partial<Hypo>) {
    if (!draft) return;
    const next = draft.hypotheses.map((h, idx) => (idx === i ? { ...h, ...patch } : h));
    setDraft({ ...draft, hypotheses: next });
  }
  function updateHypoVars(i: number, key: keyof Hypo["variables"], csv: string) {
    if (!draft) return;
    const list = csv.split(",").map((s) => s.trim()).filter(Boolean);
    const next = draft.hypotheses.map((h, idx) =>
      idx === i ? { ...h, variables: { ...h.variables, [key]: list } } : h,
    );
    setDraft({ ...draft, hypotheses: next });
  }
  function removeHypo(i: number) {
    if (!draft) return;
    setDraft({ ...draft, hypotheses: draft.hypotheses.filter((_, idx) => idx !== i) });
  }
  function addHypo() {
    if (!draft) return;
    const label = `H${draft.hypotheses.length + 1}`;
    setDraft({
      ...draft,
      hypotheses: [
        ...draft.hypotheses,
        {
          label,
          statement: "",
          kind: "alternative",
          variables: { independent: [], dependent: [], moderator: [], mediator: [] },
        },
      ],
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Research question</h1>
      <p className="mt-1 text-sm text-ink-600">
        Nothing is locked in. You can edit every suggestion below, send the
        advisor back with feedback for another pass, or reject the whole
        attempt and start over with a different idea.
      </p>

      <Card className="mt-6">
        <Label>The idea / working question</Label>
        <Textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={5} />
        <div className="mt-3 flex justify-end gap-2">
          <Button onClick={() => refine()} disabled={busy || !idea.trim()}>
            {busy ? "Refining…" : draft ? "Re-run refinement" : "Refine with advisor"}
          </Button>
        </div>
        {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      </Card>

      {draft && (
        <div className="mt-6 space-y-4">
          {!draft.refinedMain && draft.followUpQuestions.length > 0 && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-ink-900">
                The advisor needs more information
              </h3>
              <ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">
                {draft.followUpQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-ink-500">
                Answer these in the idea field above and press &quot;Refine with advisor&quot; again.
              </p>
            </Card>
          )}

          {draft.refinedMain !== undefined && (
            <Card>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-ink-900">
                  Refined research question <span className="text-xs font-normal text-ink-500">(editable)</span>
                </h3>
                <Badge>feasibility: {draft.feasibility}</Badge>
              </div>
              <Textarea
                className="mt-2 font-serif text-base"
                rows={3}
                value={draft.refinedMain}
                onChange={(e) => setDraft({ ...draft, refinedMain: e.target.value })}
                placeholder="Write or edit the main question here. Empty it to reject the suggestion."
              />

              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Sub-questions
                </div>
                <Button size="sm" variant="ghost" onClick={addSub}>
                  + Add sub-question
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {draft.subQuestions.map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={s} onChange={(e) => updateSub(i, e.target.value)} />
                    <Button variant="ghost" size="sm" onClick={() => removeSub(i)}>
                      ✕
                    </Button>
                  </div>
                ))}
                {draft.subQuestions.length === 0 && (
                  <p className="text-xs text-ink-500">No sub-questions. Add one if useful.</p>
                )}
              </div>
            </Card>
          )}

          <Card>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-ink-900">Hypotheses</h3>
              <Button size="sm" variant="ghost" onClick={addHypo}>
                + Add hypothesis
              </Button>
            </div>
            <div className="mt-2 space-y-3">
              {draft.hypotheses.map((h, i) => (
                <div key={i} className="rounded border border-ink-100 bg-ink-50 p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      className="w-20"
                      value={h.label}
                      onChange={(e) => updateHypo(i, { label: e.target.value })}
                    />
                    <Select
                      value={h.kind}
                      onChange={(e) => updateHypo(i, { kind: e.target.value as Hypo["kind"] })}
                      className="w-48"
                    >
                      <option value="null">null</option>
                      <option value="alternative">alternative</option>
                      <option value="directional">directional</option>
                      <option value="non_directional">non-directional</option>
                    </Select>
                    <div className="ml-auto">
                      <Button variant="ghost" size="sm" onClick={() => removeHypo(i)}>
                        ✕
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    className="mt-2"
                    rows={2}
                    value={h.statement}
                    onChange={(e) => updateHypo(i, { statement: e.target.value })}
                    placeholder="Hypothesis statement"
                  />
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <Label>IV (comma-separated)</Label>
                      <Input
                        value={h.variables.independent.join(", ")}
                        onChange={(e) => updateHypoVars(i, "independent", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>DV</Label>
                      <Input
                        value={h.variables.dependent.join(", ")}
                        onChange={(e) => updateHypoVars(i, "dependent", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Moderator</Label>
                      <Input
                        value={h.variables.moderator?.join(", ") ?? ""}
                        onChange={(e) => updateHypoVars(i, "moderator", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Mediator</Label>
                      <Input
                        value={h.variables.mediator?.join(", ") ?? ""}
                        onChange={(e) => updateHypoVars(i, "mediator", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {draft.hypotheses.length === 0 && (
                <p className="text-xs text-ink-500">No hypotheses yet. Add one if useful.</p>
              )}
            </div>
          </Card>

          {draft.critique && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-ink-900">Quality critique</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                {(["clarity", "originality", "feasibility", "significance"] as const).map((k) => (
                  <div key={k} className="rounded-md border border-ink-100 bg-ink-50 p-3">
                    <div className="text-xs uppercase text-ink-500">{k}</div>
                    <div className="font-serif text-xl font-semibold text-ink-900">
                      {draft.critique[k]}
                      <span className="text-xs text-ink-400">/10</span>
                    </div>
                  </div>
                ))}
              </div>
              {draft.critique.notes.length > 0 && (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-700">
                  {draft.critique.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}
            </Card>
          )}

          <Card>
            <Label>Send the advisor back with feedback</Label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
              placeholder={"e.g., Make it narrower — focus only on mobile users. Or: drop the moderator, I don't have data for it. Or: reframe as a qualitative question."}
            />
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" onClick={reject}>
                Reject and start over
              </Button>
              <Button
                variant="secondary"
                onClick={() => refine(feedback)}
                disabled={busy || !feedback.trim()}
              >
                {busy ? "Revising…" : "Revise with feedback"}
              </Button>
              <Button variant="secondary" onClick={() => refine()} disabled={busy}>
                {busy ? "Retrying…" : "Another attempt"}
              </Button>
              <Button onClick={save} disabled={!draft.refinedMain.trim()}>
                Save to thesis
              </Button>
            </div>
          </Card>

          {history.length > 0 && (
            <Card>
              <h3 className="mb-2 text-sm font-semibold text-ink-900">Previous attempts</h3>
              <ul className="space-y-2 text-sm text-ink-700">
                {history.map((h, i) => (
                  <li key={i} className="rounded border border-ink-100 bg-ink-50 p-2">
                    <div className="italic">{h.refinedMain || "(empty suggestion)"}</div>
                    <div className="mt-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setHistory((prev) => prev.filter((_, idx) => idx !== i));
                          if (draft) setHistory((prev) => [draft, ...prev].slice(0, 5));
                          setDraft(h);
                        }}
                      >
                        Restore
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
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
          <p className="mt-3 text-xs text-ink-500">
            Saving again replaces the current research questions and hypotheses.
          </p>
        </Card>
      )}
    </div>
  );
}
