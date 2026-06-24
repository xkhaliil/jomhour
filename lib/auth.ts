import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the caller has a valid Supabase session. Must be called inside
 * every admin Server Function — Server Functions are reachable via direct
 * POST regardless of proxy.ts route guards, so proxy.ts alone is not a
 * security boundary.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  // getUser() re-validates the token against the Auth server, unlike
  // getSession() which trusts the cookie as-is — required for authorization.
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error("Unauthorized");
  }

  return data.user;
}
