"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const SAMPLE_COUNT = 5;

/**
 * Clock-sync handshake (spec §4 step 5): hits /api/time a few times in quick
 * succession, measures round-trip time for each, and derives
 * offset = serverTime - (clientSendTime + roundTripTime / 2). Uses the
 * median across samples so one slow/jittery request can't skew the result.
 */
export function useServerClock() {
  const [ready, setReady] = useState(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      const offsets: number[] = [];

      for (let i = 0; i < SAMPLE_COUNT; i++) {
        const sendTime = Date.now();
        try {
          const res = await fetch("/api/time", { cache: "no-store" });
          const receiveTime = Date.now();
          const { now: serverTime } = await res.json();
          const roundTripTime = receiveTime - sendTime;
          offsets.push(serverTime - (sendTime + roundTripTime / 2));
        } catch {
          // Network hiccup — skip this sample.
        }
      }

      if (cancelled || offsets.length === 0) return;

      offsets.sort((a, b) => a - b);
      offsetRef.current = offsets[Math.floor(offsets.length / 2)];
      setReady(true);
    }

    sync();
    return () => {
      cancelled = true;
    };
  }, []);

  // Stable identity (reads offsetRef.current at call time) so consumers
  // don't need to treat it as changing on every render.
  const getServerNow = useCallback(() => Date.now() + offsetRef.current, []);

  return { ready, getServerNow };
}
