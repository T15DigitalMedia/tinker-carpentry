import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

// Bypasses RLS entirely. Only for trusted server-to-server code with no
// request-scoped user (e.g. the Stripe webhook) — never import this into
// anything that handles a browser request on behalf of a specific visitor.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
