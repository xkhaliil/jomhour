"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { GO_LIVE_EVENT, matchChannelName, type GoLivePayload } from "@/lib/realtime";

/**
 * Writes the new LiveSession state and publishes a single tiny Realtime
 * broadcast (text + timing only — see spec §9). Uses httpSend() so this
 * works as a one-shot REST call from a serverless function, with no
 * WebSocket connection to hold open.
 */
export async function goLive(matchId: string, chantId: string) {
  await requireAdmin();

  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { chants: { orderBy: { sortOrder: "asc" } } },
  });
  if (!match) throw new Error("Match not found");

  const chantIndex = match.chants.findIndex((c) => c.id === chantId);
  if (chantIndex === -1) throw new Error("Chant not found");
  const chant = match.chants[chantIndex];
  const nextChant = match.chants[chantIndex + 1] ?? null;

  // A couple seconds in the future, giving the broadcast time to reach every
  // phone before any of them needs to start animating — see spec §4.
  const startedAt = new Date(Date.now() + 2000);

  await prisma.liveSession.update({
    where: { matchId },
    data: {
      status: "live",
      currentChantId: chant.id,
      startedAt,
      nextChantId: nextChant?.id ?? null,
    },
  });

  const payload: GoLivePayload = {
    chant: {
      id: chant.id,
      title: chant.title,
      textAr: chant.textAr,
      textTranslit: chant.textTranslit,
      durationSec: chant.durationSec,
      lettersPerSec: chant.lettersPerSec,
    },
    startedAt: startedAt.getTime(),
    nextChantTitle: nextChant?.title ?? null,
  };

  const admin = createAdminClient();
  const channel = admin.channel(matchChannelName(match.slug));
  try {
    await channel.httpSend(GO_LIVE_EVENT, payload);
  } finally {
    await admin.removeChannel(channel);
  }

  revalidatePath(`/admin/${match.slug}`);
  revalidatePath(`/${match.slug}/live`);
}
