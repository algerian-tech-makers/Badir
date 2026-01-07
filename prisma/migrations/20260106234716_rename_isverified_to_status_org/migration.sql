/*
  Warnings:

  - You are about to drop the column `is_verified` on the `organizations` table. All the data in the column will be lost.

*/
-- Drop policy that depends on the column
DROP POLICY IF EXISTS "Anyone can view verified organizations" ON "organizations";
DROP POLICY IF EXISTS "Anyone can view approved organizations" ON "organizations";


-- AlterTable
ALTER TABLE "organizations" 
ADD COLUMN "status" "OrganizationStatus" NOT NULL DEFAULT 'pending';

UPDATE "organizations" 
SET "status" = "is_verified"::"OrganizationStatus";

ALTER TABLE "organizations" 
DROP COLUMN "is_verified";

CREATE POLICY "Anyone can view approved organizations" ON "organizations"
    FOR SELECT
    TO public
    USING ("status" = 'approved');