import { v4 as uuid } from "uuid";
import type { Chapter, Thesis, ThesisInstitution } from "./types";

// Israeli university defaults drawn from the most common guides
// (Tel Aviv University, Hebrew University of Jerusalem, Technion,
// Bar-Ilan, Haifa, Reichman, Ben-Gurion). Users override these
// per-institution inside the settings panel.
export const ISRAELI_INSTITUTION_DEFAULTS: ThesisInstitution = {
  name: "",
  department: "",
  country: "Israel",
  marginsCm: { top: 2.5, right: 2.5, bottom: 2.5, left: 3.5 },
  lineSpacing: 1.5,
  fontFamily: "Times New Roman",
  fontSizePt: 12,
  preferredCitationStyle: "apa7",
  bilingualAbstract: true,
};

export const DEFAULT_CHAPTERS: Chapter[] = [
  { key: "title_page", title: "Title Page", order: 0, content: null },
  { key: "abstract", title: "Abstract", order: 1, content: null, wordTarget: 300 },
  { key: "acknowledgements", title: "Acknowledgements", order: 2, content: null },
  { key: "toc", title: "Table of Contents", order: 3, content: null },
  { key: "introduction", title: "1. Introduction", order: 4, content: null, wordTarget: 3000 },
  { key: "literature_review", title: "2. Literature Review", order: 5, content: null, wordTarget: 8000 },
  { key: "theoretical_framework", title: "3. Theoretical Framework", order: 6, content: null, wordTarget: 3000 },
  { key: "methodology", title: "4. Methodology", order: 7, content: null, wordTarget: 5000 },
  { key: "findings", title: "5. Findings", order: 8, content: null, wordTarget: 5000 },
  { key: "discussion", title: "6. Discussion", order: 9, content: null, wordTarget: 4000 },
  { key: "conclusion", title: "7. Conclusion", order: 10, content: null, wordTarget: 1500 },
  { key: "references", title: "References", order: 11, content: null },
  { key: "appendices", title: "Appendices", order: 12, content: null },
];

export function createEmptyThesis(partial?: Partial<Thesis>): Thesis {
  const now = new Date().toISOString();
  return {
    id: uuid(),
    createdAt: now,
    updatedAt: now,
    title: partial?.title ?? "Untitled Thesis",
    workingTitle: partial?.workingTitle ?? "",
    language: "en",
    field: partial?.field ?? "other",
    degreeLevel: partial?.degreeLevel ?? "master",
    institution: partial?.institution ?? { ...ISRAELI_INSTITUTION_DEFAULTS },
    paradigm: partial?.paradigm,
    approach: partial?.approach,
    design: partial?.design,
    researchQuestions: [],
    hypotheses: [],
    gapAnalysis: [],
    constructs: [],
    references: [],
    chapters: DEFAULT_CHAPTERS.map((c) => ({ ...c })),
    instruments: [],
    dataSources: [],
    analysisPlans: [],
    milestones: [],
    defenseBank: [],
    citationStyle: partial?.citationStyle ?? "apa7",
    settings: {
      enableHumanizer: true,
      enableInlineCritique: true,
      doubleBlindMode: false,
      targetWordCount: 25000,
    },
    ...partial,
  } as Thesis;
}
