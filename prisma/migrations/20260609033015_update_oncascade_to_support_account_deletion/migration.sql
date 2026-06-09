-- DropForeignKey
ALTER TABLE "initiative_posts" DROP CONSTRAINT "initiative_posts_author_id_fkey";

-- DropForeignKey
ALTER TABLE "initiatives" DROP CONSTRAINT "initiatives_organizer_org_id_fkey";

-- DropForeignKey
ALTER TABLE "initiatives" DROP CONSTRAINT "initiatives_organizer_user_id_fkey";

-- DropForeignKey
ALTER TABLE "platform_ratings" DROP CONSTRAINT "platform_ratings_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_initiative_ratings" DROP CONSTRAINT "user_initiative_ratings_user_id_fkey";

-- AlterTable
ALTER TABLE "initiative_posts" ALTER COLUMN "author_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "platform_ratings" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_initiative_ratings" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_organizer_org_id_fkey" FOREIGN KEY ("organizer_org_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiatives" ADD CONSTRAINT "initiatives_organizer_user_id_fkey" FOREIGN KEY ("organizer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "initiative_posts" ADD CONSTRAINT "initiative_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_initiative_ratings" ADD CONSTRAINT "user_initiative_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_ratings" ADD CONSTRAINT "platform_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
