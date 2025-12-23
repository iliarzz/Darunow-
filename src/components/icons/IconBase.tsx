"use client";

type Props = React.SVGProps<SVGSVGElement> & {
  size?: number;
};

export function IconBase({ size = 20, children, ...rest }: Props & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {children}
    </svg>
  );
}
