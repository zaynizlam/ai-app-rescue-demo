import { supabase } from "@/lib/supabase/client";

export async function POST(req: Request) {
  const event = await req.json();

  if (event.type === "checkout.session.completed") {
    const userId = event.data.object.client_reference_id;
    await supabase.from("profiles").update({ plan: "pro" }).eq("id", userId);
  }

  return Response.json({ received: true });
}
