"use client";

import { IconBase } from "./IconBase";

const navy = "#0F2E6D";
const light = "#3DA0FF";

export function HomepageIcon({ size = 20, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase size={size} {...rest}>
      <path d="M8 24.5 24 11l16 13.5V37a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2V24.5Z" fill={navy} />
      <rect x="18" y="26" width="12" height="13" rx="1.5" fill="white" opacity="0.9" />
      <ellipse cx="32" cy="26" rx="8" ry="6" fill={light} opacity="0.8" />
      <path d="M6 21c2 0 3.5-1.5 5.5-3.5 2-2 4.5-4 7.5-4" stroke={light} strokeWidth="3" strokeLinecap="round" />
      <path d="M34 15c2 0 3.5 1.2 5 2.4" stroke={light} strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}
