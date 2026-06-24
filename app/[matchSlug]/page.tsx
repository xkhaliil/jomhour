import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { findNationalTeam } from "@/lib/national-teams";
import CountdownTimer from "./CountdownTimer";
import ShareButton from "./ShareButton";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ matchSlug: string }>;
}) {
  const { matchSlug } = await params;

  const match = await prisma.match.findUnique({ where: { slug: matchSlug } });
  if (!match) {
    notFound();
  }

  const joinUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${match.slug}/live`;
  const qrDataUrl = await QRCode.toDataURL(joinUrl, { margin: 1, width: 220 });
  const flagA = findNationalTeam(match.teamA);
  const flagB = findNationalTeam(match.teamB);

  return (
    <>
      {/* Apply the saved theme before paint to avoid a light/dark flash —
          same key the live view writes to, so the preference carries over. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('jomhour-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
        }}
      />
      <div className="flex min-h-dvh flex-col items-center justify-center bg-white bg-[url('/tunisia-bg-light.png')] bg-cover bg-center bg-no-repeat px-4 py-10 text-zinc-900 sm:px-6 dark:bg-black dark:bg-[url('/tunisia-bg-dark.png')] dark:text-zinc-50">
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-7 rounded-3xl border border-black/5 bg-white/70 px-6 py-10 text-center shadow-xl backdrop-blur-md sm:px-10 dark:border-white/10 dark:bg-black/45">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
              {match.venue ?? "Match day"}
            </p>
            <h1 className="mt-1 flex flex-wrap items-center justify-center gap-2 text-2xl font-bold sm:text-3xl">
              {flagA && <span className={`fi fi-${flagA.code} rounded-sm`} aria-hidden />}
              {match.teamA}
              <span className="text-zinc-400">vs</span>
              {flagB && <span className={`fi fi-${flagB.code} rounded-sm`} aria-hidden />}
              {match.teamB}
            </h1>
          </div>

          <CountdownTimer kickoffAt={match.kickoffAt.toISOString()} />

          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- small generated data: URL, no optimization needed */}
            <img
              src={qrDataUrl}
              alt="QR code to join the live chant"
              width={200}
              height={200}
              className="mx-auto rounded-xl ring-1 ring-black/5 dark:ring-white/10"
            />
            <p className="break-all text-sm text-zinc-500">{joinUrl}</p>
          </div>

          <ShareButton joinUrl={joinUrl} title={`${match.teamA} vs ${match.teamB}`} />
        </div>
      </div>
    </>
  );
}
