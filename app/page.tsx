import Link from "next/link";
import { Shell } from "@/components/layout/Shell";

const FEATURES = [
  {
    title: "Sharpen your research question",
    body: "Walk through paradigm, approach, and design with an in-house advisor that pushes back. Score the question on clarity, originality, feasibility, and significance — and revise until it holds up.",
  },
  {
    title: "Real gap analysis",
    body: "Classify gaps as empirical, methodological, population, theoretical, evidence-for-practice, or construct. Shallow 'more research is needed' verdicts are rejected by design.",
  },
  {
    title: "Theoretical framework, conceptually drawn",
    body: "Pick theories, integrate them, and produce a conceptual model with constructs, propositions, and a sketch you can drop into the methodology chapter.",
  },
  {
    title: "Literature review that synthesises",
    body: "Thematic structure, agreement-and-tension passes across sources, and a built-in rule that a citation never appears unless you have verified the source. Hallucinations get flagged, not silently emitted.",
  },
  {
    title: "Methodology with teeth",
    body: "Sampling defaults grounded in the field, power-analysis prompts, validity threats classified by Campbell-style category, and an ethics block tuned to the Helsinki / IRB process used by Israeli universities.",
  },
  {
    title: "Generate real instruments",
    body: "Surveys built from validated scales (cited, never invented), semi-structured interview guides with probes, experiment protocols, and behavioral metric definitions with measurement windows.",
  },
  {
    title: "Findings, then discussion",
    body: "Strict separation. Findings reports the numbers; discussion interprets them against your theoretical framework and the prior literature you have actually read.",
  },
  {
    title: "Citations and bibliography",
    body: "APA 7, Harvard, Chicago (author-date and notes), MLA 9, Vancouver, IEEE. The reference manager is the source of truth — every in-text citation is linked to a verified entry.",
  },
  {
    title: "Defense simulator",
    body: "The system steel-mans the weakest part of your thesis and drills you on it. Model answers follow restate → answer → evidence → limit.",
  },
  {
    title: "Project plan that fits real life",
    body: "Milestones from proposal approval through defense, weighted by the hours you can actually give the thesis each week. Risk flags surface before they become emergencies.",
  },
];

export default function Home() {
  return (
    <Shell>
      <section className="mx-auto max-w-4xl px-6 pb-10 pt-20 text-center">
        <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight text-ink-900 sm:text-6xl">
          A thesis advisor that lives inside your draft.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-600">
          Thesis Forge takes a graduate researcher from a vague idea to a
          defensible thesis — research question, gap analysis, theoretical
          framework, literature review, methodology, instruments, data, findings,
          discussion, citations, and defense — in academic English, with prose
          that reads as your own.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/new"
            className="inline-flex h-11 items-center rounded-md bg-ink-900 px-6 text-sm font-medium text-white hover:bg-ink-800"
          >
            Start a new thesis
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center rounded-md border border-ink-200 bg-white px-6 text-sm font-medium text-ink-900 hover:bg-ink-50"
          >
            Open existing
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-500">
          Local-first storage. Your draft never leaves your browser unless you
          ask the AI advisor to react to it.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-ink-200 bg-white p-6 shadow-sm"
            >
              <h3 className="font-serif text-lg font-semibold text-ink-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 pb-24">
        <div className="rounded-xl border border-ink-200 bg-white p-8 shadow-sm">
          <h2 className="font-serif text-2xl font-semibold text-ink-900">
            Built around three commitments
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-ink-700">
            <li>
              <b>1. No invented sources.</b> If a citation cannot be verified, it is
              flagged, not emitted. Your reference list is the only place
              citations come from.
            </li>
            <li>
              <b>2. No AI cadence.</b> A humanizer pass strips the giveaways —
              boilerplate openers, monotone sentence length, banned phrases —
              while preserving every claim and citation.
            </li>
            <li>
              <b>3. No methodology shortcuts.</b> Sampling, validity, ethics, and
              reproducibility are non-negotiable. The advisor will tell you when
              your design has a fatal flaw.
            </li>
          </ol>
        </div>
      </section>
    </Shell>
  );
}
