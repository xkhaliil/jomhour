import { toGraphemes, highlightCountForElapsed } from "./graphemes";

export type ChantPayload = {
  id: string;
  title: string;
  textAr: string;
  textTranslit: string | null;
  durationSec: number;
  lettersPerSec: number;
};

export type PlaybackFrame = {
  graphemesAr: string[];
  graphemesTranslit: string[] | null;
  highlightCountAr: number;
  highlightCountTranslit: number;
  /** 0..1 fraction of the chant's pacing that has been highlighted so far. */
  progress: number;
  remainingSec: number;
  elapsedSec: number;
  finished: boolean;
};

/**
 * Pure function of (chant, startedAt, now) -> what should be on screen right
 * now. No side effects, so it's the same whether driven by a rAF loop, a
 * server-render, or a unit test.
 */
export function computePlaybackFrame(
  chant: ChantPayload,
  startedAtMs: number,
  nowMs: number
): PlaybackFrame {
  const elapsedSec = Math.max(0, (nowMs - startedAtMs) / 1000);
  const graphemesAr = toGraphemes(chant.textAr);
  const graphemesTranslit = chant.textTranslit
    ? toGraphemes(chant.textTranslit)
    : null;

  const highlightCountAr = highlightCountForElapsed(
    elapsedSec,
    chant.lettersPerSec,
    graphemesAr.length
  );
  // Drive the transliteration highlight off the same fractional progress so
  // both representations stay in lockstep regardless of which is on screen.
  const progress =
    graphemesAr.length > 0 ? highlightCountAr / graphemesAr.length : 0;
  const highlightCountTranslit = graphemesTranslit
    ? Math.round(progress * graphemesTranslit.length)
    : 0;

  return {
    graphemesAr,
    graphemesTranslit,
    highlightCountAr,
    highlightCountTranslit,
    progress,
    remainingSec: Math.max(0, chant.durationSec - elapsedSec),
    elapsedSec,
    finished: elapsedSec >= chant.durationSec,
  };
}
