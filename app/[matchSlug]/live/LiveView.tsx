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
    <div className="relative flex min-h-dvh flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-50">
      {live.connection === "disconnected" && <ReconnectingBanner />}

      <Toolbar
        lang={lang}
        onToggleLang={() => setLang((l) => (l === "ar" ? "en" : "ar"))}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        hasTranslit={Boolean(playingChant?.textTranslit)}
      />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
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
      <p className="mt-3 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
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
    <div className="absolute right-4 top-4 flex gap-2">
      {hasTranslit && (
        <button
          onClick={onToggleLang}
          className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium dark:border-white/15"
          aria-label="Toggle language"
        >
          {lang === "ar" ? "EN" : "AR"}
        </button>
      )}
      <button
        onClick={onToggleTheme}
        className="rounded-full border border-black/10 px-3 py-1.5 text-xs font-medium dark:border-white/15"
        aria-label="Toggle theme"
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
    <>
      <CountdownRing progress={frame.elapsedSec / chant.durationSec} />
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        {chant.title}
      </p>
      <p
        dir={useTranslit ? "ltr" : "rtl"}
        lang={useTranslit ? "en" : "ar"}
        className="max-w-3xl text-4xl font-bold leading-relaxed sm:text-6xl"
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
                ? "text-emerald-500"
                : "text-zinc-300 dark:text-zinc-700"
            }
          >
            {g}
          </span>
        ))}
      </p>
    </>
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
    <>
      <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        {teamA} vs {teamB}
      </p>
      <p className="text-2xl font-semibold sm:text-3xl">
        {ended ? "Thanks for joining! 👏" : "Waiting for the next chant…"}
      </p>
      {!ended && nextChantTitle && (
        <p className="text-zinc-500">Up next: {nextChantTitle}</p>
      )}
    </>
  );
}
