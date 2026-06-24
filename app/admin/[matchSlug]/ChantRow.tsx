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
      <li className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/70">
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
    <li
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm transition sm:flex-row sm:items-start sm:justify-between sm:gap-4 dark:bg-zinc-900/70 ${
        isLive
          ? "border-red-500/40 ring-1 ring-red-500/20"
          : "border-black/10 dark:border-white/10"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{chant.title}</p>
          {isLive && (
            <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
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
      <div className="flex flex-wrap items-center gap-3 text-sm sm:shrink-0">
        <form
          action={() => goLive(matchId, chant.id)}
          onSubmit={(e) => {
            if (!confirm(`Go live with "${chant.title}" now?`)) e.preventDefault();
          }}
        >
          <button
            type="submit"
            className="rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-500"
          >
            Go Live
          </button>
        </form>
        <button
          onClick={() => setEditing(true)}
          className="font-medium text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Edit
        </button>
        <form
          action={() => deleteChant(chant.id, matchSlug)}
          onSubmit={(e) => {
            if (!confirm(`Delete "${chant.title}"?`)) e.preventDefault();
          }}
        >
          <button type="submit" className="font-medium text-red-600 underline hover:text-red-800 dark:text-red-400">
            Delete
          </button>
        </form>
      </div>
    </li>
  );
}
