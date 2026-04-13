"use client";

import { useState } from "react";
import { Button, Textarea } from "@/components/ui/primitives";
import { callAI } from "@/lib/api";
import type { StageKey } from "@/lib/ai";

type Props = {
  stage: StageKey;
  contextBuilder?: () => string;
  placeholder?: string;
  title?: string;
  maxTokens?: number;
};

export function AIPanel({ stage, contextBuilder, placeholder, title, maxTokens }: Props) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    setOutput("");
    try {
      const composed = [contextBuilder?.() ?? "", prompt].filter(Boolean).join("\n\n");
      const text = await callAI<string>({ stage, user: composed, maxTokens });
      setOutput(text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink-900">{title ?? "Advisor"}</h3>
        <span className="text-[10px] uppercase tracking-wide text-ink-500">{stage}</span>
      </div>
      <Textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={placeholder ?? "Ask the advisor…"}
        rows={4}
      />
      <div className="mt-2 flex justify-end">
        <Button onClick={run} disabled={busy} size="sm">
          {busy ? "Thinking…" : "Ask advisor"}
        </Button>
      </div>
      {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
      {output && (
        <div className="mt-3 whitespace-pre-wrap rounded-md border border-ink-100 bg-ink-50 p-3 text-sm text-ink-800">
          {output}
        </div>
      )}
    </div>
  );
}
