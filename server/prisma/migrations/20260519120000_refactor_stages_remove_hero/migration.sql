-- Migrar stageId -> stageSlug y consolidar medios de etapa

-- Nuevas columnas
ALTER TABLE "users" ADD COLUMN "stageSlug" TEXT;
ALTER TABLE "stage_posts" ADD COLUMN "stageSlug" TEXT;
ALTER TABLE "stage_gallery_images" ADD COLUMN "stageSlug" TEXT;

-- Copiar slugs desde la tabla stages
UPDATE "users" u
SET "stageSlug" = s."slug"
FROM "stages" s
WHERE u."stageId" = s."id";

UPDATE "stage_posts" sp
SET "stageSlug" = s."slug"
FROM "stages" s
WHERE sp."stageId" = s."id";

UPDATE "stage_gallery_images" sgi
SET "stageSlug" = s."slug"
FROM "stages" s
WHERE sgi."stageId" = s."id";

-- Tabla de medios (solo URLs)
CREATE TABLE "stage_media" (
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverUrl" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stage_media_pkey" PRIMARY KEY ("slug")
);

INSERT INTO "stage_media" ("slug", "logoUrl", "coverUrl", "updatedAt")
SELECT "slug", "logo", "coverImage", CURRENT_TIMESTAMP
FROM "stages"
WHERE "logo" IS NOT NULL OR "coverImage" IS NOT NULL;

-- Renombrar columnas de imagen a imageUrl (links, no binarios)
ALTER TABLE "posts" RENAME COLUMN "image" TO "imageUrl";
ALTER TABLE "events" RENAME COLUMN "image" TO "imageUrl";
ALTER TABLE "stage_posts" RENAME COLUMN "image" TO "imageUrl";

-- Quitar FKs y columnas legacy
ALTER TABLE "stage_posts" DROP CONSTRAINT "stage_posts_stageId_fkey";
ALTER TABLE "stage_gallery_images" DROP CONSTRAINT "stage_gallery_images_stageId_fkey";
ALTER TABLE "users" DROP CONSTRAINT "users_stageId_fkey";

DROP INDEX IF EXISTS "stage_posts_stageId_createdAt_idx";
DROP INDEX IF EXISTS "stage_gallery_images_stageId_order_idx";
DROP INDEX IF EXISTS "users_stageId_idx";

ALTER TABLE "stage_posts" DROP COLUMN "stageId";
ALTER TABLE "stage_gallery_images" DROP COLUMN "stageId";
ALTER TABLE "users" DROP COLUMN "stageId";

ALTER TABLE "stage_posts" ALTER COLUMN "stageSlug" SET NOT NULL;
ALTER TABLE "stage_gallery_images" ALTER COLUMN "stageSlug" SET NOT NULL;

CREATE INDEX "stage_posts_stageSlug_createdAt_idx" ON "stage_posts"("stageSlug", "createdAt");
CREATE INDEX "stage_gallery_images_stageSlug_order_idx" ON "stage_gallery_images"("stageSlug", "order");
CREATE INDEX "users_stageSlug_idx" ON "users"("stageSlug");

DROP TABLE "stages";
DROP TABLE "hero_section";
