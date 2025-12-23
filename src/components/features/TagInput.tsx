"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Chip } from "@/components/ui/chip";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
};

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const next = draft.trim();
    if (!next) return;
    if (value.includes(next)) {
      setDraft("");
      return;
    }
    onChange([next, ...value]);
    setDraft("");
  };

  const removeTag = (tag: string) => onChange(value.filter((t) => t !== tag));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="rounded-full"
        />
        <Button variant="outline" size="sm" className="rounded-full" onClick={addTag}>
          افزودن
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Chip key={tag} selected className="bg-accent-200/60 text-primary-800" onClick={() => removeTag(tag)}>
            {tag}
            <X className="h-3 w-3" />
          </Chip>
        ))}
        {value.length === 0 && <p className="text-xs text-muted">چیزی وارد نشده است.</p>}
      </div>
    </div>
  );
}
