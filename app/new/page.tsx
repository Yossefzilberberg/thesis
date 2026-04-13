"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Shell } from "@/components/layout/Shell";
import { Button, Card, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { createEmptyThesis, ISRAELI_INSTITUTION_DEFAULTS } from "@/lib/defaults";
import { saveThesis } from "@/lib/storage";
import type {
  CitationStyle,
  DegreeLevel,
  ResearchApproach,
  ResearchDesign,
  ResearchParadigm,
  ThesisField,
} from "@/lib/types";

export default function NewThesisPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [idea, setIdea] = useState("");
  const [field, setField] = useState<ThesisField>("management");
  const [degreeLevel, setDegreeLevel] = useState<DegreeLevel>("master");
  const [institution, setInstitution] = useState(ISRAELI_INSTITUTION_DEFAULTS.name);
  const [supervisor, setSupervisor] = useState("");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("apa7");
  const [paradigm, setParadigm] = useState<ResearchParadigm>("post_positivist");
  const [approach, setApproach] = useState<ResearchApproach>("quantitative");
  const [design, setDesign] = useState<ResearchDesign>("survey");
  const [busy, setBusy] = useState(false);

  async function create() {
    setBusy(true);
    const t = createEmptyThesis({
      title: title || "Untitled Thesis",
      field,
      degreeLevel,
      paradigm,
      approach,
      design,
      citationStyle,
      institution: {
        ...ISRAELI_INSTITUTION_DEFAULTS,
        name: institution,
        supervisor,
        preferredCitationStyle: citationStyle,
      },
    });
    // Stash the seed idea in the introduction chapter's aiNotes so the
    // research-question panel has context.
    t.chapters = t.chapters.map((c) =>
      c.key === "introduction" ? { ...c, aiNotes: idea ? [idea] : [] } : c,
    );
    await saveThesis(t);
    setBusy(false);
    router.push(`/thesis/${t.id}/research-question`);
  }

  return (
    <Shell>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="mb-2 font-serif text-3xl font-semibold text-ink-900">
          Start a new thesis
        </h1>
        <p className="mb-8 text-sm text-ink-600">
          Four small steps. None of this is final — change anything later.
        </p>

        <div className="mb-8 flex items-center gap-2 text-xs">
          {["Topic", "Field", "Design", "Format"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold ${
                  i <= step ? "bg-ink-900 text-white" : "bg-ink-200 text-ink-600"
                }`}
              >
                {i + 1}
              </div>
              <span className={i === step ? "font-medium text-ink-900" : "text-ink-500"}>{label}</span>
              {i < 3 && <span className="text-ink-300">—</span>}
            </div>
          ))}
        </div>

        <Card>
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label>Working title</Label>
                <Input
                  placeholder="e.g., The effect of in-feed video pacing on purchase intent in Gen-Z consumers"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>The rough idea (the advisor will sharpen it in the next step)</Label>
                <Textarea
                  placeholder="Write freely. What puzzles you? What do you wish you understood? Which population, setting, or mechanism interests you?"
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={6}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Field</Label>
                <Select value={field} onChange={(e) => setField(e.target.value as ThesisField)}>
                  {[
                    "business",
                    "computer_science",
                    "data_science",
                    "economics",
                    "education",
                    "engineering",
                    "health_sciences",
                    "humanities",
                    "law",
                    "life_sciences",
                    "management",
                    "marketing",
                    "political_science",
                    "psychology",
                    "public_policy",
                    "social_sciences",
                    "sociology",
                    "other",
                  ].map((f) => (
                    <option key={f} value={f}>
                      {f.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Degree level</Label>
                <Select value={degreeLevel} onChange={(e) => setDegreeLevel(e.target.value as DegreeLevel)}>
                  <option value="bachelor">Bachelor&apos;s (BA/BSc)</option>
                  <option value="master">Master&apos;s (MA/MSc)</option>
                  <option value="phd">Doctorate (PhD)</option>
                  <option value="postdoc">Postdoctoral</option>
                </Select>
              </div>
              <div>
                <Label>Institution</Label>
                <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="e.g., Tel Aviv University" />
              </div>
              <div>
                <Label>Supervisor</Label>
                <Input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} placeholder="Dr. …" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label>Paradigm</Label>
                <Select value={paradigm} onChange={(e) => setParadigm(e.target.value as ResearchParadigm)}>
                  <option value="positivist">Positivist</option>
                  <option value="post_positivist">Post-positivist</option>
                  <option value="interpretivist">Interpretivist</option>
                  <option value="critical">Critical</option>
                  <option value="pragmatist">Pragmatist</option>
                </Select>
              </div>
              <div>
                <Label>Approach</Label>
                <Select value={approach} onChange={(e) => setApproach(e.target.value as ResearchApproach)}>
                  <option value="quantitative">Quantitative</option>
                  <option value="qualitative">Qualitative</option>
                  <option value="mixed_methods">Mixed methods</option>
                </Select>
              </div>
              <div>
                <Label>Design</Label>
                <Select value={design} onChange={(e) => setDesign(e.target.value as ResearchDesign)}>
                  {[
                    "experimental",
                    "quasi_experimental",
                    "correlational",
                    "survey",
                    "case_study",
                    "ethnography",
                    "phenomenology",
                    "grounded_theory",
                    "action_research",
                    "narrative",
                    "systematic_review",
                    "meta_analysis",
                    "design_science",
                    "historical",
                  ].map((d) => (
                    <option key={d} value={d}>
                      {d.replace(/_/g, " ")}
                    </option>
                  ))}
                </Select>
              </div>
              <p className="col-span-full text-xs text-ink-500">
                These are starting points. The methodology step will pressure-test
                them against your research question.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Citation style</Label>
                <Select value={citationStyle} onChange={(e) => setCitationStyle(e.target.value as CitationStyle)}>
                  <option value="apa7">APA 7 — social sciences (most common)</option>
                  <option value="harvard">Harvard — management / business</option>
                  <option value="chicago_author_date">Chicago 17 (author-date)</option>
                  <option value="chicago_notes">Chicago 17 (notes + bibliography)</option>
                  <option value="mla9">MLA 9 — humanities</option>
                  <option value="vancouver">Vancouver — medicine / health</option>
                  <option value="ieee">IEEE — engineering / CS</option>
                </Select>
              </div>
              <p className="col-span-full text-xs text-ink-500">
                Israeli institutional defaults applied: Times New Roman 12 pt,
                line spacing 1.5, margins 2.5 cm (3.5 cm left for binding),
                bilingual abstract enabled. Change anytime under Settings.
              </p>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              Back
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep((s) => s + 1)}>Continue</Button>
            ) : (
              <Button onClick={create} disabled={busy}>
                {busy ? "Creating…" : "Create thesis"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
