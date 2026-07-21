"use client";

import { useEffect, useState } from "react";
import { CAPACITY } from "./channel-mock";

// Simulates the live SSE capacity stream with a small bounded random walk.
// Real impl: subscribe to an EventSource('/api/v1/orgs/:id/capacity/stream').
export function useLiveCapacity(base: number) {
  const [active, setActive] = useState(base);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => {
        const step = Math.round((Math.random() - 0.5) * 2.4); // -1..+1 (calm)
        const next = prev + step;
        return Math.max(3, Math.min(CAPACITY - 1, next)); // stay in a believable band
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return active;
}
