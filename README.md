# AI-Built App Rescue: from broken to production

**Demo project.** TaskFlow is a small task-list SaaS (Next.js + Supabase + Stripe) written the way AI app builders such as Lovable, Bolt and Cursor often produce it: it looks finished, but it won't deploy, logs users out, and leaks data. This repo shows how I take an app like that to production.

- `broken` branch: the app as generated
- `main`: the fixed app, one commit per fix

```bash
git log --oneline broken..main   # the six fixes
git diff broken main             # every change
```

## What was wrong and what I fixed

| # | Problem the founder would see | Root cause | Fix |
|---|---|---|---|
| 1 | Deploy fails on Vercel | A component using React hooks had no `"use client"` directive, so `next build` errored | Marked it as a client component |
| 2 | (Invisible until it's too late) Anyone can wipe the database | The Supabase **service-role key** was in a `NEXT_PUBLIC_` variable, so it shipped in the browser bundle | Anon key in the browser; service-role key moved to a server-only module; rotate the old key |
| 3 | Login loops, users "logged out" on refresh | Session stored in localStorage, which the server can't read; server redirected to /login, client redirected back | `@supabase/ssr` cookie sessions for browser and server, plus middleware that refreshes the session |
| 4 | Users can see each other's tasks | Row Level Security disabled "so the app works" | RLS on, per-user policies; profiles read-only so users can't set their own plan |
| 5 | Anyone can get Pro for free | Stripe webhook trusted any JSON posted to it | Signature verification on the raw body, `paid` check, retry-safe errors |
| 6 | Paying customers land on a dead page | Checkout redirect URLs hard-coded to `localhost`; user id taken from an editable form field | URLs from `NEXT_PUBLIC_SITE_URL`; user taken from the session |

Every fix is a separate commit with the reason in the message, so the client can review each change on its own.

## Run it

Requirements: Node 20+, a Supabase project, a Stripe account in test mode.

```bash
npm install
cp .env.example .env.local      # fill in your keys
npm run dev
```

1. In Supabase, run `supabase/migrations/0001_init.sql` then `0002_enable_rls.sql` (SQL editor or `supabase db push`).
2. Create a test user under Authentication → Users.
3. In Stripe test mode, create a recurring price and put its id in `STRIPE_PRICE_ID`.
4. Forward webhooks locally and copy the `whsec_…` secret it prints into `STRIPE_WEBHOOK_SECRET`:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
5. Pay with card `4242 4242 4242 4242`; the badge switches to **pro**.

### See the "before" fail

```bash
git checkout broken && npm install && npm run build   # fails
git checkout main && npm run build                    # passes
```

## Deploy (Vercel)

1. Import the repo in Vercel and add every variable from `.env.example`.
2. Set `NEXT_PUBLIC_SITE_URL` to the production domain.
3. In Supabase → Authentication → URL Configuration, set the Site URL to the same domain.
4. In Stripe, add a webhook endpoint `https://<domain>/api/stripe/webhook` for `checkout.session.completed` and put its signing secret in `STRIPE_WEBHOOK_SECRET`.

---

Need the same done for your app? I fix and ship AI-built Next.js, Node and Python apps. Find me on Upwork.
