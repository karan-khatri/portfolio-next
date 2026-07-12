"use client";

import { LazyMotion, domAnimation } from "framer-motion";

// Mounted once, high in the tree (app/page.tsx). `domAnimation` covers
// opacity/transform/AnimatePresence — enough for Reveal — without also
// bundling drag/layout (that's `domMax`, only needed by the admin
// composer's Reorder, which lives in a disjoint route and won't leak in
// here via Next's route-level code splitting). `strict` forces descendants
// to use `m.*` instead of `motion.*`, so no one can accidentally pull in
// the full bundle later.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
