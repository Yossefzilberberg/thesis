import { NextResponse } from "next/server";
import { buildBibliography, formatInText, formatReferenceList } from "@/lib/citations/format";
import type { CitationStyle, Reference } from "@/lib/types";

type Body =
  | { mode: "reference"; ref: Reference; style: CitationStyle }
  | {
      mode: "intext";
      ref: Reference;
      style: CitationStyle;
      locator?: string;
      suppressAuthor?: boolean;
      prefix?: string;
      suffix?: string;
    }
  | { mode: "bibliography"; refs: Reference[]; style: CitationStyle };

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  try {
    if (body.mode === "reference") {
      return NextResponse.json({ ok: true, text: formatReferenceList(body.ref, body.style) });
    }
    if (body.mode === "intext") {
      return NextResponse.json({
        ok: true,
        text: formatInText(body.ref, body.style, {
          locator: body.locator,
          suppressAuthor: body.suppressAuthor,
          prefix: body.prefix,
          suffix: body.suffix,
        }),
      });
    }
    if (body.mode === "bibliography") {
      return NextResponse.json({ ok: true, lines: buildBibliography(body.refs, body.style) });
    }
    return NextResponse.json({ ok: false, error: "Unknown mode" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Citation formatting failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
