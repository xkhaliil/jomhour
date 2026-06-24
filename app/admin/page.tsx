import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/app/lib/actions/auth";
import { findNationalTeam } from "@/lib/national-teams";
import LoginForm from "./LoginForm";
import CreateMatchForm from "./CreateMatchForm";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  live: "bg-red-600 text-white",
  ended: "bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return <LoginForm />;
  }

  const matches = await prisma.match.findMany({
    orderBy: { kickoffAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Match day control
          </p>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            Matches
          </h1>
        </div>
        <form action={signOut}>
          <button className="rounded-full border border-black/10 px-4 py-1.5 text-sm font-medium text-zinc-600 transition hover:border-black/20 hover:text-zinc-900 dark:border-white/15 dark:text-zinc-400 dark:hover:text-zinc-100">
            Sign out
          </button>
        </form>
      </header>

      <CreateMatchForm />

      <ul className="space-y-2">
        {matches.map((match) => {
          const flagA = findNationalTeam(match.teamA);
          const flagB = findNationalTeam(match.teamB);
          return (
            <li key={match.id}>
              <Link
                href={`/admin/${match.slug}`}
                className="group flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-black/10 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-0.5 hover:border-red-500/40 hover:shadow-md dark:border-white/10 dark:bg-zinc-900/70"
              >
                <span className="flex flex-wrap items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-50">
                  {flagA && <span className={`fi fi-${flagA.code} rounded-sm`} aria-hidden />}
                  {match.teamA}
                  <span className="font-normal text-zinc-400">vs</span>
                  {flagB && <span className={`fi fi-${flagB.code} rounded-sm`} aria-hidden />}
                  {match.teamB}
                </span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_STYLES[match.status] ?? STATUS_STYLES.scheduled}`}
                >
                  {match.status}
                </span>
              </Link>
            </li>
          );
        })}
        {matches.length === 0 && (
          <p className="rounded-2xl border border-dashed border-black/10 px-5 py-8 text-center text-sm text-zinc-500 dark:border-white/10">
            No matches yet — create one above.
          </p>
        )}
      </ul>
    </div>
  );
}
