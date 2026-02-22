"use client";

import { useEffect } from "react";

type ScrollSnapProps = {
  enabled?: boolean;
  paddingTop?: number;
};

export function ScrollSnap({ enabled = true, paddingTop = 72 }: ScrollSnapProps) {
  useEffect(() => {
    if (!enabled) return;
    const media = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    if (!media.matches) return;
    const root = document.documentElement;
    const prevSnapType = root.style.scrollSnapType;
    const prevPadding = root.style.scrollPaddingTop;
    root.style.scrollSnapType = "y proximity";
    root.style.scrollPaddingTop = `${paddingTop}px`;
    return () => {
      root.style.scrollSnapType = prevSnapType;
      root.style.scrollPaddingTop = prevPadding;
    };
  }, [enabled, paddingTop]);

  return null;
}
