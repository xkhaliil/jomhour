const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });

export function toGraphemes(text: string): string[] {
  return Array.from(segmenter.segment(text), (s) => s.segment);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Number of graphemes that should be highlighted given how much time has
 * elapsed since the chant started, paced by lettersPerSec.
 */
export function highlightCountForElapsed(
  elapsedSec: number,
  lettersPerSec: number,
  totalGraphemes: number
): number {
  if (elapsedSec <= 0) return 0;
  return clamp(Math.floor(elapsedSec * lettersPerSec), 0, totalGraphemes);
}
