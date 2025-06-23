"use client";

import { useEditor, EditorContent, EditorContext } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Superscript from "@tiptap/extension-superscript";
import Subscript from "@tiptap/extension-subscript";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Link } from "@/components/tiptap-extension/link-extension";

import { MarkButton } from "@/components/tiptap-ui/mark-button";
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu";
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button";
import { LinkPopover } from "@/components/tiptap-ui/link-popover";
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button";
import { ColorInputButton } from "@/components/tiptap-ui/color-input-button";

import "@/components/tiptap-node/code-block-node/code-block-node.scss";
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss";

export default function SimpleEditor({
  value,
  onChange,
  onBlur,
  readOnly = false,
}: {
  value: string;
  onChange?: (val: string) => void;
  onBlur?: () => void;
  readOnly?: boolean;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!readOnly && onChange) {
        onChange(editor.getHTML());
      }
    },
    editable: !readOnly,
    autofocus: false,
    injectCSS: true,
    immediatelyRender: false,
  });

  if (!editor) return <div>Chargement de l’éditeur…</div>;

  return (
    <EditorContext.Provider value={{ editor }}>
      <div className="space-y-2">
        {readOnly ? (
            <></>
          ) : (
            <div className="flex flex-wrap gap-2 border border-gray-200 rounded p-2">
              {/* Undo / Redo */}
              <UndoRedoButton action="undo" />
              <UndoRedoButton action="redo" />

              {/* Headings & marks */}
              <HeadingDropdownMenu levels={[1, 2, 3, 4, 5, 6]} />
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="underline" />
              <MarkButton type="strike" />
              <MarkButton type="code" />
              <MarkButton type="superscript" />
              <MarkButton type="subscript" />

              {/* Text align */}
              <TextAlignButton align="left" />
              <TextAlignButton align="center" />
              <TextAlignButton align="right" />
              <TextAlignButton align="justify" />

              {/* Link */}
              <LinkPopover />

              {/* Color */}
              <ColorInputButton />
            </div>
          )}
        <div className="border rounded min-h-[500px] p-3">
          <EditorContent
            editor={editor}
            onBlur={onBlur}
            role="presentation"
            className="control-showcase"
          />
        </div>
      </div>
    </EditorContext.Provider>
  );
}
