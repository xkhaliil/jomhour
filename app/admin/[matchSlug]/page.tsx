import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
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

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <Link href="/admin" className="text-sm text-zinc-500 underline">
        ← All matches
      </Link>

      <header>
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {match.teamA} vs {match.teamB}
        </h1>
        <p className="text-sm text-zinc-500">
          {match.kickoffAt.toLocaleString()} {match.venue ? `· ${match.venue}` : ""}
        </p>
      </header>

      <JoinShare
        joinUrl={joinUrl}
        qrDataUrl={qrDataUrl}
        title={`${match.teamA} vs ${match.teamB}`}
      />

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
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
            <p className="text-sm text-zinc-500">No chants yet — add one below.</p>
          )}
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
          Add chant
        </h2>
        <AddChantSection matchId={match.id} matchSlug={match.slug} />
      </section>
    </div>
  );
}
