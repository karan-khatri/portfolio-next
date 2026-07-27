"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { TableKit } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import {
  LuBold,
  LuItalic,
  LuUnderline,
  LuStrikethrough,
  LuSubscript,
  LuSuperscript,
  LuHighlighter,
  LuList,
  LuListOrdered,
  LuListTodo,
  LuQuote,
  LuCode,
  LuLink,
  LuImage,
  LuTable,
  LuMinus,
  LuUndo2,
  LuRedo2,
  LuAlignLeft,
  LuAlignCenter,
  LuAlignRight,
  LuAlignJustify,
  LuPaintbrush,
  LuColumns3,
  LuRows3,
  LuTrash2,
} from "react-icons/lu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from "./rich-text-editor.module.scss";

const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const;
const HIGHLIGHT_COLORS = ["#fde68a", "#bbf7d0", "#bfdbfe", "#fecaca", "#e9d5ff"];
const TEXT_COLORS = [
  "#111827",
  "#dc2626",
  "#d97706",
  "#16a34a",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      data-active={active || undefined}
      className={styles.toolbarButton}
    >
      {children}
    </button>
  );
}

function BlockFormatSelect({ editor }: { editor: Editor }) {
  const activeLevel = HEADING_LEVELS.find((level) => editor.isActive("heading", { level }));
  const value = activeLevel ? `h${activeLevel}` : "p";

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (!next || next === "p") {
          editor.chain().focus().setParagraph().run();
          return;
        }
        const level = Number(next.slice(1)) as (typeof HEADING_LEVELS)[number];
        editor.chain().focus().toggleHeading({ level }).run();
      }}
    >
      <SelectTrigger size="sm" className={styles.blockSelect}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="p">Paragraph</SelectItem>
        {HEADING_LEVELS.map((level) => (
          <SelectItem key={level} value={`h${level}`}>
            Heading {level}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ColorMenu({
  editor,
  icon,
  label,
  colors,
  isActive,
  apply,
  clear,
}: {
  editor: Editor;
  icon: React.ReactNode;
  label: string;
  colors: string[];
  isActive: boolean;
  apply: (color: string) => void;
  clear: () => void;
}) {
  return (
    <div className={styles.colorMenu}>
      <ToolbarButton label={label} active={isActive} onClick={() => {}}>
        {icon}
      </ToolbarButton>
      <div className={styles.colorSwatches}>
        {colors.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={`${label}: ${color}`}
            className={styles.colorSwatch}
            style={{ backgroundColor: color }}
            onMouseDown={(event) => {
              event.preventDefault();
              apply(color);
              editor.chain().focus();
            }}
          />
        ))}
        <button
          type="button"
          aria-label={`Clear ${label.toLowerCase()}`}
          className={styles.colorClear}
          onMouseDown={(event) => {
            event.preventDefault();
            clear();
            editor.chain().focus();
          }}
        >
          <LuMinus className={styles.icon} />
        </button>
      </div>
    </div>
  );
}

function TableControls({ editor }: { editor: Editor }) {
  if (!editor.isActive("table")) return null;
  return (
    <>
      <span className={styles.divider} />
      <ToolbarButton
        label="Add column after"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
      >
        <LuColumns3 className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Add row after"
        onClick={() => editor.chain().focus().addRowAfter().run()}
      >
        <LuRows3 className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Delete table"
        onClick={() => editor.chain().focus().deleteTable().run()}
      >
        <LuTrash2 className={styles.icon} />
      </ToolbarButton>
    </>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  function setLink() {
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  function insertImage() {
    const url = window.prompt("Image URL");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  }

  function insertTable() {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }

  return (
    <div className={styles.toolbar}>
      <BlockFormatSelect editor={editor} />
      <span className={styles.divider} />
      <ToolbarButton
        label="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <LuBold className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <LuItalic className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <LuUnderline className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <LuStrikethrough className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Inline code"
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <LuCode className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Subscript"
        active={editor.isActive("subscript")}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        <LuSubscript className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Superscript"
        active={editor.isActive("superscript")}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        <LuSuperscript className={styles.icon} />
      </ToolbarButton>
      <span className={styles.divider} />
      <ColorMenu
        editor={editor}
        label="Highlight"
        icon={<LuHighlighter className={styles.icon} />}
        colors={HIGHLIGHT_COLORS}
        isActive={editor.isActive("highlight")}
        apply={(color) => editor.chain().focus().setHighlight({ color }).run()}
        clear={() => editor.chain().focus().unsetHighlight().run()}
      />
      <ColorMenu
        editor={editor}
        label="Text color"
        icon={<LuPaintbrush className={styles.icon} />}
        colors={TEXT_COLORS}
        isActive={editor.isActive("textStyle")}
        apply={(color) => editor.chain().focus().setColor(color).run()}
        clear={() => editor.chain().focus().unsetColor().run()}
      />
      <span className={styles.divider} />
      <ToolbarButton
        label="Align left"
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        <LuAlignLeft className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Align center"
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        <LuAlignCenter className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Align right"
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        <LuAlignRight className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Justify"
        active={editor.isActive({ textAlign: "justify" })}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
      >
        <LuAlignJustify className={styles.icon} />
      </ToolbarButton>
      <span className={styles.divider} />
      <ToolbarButton
        label="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <LuList className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Ordered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <LuListOrdered className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Task list"
        active={editor.isActive("taskList")}
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <LuListTodo className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <LuQuote className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <LuCode className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton label="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <LuMinus className={styles.icon} />
      </ToolbarButton>
      <span className={styles.divider} />
      <ToolbarButton label="Link" active={editor.isActive("link")} onClick={setLink}>
        <LuLink className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton label="Image" onClick={insertImage}>
        <LuImage className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton label="Table" onClick={insertTable}>
        <LuTable className={styles.icon} />
      </ToolbarButton>
      <TableControls editor={editor} />
      <span className={styles.divider} />
      <ToolbarButton
        label="Undo"
        disabled={!editor.can().undo()}
        onClick={() => editor.chain().focus().undo().run()}
      >
        <LuUndo2 className={styles.icon} />
      </ToolbarButton>
      <ToolbarButton
        label="Redo"
        disabled={!editor.can().redo()}
        onClick={() => editor.chain().focus().redo().run()}
      >
        <LuRedo2 className={styles.icon} />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
      Subscript,
      Superscript,
      Highlight,
      TextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: false } }),
      Image.configure({ allowBase64: false }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: styles.content,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={styles.wrapper}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
