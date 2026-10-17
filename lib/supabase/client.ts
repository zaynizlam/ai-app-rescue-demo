import { createBrowserClient } from "@supabase/ssr";

// Browser client: stores the session in cookies (not localStorage),
// so the server can see the same logged-in user. Uses the public anon key, so RLS applies.
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}
