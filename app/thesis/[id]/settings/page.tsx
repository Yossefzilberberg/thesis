"use client";

import { Button, Card, Input, Label, Select } from "@/components/ui/primitives";
import { useThesisStore } from "@/lib/store";
import { deleteThesis, exportThesis } from "@/lib/storage";
import { useRouter } from "next/navigation";
import type { CitationStyle, Thesis } from "@/lib/types";

export default function SettingsPage() {
  const thesis = useThesisStore((s) => s.current);
  const patch = useThesisStore((s) => s.patch);
  const refreshIndex = useThesisStore((s) => s.refreshIndex);
  const router = useRouter();

  if (!thesis) return null;

  function update<K extends keyof Thesis>(key: K, value: Thesis[K]) {
    void patch({ [key]: value } as Partial<Thesis>);
  }

  async function doExport() {
    const json = await exportThesis(thesis!.id);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${thesis!.title || "thesis"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function doDelete() {
    if (!confirm("Delete this thesis permanently? This cannot be undone.")) return;
    await deleteThesis(thesis!.id);
    await refreshIndex();
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="font-serif text-2xl font-semibold text-ink-900">Settings</h1>

      <Card className="mt-6 space-y-3">
        <div>
          <Label>Title</Label>
          <Input value={thesis.title} onChange={(e) => update("title", e.target.value)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Citation style</Label>
            <Select
              value={thesis.citationStyle}
              onChange={(e) => update("citationStyle", e.target.value as CitationStyle)}
            >
              <option value="apa7">APA 7</option>
              <option value="harvard">Harvard</option>
              <option value="chicago_author_date">Chicago 17 (author-date)</option>
              <option value="chicago_notes">Chicago 17 (notes)</option>
              <option value="mla9">MLA 9</option>
              <option value="vancouver">Vancouver</option>
              <option value="ieee">IEEE</option>
            </Select>
          </div>
          <div>
            <Label>Target word count</Label>
            <Input
              type="number"
              value={thesis.settings.targetWordCount}
              onChange={(e) =>
                update("settings", {
                  ...thesis.settings,
                  targetWordCount: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-ink-900">Institution</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Name</Label>
            <Input
              value={thesis.institution.name}
              onChange={(e) =>
                update("institution", { ...thesis.institution, name: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Department</Label>
            <Input
              value={thesis.institution.department ?? ""}
              onChange={(e) =>
                update("institution", { ...thesis.institution, department: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Supervisor</Label>
            <Input
              value={thesis.institution.supervisor ?? ""}
              onChange={(e) =>
                update("institution", { ...thesis.institution, supervisor: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Country</Label>
            <Input
              value={thesis.institution.country}
              onChange={(e) =>
                update("institution", { ...thesis.institution, country: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Font family</Label>
            <Input
              value={thesis.institution.fontFamily}
              onChange={(e) =>
                update("institution", { ...thesis.institution, fontFamily: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Font size (pt)</Label>
            <Input
              type="number"
              value={thesis.institution.fontSizePt}
              onChange={(e) =>
                update("institution", {
                  ...thesis.institution,
                  fontSizePt: Number(e.target.value),
                })
              }
            />
          </div>
          <div>
            <Label>Line spacing</Label>
            <Select
              value={thesis.institution.lineSpacing}
              onChange={(e) =>
                update("institution", {
                  ...thesis.institution,
                  lineSpacing: Number(e.target.value) as 1 | 1.15 | 1.5 | 2,
                })
              }
            >
              <option value={1}>Single</option>
              <option value={1.15}>1.15</option>
              <option value={1.5}>1.5 (Israeli default)</option>
              <option value={2}>Double</option>
            </Select>
          </div>
          <div>
            <Label>Bilingual abstract (Hebrew + English)</Label>
            <Select
              value={thesis.institution.bilingualAbstract ? "yes" : "no"}
              onChange={(e) =>
                update("institution", {
                  ...thesis.institution,
                  bilingualAbstract: e.target.value === "yes",
                })
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-ink-900">Writing features</h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={thesis.settings.enableHumanizer}
              onChange={(e) =>
                update("settings", { ...thesis.settings, enableHumanizer: e.target.checked })
              }
            />
            Humanizer pass available from the chapter editor
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={thesis.settings.enableInlineCritique}
              onChange={(e) =>
                update("settings", { ...thesis.settings, enableInlineCritique: e.target.checked })
              }
            />
            Inline critique available from the chapter editor
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={thesis.settings.doubleBlindMode}
              onChange={(e) =>
                update("settings", { ...thesis.settings, doubleBlindMode: e.target.checked })
              }
            />
            Double-blind export mode (strip author and institution from exports)
          </label>
        </div>
      </Card>

      <Card className="mt-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink-900">Export / delete</h3>
          <p className="text-xs text-ink-500">
            Export a full JSON snapshot of this thesis including all references,
            chapters, and AI artefacts.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={doExport}>
            Export JSON
          </Button>
          <Button variant="danger" onClick={doDelete}>
            Delete thesis
          </Button>
        </div>
      </Card>
    </div>
  );
}
