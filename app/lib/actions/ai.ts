"use server";

import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";

const ChantDraftSchema = z.object({
  title: z.string(),
  textAr: z.string(),
  textTranslit: z.string(),
});

export type ChantDraft = z.infer<typeof ChantDraftSchema>;
export type DraftActionState = { draft?: ChantDraft; error?: string };

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You write short, rhythmic football stadium chants in Modern Standard Arabic, meant for thousands of fans to read off a phone screen and shout in unison.

- textAr must be fully vocalized with diacritics (tashkeel) — every letter needs its diacritic mark so the app can pace a karaoke-style highlight syllable by syllable.
- Keep textAr short: one or two chantable lines; repeated phrases are fine and often work best.
- textTranslit is a Latin-script transliteration of textAr (how it sounds out loud), not an English translation.
- title is a short label for the chant, e.g. the transliteration of its first few words.`;

/**
 * Drafts a chant suggestion from a short admin prompt (team, theme, occasion).
 * Returns a structured suggestion only — the admin reviews and edits it
 * before it's ever saved as a real chant (see spec §7).
 */
export async function draftChantWithAI(
  _prevState: DraftActionState,
  formData: FormData
): Promise<DraftActionState> {
  await requireAdmin();

  const prompt = String(formData.get("prompt") ?? "").trim();
  if (!prompt) {
    return { error: "Describe the chant you want — team, theme, or occasion." };
  }

  let response;
  try {
    response = await client.messages.parse({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      output_config: {
        effort: "low",
        format: zodOutputFormat(ChantDraftSchema),
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return { error: "AI is rate-limited right now — try again in a moment." };
    }
    if (err instanceof Anthropic.APIError) {
      return { error: "AI request failed — try again." };
    }
    throw err;
  }

  if (response.stop_reason === "refusal") {
    return { error: "The AI declined that request — try rephrasing." };
  }
  if (!response.parsed_output) {
    return { error: "The AI response didn't match the expected format — try again." };
  }

  return { draft: response.parsed_output };
}
