"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type ChantActionState = { error?: string };

function parseChantForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const textAr = String(formData.get("textAr") ?? "").trim();
  const textTranslit = String(formData.get("textTranslit") ?? "").trim();
  const durationSec = Number(formData.get("durationSec") ?? 60);
  const lettersPerSec = Number(formData.get("lettersPerSec") ?? 1);

  if (!title || !textAr) {
    return { error: "Title and Arabic text are required." } as const;
  }
  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    return { error: "Duration must be a positive number of seconds." } as const;
  }
  if (!Number.isFinite(lettersPerSec) || lettersPerSec <= 0) {
    return { error: "Letters per second must be a positive number." } as const;
  }

  return {
    data: {
      title,
      textAr,
      textTranslit: textTranslit || null,
      durationSec: Math.round(durationSec),
      lettersPerSec,
    },
  } as const;
}

export async function createChant(
  matchId: string,
  matchSlug: string,
  _prevState: ChantActionState,
  formData: FormData
): Promise<ChantActionState> {
  await requireAdmin();

  const parsed = parseChantForm(formData);
  if ("error" in parsed) return parsed;

  const lastChant = await prisma.chant.findFirst({
    where: { matchId },
    orderBy: { sortOrder: "desc" },
  });

  await prisma.chant.create({
    data: {
      ...parsed.data,
      matchId,
      sortOrder: (lastChant?.sortOrder ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/${matchSlug}`);
  return {};
}

export async function updateChant(
  chantId: string,
  matchSlug: string,
  _prevState: ChantActionState,
  formData: FormData
): Promise<ChantActionState> {
  await requireAdmin();

  const parsed = parseChantForm(formData);
  if ("error" in parsed) return parsed;

  await prisma.chant.update({
    where: { id: chantId },
    data: parsed.data,
  });

  revalidatePath(`/admin/${matchSlug}`);
  return {};
}

export async function deleteChant(chantId: string, matchSlug: string) {
  await requireAdmin();
  await prisma.chant.delete({ where: { id: chantId } });
  revalidatePath(`/admin/${matchSlug}`);
}
