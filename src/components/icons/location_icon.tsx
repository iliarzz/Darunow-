"use client";

import { IconBase } from "./IconBase";

const navy = "#0F2E6D";
const light = "#3DA0FF";

export function IconLocation({ size = 20, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase size={size} {...rest}>
      <path
        d="M24 6c6.6 0 12 5.2 12 11.6C36 27 24 42 24 42S12 27 12 17.6C12 11.2 17.4 6 24 6Z"
        fill={navy}
      />
      <circle cx="24" cy="18" r="6" fill="white" />
      <ellipse cx="28" cy="16" rx="4" ry="3" fill={light} opacity="0.85" />
      <path d="M10 16c2-1.1 4-1.6 6.5-1.6" stroke={light} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 13.5c2 .4 3.6 1 4.8 1.8" stroke={light} strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}
