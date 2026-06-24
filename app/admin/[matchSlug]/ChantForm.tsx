"use client";

import { useActionState, useEffect, useRef } from "react";
import {
  createChant,
  updateChant,
  type ChantActionState,
} from "@/app/lib/actions/chants";
import type { ChantDraft } from "@/app/lib/actions/ai";

export type ChantFormValues = {
  id: string;
  title: string;
  textAr: string;
  textTranslit: string | null;
  durationSec: number;
  lettersPerSec: number;
};

const initialState: ChantActionState = {};

export default function ChantForm({
  matchId,
  matchSlug,
  chant,
  aiDraft,
  onSaved,
}: {
  matchId: string;
  matchSlug: string;
  chant?: ChantFormValues;
  aiDraft?: ChantDraft;
  onSaved?: () => void;
}) {
  const defaults = chant ?? aiDraft;
  const action = chant
    ? updateChant.bind(null, chant.id, matchSlug)
    : createChant.bind(null, matchId, matchSlug);

  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state.error) {
      formRef.current?.reset();
      onSaved?.();
    }
    wasPending.current = pending;
  }, [pending, state, onSaved]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">
          Title
        </label>
        <input
          name="title"
          required
          defaultValue={defaults?.title}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">
          Arabic text
        </label>
        <textarea
          name="textAr"
          required
          dir="rtl"
          lang="ar"
          rows={3}
          defaultValue={defaults?.textAr}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-right text-lg outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-sm text-zinc-600 dark:text-zinc-400">
          Transliteration (optional)
        </label>
        <input
          name="textTranslit"
          dir="ltr"
          defaultValue={defaults?.textTranslit ?? ""}
          className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">
            Duration (sec)
          </label>
          <input
            name="durationSec"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={chant?.durationSec ?? 60}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">
            Letters / sec
          </label>
          <input
            name="lettersPerSec"
            type="number"
            min={0.1}
            step={0.1}
            required
            defaultValue={chant?.lettersPerSec ?? 1}
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-500 disabled:opacity-50"
      >
        {pending ? "Saving…" : chant ? "Save changes" : "Add chant"}
      </button>
    </form>
  );
}
