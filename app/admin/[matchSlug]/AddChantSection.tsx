"use client";

import { useActionState } from "react";
import { draftChantWithAI, type DraftActionState } from "@/app/lib/actions/ai";
import ChantForm from "./ChantForm";

const initialState: DraftActionState = {};

export default function AddChantSection({
  matchId,
  matchSlug,
}: {
  matchId: string;
  matchSlug: string;
}) {
  const [state, formAction, pending] = useActionState(draftChantWithAI, initialState);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-2">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">
          Draft with AI (optional)
        </label>
        <div className="flex gap-2">
          <input
            name="prompt"
            placeholder="e.g. Al Ahly, derby day, attacking chant"
            className="flex-1 rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
          />
          <button
            type="submit"
            disabled={pending}
            className="shrink-0 rounded-md border border-black/10 px-3 py-2 text-sm font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/5"
          >
            {pending ? "Drafting…" : "✨ Draft with AI"}
          </button>
        </div>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
      </form>

      {/* Remount with fresh defaultValues whenever a new draft arrives. The
          admin still reviews and edits before this is ever saved (spec §7) —
          drafting never writes a chant directly. */}
      <ChantForm
        key={state.draft ? JSON.stringify(state.draft) : "empty"}
        matchId={matchId}
        matchSlug={matchSlug}
        aiDraft={state.draft}
      />
    </div>
  );
}
