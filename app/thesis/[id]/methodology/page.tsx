"use client";

import { useState } from "react";
import { Badge, Button, Card, Textarea } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";

type AIOut = {
  philosophicalStance: string;
  designJustification: string;
  sampling: { strategy: string; targetN: string; powerAnalysis: string; inclusion: string[]; exclusion: string[] };
  instruments: { name: string; kind: string; validatedBy: string; why: string }[];
  procedure: string[];
  analysisPlan: { technique: string; assumptions: string[]; software: string[] }[];
  ethics: { irb: boolean; informedConsent: string; dataStorage: string; risks: string[] };
  threatsToValidity: { internal: string[]; external: string[]; construct: string[]; conclusion: string[] };
  limitations: string[];
};

export default function MethodologyPage() {
  const thesis = useThesisStore((s) => s.current);
  const updateChapter = useThesisStore((s) => s.updateChapter);
  const [constraints, setConstraints] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<AIOut | null>(null);

  if (!thesis) return null;
  const rq = thesis.researchQuestions.find((r) => r.kind === "main")?.text;

  async function run() {
    setBusy(true);
    try {
      const res = await callAI<AIOut>({
        stage: "methodology",
        user: `RQ: ${rq ?? "not set"}\nField: ${thesis!.field}\nParadigm: ${thesis!.paradigm}\nApproach: ${thesis!.approach}\nDesign: ${thesis!.design}\nConstraints: ${constraints || "none specified"}`,
        json: true,
        maxTokens: 4000,
      });
      setOut(res);
    } finally {
      setBusy(false);
    }
  }

  async function draftChapter() {
    if (!out) return;
    const paragraphs: string[] = [];
    paragraphs.push(out.philosophicalStance);
    paragraphs.push(out.designJustification);
    paragraphs.push(
      `The sampling strategy follows a ${out.sampling.strategy.toLowerCase()} approach. ${out.sampling.powerAnalysis} The target sample is ${out.sampling.targetN}. Inclusion criteria: ${out.sampling.inclusion.join("; ")}. Exclusion criteria: ${out.sampling.exclusion.join("; ")}.`,
    );
    paragraphs.push(
      `The study uses the following instruments: ${out.instruments
        .map((i) => `${i.name} (${i.kind}, ${i.validatedBy}) — ${i.why}`)
        .join("; ")}.`,
    );
    paragraphs.push(`Procedure: ${out.procedure.join(" ")}`);
    paragraphs.push(
      `Analysis plan: ${out.analysisPlan
        .map((a) => `${a.technique} (assumptions: ${a.assumptions.join(", ")}; software: ${a.software.join(", ")})`)
        .join("; ")}.`,
    );
    paragraphs.push(
      `Ethics: ${out.ethics.irb ? "IRB / Helsinki Committee approval obtained prior to data collection." : "No human subjects; IRB review not required."} ${out.ethics.informedConsent} Data storage: ${out.ethics.dataStorage} Identified risks: ${out.ethics.risks.join("; ")}.`,
    );
    paragraphs.push(
      `Threats to validity — internal: ${out.threatsToValidity.internal.join("; ")}; external: ${out.threatsToValidity.external.join("; ")}; construct: ${out.threatsToValidity.construct.join("; ")}; statistical conclusion: ${out.threatsToValidity.conclusion.join("; ")}.`,
    );
    paragraphs.push(`Limitations: ${out.limitations.join("; ")}.`);

    const doc = {
      type: "doc",
      content: paragraphs.map((p) => ({
        type: "paragraph",
        content: [{ type: "text", text: p }],
      })),
    } as Record<string, unknown>;

    await updateChapter("methodology", { content: doc });
    alert("Methodology chapter drafted. Open it under Chapters to edit.");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Methodology designer</h1>
      <p className="mt-1 text-sm text-ink-600">
        Produces a full methodology plan: design justification, sampling, instruments,
        procedure, analysis, ethics, validity threats, and limitations. You can push
        the result into the methodology chapter as a draft.
      </p>

      <Card className="mt-6">
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
          Constraints (budget, time, access, language, data availability)
        </label>
        <Textarea rows={4} value={constraints} onChange={(e) => setConstraints(e.target.value)} />
        <div className="mt-3 flex justify-end">
          <Button disabled={busy} onClick={run}>
            {busy ? "Designing…" : "Design methodology"}
          </Button>
        </div>
      </Card>

      {out && (
        <div className="mt-6 space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Philosophical stance</h3>
            <p className="mt-1 text-sm text-ink-800">{out.philosophicalStance}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Design justification</h3>
            <p className="mt-1 text-sm text-ink-800">{out.designJustification}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Sampling</h3>
            <p className="mt-1 text-sm text-ink-800">
              <b>Strategy:</b> {out.sampling.strategy}. <b>Target n:</b> {out.sampling.targetN}.{" "}
              <b>Power:</b> {out.sampling.powerAnalysis}
            </p>
            <p className="mt-1 text-xs text-ink-500">
              Inclusion: {out.sampling.inclusion.join("; ")} · Exclusion:{" "}
              {out.sampling.exclusion.join("; ")}
            </p>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Instruments</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-800">
              {out.instruments.map((i, idx) => (
                <li key={idx}>
                  <b>{i.name}</b> ({i.kind}, {i.validatedBy}) — {i.why}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Procedure</h3>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-ink-800">
              {out.procedure.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ol>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Analysis plan</h3>
            <ul className="mt-1 space-y-1 text-sm text-ink-800">
              {out.analysisPlan.map((a, i) => (
                <li key={i}>
                  <b>{a.technique}</b> — assumptions: {a.assumptions.join(", ")} ·{" "}
                  software: {a.software.join(", ")}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Ethics</h3>
            <p className="mt-1 text-sm text-ink-800">
              <b>IRB required:</b> {out.ethics.irb ? "Yes" : "No"}. {out.ethics.informedConsent}{" "}
              Data storage: {out.ethics.dataStorage}
            </p>
            <p className="mt-1 text-xs text-ink-500">Risks: {out.ethics.risks.join("; ")}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Threats to validity</h3>
            <div className="mt-1 grid grid-cols-2 gap-3 text-xs">
              {(["internal", "external", "construct", "conclusion"] as const).map((k) => (
                <div key={k}>
                  <Badge>{k}</Badge>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-ink-700">
                    {out.threatsToValidity[k].map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Limitations</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-ink-800">
              {out.limitations.map((l, i) => (
                <li key={i}>{l}</li>
              ))}
            </ul>
          </Card>
          <div className="flex justify-end">
            <Button onClick={draftChapter}>Draft methodology chapter</Button>
          </div>
        </div>
      )}
    </div>
  );
}
