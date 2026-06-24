// Trivial and fast on purpose — no DB call. Used by the client clock-sync
// handshake (see useServerClock) to compute the offset between this server's
// clock and the fan's device clock.
export async function GET() {
  return Response.json({ now: Date.now() });
}
