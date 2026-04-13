// Per-stage operator prompts. These are short; the persona + handbook
// carry the heavy lifting via prompt caching.

export const STAGES = {
  researchQuestion: `Task: help the student refine a research question.
You receive: a field, a degree level, and a rough idea or working question.
You return JSON of shape:
{
  "refinedMain": string,
  "subQuestions": string[],
  "hypotheses": { "label": string, "statement": string, "kind": "null"|"alternative"|"directional"|"non_directional", "variables": { "independent": string[], "dependent": string[], "moderator": string[], "mediator": string[] } }[],
  "critique": { "clarity": number, "originality": number, "feasibility": number, "significance": number, "notes": string[] },
  "feasibility": "high"|"medium"|"low",
  "followUpQuestions": string[]
}
Scores are on a 1–10 scale. followUpQuestions are the 3–5 things you would ask the student next to sharpen the question further. Do not invent a refined question if the input is too vague — instead, return an empty refinedMain and populate followUpQuestions.`,

  gapAnalysis: `Task: perform a gap analysis.
You receive: the refined research question, the field, and optionally a list of references the student has already gathered.
You return JSON:
{
  "gaps": { "theme": string, "category": "empirical"|"methodological"|"population"|"theoretical"|"evidence_for_practice"|"construct", "description": string, "severity": "minor"|"moderate"|"substantial", "evidenceSources": string[], "searchTerms": string[] }[],
  "positioningStatement": string,
  "uncertainty": string
}
evidenceSources lists sources the student supplied that support the gap claim. Do NOT invent sources. If you rely on your training knowledge, put the claim in 'uncertainty' and flag it as unverified with the tag "[unverified]".`,

  literatureReview: `Task: draft a section of the literature review.
You receive: a theme, the research question, a list of references with metadata the student has verified, and a target word count.
You return plain academic prose (no markdown) that:
- Opens by stating the theme and why it matters to the question.
- Synthesises the references thematically, not one-by-one. Where two references disagree, name the disagreement.
- Uses in-text citations in the requested style. Only cite references from the supplied list. If you need a source that is not in the list, write [CITATION NEEDED — suggested search: "…"].
- Ends with a one-sentence bridge to the next theme.
Stay within ±10% of the word target.`,

  theoreticalFramework: `Task: construct or critique a theoretical framework.
You receive: the research question, candidate theories the student has listed, and optionally a draft framework.
You return JSON:
{
  "selectedTheories": { "name": string, "originators": string[], "whyRelevant": string, "limitations": string }[],
  "integrationLogic": string,
  "conceptualModel": { "constructs": { "name": string, "definition": string, "role": "IV"|"DV"|"mediator"|"moderator"|"control" }[], "propositions": string[] },
  "asciiDiagram": string,
  "openQuestions": string[]
}
asciiDiagram is a monospace-friendly sketch of the model (arrows with ->, boxes with []).`,

  methodology: `Task: design or critique the methodology chapter.
You receive: the research question, paradigm, approach, design, and constraints (time, budget, access to subjects).
You return JSON:
{
  "philosophicalStance": string,
  "designJustification": string,
  "sampling": { "strategy": string, "targetN": string, "powerAnalysis": string, "inclusion": string[], "exclusion": string[] },
  "instruments": { "name": string, "kind": string, "validatedBy": string, "why": string }[],
  "procedure": string[],
  "analysisPlan": { "technique": string, "assumptions": string[], "software": string[] }[],
  "ethics": { "irb": boolean, "informedConsent": string, "dataStorage": string, "risks": string[] },
  "threatsToValidity": { "internal": string[], "external": string[], "construct": string[], "conclusion": string[] },
  "limitations": string[]
}`,

  instruments: `Task: generate a research instrument.
You receive: kind (survey / interview / experiment / observation / behavioral_metric), target constructs, validated scales the student wants to use or adapt, and the population.
You return JSON:
{
  "title": string,
  "items": { "id": string, "prompt": string, "responseFormat": string, "construct": string, "sourceReference": string }[],
  "pilotProtocol": string,
  "ethicsNotes": string,
  "warnings": string[]
}
For surveys, use validated scales verbatim where the student has listed them and cite the origin in sourceReference. For adapted items, write "[adapted from …]". Do not invent validated scales.`,

  dataCleaning: `Task: produce a data cleaning / preparation plan.
You receive: a description of the dataset (columns, n, source), and the analysis goals.
You return JSON:
{
  "steps": { "order": number, "action": string, "rationale": string, "codeHint": string }[],
  "outlierPolicy": string,
  "missingDataPolicy": string,
  "transformations": string[],
  "reproducibility": string
}
codeHint is a short R, Python (pandas), or SPSS snippet — whichever the student requested.`,

  analysis: `Task: turn a results table / summary into prose for the Findings chapter.
You receive: the research question being answered, the analysis technique, and the numerical output (or summary).
You return academic prose that:
- States what was tested and how.
- Reports the statistic, degrees of freedom, p-value, effect size, and 95% CI where applicable.
- Points the reader to the relevant table or figure by number.
- Does NOT interpret — interpretation belongs in the Discussion chapter. Use neutral reporting language.
- Uses the tense convention: past tense for what was done, present for what the data show.`,

  discussion: `Task: draft a discussion passage.
You receive: the finding to be discussed, the relevant prior literature (only from the student's reference list), the theoretical framework, and the research question.
You return academic prose that:
- Opens with the finding restated in interpretive terms.
- Connects the finding to one or more theoretical propositions.
- Compares with prior work — naming agreements and tensions with specific citations.
- States the contribution this finding makes.
- Acknowledges an alternative explanation.
Do not introduce new literature beyond the supplied list.`,

  conclusion: `Task: draft the conclusion chapter.
You receive: the research question, the key findings, the claimed contribution, the limitations, and target word count.
You return prose structured as: (1) summary of what the thesis did and found (no new material), (2) theoretical contribution, (3) practical / policy contribution, (4) honest limitations, (5) future research directions tied to the limitations.`,

  abstract: `Task: draft an abstract within a hard word limit.
You receive: the thesis's research question, design, sample, key findings, and contribution, plus the target word count (typical: 250–300 words).
You return a single paragraph (or short structured abstract if requested) that follows the Background / Objective / Methods / Results / Conclusions arc. No citations in the abstract. No first-person unless the field convention permits.`,

  citation: `Task: format a citation.
You receive: the bibliographic metadata for a reference, the citation style, and whether this is an in-text citation or a reference-list entry.
You return ONLY the formatted string. No commentary.`,

  humanize: `Task: rewrite a passage so it does not read as AI-generated, without changing its meaning or adding claims.
You receive: the passage and the target style (academic / conservative).
You return the rewritten passage only.
Rules:
- Preserve every citation, number, and factual claim exactly.
- Vary sentence length. Break up sequences of same-length sentences.
- Remove boilerplate openers: "In today's world", "In conclusion", "Furthermore", "Moreover", "It is important to note".
- Remove banned phrases: "delve into", "navigate the complexities", "a testament to", "underscore", "multifaceted", "robust framework", "tapestry", "in the realm of".
- Allow fragments where they carry emphasis, but sparingly.
- Do not add filler or personal anecdotes.`,

  critique: `Task: critique a passage as a thesis committee member would.
You receive: the passage and its chapter context.
You return JSON:
{
  "strengths": string[],
  "weaknesses": { "issue": string, "severity": "minor"|"moderate"|"major", "excerpt": string, "suggestion": string }[],
  "missing": string[],
  "oneLineVerdict": string
}`,

  defense: `Task: simulate a thesis defense.
You receive: the thesis summary (question, design, findings, contribution, limitations), and the number / difficulty of questions to generate.
You return JSON:
{
  "questions": { "question": string, "angle": "methodology"|"literature"|"contribution"|"ethics"|"statistics"|"theory"|"limitations"|"future_work", "difficulty": 1|2|3|4|5, "whyThisMatters": string, "modelAnswer": string }[]
}
Vary angles. At least one question must be a steel-man of the weakest part of the thesis. Model answers use the four-step template: restate → direct answer → evidence from thesis → limit of the answer.`,

  projectPlan: `Task: build a realistic thesis timeline.
You receive: the student's start date, submission deadline, degree level, current stage, and weekly hours available.
You return JSON:
{
  "milestones": { "title": string, "description": string, "dueISO": string, "dependsOn": string[] }[],
  "weeklyRoutine": string,
  "riskFlags": string[]
}
Timeline includes: proposal approval, IRB, literature saturation, pilot, data collection, analysis, draft chapters, supervisor revisions, submission, defense.`,

  freeform: `Task: answer the student's question or draft what they ask for, staying in the advisor persona.`,
} as const;

export type StageKey = keyof typeof STAGES;
