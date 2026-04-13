// Core domain types for the thesis writing system.
// Everything the user produces lives inside a `Thesis` object that is
// persisted locally (IndexedDB) and rendered through the editor pipeline.

export type ThesisField =
  | "business"
  | "computer_science"
  | "data_science"
  | "economics"
  | "education"
  | "engineering"
  | "health_sciences"
  | "humanities"
  | "law"
  | "life_sciences"
  | "management"
  | "marketing"
  | "political_science"
  | "psychology"
  | "public_policy"
  | "social_sciences"
  | "sociology"
  | "other";

export type DegreeLevel = "bachelor" | "master" | "phd" | "postdoc";

export type ResearchParadigm =
  | "positivist"
  | "post_positivist"
  | "interpretivist"
  | "critical"
  | "pragmatist";

export type ResearchApproach = "quantitative" | "qualitative" | "mixed_methods";

export type ResearchDesign =
  | "experimental"
  | "quasi_experimental"
  | "correlational"
  | "survey"
  | "case_study"
  | "ethnography"
  | "phenomenology"
  | "grounded_theory"
  | "action_research"
  | "narrative"
  | "systematic_review"
  | "meta_analysis"
  | "design_science"
  | "historical";

export type CitationStyle =
  | "apa7"
  | "harvard"
  | "chicago_author_date"
  | "chicago_notes"
  | "mla9"
  | "vancouver"
  | "ieee";

export type ThesisInstitution = {
  name: string;
  department?: string;
  country: string; // e.g. "Israel"
  supervisor?: string;
  // Formatting requirements commonly imposed by Israeli universities.
  marginsCm: { top: number; right: number; bottom: number; left: number };
  lineSpacing: 1 | 1.15 | 1.5 | 2;
  fontFamily: string;
  fontSizePt: number;
  preferredCitationStyle: CitationStyle;
  bilingualAbstract?: boolean; // Hebrew + English abstract requirement
};

export type ResearchQuestion = {
  id: string;
  text: string;
  kind: "main" | "sub";
  rationale?: string;
  measurable: boolean;
  feasibility?: "high" | "medium" | "low";
  // Auto-generated quality signals from the AI critique pass.
  critique?: {
    clarity: number;
    originality: number;
    feasibility: number;
    significance: number;
    notes: string[];
  };
};

export type Hypothesis = {
  id: string;
  label: string; // e.g. H1, H2a
  statement: string;
  kind: "null" | "alternative" | "directional" | "non_directional";
  variables: { independent: string[]; dependent: string[]; moderator?: string[]; mediator?: string[] };
};

export type GapAnalysisItem = {
  id: string;
  theme: string;
  description: string;
  evidenceSources: string[];
  severity: "minor" | "moderate" | "substantial";
};

export type Construct = {
  id: string;
  name: string;
  definition: string;
  operationalization: string;
  measurementScale?: string; // e.g. "5-point Likert"
  validatedInstrument?: string; // e.g. "UTAUT (Venkatesh et al., 2003)"
};

export type Reference = {
  id: string;
  type:
    | "journal_article"
    | "book"
    | "book_chapter"
    | "conference_paper"
    | "thesis"
    | "report"
    | "website"
    | "dataset"
    | "preprint";
  authors: { family: string; given: string }[];
  year: number | string;
  title: string;
  containerTitle?: string; // journal, book, conference
  publisher?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  isbn?: string;
  editors?: { family: string; given: string }[];
  edition?: string;
  place?: string;
  // Metadata the system uses but never cites without user confirmation.
  verified: boolean; // user has confirmed the source exists
  qualitySignals?: {
    impactFactor?: number;
    citationCount?: number;
    quartile?: "Q1" | "Q2" | "Q3" | "Q4";
    peerReviewed?: boolean;
  };
  notes?: string;
  tags?: string[];
};

export type CitationInsertion = {
  id: string;
  referenceId: string;
  locator?: string; // page / chapter
  prefix?: string;
  suffix?: string;
  suppressAuthor?: boolean;
};

export type ChapterKey =
  | "title_page"
  | "abstract"
  | "acknowledgements"
  | "toc"
  | "introduction"
  | "literature_review"
  | "theoretical_framework"
  | "methodology"
  | "findings"
  | "discussion"
  | "conclusion"
  | "references"
  | "appendices";

export type Chapter = {
  key: ChapterKey;
  title: string;
  order: number;
  // TipTap JSON content.
  content: Record<string, unknown> | null;
  wordTarget?: number;
  lastEditedAt?: string;
  aiNotes?: string[];
};

export type Instrument = {
  id: string;
  kind: "survey" | "interview_guide" | "experiment_protocol" | "observation_grid" | "behavioral_metric";
  title: string;
  items: {
    id: string;
    prompt: string;
    responseFormat?: string;
    sourceReference?: string;
    construct?: string;
  }[];
  pilotNotes?: string;
  ethicsNotes?: string;
};

export type DataSource = {
  id: string;
  label: string;
  kind: "survey_export" | "api" | "analytics" | "transcripts" | "dataset" | "manual";
  description: string;
  rowsCollected?: number;
  cleaningLog?: string[];
};

export type AnalysisPlan = {
  id: string;
  question: string; // ties to a research question
  technique: string; // e.g. "Two-way ANOVA", "Thematic Analysis (Braun & Clarke, 2006)"
  assumptions: string[];
  software: string[]; // e.g. ["R 4.4", "SPSS 29"]
  outputs: string[];
};

export type Milestone = {
  id: string;
  title: string;
  dueDate?: string;
  status: "not_started" | "in_progress" | "blocked" | "done";
  dependencies?: string[];
  owner?: string;
};

export type DefenseQuestion = {
  id: string;
  question: string;
  angle:
    | "methodology"
    | "literature"
    | "contribution"
    | "ethics"
    | "statistics"
    | "theory"
    | "limitations"
    | "future_work";
  difficulty: 1 | 2 | 3 | 4 | 5;
  suggestedResponse?: string;
};

export type Thesis = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  workingTitle?: string;
  language: "en";
  field: ThesisField;
  degreeLevel: DegreeLevel;
  institution: ThesisInstitution;
  paradigm?: ResearchParadigm;
  approach?: ResearchApproach;
  design?: ResearchDesign;
  researchQuestions: ResearchQuestion[];
  hypotheses: Hypothesis[];
  gapAnalysis: GapAnalysisItem[];
  constructs: Construct[];
  references: Reference[];
  chapters: Chapter[];
  instruments: Instrument[];
  dataSources: DataSource[];
  analysisPlans: AnalysisPlan[];
  milestones: Milestone[];
  defenseBank: DefenseQuestion[];
  citationStyle: CitationStyle;
  // Free-form settings that the editor surfaces.
  settings: {
    enableHumanizer: boolean; // rewrite passes that remove AI-sounding cadence
    enableInlineCritique: boolean;
    doubleBlindMode: boolean; // strip identifying details for review copies
    targetWordCount: number;
  };
};
