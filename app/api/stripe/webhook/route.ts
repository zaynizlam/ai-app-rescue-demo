import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  // Signature verification needs the raw body, exactly as Stripe sent it.
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.client_reference_id) {
      const { error } = await createAdminClient()
        .from("profiles")
        .update({ plan: "pro" })
        .eq("id", session.client_reference_id);
      // A 500 makes Stripe retry the event instead of silently losing the upgrade
      if (error) return new Response("Database error", { status: 500 });
    }
  }

  return Response.json({ received: true });
}
