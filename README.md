# Thesis Forge

An end-to-end system for writing a graduate thesis in English, built around the
conventions used by Israeli universities. It covers every stage of the research
lifecycle — refining the research question, performing a real gap analysis,
building a theoretical framework, running a literature review, designing a
methodology, generating research instruments, drafting chapters, managing
citations, and simulating the committee defense.

The writing advisor is a Claude-powered research supervisor with strict rules:
it never fabricates sources, it refuses shallow gap analyses, it will not
weaken a methodology to make results look stronger, and its drafts read like
academic prose rather than AI output.

## Highlights

- **Research question workshop** — turn a rough idea into a specific,
  measurable, feasible question. Each candidate is scored on clarity,
  originality, feasibility, and significance.
- **Gap analysis with six categories** — empirical, methodological,
  population, theoretical, evidence-for-practice, construct. Generic "more
  research is needed" verdicts are rejected by design.
- **Theoretical framework builder** — select theories, produce a coherent
  integration, and generate a conceptual model with constructs, roles, and
  propositions (plus an ASCII diagram to paste into the chapter).
- **Methodology designer** — philosophical stance, sampling with power
  analysis, validated instruments, analysis plan, ethics (Helsinki /
  IRB), Campbell-style validity threats, and limitations. Pushes a full
  draft into the methodology chapter.
- **Instrument generator** — surveys from validated scales (cited, never
  invented), interview guides with probes, experiment protocols, behavioral
  metric definitions with measurement windows.
- **Data & analysis** — cleaning plan with R / Python / SPSS / STATA code
  hints, and a results → findings-prose pass that reports statistics
  correctly without interpretation.
- **Citation engine** — APA 7, Harvard, Chicago 17 (author-date and notes),
  MLA 9, Vancouver, IEEE. In-text citations are linked to verified reference
  entries.
- **Word-like rich text editor** — TipTap with headings, lists, tables,
  block quotes, highlights, alignment, links, task lists, and a live word
  count.
- **Humanizer pass** — rewrites AI-sounding prose while preserving every
  claim and citation. Strips boilerplate openers, banned phrases, and
  monotone cadence.
- **Defense simulator** — a mock committee that targets the weakest part of
  the thesis, returns model answers using the restate → answer → evidence →
  limit template.
- **Project planner** — realistic timeline from proposal approval through
  defense, weighted by weekly hours you can actually give.
- **Israeli institutional defaults** — Times New Roman 12 pt, 1.5 line
  spacing, 2.5 cm margins with 3.5 cm binding margin, bilingual abstract
  toggle, Helsinki Committee note in the ethics section.

## Getting started

```bash
pnpm install   # or npm install / yarn
cp .env.example .env
# fill ANTHROPIC_API_KEY
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and start a new thesis.
Theses are stored locally in your browser (IndexedDB with a localStorage
fallback), so the draft never leaves your machine unless you send a specific
passage to the advisor.

## Technology

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- TipTap for the rich text editor
- Dexie (IndexedDB) for local persistence
- Zustand for state
- `@anthropic-ai/sdk` for the advisor
- Anthropic **prompt caching** on the persona + handbook blocks so long
  system prompts are reused efficiently across stages

## Architecture

```
app/                      Next.js pages and API routes
  api/ai/                 Single endpoint that dispatches to stage prompts
  api/citations/format/   Formats references in any supported style
  thesis/[id]/            Per-thesis workspace (chapters + tools)
components/
  editor/                 TipTap editor + toolbar
  workspace/              ChapterNav, AIPanel
  layout/                 Shell / navigation
  ui/                     Primitives (Button, Card, Input, …)
lib/
  ai/                     Persona, handbook, stage prompts, client
  citations/              APA 7, Harvard, Chicago, MLA, Vancouver, IEEE
  types.ts                Domain model
  storage.ts              IndexedDB + localStorage persistence
  store.ts                Zustand state
```

## Commitments

1. **No invented sources.** If a citation cannot be verified against your
   reference library, it is flagged — never silently emitted.
2. **No AI cadence.** The humanizer pass enforces varied sentence length and
   removes the giveaways while preserving every claim and citation.
3. **No methodology shortcuts.** Sampling, validity, ethics, reproducibility
   are non-negotiable. The advisor tells you when a design has a fatal flaw
   even if you did not ask.
