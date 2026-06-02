/*
  Warnings:

  - You are about to drop the column `is_verified` on the `organizations` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "organizations" DROP COLUMN "is_verified",
ADD COLUMN     "status" "OrganizationStatus" NOT NULL DEFAULT 'pending';
