"use client";

/* Masked rotating headline word — pauses while any field is focused. Spec §3.1(b). */

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { HEADLINE_WORDS } from "./pour";

const EASE = [0.22, 1, 0.36, 1] as const;

export function RotatingWord({ paused }: { paused: boolean }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (paused || reduce) return;
    const id = setInterval(() => setI((v) => (v + 1) % HEADLINE_WORDS.length), 4000);
    return () => clearInterval(id);
  }, [paused, reduce]);

  const word = reduce ? HEADLINE_WORDS[0] : HEADLINE_WORDS[i];

  return (
    <span className="inline-block overflow-hidden align-bottom" style={{ minHeight: "1em", minWidth: "5ch" }}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={word}
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "-110%" }}
          transition={{ duration: 0.55, ease: EASE }}
          className="inline-block italic"
          style={{ color: "#b8763d" }}
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
