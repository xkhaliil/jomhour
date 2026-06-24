"use client";

import { useActionState } from "react";
import { signIn, type AuthActionState } from "@/app/lib/actions/auth";

const initialState: AuthActionState = {};

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        action={formAction}
        className="w-full max-w-sm space-y-4 rounded-xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900"
      >
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Admin sign in
        </h1>
        <div className="space-y-1">
          <label className="block text-sm text-zinc-600 dark:text-zinc-400">
            Email
          </label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
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
            className="w-full rounded-md border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/30 dark:border-white/15 dark:focus:border-white/40"
          />
        </div>
        {state.error && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
