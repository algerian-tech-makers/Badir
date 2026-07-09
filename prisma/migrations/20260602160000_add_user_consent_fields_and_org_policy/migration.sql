-- Add user consent and newsletter unsubscribe tracking fields.
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "newsletter_unsubscribed_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "consent_given" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "consent_given_at" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "consent_version" TEXT;

-- Move policy changes out of the already-applied organization migration.
DROP POLICY IF EXISTS "Anyone can view verified organizations" ON "organizations";
DROP POLICY IF EXISTS "Anyone can view approved organizations" ON "organizations";

CREATE POLICY "Anyone can view approved organizations" ON "organizations"
    FOR SELECT
    TO public
    USING ("status" = 'approved');
