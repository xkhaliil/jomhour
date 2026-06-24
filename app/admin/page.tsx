import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/app/lib/actions/auth";
import LoginForm from "./LoginForm";
import CreateMatchForm from "./CreateMatchForm";

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
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Matches
        </h1>
        <form action={signOut}>
          <button className="text-sm text-zinc-500 underline hover:text-zinc-900 dark:hover:text-zinc-200">
            Sign out
          </button>
        </form>
      </header>

      <CreateMatchForm />

      <ul className="space-y-2">
        {matches.map((match) => (
          <li key={match.id}>
            <Link
              href={`/admin/${match.slug}`}
              className="flex items-center justify-between rounded-lg border border-black/10 bg-white px-4 py-3 hover:border-black/20 dark:border-white/10 dark:bg-zinc-900 dark:hover:border-white/20"
            >
              <span className="font-medium text-zinc-900 dark:text-zinc-50">
                {match.teamA} vs {match.teamB}
              </span>
              <span className="text-sm text-zinc-500">{match.status}</span>
            </Link>
          </li>
        ))}
        {matches.length === 0 && (
          <p className="text-sm text-zinc-500">No matches yet — create one above.</p>
        )}
      </ul>
    </div>
  );
}
