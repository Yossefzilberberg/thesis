import { NextResponse } from "next/server";
import { runStage, runStageJSON, type StageKey } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 120;

// Single generic endpoint so the client can call any stage by name.
// Keeps the API surface small and the routing centralised. Every route
// below calls this via its own thin wrapper for better discoverability.

type Body = {
  stage: StageKey;
  user: string;
  json?: boolean;
  maxTokens?: number;
  temperature?: number;
  useFast?: boolean;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  if (!body?.stage || !body?.user) {
    return NextResponse.json({ error: "stage and user are required" }, { status: 400 });
  }
  try {
    if (body.json) {
      const out = await runStageJSON({
        stage: body.stage,
        user: body.user,
        maxTokens: body.maxTokens,
        temperature: body.temperature,
        useFast: body.useFast,
      });
      return NextResponse.json({ ok: true, data: out });
    }
    const text = await runStage({
      stage: body.stage,
      user: body.user,
      maxTokens: body.maxTokens,
      temperature: body.temperature,
      useFast: body.useFast,
    });
    return NextResponse.json({ ok: true, text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI call failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
