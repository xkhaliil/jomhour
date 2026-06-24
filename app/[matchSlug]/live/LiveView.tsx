"use client";

import { useEffect, useState } from "react";
import type { ChantPayload } from "@/lib/chant-playback";
import type { ResolvedLiveState } from "@/lib/live-session";
import { useChantPlayback } from "./useChantPlayback";
import { useLiveChant } from "./useLiveChant";
import { useServerClock } from "./useServerClock";
import CountdownRing from "./CountdownRing";

export type LiveViewProps = {
  matchSlug: string;
  teamA: string;
  teamB: string;
  initialStatus: ResolvedLiveState["status"];
  initialChant: ChantPayload | null;
  initialStartedAt: number | null;
  initialNextChantTitle: string | null;
};

const THEME_KEY = "jomhour-theme";

export default function LiveView({
  matchSlug,
  teamA,
  teamB,
  initialStatus,
  initialChant,
  initialStartedAt,
  initialNextChantTitle,
}: LiveViewProps) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  // The inline script in page.tsx already set the `.dark` class on <html>
  // before hydration (reading the same localStorage key) to avoid a flash —
  // read it back here as the source of truth instead of re-deriving it.
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const live = useLiveChant(matchSlug, {
    chant: initialChant,
    startedAt: initialStartedAt,
    status: initialStatus,
    nextChantTitle: initialNextChantTitle,
  });

  const { getServerNow } = useServerClock();

  const playingChant = live.status === "live" ? live.chant : null;
  const playingStartedAt = live.status === "live" ? live.startedAt : null;
  const frame = useChantPlayback(playingChant, playingStartedAt, getServerNow);

  const showChant = Boolean(playingChant && frame && !frame.finished);

  return (
    <div className="relative flex min-h-dvh flex-col bg-white bg-[url('/tunisia-bg-light.png')] bg-cover bg-center bg-no-repeat text-zinc-900 dark:bg-black dark:bg-[url('/tunisia-bg-dark.png')] dark:text-zinc-50">
      {live.connection === "disconnected" && <ReconnectingBanner />}

      <Toolbar
        lang={lang}
        onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        hasTranslit={Boolean(playingChant?.textTranslit)}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16 text-center sm:px-6">
        {showChant && playingChant && frame ? (
          <ChantStage chant={playingChant} frame={frame} lang={lang} />
        ) : (
          <IdleStage
            teamA={teamA}
            teamB={teamB}
            ended={live.status === "ended"}
            nextChantTitle={live.nextChantTitle}
          />
        )}
      </main>
    </div>
  );
}

function ReconnectingBanner() {
  return (
    <div className="absolute inset-x-0 top-0 z-10 flex justify-center">
      <p className="mt-3 flex items-center gap-1.5 rounded-full bg-amber-100/90 px-4 py-1.5 text-xs font-medium text-amber-800 shadow-sm backdrop-blur-sm dark:bg-amber-900/60 dark:text-amber-200">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
        Reconnecting…
      </p>
    </div>
  );
}

function Toolbar({
  lang,
  onToggleLang,
  theme,
  onToggleTheme,
  hasTranslit,
}: {
  lang: "ar" | "en";
  onToggleLang: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  hasTranslit: boolean;
}) {
  return (
    <div className="absolute right-3 top-3 z-10 flex gap-2 sm:right-4 sm:top-4">
      {hasTranslit && (
        <button
          onClick={onToggleLang}
          className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur-sm transition hover:bg-white/90 dark:border-white/15 dark:bg-black/40 dark:hover:bg-black/60"
          aria-label="Toggle language"
        >
          {lang === "ar" ? "EN" : "AR"}
        </button>
      )}
      <button
        onClick={onToggleTheme}
        className="rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm transition hover:bg-white/90 dark:border-white/15 dark:bg-black/40 dark:hover:bg-black/60"
        aria-label="Toggle theme"
        // theme's initial value depends on a pre-hydration script reading
        // localStorage, which the server can't see — harmless one-time
        // mismatch, corrected the instant React hydrates.
        suppressHydrationWarning
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
    </div>
  );
}

function ChantStage({
  chant,
  frame,
  lang,
}: {
  chant: ChantPayload;
  frame: NonNullable<ReturnType<typeof useChantPlayback>>;
  lang: "ar" | "en";
}) {
  const useTranslit = lang === "en" && frame.graphemesTranslit;
  const graphemes = useTranslit ? frame.graphemesTranslit! : frame.graphemesAr;
  const highlightCount = useTranslit
    ? frame.highlightCountTranslit
    : frame.highlightCountAr;

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-6 rounded-3xl border border-black/5 bg-white/70 px-5 py-10 shadow-xl backdrop-blur-md sm:px-10 dark:border-white/10 dark:bg-black/45">
      <CountdownRing progress={frame.elapsedSec / chant.durationSec} size={84} />
      <p className="rounded-full bg-red-600/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700 dark:bg-red-500/15 dark:text-red-300">
        {chant.title}
      </p>
      <p
        dir={useTranslit ? "ltr" : "rtl"}
        lang={useTranslit ? "en" : "ar"}
        className="text-3xl font-bold leading-relaxed sm:text-5xl"
        // The highlight position depends on Date.now(), so the SSR pass and
        // the client hydration pass compute slightly different counts a few
        // hundred ms apart — harmless, and corrected on the next animation
        // frame, so the hydration mismatch warning is suppressed here.
        suppressHydrationWarning
      >
        {graphemes.map((g, i) => (
          <span
            key={i}
            suppressHydrationWarning
            className={
              i < highlightCount
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-300 dark:text-zinc-700"
            }
          >
            {g}
          </span>
        ))}
      </p>
    </div>
  );
}

function IdleStage({
  teamA,
  teamB,
  ended,
  nextChantTitle,
}: {
  teamA: string;
  teamB: string;
  ended: boolean;
  nextChantTitle: string | null;
}) {
  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3 rounded-3xl border border-black/5 bg-white/70 px-6 py-10 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-black/45">
      <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {teamA} <span className="text-red-600 dark:text-red-400">vs</span> {teamB}
      </p>
      {!ended && (
        <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden />
      )}
      <p className="text-2xl font-bold sm:text-3xl">
        {ended ? "Thanks for joining! 👏" : "Waiting for the next chant…"}
      </p>
      {!ended && nextChantTitle && (
        <p className="text-zinc-500">Up next: {nextChantTitle}</p>
      )}
    </div>
  );
}
