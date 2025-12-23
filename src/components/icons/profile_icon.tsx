"use client";

import { IconBase } from "./IconBase";

const navy = "#0F2E6D";
const light = "#3DA0FF";

export function ProfileIcon({ size = 20, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase size={size} {...rest}>
      <circle cx="18" cy="16" r="7" fill={navy} />
      <path d="M6 34c3.5-6 9.5-9 17-9 6 0 11 2.2 14.5 6" stroke={navy} strokeWidth="4" strokeLinecap="round" />
      <path
        d="M30 14c3-1 6.5 0.5 8 2.5 1.5 2-0.5 5-2 6.5l-6 5.5-5-6 5-5c1.2-1.2 0.8-3.7 0-4.5Z"
        fill={light}
        opacity="0.85"
      />
      <path d="M8 18c2-1 4-2 6.5-2" stroke={light} strokeWidth="3" strokeLinecap="round" />
      <path d="M30 12.5c1.8.4 3.4 1 4.6 1.8" stroke={light} strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}
