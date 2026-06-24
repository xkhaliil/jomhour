"use client";

import { useState } from "react";

export default function ShareButton({
  joinUrl,
  title,
}: {
  joinUrl: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: joinUrl });
        return;
      } catch {
        // user cancelled — fall through to clipboard copy
      }
    }
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500"
    >
      {copied ? "Link copied!" : "Invite your section"}
    </button>
  );
}
