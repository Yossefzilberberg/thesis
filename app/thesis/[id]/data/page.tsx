"use client";

import { useState } from "react";
import { Badge, Button, Card, Select, Textarea } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";

type CleanOut = {
  steps: { order: number; action: string; rationale: string; codeHint: string }[];
  outlierPolicy: string;
  missingDataPolicy: string;
  transformations: string[];
  reproducibility: string;
};

export default function DataPage() {
  const thesis = useThesisStore((s) => s.current);
  const [dataset, setDataset] = useState("");
  const [lang, setLang] = useState("R");
  const [busy, setBusy] = useState(false);
  const [clean, setClean] = useState<CleanOut | null>(null);

  const [results, setResults] = useState("");
  const [findings, setFindings] = useState("");
  const [busyAnalysis, setBusyAnalysis] = useState(false);

  if (!thesis) return null;
  const rq = thesis.researchQuestions.find((r) => r.kind === "main")?.text;

  async function runCleaning() {
    setBusy(true);
    try {
      const out = await callAI<CleanOut>({
        stage: "dataCleaning",
        user: `Dataset description: ${dataset}\nAnalysis goals: answer "${rq ?? "the research question"}"\nPreferred language: ${lang}`,
        json: true,
      });
      setClean(out);
    } finally {
      setBusy(false);
    }
  }

  async function runFindings() {
    setBusyAnalysis(true);
    try {
      const text = await callAI<string>({
        stage: "analysis",
        user: `Research question: ${rq ?? "not set"}\nCitation style: ${thesis!.citationStyle}\n\nRaw results / summary to turn into findings prose:\n${results}`,
      });
      setFindings(text);
    } finally {
      setBusyAnalysis(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Data & analysis</h1>

      <Card className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-ink-900">Data cleaning / preparation plan</h3>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
          Dataset description (columns, n, source)
        </label>
        <Textarea rows={4} value={dataset} onChange={(e) => setDataset(e.target.value)} />
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-500">Code hints in</span>
            <Select value={lang} onChange={(e) => setLang(e.target.value)} className="w-auto">
              <option>R</option>
              <option>Python</option>
              <option>SPSS</option>
              <option>STATA</option>
            </Select>
          </div>
          <Button onClick={runCleaning} disabled={busy || !dataset.trim()}>
            {busy ? "Planning…" : "Build cleaning plan"}
          </Button>
        </div>
        {clean && (
          <div className="mt-4 space-y-3 text-sm">
            <ol className="space-y-2">
              {clean.steps.map((s) => (
                <li key={s.order} className="rounded border border-ink-100 bg-ink-50 p-3">
                  <div className="font-semibold text-ink-900">
                    {s.order}. {s.action}
                  </div>
                  <div className="text-ink-700">{s.rationale}</div>
                  {s.codeHint && (
                    <pre className="mt-1 overflow-x-auto rounded bg-ink-900 p-2 text-xs text-ink-50">
                      {s.codeHint}
                    </pre>
                  )}
                </li>
              ))}
            </ol>
            <p className="text-ink-700">
              <Badge>outliers</Badge> {clean.outlierPolicy}
            </p>
            <p className="text-ink-700">
              <Badge>missing</Badge> {clean.missingDataPolicy}
            </p>
            <p className="text-ink-700">
              <Badge>reproducibility</Badge> {clean.reproducibility}
            </p>
          </div>
        )}
      </Card>

      <Card className="mt-6">
        <h3 className="mb-2 text-sm font-semibold text-ink-900">Results → findings prose</h3>
        <p className="mb-2 text-xs text-ink-500">
          Paste your statistical output or qualitative theme summary. The advisor
          will turn it into neutral Findings-chapter prose (no interpretation).
        </p>
        <Textarea rows={6} value={results} onChange={(e) => setResults(e.target.value)} />
        <div className="mt-3 flex justify-end">
          <Button onClick={runFindings} disabled={busyAnalysis || !results.trim()}>
            {busyAnalysis ? "Writing…" : "Draft findings paragraph"}
          </Button>
        </div>
        {findings && (
          <div className="mt-4 whitespace-pre-wrap rounded border border-ink-100 bg-ink-50 p-3 text-sm text-ink-800">
            {findings}
          </div>
        )}
      </Card>
    </div>
  );
}
