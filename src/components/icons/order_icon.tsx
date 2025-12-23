"use client";

import { IconBase } from "./IconBase";

const navy = "#0F2E6D";
const light = "#3DA0FF";

export function OrderIcon({ size = 20, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase size={size} {...rest}>
      <rect x="12" y="8" width="24" height="32" rx="4" fill={navy} />
      <rect x="16" y="14" width="16" height="4" rx="2" fill="white" />
      <rect x="16" y="22" width="10" height="3" rx="1.5" fill="white" opacity="0.9" />
      <rect x="16" y="28" width="12" height="3" rx="1.5" fill="white" opacity="0.85" />
      <ellipse cx="31" cy="18" rx="6" ry="4.5" fill={light} opacity="0.8" />
      <path d="M10 16c2-1 3.5-1.5 5.5-1.5" stroke={light} strokeWidth="3" strokeLinecap="round" />
      <path d="M34 12c1.6.4 3 .9 4 1.6" stroke={light} strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}
