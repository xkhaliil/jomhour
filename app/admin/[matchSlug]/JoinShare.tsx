"use client";

import { useState } from "react";

export default function JoinShare({
  joinUrl,
  qrDataUrl,
  title,
}: {
  joinUrl: string;
  qrDataUrl: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: joinUrl });
      } catch {
        // user cancelled — ignore
      }
    } else {
      await copyLink();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/70">
      {/* eslint-disable-next-line @next/next/no-img-element -- small generated data: URL, no optimization needed */}
      <img
        src={qrDataUrl}
        alt="QR code to join"
        width={120}
        height={120}
        className="rounded-lg ring-1 ring-black/5 dark:ring-white/10"
      />
      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Fan join link
          </p>
          <p className="break-all text-sm text-zinc-600 dark:text-zinc-400">{joinUrl}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyLink}
            className="rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            onClick={share}
            className="rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 transition hover:bg-red-500"
          >
            Invite your section
          </button>
        </div>
      </div>
    </div>
  );
}
