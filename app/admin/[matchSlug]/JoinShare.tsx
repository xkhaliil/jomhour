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
    <div className="flex flex-wrap items-center gap-4 rounded-lg border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-900">
      {/* eslint-disable-next-line @next/next/no-img-element -- small generated data: URL, no optimization needed */}
      <img src={qrDataUrl} alt="QR code to join" width={120} height={120} className="rounded" />
      <div className="min-w-0 flex-1 space-y-2">
        <p className="break-all text-sm text-zinc-600 dark:text-zinc-400">{joinUrl}</p>
        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="rounded-md border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
          <button
            onClick={share}
            className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
          >
            Invite your section
          </button>
        </div>
      </div>
    </div>
  );
}
