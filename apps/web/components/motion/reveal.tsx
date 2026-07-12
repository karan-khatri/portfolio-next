"use client";

import { m, useReducedMotion } from "framer-motion";

// Opacity/transform only — compositor-safe, zero layout reflow. Never wraps
// the Hero (LCP element must render immediately, unanimated). Relies on an
// ancestor MotionProvider for the LazyMotion feature bundle.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </m.div>
  );
}
