"use client";

import { IconBase } from "./IconBase";

const navy = "#0F2E6D";
const light = "#3DA0FF";

export function BasketIcon({ size = 20, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase size={size} {...rest}>
      <rect x="10" y="14" width="28" height="16" rx="3" fill={navy} />
      <ellipse cx="31" cy="18" rx="7" ry="5" fill={light} opacity="0.85" />
      <path d="M12 32c0 2-1.6 3.6-3.6 3.6S4.4 34 4.4 32" stroke={navy} strokeWidth="3" strokeLinecap="round" />
      <path d="M36 32c0 2 1.6 3.6 3.6 3.6S43.6 34 43.6 32" stroke={navy} strokeWidth="3" strokeLinecap="round" />
      <path d="M6 18c2-1 4-1.5 6.5-1.5" stroke={light} strokeWidth="3" strokeLinecap="round" />
      <path d="M34 16c2 0 3.5.5 5 1.2" stroke={light} strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}
