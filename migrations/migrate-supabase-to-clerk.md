# Supabase Auth → Clerk Migration (realestate-market)

This document describes the one-time migration of authentication from
Supabase Auth (legacy: `realestate_users` table + custom session cookie /
bcrypt password / Stripe-metadata magic links) to Clerk
(Magic Link + Google OAuth).

Stripe billing is **unchanged**. `stripe_customer_id`, `plan`,
`current_period_end`, and all subscription state stay in
`realestate_users` and remain authoritative.

---

## 1. Supabase project details

There are TWO Supabase projects involved. Verify which one this
repository actually points at before running anything.

| Env file              | Supabase project ref     | Notes                                   |
|-----------------------|---------------------------|-----------------------------------------|
| `realestate-market/.env.local` (current) | `uvryowvflquhavwlidtl` | Holds `realestate_users` rows today.    |
| Shared instance noted by boss            | `xmlampsodchxnzwbzahh` | Used by ai-fortune-app, brand-voice, subsidy-agent (~14 users total across all 4 projects). |

> **Action item for boss:** confirm which project realestate-market
> should use after the cutover. If we are consolidating onto the shared
> `xmlampsodchxnzwbzahh` instance, the rows in `uvryowvflquhavwlidtl`
> need to be exported and re-imported first (see step 4). If we keep
> the project-local instance, just run the SQL there.

---

## 2. Add the Clerk linkage column

Run [`clerk-userid.sql`](./clerk-userid.sql) in the Supabase SQL editor
of whichever project we settle on.

It adds `clerk_user_id text` (nullable, unique when set) and an index on
`email`. No existing columns are touched, so plan / stripe_customer_id /
current_period_end stay intact.

---

## 3. Filter realestate-related users from `auth.users`

If legacy `auth.users` is used (it is not in this repo's current
implementation, but the shared instance may have been), filter the rows
that belong to this project. Rows in `realestate_users` are the source
of truth here:

```sql
-- All emails that belong to the realestate project
SELECT email, plan, stripe_customer_id, current_period_end
FROM realestate_users
ORDER BY created_at;

-- If a shared auth.users exists, intersect with this list
SELECT au.id, au.email
FROM auth.users au
JOIN realestate_users ru ON ru.email = au.email;
```

Save the result to `users-to-migrate.csv` (email, plan, stripe_customer_id, current_period_end).

---

## 4. Create matching Clerk users via the Backend API

For each row, create or look up a Clerk user, capture the resulting
`user.id`, and store it in Supabase. Pseudocode:

```ts
// scripts/migrate-to-clerk.ts (run once, locally, with CLERK_SECRET_KEY set)
import { createClerkClient } from "@clerk/backend";
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

for (const row of usersToMigrate) {
  // Look up by email first (idempotent)
  const existing = await clerk.users.getUserList({ emailAddress: [row.email] });
  let clerkUser = existing.data[0];
  if (!clerkUser) {
    clerkUser = await clerk.users.createUser({
      emailAddress: [row.email],
      skipPasswordRequirement: true, // Magic Link / OAuth only
    });
  }
  await supabaseAdmin
    .from("realestate_users")
    .update({ clerk_user_id: clerkUser.id })
    .eq("email", row.email);
}
```

Notes:

- Use `skipPasswordRequirement: true` so users sign in via Magic Link
  or Google. The legacy bcrypt `password_hash` column is no longer
  consulted; you can drop it later once the cutover is verified.
- Clerk dedupes by email, so re-running the script is safe.
- Rate limit: Clerk Backend API is ~10 req/s; batch with small
  concurrency (5) and `await Promise.all` chunks.

---

## 5. UPDATE rows with the new `clerk_user_id`

The script above already does this per user. As a sanity check after
the run:

```sql
SELECT count(*) FILTER (WHERE clerk_user_id IS NULL) AS unlinked,
       count(*) FILTER (WHERE clerk_user_id IS NOT NULL) AS linked
FROM realestate_users;
```

`unlinked` should be 0 (or only rows that never had a paying email).

The runtime helper `src/lib/clerkAuth.ts` also performs a best-effort
upsert of `clerk_user_id` when an authenticated user hits any API
route, so any stragglers self-heal on next sign-in.

---

## 6. Premium status preservation

The migration **never touches**:

- `stripe_customer_id`
- `plan` (`free` / `standard` / `professional`)
- `current_period_end`
- `usage_search`, `usage_estimate`, `usage_month`

Stripe webhooks (`/api/webhook`) continue to upsert by `email`, so
existing subscriptions remain active across the cutover. Customer
Portal access (`/api/portal`) takes `customer_id` from the
`realestate_users` row, which is unchanged.

---

## 7. Cleanup (after 2 weeks of stable operation)

Once Clerk is the verified source of truth:

```sql
ALTER TABLE realestate_users DROP COLUMN IF EXISTS password_hash;
```

Optionally remove legacy email + bcrypt code in
`src/app/api/auth/{login,register-free,magic-link,google}/route.ts`
(currently stubbed with HTTP 410).
