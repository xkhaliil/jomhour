"use client";

import { useEffect, useRef, useState } from "react";
import {
  computePlaybackFrame,
  type ChantPayload,
  type PlaybackFrame,
} from "@/lib/chant-playback";

/**
 * Drives computePlaybackFrame off requestAnimationFrame. No network calls
 * happen here — once `chant`/`startedAtMs` are known, everything is derived
 * locally from `getNow()`, per the shared-clock/local-playback design.
 */
export function useChantPlayback(
  chant: ChantPayload | null,
  startedAtMs: number | null,
  getNow: () => number
): PlaybackFrame | null {
  // Computed eagerly (not in an effect) so a fan opening mid-chant sees the
  // correct highlight position in the very first render, not a flash of the
  // idle state while waiting for the first animation frame.
  const [frame, setFrame] = useState<PlaybackFrame | null>(() =>
    chant && startedAtMs != null
      ? computePlaybackFrame(chant, startedAtMs, getNow())
      : null
  );
  // getNow's latest closure is read via this ref (updated in its own effect,
  // never during render) so an offset update (Phase 5) doesn't have to
  // restart the whole animation loop below.
  const getNowRef = useRef(getNow);
  useEffect(() => {
    getNowRef.current = getNow;
  }, [getNow]);

  useEffect(() => {
    // No chant to play — leave any previous frame in place. The caller
    // already gates rendering on `chant` being non-null, so a stale frame
    // here is simply unused, and it'll be overwritten the next time a chant
    // does start.
    if (!chant || startedAtMs == null) {
      return;
    }

    let rafId: number;

    function tick() {
      const next = computePlaybackFrame(chant!, startedAtMs!, getNowRef.current());
      setFrame(next);
      if (!next.finished) {
        rafId = requestAnimationFrame(tick);
      }
    }

    tick();
    return () => cancelAnimationFrame(rafId);
  }, [chant, startedAtMs]);

  return frame;
}
