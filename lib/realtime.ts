import type { ChantPayload } from "./chant-playback";

export const GO_LIVE_EVENT = "go_live";

export function matchChannelName(matchSlug: string) {
  return `match:${matchSlug}`;
}

/** Tiny by design — text + timing only, never images/audio/video (spec §9). */
export type GoLivePayload = {
  chant: ChantPayload;
  startedAt: number;
  nextChantTitle: string | null;
};
