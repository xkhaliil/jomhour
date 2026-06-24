import type { Chant, LiveSession, Match } from "@prisma/client";
import type { ChantPayload } from "./chant-playback";

type MatchWithSession = Match & {
  session: LiveSession | null;
  chants: Chant[];
};

export type ResolvedLiveState = {
  status: "idle" | "live" | "ended";
  chant: ChantPayload | null;
  startedAt: number | null;
  nextChantTitle: string | null;
};

function toChantPayload(chant: Chant): ChantPayload {
  return {
    id: chant.id,
    title: chant.title,
    textAr: chant.textAr,
    textTranslit: chant.textTranslit,
    durationSec: chant.durationSec,
    lettersPerSec: chant.lettersPerSec,
  };
}

/**
 * Derives the fan-facing live state from a Match's session + chants. Shared
 * by the live-view server page (initial render) and the resume route (used
 * on reconnect) so both agree on exactly what counts as "live".
 */
export function resolveLiveState(match: MatchWithSession): ResolvedLiveState {
  const { session, chants } = match;

  const currentChant = session?.currentChantId
    ? chants.find((c) => c.id === session.currentChantId) ?? null
    : null;
  const nextChant = session?.nextChantId
    ? chants.find((c) => c.id === session.nextChantId) ?? null
    : null;

  const status: ResolvedLiveState["status"] =
    session?.status === "live" && currentChant && session.startedAt
      ? "live"
      : session?.status === "ended"
        ? "ended"
        : "idle";

  return {
    status,
    chant: status === "live" && currentChant ? toChantPayload(currentChant) : null,
    startedAt:
      status === "live" && session?.startedAt ? session.startedAt.getTime() : null,
    nextChantTitle: nextChant?.title ?? null,
  };
}
