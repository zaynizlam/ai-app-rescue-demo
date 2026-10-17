import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const form = await req.formData();
  const userId = String(form.get("userId"));

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    client_reference_id: userId,
    success_url: "http://localhost:3000/dashboard?upgraded=1",
    cancel_url: "http://localhost:3000/dashboard",
  });

  return Response.redirect(session.url!, 303);
}
