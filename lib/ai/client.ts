import Anthropic from "@anthropic-ai/sdk";

// Single Anthropic client, reused across API routes.
// Prompt caching is used for long system prompts (methodology handbook,
// style rules, institutional guidelines) so we don't pay full price on
// every stage-specific call.
let client: Anthropic | null = null;
export function getAnthropic() {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export function model() {
  return process.env.ANTHROPIC_MODEL || "claude-opus-4-6";
}

export function fastModel() {
  return process.env.ANTHROPIC_FAST_MODEL || "claude-haiku-4-5-20251001";
}

export type CacheableBlock =
  | { type: "text"; text: string; cache_control?: { type: "ephemeral" } };

// Build a system prompt array with cache_control on the long, stable
// portions. The first block is the persona + global ruleset (cached),
// followed by the per-stage operator prompt (not cached).
export function buildSystem(options: {
  persona: string;
  stageInstruction: string;
  extraCached?: string;
}): CacheableBlock[] {
  const blocks: CacheableBlock[] = [
    {
      type: "text",
      text: options.persona,
      cache_control: { type: "ephemeral" },
    },
  ];
  if (options.extraCached) {
    blocks.push({
      type: "text",
      text: options.extraCached,
      cache_control: { type: "ephemeral" },
    });
  }
  blocks.push({ type: "text", text: options.stageInstruction });
  return blocks;
}

export type RunOptions = {
  system: CacheableBlock[];
  user: string;
  maxTokens?: number;
  temperature?: number;
  useFast?: boolean;
};

export async function runCompletion(opts: RunOptions): Promise<string> {
  const anthropic = getAnthropic();
  const msg = await anthropic.messages.create({
    model: opts.useFast ? fastModel() : model(),
    max_tokens: opts.maxTokens ?? 4096,
    temperature: opts.temperature ?? 0.4,
    system: opts.system as Anthropic.Messages.TextBlockParam[],
    messages: [{ role: "user", content: opts.user }],
  });
  const text = msg.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return text.trim();
}

// Convenience: force the model to return JSON matching a described shape.
// We don't use strict JSON mode (not universally available) — instead we
// instruct + parse, falling back to a best-effort extraction.
export async function runJSON<T>(opts: RunOptions): Promise<T> {
  const text = await runCompletion({
    ...opts,
    user:
      opts.user +
      "\n\nReturn ONLY a JSON object. No prose, no markdown fences, no commentary.",
    temperature: opts.temperature ?? 0.2,
  });
  return parseLooseJSON<T>(text);
}

export function parseLooseJSON<T>(raw: string): T {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("Model did not return parseable JSON");
  }
}
