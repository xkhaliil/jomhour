import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — server-only. Used to publish Realtime
 * broadcasts and to provision admin users. Never import this from a
 * Client Component.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
