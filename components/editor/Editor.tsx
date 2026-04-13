"use client";

import CharacterCount from "@tiptap/extension-character-count";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Toolbar } from "./Toolbar";

type Props = {
  value: Record<string, unknown> | null;
  onChange: (doc: Record<string, unknown>, text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
};

export function Editor({ value, onChange, placeholder, autoFocus, className }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "underline" } }),
      Highlight,
      Typography,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({
        placeholder:
          placeholder ??
          "Start typing. Use the toolbar above or press ⌘/Ctrl+K to ask the research advisor.",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
    ],
    content: value ?? undefined,
    autofocus: autoFocus,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as Record<string, unknown>, editor.getText());
    },
  });

  useEffect(() => {
    if (!editor) return;
    const current = editor.getJSON();
    // Only reset content when switching chapters, not on every keystroke.
    if (value && JSON.stringify(current) === "{}") {
      editor.commands.setContent(value);
    }
  }, [editor, value]);

  const insertCitation = useCallback(
    (label: string, refId: string) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .insertContent(
          `<span class="citation-chip" data-ref="${refId}">${label}</span>&nbsp;`,
        )
        .run();
    },
    [editor],
  );

  return (
    <div className={cn("flex flex-col", className)}>
      <Toolbar editor={editor} insertCitation={insertCitation} />
      <div className="rounded-b-md border border-t-0 border-ink-200 bg-white px-10 py-8 shadow-sm">
        <EditorContent editor={editor} />
        {editor && (
          <div className="mt-6 flex justify-end border-t border-ink-100 pt-3 text-xs text-ink-500">
            {editor.storage.characterCount.words()} words ·{" "}
            {editor.storage.characterCount.characters()} characters
          </div>
        )}
      </div>
    </div>
  );
}
