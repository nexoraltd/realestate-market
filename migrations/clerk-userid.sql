-- Add Clerk user ID linkage to realestate_users.
-- Idempotent: safe to run multiple times.

ALTER TABLE realestate_users
  ADD COLUMN IF NOT EXISTS clerk_user_id text;

CREATE UNIQUE INDEX IF NOT EXISTS realestate_users_clerk_user_id_key
  ON realestate_users (clerk_user_id)
  WHERE clerk_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS realestate_users_email_idx
  ON realestate_users (email);

-- Premium / billing columns intentionally untouched:
--   plan, stripe_customer_id, current_period_end, password_hash,
--   usage_search, usage_estimate, usage_month
-- They keep their values so subscriptions stay active during cutover.
