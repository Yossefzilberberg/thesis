"use client";

import { useState } from "react";
import { v4 as uuid } from "uuid";
import { Badge, Button, Card, Input, Label, Select } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { callAI } from "@/lib/api";
import type { Milestone } from "@/lib/types";
import { formatDate } from "@/lib/utils";

type AIOut = {
  milestones: { title: string; description: string; dueISO: string; dependsOn: string[] }[];
  weeklyRoutine: string;
  riskFlags: string[];
};

export default function ProjectPage() {
  const thesis = useThesisStore((s) => s.current);
  const patch = useThesisStore((s) => s.patch);
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 180 * 86400 * 1000).toISOString().slice(0, 10),
  );
  const [hours, setHours] = useState(15);
  const [stage, setStage] = useState("literature review");
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<AIOut | null>(null);

  if (!thesis) return null;

  async function run() {
    setBusy(true);
    try {
      const res = await callAI<AIOut>({
        stage: "projectPlan",
        user: `Start date: ${start}\nDeadline: ${deadline}\nDegree level: ${thesis!.degreeLevel}\nCurrent stage: ${stage}\nWeekly hours available: ${hours}\nField: ${thesis!.field}\nDesign: ${thesis!.design}`,
        json: true,
      });
      setOut(res);
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!out) return;
    const milestones: Milestone[] = out.milestones.map((m) => ({
      id: uuid(),
      title: m.title,
      dueDate: m.dueISO,
      status: "not_started",
      dependencies: m.dependsOn,
    }));
    await patch({ milestones });
    alert("Timeline saved.");
  }

  async function toggleStatus(id: string) {
    if (!thesis) return;
    const next = thesis.milestones.map((m) => {
      if (m.id !== id) return m;
      const order: Milestone["status"][] = ["not_started", "in_progress", "done", "blocked"];
      const idx = order.indexOf(m.status);
      return { ...m, status: order[(idx + 1) % order.length] };
    });
    await patch({ milestones: next });
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Project plan</h1>

      <Card className="mt-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <div>
            <Label>Start</Label>
            <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </div>
          <div>
            <Label>Deadline</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
          </div>
          <div>
            <Label>Weekly hours</Label>
            <Input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </div>
          <div>
            <Label>Current stage</Label>
            <Select value={stage} onChange={(e) => setStage(e.target.value)}>
              <option>idea</option>
              <option>research question</option>
              <option>literature review</option>
              <option>methodology</option>
              <option>IRB / proposal</option>
              <option>data collection</option>
              <option>analysis</option>
              <option>writing</option>
              <option>revisions</option>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Button disabled={busy} onClick={run}>
            {busy ? "Planning…" : "Generate timeline"}
          </Button>
        </div>
      </Card>

      {out && (
        <div className="mt-6 space-y-3">
          <Card>
            <h3 className="text-sm font-semibold text-ink-900">Weekly routine</h3>
            <p className="mt-1 text-sm text-ink-800">{out.weeklyRoutine}</p>
          </Card>
          {out.riskFlags.length > 0 && (
            <Card className="border-amber-300 bg-amber-50 text-amber-900">
              <h3 className="text-sm font-semibold">Risk flags</h3>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">
                {out.riskFlags.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </Card>
          )}
          <Card>
            <h3 className="mb-2 text-sm font-semibold text-ink-900">Milestones</h3>
            <ol className="space-y-2 text-sm text-ink-800">
              {out.milestones.map((m, i) => (
                <li key={i} className="rounded border border-ink-100 bg-ink-50 p-2">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{m.title}</div>
                    <Badge>{formatDate(m.dueISO)}</Badge>
                  </div>
                  <p className="text-ink-700">{m.description}</p>
                  {m.dependsOn.length > 0 && (
                    <div className="mt-1 text-xs text-ink-500">
                      Depends on: {m.dependsOn.join(", ")}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </Card>
          <div className="flex justify-end">
            <Button onClick={save}>Save timeline</Button>
          </div>
        </div>
      )}

      {thesis.milestones.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-2 font-serif text-lg font-semibold text-ink-900">
            Active milestones
          </h2>
          <div className="space-y-2">
            {thesis.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded border border-ink-200 bg-white p-3 text-sm"
              >
                <div>
                  <div className="font-semibold text-ink-900">{m.title}</div>
                  {m.dueDate && (
                    <div className="text-xs text-ink-500">Due {formatDate(m.dueDate)}</div>
                  )}
                </div>
                <button
                  className="rounded border border-ink-200 px-3 py-1 text-xs capitalize hover:bg-ink-50"
                  onClick={() => toggleStatus(m.id)}
                >
                  {m.status.replace("_", " ")}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
