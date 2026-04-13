"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Badge, Button, Card, Select, Textarea } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";
import type { Instrument } from "@/lib/types";

type AIOut = {
  title: string;
  items: { id: string; prompt: string; responseFormat: string; construct: string; sourceReference: string }[];
  pilotProtocol: string;
  ethicsNotes: string;
  warnings: string[];
};

export default function InstrumentsPage() {
  const thesis = useThesisStore((s) => s.current);
  const patch = useThesisStore((s) => s.patch);
  const [kind, setKind] = useState<Instrument["kind"]>("survey");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<AIOut | null>(null);

  if (!thesis) return null;

  async function run() {
    setBusy(true);
    try {
      const res = await callAI<AIOut>({
        stage: "instruments",
        user: `Kind: ${kind}\nField: ${thesis!.field}\nConstructs: ${thesis!.constructs.map((c) => c.name).join(", ") || "not specified"}\nPopulation / notes: ${notes}`,
        json: true,
        maxTokens: 3000,
      });
      setOut(res);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!out) return;
    const inst: Instrument = {
      id: uuid(),
      kind,
      title: out.title,
      items: out.items,
      pilotNotes: out.pilotProtocol,
      ethicsNotes: out.ethicsNotes,
    };
    await patch({ instruments: [...thesis!.instruments, inst] });
    alert("Instrument saved.");
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Instruments</h1>
      <p className="mt-1 text-sm text-ink-600">
        Generate surveys (from validated scales you cite), interview guides with
        probes, experiment protocols, observation grids, or behavioural metric
        definitions.
      </p>

      <Card className="mt-6">
        <div className="grid gap-3 sm:grid-cols-[220px_1fr]">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Kind
            </label>
            <Select value={kind} onChange={(e) => setKind(e.target.value as Instrument["kind"])}>
              <option value="survey">Survey</option>
              <option value="interview_guide">Interview guide</option>
              <option value="experiment_protocol">Experiment protocol</option>
              <option value="observation_grid">Observation grid</option>
              <option value="behavioral_metric">Behavioral metric</option>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-500">
              Population / context / any scales you want used
            </label>
            <Textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button disabled={busy} onClick={run}>
            {busy ? "Building…" : "Build instrument"}
          </Button>
        </div>
      </Card>

      {out && (
        <div className="mt-6 space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">{out.title}</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink-800">
              {out.items.map((it) => (
                <li key={it.id}>
                  <div>{it.prompt}</div>
                  <div className="text-xs text-ink-500">
                    {it.construct && <Badge>{it.construct}</Badge>} {it.responseFormat}{" "}
                    {it.sourceReference && <span className="italic">{it.sourceReference}</span>}
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Pilot protocol</h3>
            <p className="mt-1 text-sm text-ink-800">{out.pilotProtocol}</p>
          </Card>

          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Ethics notes</h3>
            <p className="mt-1 text-sm text-ink-800">{out.ethicsNotes}</p>
          </Card>

          {out.warnings.length > 0 && (
            <Card className="border-amber-300 bg-amber-50 text-amber-900">
              <h3 className="text-sm font-semibold">Warnings</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {out.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </Card>
          )}

          <div className="flex justify-end">
            <Button onClick={save}>Save instrument</Button>
          </div>
        </div>
      )}

      {thesis.instruments.length > 0 && (
        <div className="mt-10 space-y-3">
          <h2 className="font-serif text-lg font-semibold text-ink-900">Saved instruments</h2>
          {thesis.instruments.map((i) => (
            <Card key={i.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-ink-900">{i.title}</h3>
                  <Badge>{i.kind.replace(/_/g, " ")}</Badge>
                </div>
                <span className="text-xs text-ink-500">{i.items.length} items</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
