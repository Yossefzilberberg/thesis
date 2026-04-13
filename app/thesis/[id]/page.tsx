"use client";

import Link from "next/link";
import { Badge, Card } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { formatDate } from "@/lib/utils";

export default function ThesisOverview() {
  const thesis = useThesisStore((s) => s.current);
  if (!thesis) return null;

  const completedChapters = thesis.chapters.filter((c) => c.content).length;
  const totalWordsTarget = thesis.settings.targetWordCount;

  const stages = [
    {
      title: "Research question",
      done: thesis.researchQuestions.length > 0,
      href: `/thesis/${thesis.id}/research-question`,
      desc: "Sharpen a vague idea into a specific, measurable, feasible question.",
    },
    {
      title: "Gap analysis",
      done: thesis.gapAnalysis.length > 0,
      href: `/thesis/${thesis.id}/gap-analysis`,
      desc: "Classify gaps in the literature. Shallow verdicts are rejected.",
    },
    {
      title: "Theoretical framework",
      done: thesis.constructs.length > 0,
      href: `/thesis/${thesis.id}/framework`,
      desc: "Pick theories, produce a model with constructs and propositions.",
    },
    {
      title: "Literature review",
      done: !!thesis.chapters.find((c) => c.key === "literature_review")?.content,
      href: `/thesis/${thesis.id}/chapter/literature_review`,
      desc: "Thematic synthesis grounded in your verified references.",
    },
    {
      title: "Methodology",
      done: !!thesis.chapters.find((c) => c.key === "methodology")?.content,
      href: `/thesis/${thesis.id}/methodology`,
      desc: "Design, sampling, instruments, analysis plan, ethics, validity.",
    },
    {
      title: "Instruments",
      done: thesis.instruments.length > 0,
      href: `/thesis/${thesis.id}/instruments`,
      desc: "Surveys, interview guides, experiment protocols, behavioral metrics.",
    },
    {
      title: "Data & analysis",
      done: thesis.dataSources.length > 0,
      href: `/thesis/${thesis.id}/data`,
      desc: "Cleaning plan, analysis routines, findings-chapter drafting.",
    },
    {
      title: "Defense preparation",
      done: thesis.defenseBank.length > 0,
      href: `/thesis/${thesis.id}/defense`,
      desc: "Committee simulation targeting the weakest parts of your thesis.",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-ink-900">{thesis.title}</h1>
          <p className="mt-1 text-sm text-ink-600">
            {thesis.institution.name || "Institution not set"} ·{" "}
            {thesis.degreeLevel.toUpperCase()} · {thesis.field.replace(/_/g, " ")} ·{" "}
            Updated {formatDate(thesis.updatedAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge>{thesis.citationStyle.toUpperCase()}</Badge>
          {thesis.approach && <Badge>{thesis.approach.replace(/_/g, " ")}</Badge>}
          {thesis.design && <Badge>{thesis.design.replace(/_/g, " ")}</Badge>}
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-500">Progress</div>
            <div className="mt-1 text-lg font-semibold text-ink-900">
              {completedChapters} / {thesis.chapters.length} chapters started
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-500">Word target</div>
            <div className="mt-1 text-lg font-semibold text-ink-900">
              {totalWordsTarget.toLocaleString()} words
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-500">References</div>
            <div className="mt-1 text-lg font-semibold text-ink-900">
              {thesis.references.length}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-ink-500">RQs</div>
            <div className="mt-1 text-lg font-semibold text-ink-900">
              {thesis.researchQuestions.length}
            </div>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 font-serif text-lg font-semibold text-ink-900">Research lifecycle</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {stages.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="group rounded-lg border border-ink-200 bg-white p-4 transition hover:border-ink-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  s.done ? "bg-green-500" : "bg-ink-300"
                }`}
              />
              <h3 className="text-sm font-semibold text-ink-900">{s.title}</h3>
            </div>
            <p className="mt-1 text-xs text-ink-600">{s.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
