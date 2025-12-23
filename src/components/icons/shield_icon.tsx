"use client";

import { IconBase } from "./IconBase";

const navy = "#0F2E6D";
const light = "#3DA0FF";

export function IconShield({ size = 20, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) {
  return (
    <IconBase size={size} {...rest}>
      <path
        d="M24 6 10 12v10c0 8 5.5 14 14 18 8.5-4 14-10 14-18V12L24 6Z"
        fill={navy}
      />
      <path d="M24 15v10" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path d="M19 20h10" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path d="M10 14c2-1 4-1.6 6.5-1.6" stroke={light} strokeWidth="3" strokeLinecap="round" />
      <path d="M32 12.5c1.8.3 3.4.9 4.6 1.7" stroke={light} strokeWidth="3" strokeLinecap="round" />
    </IconBase>
  );
}
