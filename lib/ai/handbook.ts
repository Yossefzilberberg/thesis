// Long, stable reference text that is sent as a cached system block.
// Think of this as the advisor's handbook: methodology decision tree,
// quality checklists, writing heuristics. Because it is cached, we can
// afford to keep it thorough without paying full tokens every call.

export const HANDBOOK = `# Thesis Advisor Handbook (reference the student cannot see directly)

## A. Research question quality
A good research question is:
- Specific (a defined population, construct, and context).
- Answerable with available or obtainable data.
- Non-trivial (the answer is not obvious a priori).
- Connected to a live conversation in the literature.
- Scaled to the degree (Master's ≈ one clear question with 2–4 sub-questions; PhD expects theoretical contribution).

Red flags:
- Questions phrased as "the effect of X on Y" with no specified mechanism or moderator.
- Questions that are really two questions joined by "and".
- Questions where the outcome cannot be measured or observed.
- Questions that restate an established finding.

## B. Gap analysis
Real gaps fall into one of six categories. When you classify a candidate gap, pick one:
1. Empirical gap — the relationship has been theorised but not tested, or tested only in one context.
2. Methodological gap — existing studies share a flaw (e.g., cross-sectional only; WEIRD samples only; self-report only).
3. Population gap — the phenomenon has not been studied in the relevant population.
4. Theoretical gap — competing theories make divergent predictions that have not been adjudicated.
5. Evidence-for-practice gap — practitioners use techniques that lack evidence.
6. Construct gap — a construct is under-specified or conflated with a neighbouring construct.

Shallow gap-finding ("more research is needed on X") is rejected.

## C. Paradigm → approach → design
Paradigm choices constrain design. Use this matrix as a starting point but recognise field-specific conventions override it.
- Positivist / post-positivist → quantitative → experimental, quasi-experimental, correlational, survey, longitudinal panel, systematic review / meta-analysis, design science.
- Interpretivist → qualitative → phenomenology, ethnography, narrative inquiry, case study (interpretive), grounded theory.
- Critical → qualitative or mixed → action research, critical discourse analysis, participatory research.
- Pragmatist → mixed methods → convergent parallel, explanatory sequential, exploratory sequential, embedded.

Mixed methods are not a way to be non-committal. They require an explicit integration plan.

## D. Sampling defaults (for methodology chapter)
- Quantitative survey: aim for n ≥ 30 per cell for parametric tests; power analysis (G*Power) required before data collection. Convenience sampling is acceptable for MA with explicit limitations; probability sampling preferred.
- Quantitative experiment: a priori power analysis required (effect size from prior literature or pilot). Report sensitivity analysis if recruitment fell short.
- Qualitative interviews: theoretical saturation typically reached between 12 and 20 participants for homogeneous samples, more for heterogeneous; Master's theses commonly use 8–15.
- Case study: 1–4 cases for in-depth; 5–10 for comparative.
- Ethnography: minimum three months of sustained engagement.

## E. Instrument rules
- Prefer previously validated scales. Cite the original validation paper and any recent psychometric re-validation.
- Translations require forward-back translation and a pilot for conceptual equivalence. This is especially relevant for Israeli research using English instruments with Hebrew / Arabic / Russian-speaking respondents.
- Interview guides should have 6–12 open-ended primary questions, each with 2–3 probes, organised by topic.
- Behavioral / digital metrics (CTR, dwell time, session depth) must be defined operationally with the measurement window and exclusion rules.

## F. Analysis defaults
- Quantitative: check assumptions (normality, homoscedasticity, independence, linearity) before running parametric tests. Report effect sizes (Cohen's d, η², r, odds ratio) alongside p-values. Use 95% CIs.
- Regression: report VIF for multicollinearity; check residuals; consider robust standard errors for heteroscedasticity.
- SEM: report CFI, TLI, RMSEA, SRMR; model identification must be justified.
- Qualitative: Braun & Clarke (2006/2019) reflexive thematic analysis, or Gioia method, or constant comparison (Glaser & Strauss). Report coder reliability for team coding (Cohen's κ ≥ .70 or percent agreement ≥ 80%). For reflexive TA, do not report κ — report reflexivity.
- Mixed methods: specify point of integration and weighting (QUAN+qual, QUAL+quan, QUAN→QUAL, etc.).

## G. Writing structure
Each chapter opens with a one-paragraph roadmap and closes with a bridging paragraph to the next chapter. Sub-sections use decimal numbering (1.1, 1.2.1) and are never more than three levels deep.

Introduction chapter arc: (1) broad context, (2) specific problem, (3) gap, (4) research question(s), (5) contribution, (6) chapter roadmap. Target: 2500–3500 words for MA, 4000–6000 for PhD.

Literature review arc: (1) scope and selection criteria, (2) thematic organisation (not chronological), (3) critical synthesis of each theme, (4) identified gap, (5) theoretical positioning. Target: 6000–10000 words for MA, 12000–20000 for PhD.

Methodology arc: (1) philosophical stance, (2) research design justification, (3) sample, (4) instruments, (5) procedure, (6) analysis plan, (7) ethics, (8) limitations. Target: 3500–5500 words.

Findings arc: (1) sample description, (2) results organised by research question or hypothesis, (3) tables and figures referenced in text. No interpretation here — interpretation goes in Discussion.

Discussion arc: (1) summary of key findings, (2) interpretation in light of theory, (3) comparison with prior literature (agreements and tensions), (4) theoretical contribution, (5) practical / policy implications, (6) limitations, (7) future research.

## H. Citation and integrity
- Every non-obvious claim is cited.
- Quotations of more than 40 words are block-quoted with no quote marks, indented, and cited with page number.
- Paraphrasing requires a citation and a genuine rewrite; synonym-swap is plagiarism.
- Self-citation is permitted and expected when the student has prior work; it is declared in the ethics statement.

## I. Israeli academic conventions worth remembering
- Hebrew University and Tel Aviv University require a Hebrew abstract (תקציר) regardless of body language. Technion and Ben-Gurion require it for STEM theses written in English.
- Most Israeli universities accept APA 7 across social sciences; Harvard is common in management schools; Chicago in history and law; Vancouver in medicine; IEEE in engineering.
- Line spacing 1.5, margins at least 2.5 cm (left margin 3.5 cm for binding) are standard.
- A supervisor's signed letter typically precedes the title page.
- Helsinki Committee (IRB) approval letter goes in appendices; approval number is cited in the ethics section.

## J. Defense preparation
Committee questions cluster around:
- Why this question (not a neighbouring one)?
- Why this design (not a stronger alternative)?
- What if your key assumption is wrong?
- How do your findings differ from [prominent prior work]?
- What is the contribution in one sentence?
- What would you do differently with another two years?
- What are the limitations you did not mention in the thesis?
- Generalisability beyond the sample.

Answer template: (1) restate the question in your own words, (2) give a direct answer, (3) support with one piece of evidence from the thesis, (4) acknowledge the limit of the answer.`;
