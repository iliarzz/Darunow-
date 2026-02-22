"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

type ParallaxProps = {
  children: React.ReactNode;
  className?: string;
  distance?: number;
};

export function Parallax({ children, className, distance = 22 }: ParallaxProps) {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px) and (pointer: fine)");
    const update = () => setEnabled(media.matches);
    update();
    if (media.addEventListener) {
      media.addEventListener("change", update);
    } else {
      media.addListener(update);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", update);
      } else {
        media.removeListener(update);
      }
    };
  }, []);

  if (reduceMotion || !enabled) return <div className={cn(className)}>{children}</div>;
  return (
    <ParallaxMotion className={className} distance={distance}>
      {children}
    </ParallaxMotion>
  );
}

function ParallaxMotion({
  children,
  className,
  distance,
}: {
  children: React.ReactNode;
  className?: string;
  distance: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);

  return (
    <motion.div ref={ref} className={cn(className)} style={{ y }}>
      {children}
    </motion.div>
  );
}
