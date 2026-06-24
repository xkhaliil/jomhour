"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GO_LIVE_EVENT, matchChannelName, type GoLivePayload } from "@/lib/realtime";
import type { ResolvedLiveState } from "@/lib/live-session";

export type ConnectionState = "connecting" | "connected" | "disconnected";

async function fetchLiveState(matchSlug: string): Promise<ResolvedLiveState | null> {
  try {
    const res = await fetch(`/api/session/${matchSlug}`, { cache: "no-store" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Subscribes to the match's Realtime broadcast channel and merges incoming
 * `go_live` events into local state. `initial` seeds the first render from
 * the server-rendered LiveSession so a fan opening mid-chant doesn't have to
 * wait for a broadcast that already happened before they joined.
 *
 * On reconnect (dropped WebSocket, tab backgrounded, or the OS reporting the
 * network came back), re-fetches /api/session/[matchSlug] via plain HTTP
 * instead of waiting for the next broadcast — see spec §4 step 6.
 */
export function useLiveChant(matchSlug: string, initial: ResolvedLiveState) {
  const [state, setState] = useState(initial);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const wasDisconnected = useRef(false);

  useEffect(() => {
    function resync() {
      fetchLiveState(matchSlug).then((fresh) => {
        if (fresh) setState(fresh);
      });
    }

    const supabase = createClient();
    const channel = supabase.channel(matchChannelName(matchSlug));

    channel
      .on("broadcast", { event: GO_LIVE_EVENT }, ({ payload }) => {
        const data = payload as GoLivePayload;
        setState({
          chant: data.chant,
          startedAt: data.startedAt,
          status: "live",
          nextChantTitle: data.nextChantTitle,
        });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setConnection("connected");
          if (wasDisconnected.current) {
            wasDisconnected.current = false;
            resync();
          }
        } else if (
          status === "CLOSED" ||
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          setConnection("disconnected");
          wasDisconnected.current = true;
        }
      });

    function handleOnline() {
      resync();
    }
    function handleVisibility() {
      if (document.visibilityState === "visible") resync();
    }
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [matchSlug]);

  return { ...state, connection };
}
