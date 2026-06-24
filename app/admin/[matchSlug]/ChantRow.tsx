"use client";

import { useState } from "react";
import { deleteChant } from "@/app/lib/actions/chants";
import { goLive } from "@/app/lib/actions/live";
import ChantForm, { type ChantFormValues } from "./ChantForm";

export default function ChantRow({
  matchId,
  matchSlug,
  chant,
  isLive,
}: {
  matchId: string;
  matchSlug: string;
  chant: ChantFormValues;
  isLive: boolean;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <ChantForm
          matchId={matchId}
          matchSlug={matchSlug}
          chant={chant}
          onSaved={() => setEditing(false)}
        />
        <button
          onClick={() => setEditing(false)}
          className="mt-2 text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-200"
        >
          Cancel
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-zinc-900 dark:text-zinc-50">{chant.title}</p>
          {isLive && (
            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
              ● Live
            </span>
          )}
        </div>
        <p dir="rtl" lang="ar" className="truncate text-lg text-zinc-700 dark:text-zinc-300">
          {chant.textAr}
        </p>
        <p className="text-xs text-zinc-500">
          {chant.durationSec}s · {chant.lettersPerSec} letters/sec
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <form
          action={() => goLive(matchId, chant.id)}
          onSubmit={(e) => {
            if (!confirm(`Go live with "${chant.title}" now?`)) e.preventDefault();
          }}
        >
          <button
            type="submit"
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Go Live
          </button>
        </form>
        <button
          onClick={() => setEditing(true)}
          className="text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Edit
        </button>
        <form
          action={() => deleteChant(chant.id, matchSlug)}
          onSubmit={(e) => {
            if (!confirm(`Delete "${chant.title}"?`)) e.preventDefault();
          }}
        >
          <button type="submit" className="text-red-600 underline hover:text-red-800 dark:text-red-400">
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
