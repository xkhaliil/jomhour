import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { findNationalTeam } from "@/lib/national-teams";
import AddChantSection from "./AddChantSection";
import ChantRow from "./ChantRow";
import JoinShare from "./JoinShare";

export default async function AdminMatchPage({
  params,
}: {
  params: Promise<{ matchSlug: string }>;
}) {
  const { matchSlug } = await params;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    redirect("/admin");
  }

  const match = await prisma.match.findUnique({
    where: { slug: matchSlug },
    include: { chants: { orderBy: { sortOrder: "asc" } }, session: true },
  });

  if (!match) {
    notFound();
  }

  // Points straight at the live view, not the marketing/countdown page —
  // during the match fans should land directly in the live experience.
  const joinUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${match.slug}/live`;
  const qrDataUrl = await QRCode.toDataURL(joinUrl, { margin: 1, width: 240 });
  const flagA = findNationalTeam(match.teamA);
  const flagB = findNationalTeam(match.teamB);
  const isLive = match.session?.status === "live";

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <Link
        href="/admin"
        className="text-sm font-medium text-zinc-500 transition hover:text-red-600 dark:hover:text-red-400"
      >
        ← All matches
      </Link>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {flagA && <span className={`fi fi-${flagA.code} rounded-sm`} aria-hidden />}
            {match.teamA}
            <span className="font-normal text-zinc-400">vs</span>
            {flagB && <span className={`fi fi-${flagB.code} rounded-sm`} aria-hidden />}
            {match.teamB}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {match.kickoffAt.toLocaleString()} {match.venue ? `· ${match.venue}` : ""}
          </p>
        </div>
        {isLive && (
          <span className="flex w-fit shrink-0 items-center gap-1.5 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            Live
          </span>
        )}
      </header>

      <JoinShare
        joinUrl={joinUrl}
        qrDataUrl={qrDataUrl}
        title={`${match.teamA} vs ${match.teamB}`}
      />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Chants
        </h2>
        <ul className="space-y-2">
          {match.chants.map((chant) => (
            <ChantRow
              key={chant.id}
              matchId={match.id}
              matchSlug={match.slug}
              chant={chant}
              isLive={
                match.session?.status === "live" &&
                match.session.currentChantId === chant.id
              }
            />
          ))}
          {match.chants.length === 0 && (
            <p className="rounded-2xl border border-dashed border-black/10 px-5 py-8 text-center text-sm text-zinc-500 dark:border-white/10">
              No chants yet — add one below.
            </p>
          )}
        </ul>
      </section>

      <section className="space-y-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/70">
        <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          Add chant
        </h2>
        <AddChantSection matchId={match.id} matchSlug={match.slug} />
      </section>
    </div>
  );
}
