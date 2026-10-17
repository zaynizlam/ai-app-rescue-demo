import { createClient } from "@supabase/supabase-js";

// One client for the whole app (browser and server).
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);
