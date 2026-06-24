import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
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

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-wide text-zinc-500">
          {match.venue ?? "Match day"}
        </p>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          {match.teamA} <span className="text-zinc-400">vs</span> {match.teamB}
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
          className="mx-auto rounded"
        />
        <p className="break-all text-sm text-zinc-500">{joinUrl}</p>
      </div>

      <ShareButton joinUrl={joinUrl} title={`${match.teamA} vs ${match.teamB}`} />
    </div>
  );
}
