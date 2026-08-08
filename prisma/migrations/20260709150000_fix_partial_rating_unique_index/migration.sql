DROP INDEX IF EXISTS "user_initiative_ratings_user_id_initiative_id_key";

CREATE UNIQUE INDEX "user_initiative_ratings_user_id_initiative_id_key"
  ON "user_initiative_ratings"("user_id", "initiative_id")
  WHERE "user_id" IS NOT NULL;