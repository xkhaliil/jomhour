import { prisma } from "@/lib/prisma";
import { resolveLiveState } from "@/lib/live-session";

/**
 * Returns the current LiveSession state as JSON. Used by fan clients to
 * resume correctly after a dropped connection, instead of waiting for the
 * next `go_live` broadcast (which may never come if nothing changes while
 * they were disconnected).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ matchSlug: string }> }
) {
  const { matchSlug } = await params;

  const match = await prisma.match.findUnique({
    where: { slug: matchSlug },
    include: { session: true, chants: true },
  });

  if (!match) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  return Response.json(resolveLiveState(match));
}
