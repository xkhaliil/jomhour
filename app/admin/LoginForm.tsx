"use client";

import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/app/lib/actions/auth";

const initialState: AuthActionState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-5 overflow-hidden rounded-2xl border border-black/10 bg-white p-7 shadow-xl dark:border-white/10 dark:bg-zinc-900"
      >
        <div className="-mx-7 -mt-7 h-1.5 bg-linear-to-r from-red-500 via-amber-400 to-red-500" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Match day control
          </p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            Admin sign in
          </h1>
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2.5 text-sm outline-none focus:border-red-500 dark:border-white/15 dark:focus:border-red-400"
          />
        </div>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
