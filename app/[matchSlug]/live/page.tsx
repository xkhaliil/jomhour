import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { resolveLiveState } from "@/lib/live-session";
import LiveView from "./LiveView";

// Runs on every request — LiveSession state can change at any time and must
// never be served stale from a cache.
export const dynamic = "force-dynamic";

export default async function LivePage({
  params,
}: {
  params: Promise<{ matchSlug: string }>;
}) {
  const { matchSlug } = await params;

  const match = await prisma.match.findUnique({
    where: { slug: matchSlug },
    include: { session: true, chants: true },
  });

  if (!match) {
    notFound();
  }

  const live = resolveLiveState(match);

  return (
    <>
      {/* Apply the saved theme before paint to avoid a light/dark flash. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('jomhour-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
        }}
      />
      <LiveView
        matchSlug={match.slug}
        teamA={match.teamA}
        teamB={match.teamB}
        venue={match.venue}
        initialStatus={live.status}
        initialChant={live.chant}
        initialStartedAt={live.startedAt}
        initialNextChantTitle={live.nextChantTitle}
      />
    </>
  );
}
