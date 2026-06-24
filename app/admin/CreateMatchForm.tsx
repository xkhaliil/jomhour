"use client";

import { useActionState } from "react";
import { createMatch, type MatchActionState } from "@/app/lib/actions/matches";
import TeamSelect from "./TeamSelect";

const initialState: MatchActionState = {};

export default function CreateMatchForm() {
  const [state, formAction, pending] = useActionState(createMatch, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-2xl border border-black/10 bg-white p-5 shadow-sm sm:grid-cols-2 dark:border-white/10 dark:bg-zinc-900/70"
    >
      <h2 className="col-span-full flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        Create a match
      </h2>
      <TeamSelect label="Team A" name="teamA" required />
      <TeamSelect label="Team B" name="teamB" required />
      <Field label="Venue" name="venue" />
      <Field label="Kickoff" name="kickoffAt" type="datetime-local" required />
      <Field
        label="Join URL slug"
        name="slug"
        required
        placeholder="e.g. teama-teamb-2026"
        className="sm:col-span-2"
      />
      {state.error && (
        <p className="col-span-full text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="col-span-full justify-self-start rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create match"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  placeholder,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <label className="block text-sm text-zinc-600 dark:text-zinc-400">
        {label}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400"
      />
    </div>
  );
}
