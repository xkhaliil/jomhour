"use client";

import { useActionState } from "react";
import { createMatch, type MatchActionState } from "@/app/lib/actions/matches";

const initialState: MatchActionState = {};

export default function CreateMatchForm() {
  const [state, formAction, pending] = useActionState(createMatch, initialState);

  return (
    <form
      action={formAction}
      className="grid gap-3 rounded-xl border border-black/10 bg-white p-4 sm:grid-cols-2 dark:border-white/10 dark:bg-zinc-900"
    >
      <h2 className="col-span-full text-sm font-medium text-zinc-900 dark:text-zinc-50">
        Create a match
      </h2>
      <Field label="Team A" name="teamA" required />
      <Field label="Team B" name="teamB" required />
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
        className="col-span-full justify-self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
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
        className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
      />
    </div>
  );
}
