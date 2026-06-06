/*
  Warnings:

  - You are about to drop the column `latitude` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "latitude",
DROP COLUMN "longitude",
ADD COLUMN     "geohash" VARCHAR(12),
ALTER COLUMN "sex" DROP DEFAULT;

-- DropEnum
DROP TYPE "CertificateType";
