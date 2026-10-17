import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const event = await req.json();

  if (event.type === "checkout.session.completed") {
    const userId = event.data.object.client_reference_id;
    await createAdminClient().from("profiles").update({ plan: "pro" }).eq("id", userId);
  }

  return Response.json({ received: true });
}
