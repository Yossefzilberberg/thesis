"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Editor } from "@/components/editor/Editor";
import { Badge, Button, Card } from "@/components/ui/primitives";
import { AIPanel } from "@/components/workspace/AIPanel";
import { useThesisStore } from "@/lib/store";
import type { ChapterKey } from "@/lib/types";
import { callAI, formatBibliography } from "@/lib/api";

const STAGE_BY_CHAPTER: Record<ChapterKey, { stage: Parameters<typeof callAI>[0]["stage"]; title: string } | null> = {
  title_page: null,
  abstract: { stage: "abstract", title: "Abstract" },
  acknowledgements: null,
  toc: null,
  introduction: { stage: "freeform", title: "Introduction" },
  literature_review: { stage: "literatureReview", title: "Literature review" },
  theoretical_framework: { stage: "theoreticalFramework", title: "Theoretical framework" },
  methodology: { stage: "methodology", title: "Methodology" },
  findings: { stage: "analysis", title: "Findings" },
  discussion: { stage: "discussion", title: "Discussion" },
  conclusion: { stage: "conclusion", title: "Conclusion" },
  references: null,
  appendices: null,
};

export default function ChapterPage() {
  const params = useParams<{ id: string; key: string }>();
  const key = params.key as ChapterKey;
  const thesis = useThesisStore((s) => s.current);
  const updateChapter = useThesisStore((s) => s.updateChapter);
  const [content, setContent] = useState<Record<string, unknown> | null>(null);
  const [rawText, setRawText] = useState("");
  const [dirty, setDirty] = useState(false);
  const [biblio, setBiblio] = useState<string[] | null>(null);
  const [humanizing, setHumanizing] = useState(false);

  const chapter = useMemo(() => thesis?.chapters.find((c) => c.key === key), [thesis, key]);

  useEffect(() => {
    if (chapter) setContent(chapter.content);
  }, [chapter]);

  useEffect(() => {
    if (!thesis || key !== "references") return;
    formatBibliography(thesis.references, thesis.citationStyle).then(setBiblio).catch(() => setBiblio([]));
  }, [thesis, key]);

  if (!thesis || !chapter) return null;

  const stageInfo = STAGE_BY_CHAPTER[key];

  async function save() {
    if (!content) return;
    await updateChapter(key, { content });
    setDirty(false);
  }

  async function humanize() {
    if (!rawText.trim()) return;
    setHumanizing(true);
    try {
      const rewritten = await callAI<string>({
        stage: "humanize",
        user: `Style: academic (${thesis?.field ?? "general"}). Passage:\n\n${rawText}`,
      });
      // Replace the whole document text.
      setContent({
        type: "doc",
        content: rewritten
          .split(/\n\n+/)
          .filter(Boolean)
          .map((p) => ({ type: "paragraph", content: [{ type: "text", text: p }] })),
      } as Record<string, unknown>);
      setDirty(true);
    } finally {
      setHumanizing(false);
    }
  }

  async function critique() {
    if (!rawText.trim()) return;
    const out = await callAI<{
      strengths: string[];
      weaknesses: { issue: string; severity: string; excerpt: string; suggestion: string }[];
      missing: string[];
      oneLineVerdict: string;
    }>({
      stage: "critique",
      user: `Chapter: ${chapter!.title}\nField: ${thesis!.field}\nPassage:\n\n${rawText}`,
      json: true,
    });
    alert(
      [
        `Verdict: ${out.oneLineVerdict}`,
        "",
        "Strengths:",
        ...out.strengths.map((s) => "• " + s),
        "",
        "Weaknesses:",
        ...out.weaknesses.map((w) => `• [${w.severity}] ${w.issue} — ${w.suggestion}`),
        "",
        "Missing:",
        ...out.missing.map((m) => "• " + m),
      ].join("\n"),
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink-900">{chapter.title}</h1>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-500">
            {chapter.wordTarget && <Badge>target {chapter.wordTarget.toLocaleString()} words</Badge>}
            {dirty && <span className="text-amber-600">unsaved</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={critique} disabled={!rawText.trim()}>
            Critique
          </Button>
          <Button variant="secondary" size="sm" onClick={humanize} disabled={!rawText.trim() || humanizing}>
            {humanizing ? "Rewriting…" : "Humanize pass"}
          </Button>
          <Button size="sm" onClick={save} disabled={!dirty}>
            Save
          </Button>
        </div>
      </div>

      {key === "references" ? (
        <Card>
          <h3 className="mb-3 font-semibold text-ink-900">Bibliography ({thesis.citationStyle.toUpperCase()})</h3>
          {!biblio ? (
            <p className="text-sm text-ink-500">Formatting…</p>
          ) : biblio.length === 0 ? (
            <p className="text-sm text-ink-500">
              No references yet. Add them in the{" "}
              <a className="underline" href={`/thesis/${thesis.id}/references`}>
                References manager
              </a>
              .
            </p>
          ) : (
            <ol className="space-y-2 text-sm text-ink-800">
              {biblio.map((line, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: renderItalic(line) }} />
              ))}
            </ol>
          )}
        </Card>
      ) : (
        <>
          <Editor
            value={content}
            onChange={(doc, text) => {
              setContent(doc);
              setRawText(text);
              setDirty(true);
            }}
            placeholder={`Write the ${chapter.title.toLowerCase()} chapter here. Use the toolbar for formatting.`}
          />
          {stageInfo && (
            <div className="mt-6">
              <AIPanel
                stage={stageInfo.stage}
                title={`${stageInfo.title} — advisor`}
                placeholder="Ask the advisor to draft a passage, critique a paragraph, or sketch the structure."
                contextBuilder={() => {
                  const lines = [
                    `Chapter: ${chapter.title}`,
                    `Field: ${thesis.field}`,
                    `Degree level: ${thesis.degreeLevel}`,
                    `Approach: ${thesis.approach ?? "n/a"}`,
                    `Design: ${thesis.design ?? "n/a"}`,
                    `Citation style: ${thesis.citationStyle}`,
                    thesis.researchQuestions[0]
                      ? `Research question: ${thesis.researchQuestions[0].text}`
                      : "",
                  ].filter(Boolean);
                  return "Context for this request:\n" + lines.join("\n");
                }}
                maxTokens={4096}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function renderItalic(s: string) {
  return s
    .replace(/</g, "&lt;")
    .replace(/&lt;\/?i&gt;/g, (m) => (m.includes("/") ? "</em>" : "<em>"))
    .replace(/⟨i⟩/g, "<em>")
    .replace(/⟨\/i⟩/g, "</em>");
}
