import { Shell } from "@/components/layout/Shell";

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "What counts as a good research question",
    body: [
      "A research question at graduate level has five properties: it names a specific population, construct, and context; it can be answered with data you can obtain; the answer is non-trivial; it connects to an ongoing conversation in the literature; and its scope fits the degree.",
      "The advisor rejects questions phrased as \"the effect of X on Y\" without a specified mechanism or moderator; questions that are really two questions stapled together; questions whose outcome cannot be observed; and questions that restate a settled finding.",
    ],
  },
  {
    title: "Gap analysis: six categories",
    body: [
      "Empirical — a relationship has been theorised but not tested, or tested only in one context.",
      "Methodological — existing studies share a flaw: cross-sectional only, WEIRD samples only, self-report only.",
      "Population — the phenomenon has not been studied in the relevant population.",
      "Theoretical — competing theories make divergent predictions that have not been adjudicated.",
      "Evidence-for-practice — practitioners use techniques that lack evidence.",
      "Construct — a construct is under-specified or conflated with a neighbouring construct.",
    ],
  },
  {
    title: "Paradigm → approach → design",
    body: [
      "Positivist / post-positivist maps to quantitative designs: experimental, quasi-experimental, correlational, survey, longitudinal panel, systematic review, meta-analysis, design science.",
      "Interpretivist maps to qualitative designs: phenomenology, ethnography, narrative inquiry, interpretive case study, grounded theory.",
      "Critical paradigms map to action research, critical discourse analysis, and participatory research.",
      "Pragmatist maps to mixed methods with an explicit integration plan: convergent parallel, explanatory sequential, exploratory sequential, embedded.",
    ],
  },
  {
    title: "Sampling defaults",
    body: [
      "Quantitative survey: a priori power analysis (G*Power) before collection; aim for n ≥ 30 per cell for parametric tests. Probability sampling preferred; convenience sampling is acceptable for MA with explicit limitations.",
      "Quantitative experiment: a priori power analysis; sensitivity analysis if recruitment fell short.",
      "Qualitative interviews: saturation typically between 12 and 20 participants for homogeneous samples; MA theses commonly use 8–15.",
      "Case study: 1–4 cases for in-depth; 5–10 for comparative.",
      "Ethnography: a minimum of three months of sustained engagement.",
    ],
  },
  {
    title: "Writing that does not read as AI",
    body: [
      "Vary sentence length dramatically. Short declarative. Longer, nested. Vary cadence.",
      "Avoid LLM boilerplate: \"In conclusion\", \"Moreover\", \"Furthermore\", \"It is important to note\", \"In today's world\", \"This paper aims to\".",
      "Ban specific phrases: \"delve into\", \"navigate the complexities\", \"a testament to\", \"underscore\", \"multifaceted\", \"robust framework\", \"tapestry\", \"in the realm of\".",
      "Prefer specific nouns: \"the 412 respondents\" over \"the participants in the study\".",
      "Paragraphs show a visible arc: claim → evidence → interpretation → link forward. Not lists in disguise.",
    ],
  },
  {
    title: "Israeli academic conventions",
    body: [
      "APA 7 is the default in social sciences at most Israeli universities. Harvard is common in management schools. Vancouver in medicine. IEEE in engineering.",
      "Bilingual abstract (Hebrew + English) is typical when the thesis body is in English.",
      "Formatting: Times New Roman 12 pt, line spacing 1.5, margins 2.5 cm with 3.5 cm left margin for binding.",
      "Ethics: Helsinki Committee (IRB) approval letter goes in appendices; the approval number is cited in the ethics section of the methodology.",
    ],
  },
];

export default function HandbookPage() {
  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-serif text-3xl font-semibold text-ink-900">Handbook</h1>
        <p className="mt-2 text-sm text-ink-600">
          The same rules the advisor is operating under when it reviews your
          thesis. Worth reading once before you start — saves surprises later.
        </p>

        <div className="mt-8 space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="font-serif text-xl font-semibold text-ink-900">{s.title}</h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink-800">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Shell>
  );
}
