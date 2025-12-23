"use client";

import { IconBase } from "./IconBase";

const navy = "#0F2E6D";
const light = "#3DA0FF";

export function SearchIcon({ size = 20, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase size={size} {...rest}>
      <circle cx="22" cy="22" r="11" stroke={navy} strokeWidth="4" fill="white" opacity="0.95" />
      <path d="M29 29l7 7" stroke={navy} strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="30" cy="18" rx="6" ry="4" fill={light} opacity="0.8" />
      <path d="M10 16c3-2 6-3 9-3" stroke={light} strokeWidth="3" strokeLinecap="round" />
      <path d="M34 18c1.6 1 2.6 2.5 3.4 3.7" stroke={light} strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}
