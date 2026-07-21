"use client";

/* THE LISTENING CUP — the brand mark made interactive. Spec §5.
   - 24-bar waveform breathes at idle; typing the email plays it like a meter
   - form completion fills the cup; steam only near-complete
   - password focus → DEAF MODE: bars quantize to still dots, steam → padlock,
     zero keystroke reaction (privacy-honest)
   - imperative API via ref: spike(i), ping(), wave()
   Decorative only: aria-hidden, all state arrives as props. */

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type CupHandle = { spike: (i: number) => void; ping: () => void; wave: () => void };

const N = 24;
const BAR_W = 4;
const PITCH = 5.8;
const X0 = 100;
const BASE = 246;
const MAX_H = 110;
const DOT_SCALE = 6 / MAX_H;

type Props = {
  focus: "email" | "password" | null;
  fill: number; // 0–1
  deaf: boolean;
  phase: "form" | "brewing" | "pouring" | "error";
  errorTick: number; // increments per error (droplet one-shot)
  stained: boolean;  // saucer stain persists until success
  width?: number;
};

export const ListeningCup = forwardRef<CupHandle, Props>(function ListeningCup(
  { focus, fill, deaf, phase, errorTick, stained, width = 340 },
  ref
) {
  const reduce = useReducedMotion();
  const spikeRefs = useRef<(SVGGElement | null)[]>([]);
  const sparkleRef = useRef<SVGGElement | null>(null);
  const lastSpike = useRef(0);

  useImperativeHandle(ref, () => ({
    spike(i: number) {
      if (reduce || deaf) return;
      const now = performance.now();
      if (now - lastSpike.current < 40) return; // rAF-ish throttle
      lastSpike.current = now;
      const hit = (idx: number, peak: number) => {
        const el = spikeRefs.current[((idx % N) + N) % N];
        el?.animate(
          [{ transform: "scaleY(1)" }, { transform: `scaleY(${peak})` }, { transform: "scaleY(1)" }],
          { duration: 450, easing: "cubic-bezier(0.22,1,0.36,1)" }
        );
      };
      hit(i, 2.4); hit(i - 1, 1.9); hit(i + 1, 1.9); hit(i - 2, 1.5); hit(i + 2, 1.5);
    },
    ping() {
      if (reduce) return;
      sparkleRef.current?.animate(
        [
          { transform: "scale(0)", opacity: 0 },
          { transform: "scale(1.15)", opacity: 1, offset: 0.5 },
          { transform: "scale(0)", opacity: 0 },
        ],
        { duration: 600, easing: "cubic-bezier(0.22,1,0.36,1)" }
      );
    },
    wave() {
      if (reduce) return;
      for (let i = 0; i < N; i++) {
        const el = spikeRefs.current[i];
        el?.animate(
          [{ transform: "scaleY(1)" }, { transform: "scaleY(2.6)" }, { transform: "scaleY(1)" }],
          { duration: 520, delay: i * 30, easing: "cubic-bezier(0.22,1,0.36,1)" }
        );
      }
    },
  }), [reduce, deaf]);

  // idle sparkle every 7s only when nothing is focused (One-Ambient Rule)
  useEffect(() => {
    if (reduce || focus !== null || phase !== "form") return;
    const id = setInterval(() => {
      sparkleRef.current?.animate(
        [
          { transform: "scale(0)", opacity: 0 },
          { transform: "scale(1)", opacity: 1, offset: 0.5 },
          { transform: "scale(0)", opacity: 0 },
        ],
        { duration: 600, easing: "ease-out" }
      );
    }, 7000);
    return () => clearInterval(id);
  }, [reduce, focus, phase]);

  const bars = useMemo(() => Array.from({ length: N }, (_, i) => ({ x: X0 + i * PITCH, delay: i * 0.09 })), []);
  const steamO = deaf ? 0 : phase === "pouring" ? 1 : fill < 0.6 ? 0 : Math.min(1, (fill - 0.6) * 1.75);
  const tilt = phase === "error" ? 4 : focus === "email" && !reduce ? 2 : 0;
  // gentle sink only — bars must stay visible inside the cup at every fill level
  const liquidY = (1 - Math.max(0.05, Math.min(1, fill))) * 26;
  const surfaceY = 250 - Math.max(0.05, Math.min(1, fill)) * 118; // liquid tint level
  const barO = 0.35 + 0.65 * fill;

  return (
    <div className="lcup relative select-none" style={{ width, maxWidth: "100%" }} aria-hidden="true">
      <style>{`
        .lcup .lc-bar{ transform-box: fill-box; transform-origin: center bottom; animation: lcBreathe 2.4s ease-in-out infinite; }
        .lcup .lc-spike{ transform-box: fill-box; transform-origin: center bottom; }
        .lcup .lc-deaf .lc-bar{ animation: none !important; }
        @keyframes lcBreathe { 0%,100%{ transform: scaleY(0.38);} 50%{ transform: scaleY(0.72);} }
        @keyframes lcDrift { 0%,100%{ transform: translateY(0);} 50%{ transform: translateY(-5px);} }
        .lcup .lc-wisp{ transform-box: fill-box; animation: lcDrift 3.2s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .lcup *{ animation: none !important; } }
      `}</style>

      <svg viewBox="0 0 340 300" className="w-full" role="presentation" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="lcBarGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#b8763d" />
            <stop offset="100%" stopColor="#4fb0a5" />
          </linearGradient>
          <clipPath id="lcCupClip">
            <path d="M92 124 L248 124 L226 240 Q222 250 210 250 L130 250 Q118 250 114 240 Z" />
          </clipPath>
          <filter id="lcBlur"><feGaussianBlur stdDeviation="2" /></filter>
        </defs>

        <motion.g animate={{ rotate: tilt }} transition={{ type: "spring", stiffness: 200, damping: 20 }} style={{ originX: "170px", originY: "262px" }}>
          {/* saucer shadow + saucer */}
          <ellipse cx="170" cy="266" rx="88" ry="10" fill="#eadbc8" opacity="0.4" style={{ filter: "blur(6px)" }} />
          <ellipse cx="170" cy="262" rx="95" ry="14" fill="#f4e9d8" stroke="#d3b78f" strokeWidth="1.5" />
          {/* error stain — persists until success */}
          {stained && <ellipse cx="212" cy="259" rx="9" ry="3" fill="#3d2817" opacity="0.35" />}

          {/* handle */}
          <path d="M254 150 Q 298 158 292 184 Q 286 208 246 210" fill="none" stroke="#d3b78f" strokeWidth="5" strokeLinecap="round" />

          {/* cup body */}
          <path d="M86 118 L254 118 L230 240 Q225 252 212 252 L128 252 Q115 252 110 240 Z" fill="#fffdf9" stroke="#d3b78f" strokeWidth="1.5" />
          <path d="M86 118 L254 118" stroke="#b8763d" strokeWidth="2" strokeLinecap="round" />

          {/* liquid: tint level + 24-bar waveform, clipped to the cup interior */}
          <g clipPath="url(#lcCupClip)" className={deaf ? "lc-deaf" : undefined}>
            {/* liquid surface — the fill level reads at a glance */}
            <motion.rect
              x="92" width="156" height="140" fill="#f4e9d8"
              initial={false}
              animate={{ y: surfaceY, opacity: 0.5 + 0.3 * fill }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            <motion.rect
              x="92" width="156" height="2.5" fill="#e3c9a4"
              initial={false}
              animate={{ y: surfaceY, opacity: fill > 0.05 ? 0.9 : 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
            <motion.g animate={{ y: liquidY }} transition={{ type: "spring", stiffness: 120, damping: 20 }}>
              <g style={{ opacity: barO, transition: "opacity .4s" }}>
                {bars.map((b, i) => (
                  <g key={i} className="lc-spike" ref={(el) => { spikeRefs.current[i] = el; }}>
                    <rect
                      className="lc-bar"
                      x={b.x}
                      y={BASE - MAX_H}
                      width={BAR_W}
                      height={MAX_H}
                      rx={2}
                      fill="url(#lcBarGrad)"
                      style={
                        deaf
                          ? { transform: `scaleY(${DOT_SCALE})`, transition: "transform .3s ease-out", transitionDelay: `${i * 20}ms` }
                          : { animationDelay: `${b.delay}s`, transition: "transform .3s ease-out" }
                      }
                    />
                  </g>
                ))}
              </g>
            </motion.g>
          </g>

          {/* steam wisps ⇄ padlock (crossfade, not a morph) */}
          <g filter="url(#lcBlur)" style={{ opacity: steamO, transition: "opacity .25s" }}>
            <path className="lc-wisp" d="M130 108 C 122 92 138 84 130 68 C 124 56 136 48 132 38" fill="none" stroke="#c9a87c" strokeWidth="2" strokeLinecap="round" />
            <path className="lc-wisp" style={{ animationDelay: ".5s" }} d="M168 106 C 158 88 178 80 168 62 C 160 48 176 42 170 30" fill="none" stroke="#c9a87c" strokeWidth="2" strokeLinecap="round" />
            <path className="lc-wisp" style={{ animationDelay: "1s" }} d="M206 108 C 198 92 214 84 206 68 C 200 56 212 48 208 38" fill="none" stroke="#c9a87c" strokeWidth="2" strokeLinecap="round" />
          </g>
          <motion.g
            initial={false}
            animate={{ opacity: deaf ? 1 : 0 }}
            transition={{ duration: 0.2, delay: deaf ? 0.2 : 0 }}
          >
            {/* padlock: shackle + body, draws on */}
            <motion.path
              d="M158 70 L158 62 Q158 50 168 50 Q178 50 178 62 L178 70"
              fill="none" stroke="#c9a87c" strokeWidth="2" strokeLinecap="round"
              initial={false}
              animate={{ pathLength: deaf ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut", delay: deaf ? 0.2 : 0 }}
            />
            <motion.rect
              x="153" y="70" width="30" height="24" rx="5"
              fill="none" stroke="#c9a87c" strokeWidth="2"
              initial={false}
              animate={{ pathLength: deaf ? 1 : 0 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut", delay: deaf ? 0.25 : 0 }}
            />
            <circle cx="168" cy="80" r="2.5" fill="#c9a87c" opacity={deaf ? 1 : 0} />
          </motion.g>

          {/* sparkle (pinged imperatively) */}
          <g ref={sparkleRef} style={{ transformBox: "fill-box", transformOrigin: "center", transform: "scale(0)", opacity: 0 }}>
            <path d="M262 90 l3.2 7.8 7.8 3.2 -7.8 3.2 -3.2 7.8 -3.2 -7.8 -7.8 -3.2 7.8 -3.2 Z" fill="#4fb0a5" />
          </g>

          {/* error droplet — one-shot per errorTick */}
          {errorTick > 0 && phase === "error" && !reduce && (
            <motion.path
              key={errorTick}
              d="M232 246 q-3 5 0 8 q3 -3 0 -8"
              fill="#3d2817"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 14, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeIn" }}
            />
          )}
        </motion.g>
      </svg>
    </div>
  );
});
