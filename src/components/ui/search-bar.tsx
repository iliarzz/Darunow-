"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
};

export function SearchBar({ value, onChange, placeholder, onClear, className }: SearchBarProps) {
  return (
    <div
      className={cn(
        "flex min-h-[48px] items-center gap-2 rounded-full border border-border bg-surface-1 px-3 shadow-xs focus-within:shadow-[var(--focus)]",
        className,
      )}
    >
      <Search className="h-4 w-4 text-muted" />
      <input
        className="w-full bg-transparent text-[14px] text-primary-900 placeholder:text-muted focus-visible:outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onClear?.();
            onChange("");
          }}
          className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-surface-3 focus-visible:outline-none focus-visible:shadow-[var(--focus)]"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
