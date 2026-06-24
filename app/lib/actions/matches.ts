"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type MatchActionState = { error?: string };

export async function createMatch(
  _prevState: MatchActionState,
  formData: FormData
): Promise<MatchActionState> {
  await requireAdmin();

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const teamA = String(formData.get("teamA") ?? "").trim();
  const teamB = String(formData.get("teamB") ?? "").trim();
  const kickoffAt = String(formData.get("kickoffAt") ?? "");
  const venue = String(formData.get("venue") ?? "").trim();

  if (!/^[a-z0-9-]+$/.test(slug)) {
    return { error: "Slug must be lowercase letters, numbers, and hyphens only." };
  }
  if (!teamA || !teamB || !kickoffAt) {
    return { error: "Team A, Team B, and kickoff time are required." };
  }
  const kickoffDate = new Date(kickoffAt);
  if (Number.isNaN(kickoffDate.getTime())) {
    return { error: "Kickoff time is invalid." };
  }

  try {
    await prisma.match.create({
      data: {
        slug,
        teamA,
        teamB,
        venue: venue || null,
        kickoffAt: kickoffDate,
        session: { create: {} },
      },
    });
  } catch {
    return { error: "That slug is already taken." };
  }

  revalidatePath("/admin");
  redirect(`/admin/${slug}`);
}
