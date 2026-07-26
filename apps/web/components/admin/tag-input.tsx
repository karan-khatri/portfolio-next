"use client";

import { useId, useState } from "react";
import { LuX } from "react-icons/lu";
import { Label } from "@/components/ui/label";
import styles from "./tag-input.module.scss";

export function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const inputId = useId();
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitDraft();
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div className={styles.field}>
      <Label htmlFor={inputId}>{label}</Label>
      <div className={styles.pillField}>
        {value.map((tag) => (
          <span key={tag} className={styles.pill}>
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className={styles.pillRemove}
              aria-label={`Remove ${tag}`}
            >
              <LuX className={styles.pillRemoveIcon} />
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitDraft}
          placeholder={value.length === 0 ? placeholder : undefined}
          className={styles.input}
        />
      </div>
    </div>
  );
}
