-- AlterEnum
ALTER TYPE "InitiativeStatus" ADD VALUE 'completed';

-- AlterTable
ALTER TABLE "user_initiative_ratings" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "user_initiative_ratings_user_id_initiative_id_key" ON "user_initiative_ratings"("user_id", "initiative_id");
