"use client";

import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { Badge, Button, Card, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { formatBibliography, formatReference } from "@/lib/api";
import { useThesisStore } from "@/lib/store";
import type { Reference } from "@/lib/types";

const TYPES: Reference["type"][] = [
  "journal_article",
  "book",
  "book_chapter",
  "conference_paper",
  "thesis",
  "report",
  "website",
  "dataset",
  "preprint",
];

function emptyRef(): Reference {
  return {
    id: uuid(),
    type: "journal_article",
    authors: [{ family: "", given: "" }],
    year: new Date().getFullYear(),
    title: "",
    verified: false,
  };
}

export default function ReferencesPage() {
  const thesis = useThesisStore((s) => s.current);
  const upsert = useThesisStore((s) => s.upsertReference);
  const remove = useThesisStore((s) => s.removeReference);
  const [editing, setEditing] = useState<Reference | null>(null);
  const [biblio, setBiblio] = useState<string[]>([]);

  useEffect(() => {
    if (!thesis) return;
    formatBibliography(thesis.references, thesis.citationStyle).then(setBiblio).catch(() => setBiblio([]));
  }, [thesis]);

  if (!thesis) return null;

  async function save() {
    if (!editing) return;
    // Any reference the user saves via this form is considered verified by
    // the user's confirmation — they typed the metadata in.
    const ref = { ...editing, verified: true };
    await upsert(ref);
    setEditing(null);
  }

  function addAuthor() {
    if (!editing) return;
    setEditing({ ...editing, authors: [...editing.authors, { family: "", given: "" }] });
  }
  function removeAuthor(i: number) {
    if (!editing) return;
    setEditing({ ...editing, authors: editing.authors.filter((_, idx) => idx !== i) });
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-ink-900">References</h1>
          <p className="mt-1 text-sm text-ink-600">
            The source of truth for every in-text citation. Only references you
            verify here may be cited in the draft.
          </p>
        </div>
        <Button onClick={() => setEditing(emptyRef())}>+ Add reference</Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <h3 className="mb-3 text-sm font-semibold text-ink-900">Reference details</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Type</Label>
              <Select
                value={editing.type}
                onChange={(e) => setEditing({ ...editing, type: e.target.value as Reference["type"] })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Year</Label>
              <Input
                value={String(editing.year)}
                onChange={(e) =>
                  setEditing({
                    ...editing,
                    year: /^\d+$/.test(e.target.value) ? Number(e.target.value) : e.target.value,
                  })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Authors</Label>
              <div className="space-y-2">
                {editing.authors.map((a, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      placeholder="Family / surname"
                      value={a.family}
                      onChange={(e) => {
                        const authors = [...editing.authors];
                        authors[i] = { ...authors[i], family: e.target.value };
                        setEditing({ ...editing, authors });
                      }}
                    />
                    <Input
                      placeholder="Given / first"
                      value={a.given}
                      onChange={(e) => {
                        const authors = [...editing.authors];
                        authors[i] = { ...authors[i], given: e.target.value };
                        setEditing({ ...editing, authors });
                      }}
                    />
                    <Button variant="ghost" size="sm" onClick={() => removeAuthor(i)}>
                      ✕
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={addAuthor}>
                  + Add author
                </Button>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label>Container (journal / book / conference)</Label>
              <Input value={editing.containerTitle ?? ""} onChange={(e) => setEditing({ ...editing, containerTitle: e.target.value })} />
            </div>
            <div>
              <Label>Volume</Label>
              <Input value={editing.volume ?? ""} onChange={(e) => setEditing({ ...editing, volume: e.target.value })} />
            </div>
            <div>
              <Label>Issue</Label>
              <Input value={editing.issue ?? ""} onChange={(e) => setEditing({ ...editing, issue: e.target.value })} />
            </div>
            <div>
              <Label>Pages</Label>
              <Input value={editing.pages ?? ""} onChange={(e) => setEditing({ ...editing, pages: e.target.value })} />
            </div>
            <div>
              <Label>DOI</Label>
              <Input value={editing.doi ?? ""} onChange={(e) => setEditing({ ...editing, doi: e.target.value })} />
            </div>
            <div>
              <Label>Publisher</Label>
              <Input value={editing.publisher ?? ""} onChange={(e) => setEditing({ ...editing, publisher: e.target.value })} />
            </div>
            <div>
              <Label>Place</Label>
              <Input value={editing.place ?? ""} onChange={(e) => setEditing({ ...editing, place: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>URL</Label>
              <Input value={editing.url ?? ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Notes</Label>
              <Textarea rows={2} value={editing.notes ?? ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} />
            </div>
          </div>
          <div className="mt-3 flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={save} disabled={!editing.title || !editing.authors[0]?.family}>
              Save reference
            </Button>
          </div>
        </Card>
      )}

      <h2 className="mb-2 font-serif text-lg font-semibold text-ink-900">
        Library ({thesis.references.length})
      </h2>
      <div className="space-y-2">
        {thesis.references.map((r, i) => (
          <div key={r.id} className="rounded border border-ink-200 bg-white p-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-serif text-ink-900">
                  {r.authors.map((a) => a.family).join(", ")} ({r.year}).{" "}
                  <span className="italic">{r.title}</span>
                  {r.containerTitle ? `. ${r.containerTitle}` : ""}.
                </div>
                <div className="mt-1 flex gap-1">
                  <Badge>{r.type.replace(/_/g, " ")}</Badge>
                  {r.verified ? <Badge>verified</Badge> : <Badge>unverified</Badge>}
                  <PreviewChip ref={r} />
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(r)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    if (confirm("Remove this reference?")) await remove(r.id);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
            {biblio[i] && (
              <div
                className="mt-2 rounded bg-ink-50 px-3 py-2 text-xs text-ink-700"
                dangerouslySetInnerHTML={{ __html: renderItalic(biblio[i]) }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewChip({ ref }: { ref: Reference }) {
  const thesis = useThesisStore((s) => s.current);
  const [preview, setPreview] = useState<string>("");
  useEffect(() => {
    if (!thesis) return;
    formatReference(ref, thesis.citationStyle).then((s) =>
      setPreview(s.replace(/⟨\/?i⟩/g, "").slice(0, 80)),
    );
  }, [ref, thesis]);
  return <Badge>{preview || "format…"}</Badge>;
}

function renderItalic(s: string) {
  return s.replace(/⟨i⟩/g, "<em>").replace(/⟨\/i⟩/g, "</em>");
}
